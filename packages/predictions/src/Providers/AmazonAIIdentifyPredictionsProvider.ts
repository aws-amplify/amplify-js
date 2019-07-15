import { Credentials, ConsoleLogger as Logger } from '@aws-amplify/core';
import Storage from '@aws-amplify/storage';
import { AbstractIdentifyPredictionsProvider } from '../types/Providers';
import { GraphQLPredictionsProvider } from '.';
import * as Rekognition from 'aws-sdk/clients/rekognition';
import {
    IdentifyEntityInput, IdentifyEntityOutput, IdentifySource, IdentifyFacesInput, IdentifyFacesOutput,
    isStorageSource, isFileSource, isBytesSource, IdentifyTextInput, IdentifyTextOutput, Table, TableCell,
    KeyValue, Polygon, Content,
} from '../types';
import * as Textract from 'aws-sdk/clients/textract';

export default class AmazonAIIdentifyPredictionsProvider extends AbstractIdentifyPredictionsProvider {
    private graphQLPredictionsProvider: GraphQLPredictionsProvider;
    private rekognition: Rekognition;
    private textract: Textract;

    constructor() {
        super();
    }

    getProviderName() {
        return 'AmazonAIIdentifyPredictionsProvider';
    }

    private makeCamelCase(obj: object, keys?: string[]) {
        if (!obj) return undefined;
        const newObj = {};
        const keysToRename = keys ? keys : Object.keys(obj);
        keysToRename.forEach(key => {
            if (obj.hasOwnProperty(key)) {
                // change the key to camelcase.
                const camelCaseKey = key.charAt(0).toLowerCase() + key.substr(1);
                Object.assign(newObj, { [camelCaseKey]: obj[key] });
            }
        });
        return newObj;
    }

    private makeCamelCaseArray(objArr: object[], keys?: string[]) {
        if (!objArr) return undefined;
        return objArr.map(obj => this.makeCamelCase(obj, keys));
    }

