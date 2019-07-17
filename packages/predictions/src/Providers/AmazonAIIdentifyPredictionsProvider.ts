import { Credentials, ConsoleLogger as Logger } from '@aws-amplify/core';
import Storage from '@aws-amplify/storage';
import { AbstractIdentifyPredictionsProvider } from '../types/Providers';
import { GraphQLPredictionsProvider } from '.';
import * as Rekognition from 'aws-sdk/clients/rekognition';
import {
    IdentifyEntityInput, IdentifyEntityOutput, IdentifySource, IdentifyFacesInput, IdentifyFacesOutput,
    isStorageSource, isFileSource, isBytesSource, IdentifyTextInput, IdentifyTextOutput,
} from '../types';
import * as Textract from 'aws-sdk/clients/textract';
import { makeCamelCase, makeCamelCaseArray, blobToArrayBuffer } from './Utils';
import { categorizeRekognitionBlocks, categorizeTextractBlocks } from './IdentifyTextUtils';

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
     * Note that Rekognition and Textract use the same source interface, so we need not worry about types.
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
                blobToArrayBuffer(source.file)
                    .then(buffer => { res({ Bytes: buffer }); })
                    .catch(err => rej(err));
            } else if (isBytesSource(source)) {
                const bytes = source.bytes;
                if (bytes instanceof Blob) {
                    blobToArrayBuffer(bytes)
                        .then(buffer => { res({ Bytes: buffer }); })
                        .catch(err => rej(err));
                }
                // everything else can be directly passed to Rekognition / Textract.
                res({ Bytes: bytes });
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

            this.rekognition = new Rekognition({ region: this._config.identify.identifyEntities.region, credentials });
            this.textract = new Textract({ region: this._config.identify.identifyEntities.region, credentials });
            let inputDocument: Textract.Document;
            await this.configureSource(input.text.source)
                .then(data => inputDocument = data)
                .catch(err => { rej(err); });

            // get default value if format isn't specified in the input.
            const format = input.text.format || this._config.identify.identifyText.format || 'PLAIN';
            const featureTypes: Textract.FeatureTypes = []; // structures we want to analyze (e.g. [TABLES, FORMS]).
            if (format === 'FORM' || format === 'ALL')
                featureTypes.push('FORMS');
            if (format === 'TABLE' || format === 'ALL')
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
                    const rekognitionResponse = categorizeRekognitionBlocks(rekognitionData.TextDetections);
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
                            return res(categorizeTextractBlocks(textractData.Blocks));
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
                    res(categorizeTextractBlocks(blocks));
                });
            }
        });
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

            this.rekognition = new Rekognition({ region: this._config.identify.identifyEntities.region, credentials });
            let inputImage: Rekognition.Image;
            await this.configureSource(input.entity.source)
                .then(data => { inputImage = data; })
                .catch(err => { return rej(err); });
            const param = { Image: inputImage };
            const servicePromises = [];

            // get default argument
            const entityType = input.entity.type || this._config.identify.identifyEntity.type;
            if (entityType === 'LABELS' || entityType === 'ALL') {
                servicePromises.push(this.detectLabels(param));
            }
            if (entityType === 'UNSAFE' || entityType === 'ALL') {
                servicePromises.push(this.detectModerationLabels(param));
            }
            // if (servicePromises.length === 0) {
            //     rej('You must specify entity type: LABELS | UNSAFE | ALL');
            // }
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
                        val.Instances.map(val => makeCamelCase(val.BoundingBox)) : undefined;
                    return {
                        name: val.Name,
                        boundingBoxes: boxes,
                        metadata: {
                            confidence: val.Confidence,
                            parents: makeCamelCaseArray(val.Parents)
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

            // default arguments
            const collection: string = input.face.collection || this._config.identify.identifyFaces.collection;
            const maxFaces: number = input.face.maxFaces || this._config.identify.identifyFaces.maxFaces;
            const celebrityDetection: boolean =
                input.celebrityDetection || this._config.identify.identifyFaces.celebrityDetection;

            this.rekognition = new Rekognition({ region: this._config.identify.identifyEntities.region, credentials });
            let inputImage: Rekognition.Image;
            await this.configureSource(input.face.source)
                .then(data => inputImage = data)
                .catch(err => { return rej(err); });

            const param = { Image: inputImage };
            if (celebrityDetection) {
                this.rekognition.recognizeCelebrities(param, (err, data) => {
                    if (err) return rej(err);
                    const faces = data.CelebrityFaces.map(celebrity => {
                        return {
                            boundingBox: makeCamelCase(celebrity.Face.BoundingBox),
                            landmarks: makeCamelCaseArray(celebrity.Face.Landmarks),
                            metadata: {
                                ...makeCamelCase(celebrity, ['Id', 'Name', 'Urls']),
                                pose: makeCamelCase(celebrity.Face.Pose)
                            }
                        };
                    });
                    res({ face: faces });
                });
            } else if (collection) {
                // Concatenate additional parameters
                const updatedParam = { ...param, CollectionId: input.face.collection, MaxFaces: maxFaces };
                this.rekognition.searchFacesByImage(updatedParam, (err, data) => {
                    if (err) return rej(err);
                    const faces = data.FaceMatches.map(val => {
                        return {
                            boundingBox: makeCamelCase(val.Face.BoundingBox),
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
                        const faceAttributes = makeCamelCase(detail, attributeKeys);
                        if (detail.Emotions) {
                            faceAttributes['emotions'] = detail.Emotions.map(emotion => emotion.Type);
                        }
                        return {
                            boundingBox: makeCamelCase(detail.BoundingBox),
                            landmarks: makeCamelCaseArray(detail.Landmarks),
                            ageRange: makeCamelCase(detail.AgeRange),
                            attributes: makeCamelCase(detail, attributeKeys),
                            metadata: {
                                confidence: detail.Confidence,
                                pose: makeCamelCase(detail.Pose)
                            } 
                        };
                    });
                    res({ face: faces });
                });
            }
        });
    }
}
