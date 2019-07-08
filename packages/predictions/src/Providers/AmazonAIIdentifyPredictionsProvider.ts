import { Credentials } from '@aws-amplify/core';
import { AbstractIdentifyPredictionsProvider } from '../types/Providers';
import { GraphQLPredictionsProvider } from '.';
import * as Rekognition from 'aws-sdk/clients/rekognition';
import {
    IdentifyEntityInput, IdentifyEntityOutput,
    IdentifySource, IdentifyFacesInput, IdentifyFacesOutput, IdentifyTextInput, IdentifyTextOutput,
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
    private verifyAndRefactorSource(source: IdentifySource): Rekognition.Image {
        /* First, check that only one source is present in the input. */
        let nSourcesProvided = 0;
        if (source.storage)++nSourcesProvided;
        if (source.bytes)++nSourcesProvided;
        if (source.file)++nSourcesProvided;
        if (nSourcesProvided !== 1) throw new Error('Only one source (storage, file, or bytes) must be provided.');

        const image: Rekognition.Image = {}; // empty image object that we'll write on.
        /* Next, update the source to format that can be readily used on AWS.Rekognition calls. */
        if (source.storage) {
            const storage = source.storage;
            let storageKey: string;
            if (storage.level && storage.level !== 'public') {
                if (!storage.identityId) throw new Error('identityId must be provided to use non-public storage.');
                storageKey = `${storage.level}/${storage.identityId}/${storage.key}`;
            } else { // storage level is public
                // TODO: verify that if storage.level is not defined then we can assume it's public
                storageKey = `public/${storage.key}`;
            }
            image.S3Object = { Bucket: this._config.aws_user_files_s3_bucket, Name: storageKey };
            // TODO: Validate how user s3 buckets are configured.
        } else if (source.file) {
            image.Bytes = source.file;
        } else { // if (source.bytes)
            image.Bytes = source.bytes;
        }
        return image;
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
            try {
                inputImage = this.verifyAndRefactorSource(input.entity.source);
            } catch (err) {
                return rej(err);
            }
            const param = { Image: inputImage };
            const entityType = input.entity.type;
            if (entityType === 'LABELS') {
                this.rekognition.detectLabels(param, (err, data) => {
                    if (err)
                        return rej(err);
                    const detectLabelData = data.Labels.map(val => {
                        const boxes = val.Instances.map(instance => { return instance.BoundingBox; });
                        return { name: val.Name, boundingBoxes: boxes };
                    });
                    return res({ entity: detectLabelData });
                });
            } else if (entityType === 'UNSAFE') {
                this.rekognition.detectModerationLabels(param, (err, data) => {
                    if (err)
                        return rej(err);
                    if (data.ModerationLabels.length !== 0)
                        return res({ unsafe: 'NO' });
                    else
                        return res({ unsafe: 'YES' });
                });
            } else { // if (entityType === 'ALL') 
                let entityData: IdentifyEntityOutput;
                this.rekognition.detectLabels(param, (err, data) => {
                    if (err) return rej(err);
                    const detectLabelData = data.Labels.map(val => {
                        const boxes = val.Instances.map(instance => { return instance.BoundingBox; });
                        return { name: val.Name, boundingBoxes: boxes };
                    });
                    entityData = { entity: detectLabelData };
                });
                this.rekognition.detectModerationLabels(param, (err, data) => {
                    if (err)
                        return rej(err);
                    if (data.ModerationLabels.length !== 0)
                        return res({ ...entityData, unsafe: 'NO' });
                    else
                        return res({ ...entityData, unsafe: 'YES' });
                });
            }
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
            try {
                inputImage = this.verifyAndRefactorSource(input.face.source);
            } catch (err) {
                return rej(err);
            }
            const param = { Image: inputImage };
            if (input.face.celebrityDetection) {
                this.rekognition.recognizeCelebrities(param, (err, data) => {
                    if (err) return rej(err);
                    const faces = data.CelebrityFaces.map(val => {
                        return { boundingBox: val.Face.BoundingBox, landmarks: val.Face.Landmarks };
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
                        return { boundingBox: val.Face.BoundingBox };
                    });
                    res({ face: faces });
                });
            } else {
                this.rekognition.detectFaces(param, (err, data) => {
                    if (err) return rej(err);
                    const faces = data.FaceDetails.map(val => {
                        // transform returned data to reflect identify API
                        return {
                            boundingBox: val.BoundingBox,
                            ageRange: val.AgeRange,
                            landmarks: val.Landmarks,
                            attributes: {
                                smile: val.Smile,
                                eyeglasses: val.Eyeglasses,
                                sunglasses: val.Sunglasses,
                                gender: val.Gender,
                                beard: val.Beard,
                                mustache: val.Mustache,
                                eyesOpen: val.EyesOpen,
                                mouthOpen: val.MouthOpen,
                                emotions: val.Emotions,
                            },
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
