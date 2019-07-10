import { Credentials } from '@aws-amplify/core';
import { AbstractIdentifyPredictionsProvider } from '../types/Providers';
import { GraphQLPredictionsProvider } from '.';
import * as Rekognition from 'aws-sdk/clients/rekognition';
import {
    IdentifyEntityInput, IdentifyEntityOutput, IdentifySource, IdentifyFacesInput,
    IdentifyFacesOutput, isStorageSource, isFileSource, isBytesSource,
    /* IdentifyTextInput, IdentifyTextOutput, IdentifyTextTable, IdentifyTextCell */
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
     * Verify user input source and refactor it to a Rekognition.Image object that can be
     * readily used to call AWS.Rekognition API. 
     * @param {IdentifySource} source - User input source that directs to the object user wants
     *  to identify (storage, file, or bytes).
     * @return - Refactored source. Throws appropriate errors if the input is not valid. 
     */
    private verifyAndRefactorSource(source: IdentifySource): Promise<Rekognition.Image> | Promise<Textract.Document> {
        // TODO: Configures s3 storage and level according to awsconfig.
        return new Promise(async (res, rej) => {
            const image: Rekognition.Image = {}; // empty image object that we'll write on.
            if (isStorageSource(source)) {
                const storage = source.storage;
                let storageKey: string;
                if (!storage.level) {
                    // storage.level = Storage.config.level
                }
                if (storage.level === 'public') {
                    storageKey = `public/${storage.key}`;
                } else if (storage.level === 'private') {
                    const credentials = await Credentials.get();
                    if (!credentials || !credentials.identityId) return rej('No identityId');
                    storageKey = `private/${credentials.identityId}/${storage.key}`;
                } else { // if (storage.level === 'protected')
                    if (storage.identityId) {
                        // prefer identityId in the input
                        storageKey = `protected/${storage.identityId}/${storage.key}`;
                    } else {
                        // use the caller's credential
                        const credentials = await Credentials.get();
                        if (!credentials || !credentials.identityId) return rej('No identityId');
                        storageKey = `protected/${credentials.identityId}/${storage.key}`;
                    }
                } // should I put else here to catch out of type error?
                image.S3Object = { Bucket: this._config.aws_user_files_s3_bucket, Name: storageKey };
            } else if (isFileSource(source)) {
                image.Bytes = source.file; // File extends Blob, so we can just pass it in without changes.
            } else if (isBytesSource(source)) {
                image.Bytes = source.bytes;
            } else {
                rej('Input source is not configured correctly.');
            }
            res(image);
        });
    }

    // protected identifyText(input: IdentifyTextInput): Promise<IdentifyTextOutput> {
    //     return new Promise(async (res, rej) => {
    //         const credentials = await Credentials.get();
    //         if (!credentials) return rej('No credentials');
    //         if (!credentials.identityId) return rej('No identityId');

    //         this.textract = new Textract({ region: this._config.identifyEntities.region, credentials });
    //         let inputDocument: Textract.Document;
    //         this.verifyAndRefactorSource(input.text.source)
    //             .then(data => inputDocument = data)
    //             .catch(err => { return res(err); });

    //         // get default value if format isn't specified in the input.
    //         if (!input.text.format) {
    //             if (this._config.identifyText.format) {
    //                 // default from awsexports
    //                 input.text.format = this._config.identifyText.format;
    //             } else {
    //                 input.text.format = 'PLAIN';
    //             }
    //         }
    //         const featureTypes: Textract.FeatureTypes = [];
    //         if (input.text.format === 'FORM' || input.text.format === 'ALL') {
    //             featureTypes.push('FORMS');
    //         }
    //         if (input.text.format === 'TABLE' || input.text.format === 'ALL') {
    //             featureTypes.push('TABLES');
    //         }
    //         let blocks: Textract.BlockList;
    //         if (featureTypes.length === 0) {
    //             // use detectDocumentText instead of analyzeDocument
    //             const param: Textract.DetectDocumentTextRequest = { Document: inputDocument, };
    //             this.textract.detectDocumentText(param, (err, data) => {
    //                 if (err) return rej(err);
    //                 blocks = data.Blocks;
    //             });
    //         } else {
    //             const param: Textract.AnalyzeDocumentRequest = {
    //                 Document: inputDocument,
    //                 FeatureTypes: featureTypes
    //             };
    //             this.textract.detectDocumentText(param, (err, data) => {
    //                 if (err) return rej(err);
    //                 blocks = data.Blocks;
    //             });
    //         }
    //         return res(this.organizeBlocks(blocks));
    //     });
    // }

    /** 
     * Organizes blocks returned from Textract to each of its block categories.
     */
    // private organizeBlocks(blocks: Textract.BlockList): IdentifyTextOutput {
    //     const response: IdentifyTextOutput = {
    //         text: {
    //             fullText: '',
    //             words: [],
    //             lines: [],
    //             linesDetailed: [],
    //             keyValues: [],
    //             selections: [],
    //             tables: [],
    //         }
    //     };

    //     const tableBlocks: Textract.BlockList = Array();
    //     const blockMap: { [key: string]: Textract.Block } = {};

    //     blocks.forEach(val => {
    //         if (val.BlockType === 'WORD') {
    //             response.text.fullText += val.Text + ' ';
    //             response.text.words.push({
    //                 text: val.Text,
    //                 polygon: val.Geometry.Polygon,
    //                 boundingBox: val.Geometry.BoundingBox,
    //             });
    //             blockMap[val.Id] = val;
    //         } else if (val.BlockType === 'LINE') {
    //             response.text.lines.push(val.Text);
    //             response.text.linesDetailed.push({
    //                 text: val.Text,
    //                 polygon: val.Geometry.Polygon,
    //                 boundingBox: val.Geometry.BoundingBox,
    //                 id: val.Id,
    //                 page: val.Page
    //             });
    //         } else if (val.BlockType === 'TABLE') {
    //             tableBlocks.push(val);
    //         } else if (val.BlockType === 'CELL') {
    //             blockMap[val.Id] = val;
    //         } else if (val.BlockType === 'KEY_VALUE_SET') {
    //             blockMap[val.Id] = val;
    //         } else if (val.BlockType === 'SELECTION_ELEMENT') {
    //             blockMap[val.Id] = val;
    //         }
    //     });

    //     if (tableBlocks.length !== 0) {
    //         const tableResponse: IdentifyTextTable[] = Array();
    //         tableBlocks.forEach(table => { tableResponse.push(this.organizeTable(table, blockMap)); });
    //         response.text.tables = tableResponse;
    //     }


    //     return response;
    // }

    // private organizeTable(table: Textract.Block, blockMap: { [key: string]: Textract.Block }): IdentifyTextTable {
    //     let tableMatrix: IdentifyTextCell[][];
    //     tableMatrix = [];
    //     table.Relationships.forEach(tableRelation => {
    //         if (tableRelation.Type === 'CHILD') {
    //             tableRelation.Ids.forEach(cellId => {
    //                 const cellBlock: Textract.Block = blockMap[cellId];
    //                 const row = cellBlock.RowIndex;
    //                 const col = cellBlock.ColumnIndex;
    //                 // get text contained in this cell.
    //                 let cellText = '';
    //                 cellBlock.Relationships.forEach(cellRelation => {
    //                     if (cellRelation.Type === 'CHILD') {
    //                         cellRelation.Ids.forEach((contentId, index) => {
    //                             const contentBlock: Textract.Block = blockMap[contentId];
    //                             if (contentBlock.BlockType === 'WORD') {
    //                                 cellText += contentBlock.Text;
    //                                 if (index !== cellRelation.Ids.length - 1) cellText += ' ';
    //                             } else if (contentBlock.BlockType === 'SELECTION_ELEMENT') {
    //                                 cellText += contentBlock.SelectionStatus;
    //                             }
    //                         });
    //                     }
    //                 });
    //                 if (!tableMatrix[row]) tableMatrix[row] = [];
    //                 tableMatrix[row][col] = {
    //                     text: cellText,
    //                     boundingBox: cellBlock.Geometry.BoundingBox,
    //                     polygon: cellBlock.Geometry.Polygon,
    //                 };
    //             });
    //         }
    //     });
    //     const rowSize: number = tableMatrix.length;
    //     const columnSize: number = tableMatrix[0].length;
    //     return {
    //         size: { rows: rowSize, columns: columnSize },
    //         matrix: tableMatrix,
    //         boundingBox: table.Geometry.BoundingBox,
    //         polygon: table.Geometry.Polygon
    //     };
    // }

    private detectLabels(param: Rekognition.DetectLabelsRequest): Promise<IdentifyEntityOutput> {
        return new Promise((res, rej) => {
            this.rekognition.detectLabels(param, (err, data) => {
                if (err) return rej(err);
                const detectLabelData = data.Labels.map(val => {
                    // extract bounding boxes 
                    const boxes = val.Instances.map(instance => { return instance.BoundingBox; });
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
     * Identify instances of real world entities from an image and if it contains unsafe content.
     * @param {IdentifyEntityInput} input - object containing the source image and entity type to identify.
     * @return {Promise<IdentifyEntityOutput>} 
     */
    protected identifyEntity(input: IdentifyEntityInput): Promise<IdentifyEntityOutput> {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) return rej('No credentials');
            if (!credentials.identityId) return rej('No identityId');

            this.rekognition = new Rekognition({ region: this._config.identifyEntities.region, credentials });
            let inputImage: Rekognition.Image;
            await this.verifyAndRefactorSource(input.entity.source)
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
     * Identify faces within an image that is provided as input, and match faces from a collection 
     * or identify celebrities.
     * @param {IdentifyEntityInput} input - object containing the source image and face match options.
     * @return {Promise<IdentifyEntityOutput>} Promise resolving to identify results.
     */
    protected identifyFaces(input: IdentifyFacesInput): Promise<IdentifyFacesOutput> {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) return rej('No credentials');
            if (!credentials.identityId) return rej('No identityId');

            this.rekognition = new Rekognition({ region: this._config.identifyEntities.region, credentials });
            let inputImage: Rekognition.Image;
            this.verifyAndRefactorSource(input.face.source)
                .then(data => inputImage = data)
                .catch(err => { return res(err); });

            const param = { Image: inputImage };

            if (input.face.celebrityDetection) {
                this.rekognition.recognizeCelebrities(param, (err, data) => {
                    if (err) return rej(err);
                    const faces = data.CelebrityFaces.map(val => {
                        return {
                            boundingBox: val.Face.BoundingBox,
                            landmarks: val.Face.Landmarks,
                            metadata: {
                                id: val.Id,
                                confidence: val.MatchConfidence,
                                name: val.Name,
                                urls: val.Urls,
                                pose: val.Face.Pose,
                                quality: val.Face.Quality
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
                            boundingBox: val.Face.BoundingBox,
                            confidence: val.Face.Confidence,
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
                            smile: val.Smile,
                            eyeglasses: val.Eyeglasses,
                            sunglasses: val.Sunglasses,
                            gender: val.Gender,
                            beard: val.Beard,
                            mustache: val.Mustache,
                            eyesOpen: val.EyesOpen,
                            mouthOpen: val.MouthOpen,
                            emotions: val.Emotions,
                        };
                        Object.keys(faceAttributes).forEach(key => {
                            faceAttributes[key] === undefined && delete faceAttributes[key];
                        }); // strip undefined attributes for conciseness
                        return {
                            boundingBox: val.BoundingBox,
                            ageRange: val.AgeRange,
                            landmarks: val.Landmarks,
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
