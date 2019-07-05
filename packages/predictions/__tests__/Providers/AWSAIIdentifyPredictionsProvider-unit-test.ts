import { AWS, ClientDevice, Parser, ConsoleLogger as Logger, Credentials } from '@aws-amplify/core';
import { IdentifyEntityInput, IdentifyEntityOutput, IdentifyFacesInput, IdentifyFacesOutput, } from '../../src/types';
import { AmazonAIIdentifyPredictionsProvider } from '../../src/Providers';
import * as Rekognition from 'aws-sdk/clients/rekognition';

jest.mock('aws-sdk/clients/rekognition', () => {
    const Rekognition = () => {
        return;
    };

    // valid responses
    const detectlabelsResponse: Rekognition.DetectLabelsResponse = {
        Labels: [{
            Name: 'test',
            Instances: [{
                BoundingBox: {
                    Height: 0,
                    Left: 0,
                    Top: 0,
                    Width: 0,
                }
            }]
        }],
    };
    const detectModerationLabelsResponse: Rekognition.DetectModerationLabelsResponse = {
        ModerationLabels: [{ Name: 'test', Confidence: 0.0, }]
    };

    const detectFacesResponse: Rekognition.DetectFacesResponse = {
        FaceDetails: [{ AgeRange: { High: 0, Low: 0 } }]
    };
    const searchFacesByImageResponse: Rekognition.SearchFacesByImageResponse = {
        FaceMatches: [{ Face: { BoundingBox: { Height: 0, Left: 0, Top: 0, Width: 0 } }, Similarity: 0.0 }]
    };
    const recognizeCelebritiesResponse: Rekognition.RecognizeCelebritiesResponse = {
        CelebrityFaces: [{ Face: { BoundingBox: { Height: 0, Left: 0, Top: 0, Width: 0 } } }]
    };

    Rekognition.prototype.detectLabels = (params, callback) => {
        callback(null, detectlabelsResponse);
    };
    Rekognition.prototype.detectModerationLabels = (params, callback) => {
        callback(null, detectModerationLabelsResponse);
    };
    Rekognition.prototype.detectFaces = (params, callback) => {
        callback(null, detectFacesResponse);
    };
    Rekognition.prototype.searchFacesByImage = (params, callback) => {
        callback(null, searchFacesByImageResponse);
    };
    Rekognition.prototype.recognizeCelebrities = (params, callback) => {
        callback(null, recognizeCelebritiesResponse);
    };

    return Rekognition;
});


const credentials = {
    accessKeyId: 'accessKeyId',
    sessionToken: 'sessionToken',
    secretAccessKey: 'secretAccessKey',
    identityId: 'identityId',
    authenticated: true
};

const options = {
    // No option needed as of now. 
};

