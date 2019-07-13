import { Credentials } from '@aws-amplify/core';
import Storage from '@aws-amplify/storage';
import { AbstractIdentifyPredictionsProvider } from '../types/Providers';
import { GraphQLPredictionsProvider } from '.';
import * as Rekognition from 'aws-sdk/clients/rekognition';
import {
    IdentifyEntityInput, IdentifyEntityOutput, IdentifySource, IdentifyFacesInput, IdentifyFacesOutput, 
    isStorageSource, isFileSource, isBytesSource, IdentifyTextInput, IdentifyTextOutput, Table, TableCell,
    KeyValue, BoundingBox,
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

    /**
     * Verify user input source and converts it into source object readable by Rekognition and Textract.
     * @param {IdentifySource} source - User input source that directs to the object user wants
     * to identify (storage, file, or bytes).
     * @return {Promise<Rekognition.Image | Textract.Document> } - Promise resolving to the converted source object.
     */
    private configureSource(source: IdentifySource): Promise<Rekognition.Image | Textract.Document> {
        return new Promise(async (res, rej) => {
            const image: Rekognition.Image = {}; // empty image object that we'll write on.
            if (isStorageSource(source)) {
                const storage = source.storage;
                const storageConfig: any = {
                    level: storage.level,
                    identityId: storage.identityId,
                };
                Storage.get(storage.key, storageConfig)
                    .then((url: string) => {
                        const parser = /https:\/\/([a-zA-Z0-9%-_.]+)\.s3\.[A-Za-z0-9%-._~]+\/([a-zA-Z0-9%-._~/]+)\?/;
                        const parsedGroups = url.match(parser);
                        if (parsedGroups.length < 3) rej('Invalid S3 url was returned.');
                        image.S3Object = {
                            Bucket: parsedGroups[1],
                            Name: decodeURIComponent(parsedGroups[2]),
                        };
                        res(image);
                    })
                    .catch(err => rej(err));
            } else if (isFileSource(source)) {
                new Response(source.file).arrayBuffer().then(bytes => {
                    image.Bytes = bytes;
                    res(image);
                }).catch(err => rej(err));
            } else if (isBytesSource(source)) {
                if (source.bytes instanceof Blob) {
                    new Response(source.bytes).arrayBuffer().then(bytes => {
                        image.Bytes = bytes;
                        res(image);
                    }).catch(err => rej(err));
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

            this.rekognition = new Rekognition({ region: this._config.identifyEntities.region, credentials });
            this.textract = new Textract({ region: this._config.identifyEntities.region, credentials });
            let inputDocument: Textract.Document;
            await this.configureSource(input.text.source)
                .then(data => inputDocument = data)
                .catch(err => { return rej(err); });

            // get default value if format isn't specified in the input.
            if (!input.text.format) {
                if (this._config.identifyText.format) {
                    // default from awsexports
                    input.text.format = this._config.identifyText.format;
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
                 * Empty indicates that we will identify plain text. We will use rekognition (suitable for everyday 
                 * images but has 50 word limit) first and see if reaches its word limit. If it does, then we call
                 * textract and use the data that identify more words.
                 */
                const textractParam: Textract.DetectDocumentTextRequest = { Document: inputDocument, };
                const rekognitionParam: Rekognition.DetectTextRequest = { Image: inputDocument };
                this.rekognition.detectText(rekognitionParam, (rekognitionErr, rekognitionData) => {
                    if (rekognitionErr) return rej(rekognitionErr);
                    const textractResponse = this.categorizeRekognitionBlocks(rekognitionData.TextDetections);
                    if (textractResponse.text.words.length < 50) {
                        // did not hit the word limit, return the data
                        return res(textractResponse);
                    }
                    this.textract.detectDocumentText(textractParam, (textractErr, textractData) => {
                        if (textractErr) return rej(textractErr);
                        // use the service that identified more texts.
                        if (rekognitionData.TextDetections.length > textractData.Blocks.length) {
                            return res(textractResponse);
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
    private refactorBoundingBox(boundingBox: Rekognition.BoundingBox | Textract.BoundingBox): BoundingBox {
        return {
            width: boundingBox.Width,
            height: boundingBox.Height,
            left: boundingBox.Left,
            top: boundingBox.Top,
        };
    }

    private refactorPolygon(polygon: Rekognition.Polygon | Textract.Polygon) {
        return polygon.map(val => { return { x: val.X, y: val.Y }; });
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
        // if blocks is an empty array, ie. rekognition did not detect anything, return empty response.
        if (blocks.length === 0) return response;

        // We categorize each block by running a forEach loop through them.
        blocks.forEach(block => {
            switch (block.Type) {
                case 'LINE':
                    response.text.lines.push(block.DetectedText);
                    response.text.linesDetailed.push({
                        text: block.DetectedText,
                        polygon: this.refactorPolygon(block.Geometry.Polygon),
                        boundingBox: this.refactorBoundingBox(block.Geometry.BoundingBox),
                        page: null,
                    });
                    break;
                case 'WORD':
                    response.text.fullText += block.DetectedText + ' ';
                    response.text.words.push({
                        text: block.DetectedText,
                        polygon: this.refactorPolygon(block.Geometry.Polygon),
                        boundingBox: this.refactorBoundingBox(block.Geometry.BoundingBox)
                    });
                    break;
            }
        });
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
                        polygon: this.refactorPolygon(block.Geometry.Polygon),
                        boundingBox: this.refactorBoundingBox(block.Geometry.BoundingBox),
                        page: block.Page
                    });
                    break;
                case 'WORD':
                    response.text.fullText += block.Text + ' ';
                    response.text.words.push({
                        text: block.Text,
                        polygon: this.refactorPolygon(block.Geometry.Polygon),
                        boundingBox: this.refactorBoundingBox(block.Geometry.BoundingBox),
                    });
                    blockMap[block.Id] = block;
                    break;
                case 'SELECTION_ELEMENT':
                    const selectionStatus = (block.SelectionStatus === 'SELECTED') ? true : false;
                    if (!response.text.selections)
                        response.text.selections = [];
                    response.text.selections.push({
                        selected: selectionStatus,
                        polygon: this.refactorPolygon(block.Geometry.Polygon),
                        boundingBox: this.refactorBoundingBox(block.Geometry.BoundingBox),
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
        // remove trailing space of fullText
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
                // We filter the KeyValue blocks of EntityType = `KEY`, which has both key and value references.
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
    ): { text?: string, selected?: boolean } {
        let words: string = '';
        let isSelected: boolean;
        if (block.Relationships) {
            block.Relationships.forEach(relation => {
                relation.Ids.forEach((contentId, index) => {
                    const contentBlock = blockMap[contentId];
                    if (contentBlock.BlockType === 'WORD') {
                        words += contentBlock.Text + ' ';
                    } else if (contentBlock.BlockType === 'SELECTION_ELEMENT') {
                        isSelected = (contentBlock.SelectionStatus === 'SELECTED') ? true : false;
                    }
                });
            });
        }
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
                    boundingBox: this.refactorBoundingBox(cellBlock.Geometry.BoundingBox),
                    polygon: this.refactorPolygon(cellBlock.Geometry.Polygon),
                    selected: content.selected,
                    rowSpan: cellBlock.RowSpan,
                    columnSpan: cellBlock.ColumnSpan,
                };
                if (!tableMatrix[row]) tableMatrix[row] = [];
                tableMatrix[row][col] = cell;
            });
        });
        const rowSize: number = tableMatrix.length;
        const columnSize: number = tableMatrix[0].length;
        return {
            size: { rows: rowSize, columns: columnSize },
            table: tableMatrix,
            boundingBox: this.refactorBoundingBox(table.Geometry.BoundingBox),
            polygon: this.refactorPolygon(table.Geometry.Polygon)
        };
    }

    /**
     * Constructs a key value object from its children key and value blocks.
     * @param {Textract.Block} KeyValue - KeyValue block that has references (`Relationships`) to its children.
     * @param {[id: string]: Textract.Block} blockMap - Maps block Ids to blocks. 
     */
    private constructKeyValue(
        keyValueBlock: Textract.Block,
        blockMap: { [key: string]: Textract.Block }
    ): KeyValue {
        let keyText: string = '';
        let valueText: string = '';
        let valueSelected: boolean;
        keyValueBlock.Relationships.forEach(keyValueRelation => {
            if (keyValueRelation.Type === 'CHILD') {
                // relation refers to key
                const contents = this.extractContentsFromBlock(keyValueBlock, blockMap);
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
            value: {
                text: valueText,
                selected: valueSelected
            },
            polygon: this.refactorPolygon(keyValueBlock.Geometry.Polygon),
            boundingBox: this.refactorBoundingBox(keyValueBlock.Geometry.BoundingBox),
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

            this.rekognition = new Rekognition({ region: this._config.identifyEntities.region, credentials });
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
            Promise.all(servicePromises).then(data => {
                let identifyResult: IdentifyEntityOutput = {};
                data.forEach(val => {
                    identifyResult = { ...identifyResult, ...val }; // concatenate resolved promises to a single object
                });
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
                const detectLabelData = data.Labels.map(val => {
                    // extract bounding boxes 
                    const boxes = val.Instances.map(instance => {
                        return {
                            width: instance.BoundingBox.Width,
                            height: instance.BoundingBox.Height,
                            left: instance.BoundingBox.Left,
                            top: instance.BoundingBox.Top,
                        };
                    });
                    return {
                        name: val.Name,
                        boundingBoxes: boxes,
                        metadata: {
                            confidence: val.Confidence,
                            parents: val.Parents,
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

            this.rekognition = new Rekognition({ region: this._config.identifyEntities.region, credentials });
            let inputImage: Rekognition.Image;
            await this.configureSource(input.face.source)
                .then(data => inputImage = data)
                .catch(err => { return rej(err); });

            const param = { Image: inputImage };
            if (input.face.celebrityDetection) {
                this.rekognition.recognizeCelebrities(param, (err, data) => {
                    if (err) return rej(err);
                    const faces = data.CelebrityFaces.map(val => {
                        return {
                            boundingBox: this.refactorBoundingBox(val.Face.BoundingBox),
                            landmarks: val.Face.Landmarks.map(landmark => {
                                return { type: landmark.Type, x: landmark.X, y: landmark.Y };
                            }),
                            metadata: {
                                id: val.Id,
                                confidence: val.MatchConfidence,
                                name: val.Name,
                                urls: val.Urls,
                                pose: {
                                    roll: val.Face.Pose.Roll,
                                    yaw: val.Face.Pose.Yaw,
                                    sharpness: val.Face.Pose.Pitch,
                                }
                            }
                        };
                    });
                    res({ face: faces });
                });
            } else if (input.face.collection) {
                // Concatenate additional parameters
                const updatedParam = {
                    ...param,
                    CollectionId: input.face.collection,
                    MaxFaces: input.face.maxFaces
                };
                this.rekognition.searchFacesByImage(updatedParam, (err, data) => {
                    if (err) return rej(err);
                    const faces = data.FaceMatches.map(val => {
                        return {
                            boundingBox: this.refactorBoundingBox(val.Face.BoundingBox),
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
                    const faces = data.FaceDetails.map(val => {
                        // transform returned data to reflect identify API
                        const faceAttributes = {
                            smile: val.Smile.Value,
                            eyeglasses: val.Eyeglasses.Value,
                            sunglasses: val.Sunglasses.Value,
                            gender: val.Gender.Value,
                            beard: val.Beard.Value,
                            mustache: val.Mustache.Value,
                            eyesOpen: val.EyesOpen.Value,
                            mouthOpen: val.MouthOpen.Value,
                            emotions: val.Emotions.map(emotion => {
                                return emotion.Type;
                            }),
                        };
                        Object.keys(faceAttributes).forEach(key => {
                            faceAttributes[key] === undefined && delete faceAttributes[key];
                        }); // strip undefined attributes for conciseness
                        return {
                            boundingBox: {
                                width: val.BoundingBox.Width,
                                height: val.BoundingBox.Height,
                                left: val.BoundingBox.Left,
                                top: val.BoundingBox.Top,
                            },
                            landmarks: val.Landmarks.map(landmark => {
                                return { type: landmark.Type, x: landmark.X, y: landmark.Y };
                            }),
                            ageRange: {
                                low: val.AgeRange.Low,
                                high: val.AgeRange.High,
                            },
                            attributes: faceAttributes,
                            metadata: {
                                confidence: val.Confidence,
                                pose: val.Pose,
                            }
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
