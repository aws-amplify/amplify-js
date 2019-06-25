import { Credentials } from '@aws-amplify/core';
import { AbstractIdentifyPredictionsProvider } from "../types/Providers";
import { GraphQLPredictionsProvider } from '.';
import * as Rekognition from 'aws-sdk/clients/rekognition';
import { IdentifyImageInput, IdentifyFacesInput, IdentifyCelebritiesInput } from '../types';
import { Translate } from 'aws-sdk/clients/all';

export default class AmazonAIIdentifyPredictionsProvider extends AbstractIdentifyPredictionsProvider {

    private graphQLPredictionsProvider: GraphQLPredictionsProvider;
    private rekognition: Rekognition;
    // private textract: Textract;

    constructor() {
        super();
    }

    getProviderName() {
        return "AmazonAIIdentifyPredictionsProvider";
    }

    getS3Prefix(level?: string, identityId?: string) {
        if (level === 'public') {
            return "public/";
        } else if (level === 'private' || level === 'protected') {
            return "$(level)/$(identityId)/";
        } else {
            return "";
        }
    }
    protected identifyImage(input: IdentifyImageInput) {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) {
                return rej('No credentials');
            } else if (!credentials.identityId) {
                return rej('No identityId');
            }

            this.rekognition = new Rekognition({ region: this._config.region, credentials });
            const storage = input.identifyImage.source.storage;
            const prefix = this.getS3Prefix(storage.level, credentials.identityId);

            const param = {
                Image: {
                    S3Object: {
                        Bucket: storage.bucket,
                        Name: prefix + storage.key,
                    }
                },
                ...!input.identifyImage.maxLabels && { MaxLabels: input.identifyImage.maxLabels },
                ...!input.identifyImage.minConfidence && { MinConfidence: input.identifyImage.minConfidence }
            };
            this.rekognition.detectLabels(param, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res(data.Labels);
                }
            });
        });
    }

    protected identifyFaces(input: IdentifyFacesInput) {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) {
                return rej('No credentials');
            } else if (!credentials.identityId) {
                return rej('No identityId');
            }

            this.rekognition = new Rekognition({ region: this._config.region, credentials });
            const storage = input.identifyFaces.source.storage;
            const prefix = this.getS3Prefix(storage.level, credentials.identityId);

            const param = {
                Image: {
                    S3Object: {
                        Bucket: storage.bucket,
                        Name: prefix + storage.key,
                    }
                }
            };
            this.rekognition.detectFaces(param, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res(data.FaceDetails);
                }
            });
        });
    }

    protected identifyCelebrities(input: IdentifyCelebritiesInput) {
        return new Promise(async (res, rej) => {
            const credentials = await Credentials.get();
            if (!credentials) {
                return rej('No credentials');
            } else if (!credentials.identityId) {
                return rej('No identityId');
            }

            this.rekognition = new Rekognition({ region: this._config.region, credentials });
            const storage = input.identifyCelebrities.source.storage;
            const prefix = this.getS3Prefix(storage.level, credentials.identityId);

            const param = {
                Image: {
                    S3Object: {
                        Bucket: storage.bucket,
                        Name: prefix + storage.key,
                    }
                }
            };

            this.rekognition.recognizeCelebrities(param, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res({
                        CelebrityFaces: data.CelebrityFaces,
                        UnrecognizedFaces: data.UnrecognizedFaces
                    });
                }
            });
        });
    }

    protected orchestrateWithGraphQL(input: any): Promise<any> {
        return this.graphQLPredictionsProvider.identify(input);
    }
}
