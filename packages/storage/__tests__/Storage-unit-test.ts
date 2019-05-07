
import AWSStorageProvider from '../src/Providers/AWSS3Provider';
import { default as Storage } from "../src/Storage";
import StorageCategory from "../src";

const credentials = {
    accessKeyId: 'accessKeyId',
    sessionToken: 'sessionToken',
    secretAccessKey: 'secretAccessKey',
    identityId: 'identityId',
    authenticated: true
};

const options = {
    bucket: 'bucket',
    region: 'region',
    credentials,
    level: 'level'
};

describe('Storage', () => {
    describe('constructor test', () => {
        test('happy case', () => {
            const storage = new Storage();
        });
    });

    describe('getPluggable test', () => {
        test('happy case', () => {
            const storage = new Storage();

            const provider = new AWSStorageProvider();
            storage.addPluggable(provider);

            expect(storage.getPluggable(provider.getProviderName())).toBeInstanceOf(AWSStorageProvider);
        });
    });

    describe('removePluggable test', () => {
        test('happy case', () => {
            const storage = new Storage();

            const provider = new AWSStorageProvider();
            storage.addPluggable(provider);

            storage.removePluggable(provider.getProviderName());

            expect(storage.getPluggable(provider.getProviderName())).toBeNull();
        });
    });

    describe('configure test', () => {
        test('configure with aws-exports file', () => {
            const storage = new Storage();

            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region'
            };

            const config = storage.configure(aws_options);

            expect(config).toEqual({
                AWSS3: {
                    bucket: 'bucket',
                    region: 'region'
                }
            });
        });

        test('configure with bucket and region', () => {
            const storage = new Storage();

            const aws_options = {
                bucket: 'bucket',
                region: 'region'
            };

            const config = storage.configure(aws_options);

            expect(config).toEqual({
                AWSS3: {
                    bucket: 'bucket',
                    region: 'region'
                }
            });
        });

        test('Configure with Storage object', () => {
            const storage = new Storage();

            const aws_options = {
                Storage: {
                    bucket: 'bucket',
                    region: 'region'
                }
            };

            const config = storage.configure(aws_options);

            expect(config).toEqual({
                AWSS3: {
                    bucket: 'bucket',
                    region: 'region'
                }
            });
        });

        test('Configure with Provider object', () => {
            const storage = new Storage();

            const aws_options = {
                AWSS3: {
                    bucket: 'bucket',
                    region: 'region'
                }
            };

            const config = storage.configure(aws_options);

            expect(config).toEqual({
                AWSS3: {
                    bucket: 'bucket',
                    region: 'region'
                }
            });
        });

        test('Configure with Storage and Provider object', () => {
            const storage = new Storage();

            const aws_options = {
                Storage: {
                    AWSS3: {
                        bucket: 'bucket',
                        region: 'region'
                    }
                }
            };

            const config = storage.configure(aws_options);

            expect(config).toEqual({
                AWSS3: {
                    bucket: 'bucket',
                    region: 'region'
                }
            });
        });

        test('Second configure call changing bucket name only', () => {
            const storage = new Storage();

            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region'
            };

            storage.configure(aws_options);
            const config = storage.configure({ bucket: "another-bucket" })
            expect(config).toEqual({
                AWSS3: {
                    bucket: 'another-bucket',
                    region: 'region',
                }
            });
        });

        test('Second configure call changing bucket, region and with Storage attribute', () => {
            const storage = new Storage();

            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region'
            };

            storage.configure(aws_options);
            const config = storage.configure({ Storage: { bucket: "another-bucket", region: "another-region" } })
            expect(config).toEqual({
                AWSS3: {
                    bucket: 'another-bucket',
                    region: 'another-region',
                }
            });
        });

        test('Second configure call changing bucket, region and with Provider attribute', () => {
            const storage = new Storage();

            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region'
            };

            storage.configure(aws_options);
            const config = storage.configure({ AWSS3: { bucket: "another-s3-bucket", region: "another-s3-region" } })
            expect(config).toEqual({
                AWSS3: {
                    bucket: 'another-s3-bucket',
                    region: 'another-s3-region',
                }
            });
        });
        test('backwards compatible issue, second configure call', () => {
            const storage = new Storage();

            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region'
            };

            storage.configure(aws_options);
            const config = storage.configure({ level: "private" })
            expect(config).toEqual({
                AWSS3: {
                    bucket: 'bucket',
                    region: 'region',
                    level: 'private'
                }
            });
        });

        test('vault level is always private', () => {

            const storage = StorageCategory;
            expect.assertions(3);
            storage.vault.configure = jest.fn().mockImplementation((configure) => {
                expect(configure).toEqual({"AWSS3": {"bucket": "bucket", "level": "private", "region": "region"}});
            });
            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region'
            };


            storage.configure(aws_options);
            storage.configure({ Storage: { level: "protected"} });
            storage.configure({ Storage: { level: "public"} });
        });

        test('normal storage level is public by default', () => {
          const storage = StorageCategory;

          storage.configure({
            region: 'region',
            bucket: 'bucket',
          });

          expect(storage['_config']).toEqual({
            AWSS3: {
              bucket: 'bucket',
              level: 'public',
              region: 'region'
            }
          });
        });

      test('backwards compatible issue, third configure call track', () => {
            const storage = new Storage();

            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region'
            };

            storage.configure(aws_options);
            storage.configure({ level: "protected" })
            const config = storage.configure({ track: true })
            expect(config).toEqual({
                AWSS3: {
                    bucket: 'bucket',
                    region: 'region',
                    level: 'protected',
                    track: true
                }
            });
        });

        test('backwards compatible issue, third configure to update level', () => {
            const storage = new Storage();
            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region'
            };

            storage.configure(aws_options);
            storage.configure({ level: "private" })
            const config = storage.configure({ level: "protected" })
            expect(config).toEqual({
                AWSS3: {
                    bucket: 'bucket',
                    region: 'region',
                    level: 'protected',
                }
            });
        });
    });

    describe('get test', async () => {
        test('get object without download', async () => {
            const get_spyon = jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => {
                return;
            });
            const storage = new Storage();
            const provider = new AWSStorageProvider();
            storage.addPluggable(provider);
            storage.configure(options);
            await storage.get('key', {
                Storage: {
                    AWSS3: {
                        bucket: 'bucket',
                        region: 'us-east-1',
                    }
                }
            });
            expect(get_spyon).toBeCalled();
            get_spyon.mockClear();
        });
    });


    describe('put test', () => {
        test('put object succefully', async () => {
            const put_spyon = jest.spyOn(AWSStorageProvider.prototype, 'put').mockImplementation(() => {
                return;
            });
            const storage = new Storage();
            const provider = new AWSStorageProvider();
            storage.addPluggable(provider);
            storage.configure(options);
            await storage.put('key', 'object', {
                Storage: {
                    AWSS3: {
                        bucket: 'bucket',
                        region: 'us-east-1',
                    }
                }
            });
            expect(put_spyon).toBeCalled();
            put_spyon.mockClear();
        });
    });

    describe('remove test', () => {
        test('remove object successfully', async () => {
            const remove_spyon = jest.spyOn(AWSStorageProvider.prototype, 'remove').mockImplementation(() => {
                return;
            });
            const storage = new Storage();
            const provider = new AWSStorageProvider();
            storage.addPluggable(provider);
            storage.configure(options);
            await storage.remove('key', {
                Storage: {
                    AWSS3: {
                        bucket: 'bucket',
                        region: 'us-east-1',
                    }
                }
            });
            expect(remove_spyon).toBeCalled();
            remove_spyon.mockClear();
        });
    });

    describe('list test', () => {
        test('list object successfully', async () => {
            const list_spyon = jest.spyOn(AWSStorageProvider.prototype, 'list').mockImplementation(() => {
                return;
            });
            const storage = new Storage();
            const provider = new AWSStorageProvider();
            storage.addPluggable(provider);
            storage.configure(options);
            await storage.list('path', {
                Storage: {
                    AWSS3: {
                        bucket: 'bucket',
                        region: 'us-east-1',
                    }
                }
            });
            expect(list_spyon).toBeCalled();
            list_spyon.mockClear();
        });
    });
});