describe('Predictions identify provider test', () => {
    describe('identifyEntity tests', () => {
        describe('identifyEntity::labels tests', () => {
            const detectLabelInput: IdentifyEntityInput = {
                identifyEntity: {
                    source: {
                        storage: {
                            key: 'key',
                        }
                    },
                    type: 'LABELS'
                }
            };

            test('happy case credentials exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                const expected: IdentifyEntityOutput = {
                    entity: [{
                        name: 'test',
                        boundingBoxes: [{
                            Height: 0,
                            Left: 0,
                            Top: 0,
                            Width: 0,
                        }]
                    }],
                };
                return expect(predictionsProvider.identify(detectLabelInput)).resolves.toMatchObject(expected);
            });


            test('error case credentials do not exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return null;
                });
                return expect(predictionsProvider.identify(detectLabelInput)).rejects.toMatch('No credentials');
            });
            test('error case credentials exist but service fails', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                jest.spyOn(Rekognition.prototype, 'detectLabels').mockImplementationOnce(
                    (input, callback) => { callback('error', null); }
                );
                return expect(predictionsProvider.identify(detectLabelInput)).rejects.toMatch('error');

            });
        });

        describe('identifyEntity::unsafe tests', () => {
            const detectModerationInput: IdentifyEntityInput = {
                identifyEntity: {
                    source: {
                        storage: {
                            key: 'key',
                        }
                    },
                    type: 'UNSAFE'
                }
            };

            test('happy case credentials exist, unsafe image', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                const expected: IdentifyEntityOutput = {
                    unsafe: 'YES'
                };
                return expect(predictionsProvider.identify(detectModerationInput)).resolves.toMatchObject(expected);
            });

            // TODO: test safe image

            test('error case credentials do not exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return null;
                });
                return expect(predictionsProvider.identify(detectModerationInput)).rejects.toMatch('No credentials');
            });

            test('error case credentials exist but service fails', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                jest.spyOn(Rekognition.prototype, 'detectModerationLabels').mockImplementationOnce(
                    (input, callback) => { callback('error', null); }
                );
                return expect(predictionsProvider.identify(detectModerationInput)).rejects.toMatch('error');

            });
        });

        describe('identifyEntity::all tests', () => {
            const detectModerationInput: IdentifyEntityInput = {
                identifyEntity: {
                    source: {
                        storage: {
                            key: 'key',
                        }
                    },
                    type: 'ALL'
                }
            };

            test('happy case credentials exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                const expected: IdentifyEntityOutput = {
                    entity: [{
                        name: 'test',
                        boundingBoxes: [{
                            Height: 0,
                            Left: 0,
                            Top: 0,
                            Width: 0,
                        }]
                    }],
                    unsafe: 'YES'
                };
                return expect(predictionsProvider.identify(detectModerationInput)).resolves.toMatchObject(expected);
            });

            test('error case credentials do not exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return null;
                });
                return expect(predictionsProvider.identify(detectModerationInput)).rejects.toMatch('No credentials');
            });
            test('error case credentials exist but service fails', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                jest.spyOn(Rekognition.prototype, 'detectModerationLabels').mockImplementationOnce(
                    (input, callback) => { callback('error', null); }
                );
                return expect(predictionsProvider.identify(detectModerationInput)).rejects.toMatch('error');

            });
        });
    });

    describe('identifyFaces tests', () => {
        describe('identifyEntity::detctFaces tests', () => {
            const detectFacesInput: IdentifyFacesInput = {
                identifyFaces: {
                    source: {
                        storage: {
                            key: 'key',
                        }
                    },
                    celebrityDetection: false,
                }
            };

            test('happy case credentials exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                const expected: IdentifyFacesOutput = { face: [{ ageRange: { High: 0, Low: 0 } }] };
                return expect(predictionsProvider.identify(detectFacesInput)).resolves.toMatchObject(expected);
            });

            test('error case credentials do not exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return null;
                });
                return expect(predictionsProvider.identify(detectFacesInput)).rejects.toMatch('No credentials');
            });

            test('error case credentials exist but service fails', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                jest.spyOn(Rekognition.prototype, 'detectFaces').mockImplementationOnce(
                    (input, callback) => { callback('error', null); }
                );
                return expect(predictionsProvider.identify(detectFacesInput)).rejects.toMatch('error');

            });

        });

        describe('identifyEntity::recognizeCelebrities tests', () => {
            const recognizeCelebritiesInput: IdentifyFacesInput = {
                identifyFaces: { source: { storage: { key: 'key', } }, celebrityDetection: true, }
            };

            test('happy case credentials exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                const expected: IdentifyFacesOutput = {
                    face: [{ boundingBox: { Left: 0, Top: 0, Height: 0, Width: 0 } }]
                };
                return expect(predictionsProvider.identify(recognizeCelebritiesInput)).resolves.toMatchObject(expected);
            });

            test('error case credentials do not exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return null;
                });
                return expect(predictionsProvider.identify(recognizeCelebritiesInput))
                    .rejects.toMatch('No credentials');
            });

            test('error case credentials exist but service fails', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                jest.spyOn(Rekognition.prototype, 'recognizeCelebrities').mockImplementationOnce(
                    (input, callback) => { callback('error', null); }
                );
                return expect(predictionsProvider.identify(recognizeCelebritiesInput)).rejects.toMatch('error');

            });
        });

        describe('identifyEntity::searchImageByFaces tests', () => {
            const searchByFacesInput: IdentifyFacesInput = {
                identifyFaces: {
                    source: { storage: { key: 'key', } },
                    celebrityDetection: false,
                    maxFaces: 0,
                    collection: 'collection'
                }
            };

            test('happy case credentials exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                const expected: IdentifyFacesOutput = {
                    face: [{ boundingBox: { Left: 0, Top: 0, Height: 0, Width: 0 } }]
                };
                return expect(predictionsProvider.identify(searchByFacesInput)).resolves.toMatchObject(expected);
            });

            test('error case credentials do not exist', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return null;
                });
                return expect(predictionsProvider.identify(searchByFacesInput))
                    .rejects.toMatch('No credentials');
            });

            test('error case credentials exist but service fails', () => {
                const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
                predictionsProvider.configure(options);
                jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
                jest.spyOn(Rekognition.prototype, 'searchFacesByImage').mockImplementationOnce(
                    (input, callback) => { callback('error', null); }
                );
                return expect(predictionsProvider.identify(searchByFacesInput)).rejects.toMatch('error');

            });
        });
    });

    describe('identify input source transformation tests', () => {
        const detectlabelsResponse: Rekognition.DetectLabelsResponse = {
            Labels: [{
                Name: 'test',
                Instances: [{
                    BoundingBox: {
                        Height: 0,
                        Left: 0,
                        Top: 0,
                        Width: 0,
                    }
                }]
            }],
        };

        test('happy case input source valid public s3object', () => {
            const detectLabelInput: IdentifyEntityInput = {
                identifyEntity: {
                    source: {
                        storage: {
                            key: 'key',
                        }
                    },
                    type: 'LABELS'
                }
            };
            const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
            predictionsProvider.configure(options);
            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
            jest.spyOn(Rekognition.prototype, 'detectLabels').mockImplementationOnce(
                (input, callback) => {
                    expect(input.Image.S3Object.Name).toMatch('public/key');
                    callback(null, detectlabelsResponse);
                }
            );
            predictionsProvider.identify(detectLabelInput);
        });

        test('happy case input source valid private s3object', () => {
            const detectLabelInput: IdentifyEntityInput = {
                identifyEntity: {
                    source: {
                        storage: {
                            key: 'key',
                            identityId: credentials.identityId,
                            level: 'private'
                        }
                    },
                    type: 'LABELS'
                }
            };
            const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
            predictionsProvider.configure(options);
            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
            jest.spyOn(Rekognition.prototype, 'detectLabels').mockImplementationOnce(
                (input, callback) => {
                    expect(input.Image.S3Object.Name).toMatch('private/identityId/key');
                    callback(null, detectlabelsResponse);
                }
            );
            predictionsProvider.identify(detectLabelInput);
        });

        test('happy case input source valid s3object protected test', () => {
            const detectLabelInput: IdentifyEntityInput = {
                identifyEntity: {
                    source: {
                        storage: {
                            key: 'key',
                            identityId: credentials.identityId,
                            level: 'protected'
                        }
                    },
                    type: 'LABELS'
                }
            };
            const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
            predictionsProvider.configure(options);
            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
            jest.spyOn(Rekognition.prototype, 'detectLabels').mockImplementationOnce(
                (input, callback) => {
                    expect(input.Image.S3Object.Name).toMatch('protected/identityId/key');
                    callback(null, detectlabelsResponse);
                }
            );
            predictionsProvider.identify(detectLabelInput);
        });

        test('happy case input source valid bytes', () => {
            const detectLabelInput: IdentifyEntityInput = {
                identifyEntity: {
                    source: {
                        bytes: 'bytes'
                    },
                    type: 'LABELS'
                }
            };
            const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
            predictionsProvider.configure(options);
            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
            jest.spyOn(Rekognition.prototype, 'detectLabels').mockImplementationOnce(
                (input, callback) => {
                    expect(input.Image.Bytes).toMatch('bytes');
                    callback(null, detectlabelsResponse);
                }
            );
            predictionsProvider.identify(detectLabelInput);
        });

        test('happy case input source valid file', () => {
            const fileInput = new File([Buffer.from('file')], 'file');
            const detectLabelInput: IdentifyEntityInput = {
                identifyEntity: {
                    source: {
                        file: fileInput
                    },
                    type: 'LABELS'
                }
            };
            const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
            predictionsProvider.configure(options);
            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
            jest.spyOn(Rekognition.prototype, 'detectLabels').mockImplementationOnce(
                (input, callback) => {
                    expect(input.Image.Bytes).toMatchObject(fileInput);
                    callback(null, detectlabelsResponse);
                }
            );
            predictionsProvider.identify(detectLabelInput);
        });

        test('error case input source not provided', () => {
            const detectLabelInput: IdentifyEntityInput = {
                identifyEntity: {
                    source: {},
                    type: 'LABELS'
                }
            };
            const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
            predictionsProvider.configure(options);
            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
            return expect(predictionsProvider.identify(detectLabelInput)).rejects.toThrow(/Only one source/);
        });

        test('error case missing identityId in private storage', () => {
            const detectLabelInput: IdentifyEntityInput = {
                identifyEntity: {
                    source: {
                        storage: {
                            key: 'key',
                            level: 'private'
                        }
                    },
                    type: 'LABELS'
                }
            };
            const predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
            predictionsProvider.configure(options);
            jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
                return Promise.resolve(credentials);
            });
            return expect(predictionsProvider.identify(detectLabelInput))
                .rejects.toThrow(/identityId must be provided/);
        });
    });
});