    private blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
        return new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = _event => { res(reader.result as ArrayBuffer); };
            reader.onerror = err => { rej(err); };
            try {
                reader.readAsArrayBuffer(blob);
            } catch (err) {
                rej(err); // in case user gives invalid type
            }
        });
    }
    /**
     * Verify user input source and converts it into source object readable by Rekognition and Textract.
     * @param {IdentifySource} source - User input source that directs to the object user wants
     * to identify (storage, file, or bytes).
     * @return {Promise<Rekognition.Image> } - Promise resolving to the converted source object.
     */
    private configureSource(source: IdentifySource): Promise<Rekognition.Image> {
        return new Promise((res, rej) => {
            if (isStorageSource(source)) {
                const storageConfig = { level: source.level, identityId: source.identityId };
                Storage.get(source.key, storageConfig)
                    .then((url: string) => {
                        const parser = /https:\/\/([a-zA-Z0-9%-_.]+)\.s3\.[A-Za-z0-9%-._~]+\/([a-zA-Z0-9%-._~/]+)\?/;
                        const parsedURL = url.match(parser);
                        if (parsedURL.length < 3) rej('Invalid S3 key was given.');
                        res({ S3Object: { Bucket: parsedURL[1], Name: parsedURL[2] } });
                    })
                    .catch(err => rej(err));
            } else if (isFileSource(source)) {
                this.blobToArrayBuffer(source.file)
                    .then(buffer => { res({ Bytes: buffer }); })
                    .catch(err => rej(err));
            } else if (isBytesSource(source)) {
                if (source.bytes instanceof Blob) {
                    this.blobToArrayBuffer(source.bytes)
                        .then(buffer => { res({ Bytes: buffer }); })
                        .catch(err => rej(err));
                } else {
                    // everything else can be directly passed to Rekognition / Textract.
                    res({ Bytes: source.bytes });
                }
            } else {
                rej('Input source is not configured correctly.');
            }
        });
    }

    /**
     * Recognize text from real-world images and documents (plain text, forms and tables). Detects text in the input 
     * image and converts it into machine-readable text. 
     * @param {IdentifySource} source - Object containing the source image and feature types to analyze.
     * @return {Promise<IdentifyTextOutput>} - Promise resolving to object containing identified texts.
     */
    protected identifyText(input: IdentifyTextInput): Promise<IdentifyTextOutput> {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) return rej('No credentials');
            if (!credentials.identityId) return rej('No identityId');

            this.rekognition = new Rekognition({ region: this._config.identify.identifyEntities.region, credentials });
            this.textract = new Textract({ region: this._config.identify.identifyEntities.region, credentials });
            let inputDocument: Textract.Document;
            await this.configureSource(input.text.source)
                .then(data => inputDocument = data)
                .catch(err => { rej(err); });

            // get default value if format isn't specified in the input.
            if (!input.text.format) {
                if (this._config.identify.identifyText.format) {
                    // default from awsexports
                    input.text.format = this._config.identify.identifyText.format;
                } else {
                    input.text.format = 'PLAIN';
                }
            }
            const featureTypes: Textract.FeatureTypes = [];
            if (input.text.format === 'FORM' || input.text.format === 'ALL')
                featureTypes.push('FORMS');
            if (input.text.format === 'TABLE' || input.text.format === 'ALL')
                featureTypes.push('TABLES');
            if (featureTypes.length === 0) {
                /**
                 * Empty featureTypes indicates that we will identify plain text. We will use rekognition (suitable
                 * for everyday images but has 50 word limit) first and see if reaches its word limit. If it does, then
                 * we call textract and use the data that identify more words.
                 */
                const textractParam: Textract.DetectDocumentTextRequest = { Document: inputDocument, };
                const rekognitionParam: Rekognition.DetectTextRequest = { Image: inputDocument };
                this.rekognition.detectText(rekognitionParam, (rekognitionErr, rekognitionData) => {
                    if (rekognitionErr) return rej(rekognitionErr);
                    const rekognitionResponse = this.categorizeRekognitionBlocks(rekognitionData.TextDetections);
                    if (rekognitionResponse.text.words.length < 50) {
                        // did not hit the word limit, return the data
                        return res(rekognitionResponse);
                    }
                    this.textract.detectDocumentText(textractParam, (textractErr, textractData) => {
                        if (textractErr) return rej(textractErr);
                        // use the service that identified more texts.
                        if (rekognitionData.TextDetections.length > textractData.Blocks.length) {
                            return res(rekognitionResponse);
                        } else {
                            const textractBlocks = textractData.Blocks;
                            return res(this.categorizeTextractBlocks(textractBlocks));
                        }
                    });
                });

            } else {
                const param: Textract.AnalyzeDocumentRequest = {
                    Document: inputDocument,
                    FeatureTypes: featureTypes
                };
                this.textract.analyzeDocument(param, (err, data) => {
                    if (err) return rej(err);
                    const blocks = data.Blocks;
                    res(this.categorizeTextractBlocks(blocks));
                });
            }
        });
    }

    /**
     * Organizes blocks from Rekognition API to each of the categories and and structures 
     * their data accordingly. 
     * @param {Textract.BlockList} source - Array containing blocks returned from Textract API.
     * @return {IdentifyTextOutput} -  Object that categorizes each block and its information.
     */
    private categorizeRekognitionBlocks(blocks: Rekognition.TextDetectionList): IdentifyTextOutput {
        // Skeleton IdentifyText API response. We will populate it as we iterate through blocks.
        const response: IdentifyTextOutput = {
            text: {
                fullText: '',
                words: [],
                lines: [],
                linesDetailed: [],
            }
        };
        // We categorize each block by running a forEach loop through them.
        blocks.forEach(block => {
            switch (block.Type) {
                case 'LINE':
                    response.text.lines.push(block.DetectedText);
                    response.text.linesDetailed.push({
                        text: block.DetectedText,
                        polygon: this.makeCamelCaseArray(block.Geometry.Polygon),
                        boundingBox: this.makeCamelCase(block.Geometry.BoundingBox),
                        page: null, // rekognition doesn't have this info
                    });
                    break;
                case 'WORD':
                    response.text.fullText += block.DetectedText + ' ';
                    response.text.words.push({
                        text: block.DetectedText,
                        polygon: this.makeCamelCaseArray(block.Geometry.Polygon),
                        boundingBox: this.makeCamelCase(block.Geometry.BoundingBox)
                    });
                    break;
            }
        });
        // remove trailing space of fullText
        response.text.fullText = response.text.fullText.substr(0, response.text.fullText.length - 1);
        return response;
    }
    /**
     * Organizes blocks from Textract API to each of the categories and and structures 
     * their data accordingly. 
     * @param {Textract.BlockList} source - Array containing blocks returned from Textract API.
     * @return {IdentifyTextOutput} -  Object that categorizes each block and its information.
     */
    private categorizeTextractBlocks(blocks: Textract.BlockList): IdentifyTextOutput {
        // Skeleton IdentifyText API response. We will populate it as we iterate through blocks.
        const response: IdentifyTextOutput = {
            text: {
                fullText: '',
                words: [],
                lines: [],
                linesDetailed: [],
            }
        };
        // if blocks is an empty array, ie. textract did not detect anything, return empty response.
        if (blocks.length === 0) return response;
        /**
         * We categorize each of the blocks by running a forEach loop through them.
         * 
         * For complex structures such as Tables and KeyValue, we need to trasverse through their children. To do so, 
         * we will post-process them after the for each loop. We do this by storing table and keyvalues in arrays and 
         * mapping other blocks in `blockMap` (id to block) so we can reference them easily later.
         * 
         * Note that we do not map `WORD` and `TABLE` in `blockMap` because they will not be referenced by any other
         * block except the Page block. 
         */
        const tableBlocks: Textract.BlockList = Array();
        const keyValueBlocks: Textract.BlockList = Array();
        const blockMap: { [id: string]: Textract.Block } = {};

        blocks.forEach(block => {
            switch (block.BlockType) {
                case 'LINE':
                    response.text.lines.push(block.Text);
                    response.text.linesDetailed.push({
                        text: block.Text,
                        polygon: this.makeCamelCaseArray(block.Geometry.Polygon),
                        boundingBox: this.makeCamelCase(block.Geometry.BoundingBox),
                        page: block.Page
                    });
                    break;
                case 'WORD':
                    response.text.fullText += block.Text + ' ';
                    response.text.words.push({
                        text: block.Text,
                        polygon: this.makeCamelCaseArray(block.Geometry.Polygon),
                        boundingBox: this.makeCamelCase(block.Geometry.BoundingBox),
                    });
                    blockMap[block.Id] = block;
                    break;
                case 'SELECTION_ELEMENT':
                    const selectionStatus = (block.SelectionStatus === 'SELECTED') ? true : false;
                    if (!response.text.selections)
                        response.text.selections = [];
                    response.text.selections.push({
                        selected: selectionStatus,
                        polygon: this.makeCamelCaseArray(block.Geometry.Polygon),
                        boundingBox: this.makeCamelCase(block.Geometry.BoundingBox),
                    });
                    blockMap[block.Id] = block;
                    break;
                case 'TABLE':
                    tableBlocks.push(block);
                    break;
                case 'KEY_VALUE_SET':
                    keyValueBlocks.push(block);
                    blockMap[block.Id] = block;
                    break;
                default:
                    blockMap[block.Id] = block;
            }
        });
        // remove trailing space in fullText
        response.text.fullText = response.text.fullText.substr(0, response.text.fullText.length - 1);

        // Post-process complex structures if they exist. 
        if (tableBlocks.length !== 0) {
            const tableResponse: Table[] = Array();
            tableBlocks.forEach(table => {
                tableResponse.push(this.constructTable(table, blockMap));
            });
            response.text.tables = tableResponse;
        }
        if (keyValueBlocks.length !== 0) {
            const keyValueResponse: KeyValue[] = Array();
            keyValueBlocks.forEach(keyValue => {
                // We need the KeyValue blocks of EntityType = `KEY`, which has both key and value references.
                if (keyValue.EntityTypes.indexOf('KEY') !== -1) {
                    keyValueResponse.push(this.constructKeyValue(keyValue, blockMap));
                }
            });
            response.text.keyValues = keyValueResponse;
        }
        return response;
    }


    /**
     * Extracts text and selection from input block's children.
     * @param {Textract.Block}} block - Block that we want to extract contents from.
     * @param {[id: string]: Textract.Block} blockMap - Maps block Ids to blocks. 
     */
    private extractContentsFromBlock(
        block: Textract.Block,
        blockMap: { [id: string]: Textract.Block }
    ): Content {
        let words: string = '';
        let isSelected: boolean;

        if (!block.Relationships) { // some block might have no content
            return { text: '', selected: undefined };
        }
        block.Relationships.forEach(relation => {
            relation.Ids.forEach(contentId => {
                const contentBlock = blockMap[contentId];
                if (contentBlock.BlockType === 'WORD') {
                    words += contentBlock.Text + ' ';
                } else if (contentBlock.BlockType === 'SELECTION_ELEMENT') {
                    isSelected = (contentBlock.SelectionStatus === 'SELECTED') ? true : false;
                }
            });
        });

        words = words.substr(0, words.length - 1); // remove trailing space.
        return { text: words, selected: isSelected };
    }

    /**
     * Constructs a table object using data from its children cells.
     * @param {Textract.Block} table - Table block that has references (`Relationships`) to its cells
     * @param {[id: string]: Textract.Block} blockMap - Maps block Ids to blocks. 
     */
    private constructTable(table: Textract.Block, blockMap: { [key: string]: Textract.Block }): Table {
        let tableMatrix: TableCell[][];
        tableMatrix = [];
        // visit each of the cell associated with the table's relationship.
        table.Relationships.forEach(tableRelation => {
            tableRelation.Ids.forEach(cellId => {
                const cellBlock: Textract.Block = blockMap[cellId];
                const row = cellBlock.RowIndex - 1; // textract starts indexing at 1, so subtract it by 1.
                const col = cellBlock.ColumnIndex - 1; // textract starts indexing at 1, so subtract it by 1.
                // extract data contained inside the cell.
                const content = this.extractContentsFromBlock(cellBlock, blockMap);
                const cell: TableCell = {
                    text: content.text,
                    boundingBox: this.makeCamelCase(cellBlock.Geometry.BoundingBox),
                    polygon: this.makeCamelCaseArray(cellBlock.Geometry.Polygon),
                    selected: content.selected,
                    rowSpan: cellBlock.RowSpan,
                    columnSpan: cellBlock.ColumnSpan,
                };
                if (!tableMatrix[row]) tableMatrix[row] = [];
                tableMatrix[row][col] = cell;
            });
        });
        const rowSize = tableMatrix.length;
        const columnSize = tableMatrix[0].length;
        // Note that we leave spanned cells undefined for distinction
        return {
            size: { rows: rowSize, columns: columnSize },
            table: tableMatrix,
            boundingBox: this.makeCamelCase(table.Geometry.BoundingBox),
            polygon: this.makeCamelCaseArray(table.Geometry.Polygon)
        };
    }

    /**
     * Constructs a key value object from its children key and value blocks.
     * @param {Textract.Block} KeyValue - KeyValue block that has references (`Relationships`) to its children.
     * @param {[id: string]: Textract.Block} blockMap - Maps block Ids to blocks. 
     */
    private constructKeyValue(
        keyBlock: Textract.Block,
        blockMap: { [key: string]: Textract.Block }
    ): KeyValue {
        let keyText: string = '';
        let valueText: string = '';
        let valueSelected: boolean;
        keyBlock.Relationships.forEach(keyValueRelation => {
            if (keyValueRelation.Type === 'CHILD') {
                // relation refers to key
                const contents = this.extractContentsFromBlock(keyBlock, blockMap);
                keyText = contents.text;
            } else if (keyValueRelation.Type === 'VALUE') {
                // relation refers to value
                keyValueRelation.Ids.forEach(valueId => {
                    const valueBlock = blockMap[valueId];
                    const contents = this.extractContentsFromBlock(valueBlock, blockMap);
                    valueText = contents.text;
                    if (contents.selected != null) valueSelected = contents.selected;
                });
            }
        });
        return {
            key: keyText,
            value: { text: valueText, selected: valueSelected },
            polygon: this.makeCamelCaseArray(keyBlock.Geometry.Polygon),
            boundingBox: this.makeCamelCase(keyBlock.Geometry.BoundingBox),
        };
    }

    /**
     * Identify instances of real world entities from an image and if it contains unsafe content.
     * @param {IdentifyEntityInput} input - Object containing the source image and entity type to identify.
     * @return {Promise<IdentifyEntityOutput>} - Promise resolving to an array of identified entities. 
     */
    protected identifyEntity(input: IdentifyEntityInput): Promise<IdentifyEntityOutput> {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) return rej('No credentials');
            if (!credentials.identityId) return rej('No identityId');

            this.rekognition = new Rekognition({ region: this._config.identify.identifyEntities.region, credentials });
            let inputImage: Rekognition.Image;
            await this.configureSource(input.entity.source)
                .then(data => { inputImage = data; })
                .catch(err => { return rej(err); });
            const param = { Image: inputImage };
            const servicePromises = [];
            if (input.entity.type === 'LABELS' || input.entity.type === 'ALL') {
                servicePromises.push(this.detectLabels(param));
            }
            if (input.entity.type === 'UNSAFE' || input.entity.type === 'ALL') {
                servicePromises.push(this.detectModerationLabels(param));
            }
            if (servicePromises.length === 0) {
                rej('You must specify entity type: LABELS | UNSAFE | ALL');
            }
            Promise.all(servicePromises).then(data => {
                let identifyResult: IdentifyEntityOutput = {};
                // concatenate resolved promises to a single object
                data.forEach(val => { identifyResult = { ...identifyResult, ...val }; });
                res(identifyResult);
            }).catch(err => rej(err));
        });
    }

    /**
     * Calls Rekognition.detectLabels and organizes the returned data.
     * @param {Rekognition.DetectLabelsRequest} param - parameter to be passed onto Rekognition
     * @return {Promise<IdentifyEntityOutput>} - Promise resolving to organized detectLabels response.
     */
    private detectLabels(param: Rekognition.DetectLabelsRequest): Promise<IdentifyEntityOutput> {
        return new Promise((res, rej) => {
            this.rekognition.detectLabels(param, (err, data) => {
                if (err) return rej(err);
                if (!data.Labels) return res({ entity: null }); // no image was detected
                const detectLabelData = data.Labels.map(val => {
                    const boxes = val.Instances ?
                        val.Instances.map(val => this.makeCamelCase(val.BoundingBox)) : undefined;
                    return {
                        name: val.Name,
                        boundingBoxes: boxes,
                        metadata: {
                            confidence: val.Confidence,
                            parents: this.makeCamelCaseArray(val.Parents)
                        }
                    };
                });
                return res({ entity: detectLabelData });
            });
        });
    }

    /**
     * Calls Rekognition.detectModerationLabels and organizes the returned data.
     * @param {Rekognition.DetectLabelsRequest} param - Parameter to be passed onto Rekognition
     * @return {Promise<IdentifyEntityOutput>} - Promise resolving to organized detectModerationLabels response.
     */
    private detectModerationLabels(param: Rekognition.DetectFacesRequest): Promise<IdentifyEntityOutput> {
        return new Promise((res, rej) => {
            this.rekognition.detectModerationLabels(param, (err, data) => {
                if (err) return rej(err);
                if (data.ModerationLabels.length !== 0) {
                    return res({ unsafe: 'YES' });
                } else {
                    return res({ unsafe: 'NO' });
                }
            });
        });
    }

    /**
     * Identify faces within an image that is provided as input, and match faces from a collection 
     * or identify celebrities.
     * @param {IdentifyEntityInput} input - object containing the source image and face match options.
     * @return {Promise<IdentifyEntityOutput>} Promise resolving to identify results.
     */
    protected identifyFaces(input: IdentifyFacesInput): Promise<IdentifyFacesOutput> {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) return rej('No credentials');
            if (!credentials.identityId) return rej('No identityId'); // is this necessary
            // TODO: default values

            this.rekognition = new Rekognition({ region: this._config.identify.identifyEntities.region, credentials });
            let inputImage: Rekognition.Image;
            await this.configureSource(input.face.source)
                .then(data => inputImage = data)
                .catch(err => { return rej(err); });

            const param = { Image: inputImage };
            if (input.celebrityDetection) {
                this.rekognition.recognizeCelebrities(param, (err, data) => {
                    if (err) return rej(err);
                    const faces = data.CelebrityFaces.map(celebrity => {
                        return {
                            boundingBox: this.makeCamelCase(celebrity.Face.BoundingBox),
                            landmarks: this.makeCamelCaseArray(celebrity.Face.Landmarks),
                            metadata: {
                                ...this.makeCamelCase(celebrity, ['Id', 'Name', 'Urls']),
                                pose: this.makeCamelCase(celebrity.Face.Pose)
                            }
                        };
                    });
                    res({ face: faces });
                });
            } else if (input.face.collection) {
                // Concatenate additional parameters
                const updatedParam = { ...param, CollectionId: input.face.collection, MaxFaces: input.face.maxFaces };
                this.rekognition.searchFacesByImage(updatedParam, (err, data) => {
                    if (err) return rej(err);
                    const faces = data.FaceMatches.map(val => {
                        return {
                            boundingBox: this.makeCamelCase(val.Face.BoundingBox),
                            externalImageId: val.Face.ExternalImageId,
                            imageId: val.Face.ImageId,
                            similarity: val.Similarity,
                        };
                    });
                    res({ face: faces });
                });
            } else {
                this.rekognition.detectFaces(param, (err, data) => {
                    if (err) return rej(err);
                    const faces = data.FaceDetails.map(detail => {
                        // face attributes keys we want to extract from Rekognition's response
                        const attributeKeys = [
                            'Smile', 'Eyeglasses', 'Sunglasses', 'Gender', 'Beard',
                            'Mustache', 'EyesOpen', 'MouthOpen',
                        ];
                        const faceAttributes = this.makeCamelCase(detail, attributeKeys);
                        if (detail.Emotions) {
                            faceAttributes['emotions'] = detail.Emotions.map(emotion => emotion.Type);
                        }
                        return {
                            boundingBox: this.makeCamelCase(detail.BoundingBox),
                            landmarks: this.makeCamelCaseArray(detail.Landmarks),
                            ageRange: this.makeCamelCase(detail.AgeRange),
                            attributes: this.makeCamelCase(detail, attributeKeys),
                            metadata: this.makeCamelCase(detail, ['Confidence', 'Pose'])
                        };
                    });
                    res({ face: faces });
                });
            }
        });
    }

    protected orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.identify(input);
    }
}
