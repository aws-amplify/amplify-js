import { Credentials } from '@aws-amplify/core';
import { AbstractIdentifyPredictionsProvider } from "../types/Providers";
import { GraphQLPredictionsProvider } from '.';
import * as Rekognition from 'aws-sdk/clients/rekognition';
import {
    IdentifyEntityInput, IdentifyEntityOutput, identifyEntityType,
    identifySource, IdentifyFacesInput, IdentifyFacesOutput,
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
        return "AmazonAIIdentifyPredictionsProvider";
    }

    /**
     * Verify user input source and refactor it to a Rekognition.Image object that can be
     * readily used to call AWS.Rekognition API. 
     * @param {identifySource} source - User input source that directs to the object user wants
     *  to identify (storage, file, or bytes).
     * @return - Refactored source. Throws appropriate errors if the input is not valid. 
     */
    private verifyAndRefactorSource(source: identifySource): Rekognition.Image {
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

            this.rekognition = new Rekognition({ region: this._config.region, credentials });
            let inputImage: Rekognition.Image;
            try {
                inputImage = this.verifyAndRefactorSource(input.identifyEntity.source);
            } catch (err) {
                rej(err);
            }
            const param = { Image: inputImage };

            let identifyEntityResult: IdentifyEntityOutput; // data to return
            const entityType: identifyEntityType = input.identifyEntity.type;

            if (entityType === 'LABELS' || entityType === 'ALL') {
                this.rekognition.detectLabels(param, (err, data) => {
                    if (err) rej(err);
                    // transform returned data to reflect identify API
                    const detectLabelData = data.Labels.map(val => {
                        return { name: val.Name, boundingBoxes: val.Instances };
                    });
                    identifyEntityResult = { entity: detectLabelData };
                });
            }
            if (entityType === 'UNSAFE' || entityType === 'ALL') {
                this.rekognition.detectModerationLabels(param, (err, data) => {
                    if (err) rej(err);
                    identifyEntityResult = data.ModerationLabels ?
                        { ...identifyEntityResult, unsafe: "YES" } : { ...identifyEntityResult, unsafe: "NO" };
                });
            }
            return res(identifyEntityResult);
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

            this.rekognition = new Rekognition({ region: this._config.region, credentials });
            let inputImage: Rekognition.Image;
            try {
                inputImage = this.verifyAndRefactorSource(input.identifyFaces.source);
            } catch (err) {
                rej(err);
            }
            const param = { Image: inputImage };

            let identifyFacesResult: IdentifyFacesOutput; // TODO: strongly type this
            if (input.identifyFaces.celebrityDetection) {
                this.rekognition.recognizeCelebrities(param, (err, data) => {
                    if (err) rej(err);
                    const faces = data.CelebrityFaces.map(val => {
                        return { boundingBox: val.Face.BoundingBox, landmarks: val.Face.Landmarks };
                    });
                    identifyFacesResult = { face: faces };
                });
            } else if (input.identifyFaces.collection) {
                // Concatenate additional parameters
                const updatedParam = {
                    ...param,
                    CollectionId: input.identifyFaces.collection,
                    MaxFaces: input.identifyFaces.maxFaces
                };
                this.rekognition.searchFacesByImage(updatedParam, (err, data) => {
                    if (err) rej(err);
                    const faces = data.FaceMatches.map(val => {
                        return { boundingBox: val.Face.BoundingBox };
                    });
                    identifyFacesResult = { face: faces };
                });
            } else {
                this.rekognition.detectFaces(param, (err, data) => {
                    if (err) rej(err);
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
                            }
                        };
                    });
                    identifyFacesResult = { face: faces };
                });
            }
            return res(identifyFacesResult);
        });
    }

    protected orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.identify(input);
    }
}
