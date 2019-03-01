
import AWSStorageProvider from '../src/Providers/AWSS3Provider';
import { default as Storage } from "../src/Storage";

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
        test('happy case', () => {
            const storage = new Storage();
            
            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region',
                level: 'private'
            };

            const config = storage.configure(aws_options);
            expect(config).toEqual({
                AWSS3:{
                    bucket: 'bucket',
                    region: 'region'
                }
            });
        });
    });

    describe('configure test', () => {
        test('happy case with user-initiated configuration', () => {
            const storage = new Storage();
            
            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region',
                level: 'private'
            };

            const config = storage.configure(aws_options);
            expect(config).toEqual({
                AWSS3:{
                    bucket: 'bucket',
                    region: 'region'
                }
            });

            const userConfig = {level: 'private'};
            const config2 = storage.configure(userConfig);
            const mergedValue = {...config, ...userConfig};
            expect(config2).toEqual(mergedValue);
        });
    });

    describe('get test', async () => {
        test('get object without download', async () => { 
            const get_spyon = jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => {
                return ;
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
            }) ;
            expect(get_spyon).toBeCalled();
            get_spyon.mockClear();
        });

        test('get object with global storage config', async () => { 
            const get_spyon = jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => {
                return ;
            });
            const storage = new Storage();
            const provider = new AWSStorageProvider();
            storage.addPluggable(provider);
            storage.configure(options);
            storage.configure({level: 'private'});
            await storage.get('key', {
                Storage: {
                    AWSS3: {
                    bucket: 'bucket', 
                    region: 'us-east-1', 
                }
            }
            }) ;
            expect(get_spyon).toBeCalledWith('key', {
                "Storage": {
                    "AWSS3": {
                        "bucket": "bucket",
                        "region": "us-east-1"}
                    }, 
                    "bucket": "bucket",
                    "credentials": {
                        "accessKeyId": "accessKeyId",
                        "authenticated": true,
                        "identityId": "identityId",
                        "secretAccessKey": "secretAccessKey",
                        "sessionToken": "sessionToken"
                    }, 
                    "level": "private",
                    "region": "region"
                }
            );
            get_spyon.mockClear();
        });

        test('get object with call-level storage config', async () => { 
            const get_spyon = jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => {
                return ;
            });
            const storage = new Storage();
            const provider = new AWSStorageProvider();
            storage.addPluggable(provider);
            storage.configure(options);
            storage.configure({level: 'private'});
            await storage.get('key', {level: 'public'});
            expect(get_spyon).toBeCalledWith('key', {
                "Storage": {
                    "AWSS3": {
                        "bucket": "bucket",
                        "region": "us-east-1"}
                    }, 
                    "level": 'public',
                    "bucket": "bucket",
                    "credentials": {
                        "accessKeyId": "accessKeyId",
                        "authenticated": true,
                        "identityId": "identityId",
                        "secretAccessKey": "secretAccessKey",
                        "sessionToken": "sessionToken"
                    }, 
                },
                
            );
            get_spyon.mockClear();
        });
    });
    

    describe('put test', () => {
        test('put object succefully', async () => {
            const put_spyon = jest.spyOn(AWSStorageProvider.prototype, 'put').mockImplementation(() => {
                return ;
            });
            const storage = new Storage();
            const provider = new AWSStorageProvider();
            storage.addPluggable(provider);
            storage.configure(options);
            await storage.put('key','object',{
                Storage: {
                    AWSS3: {
                    bucket: 'bucket', 
                    region: 'us-east-1', 
                }
            }
            }) ;
            expect(put_spyon).toBeCalled();
            put_spyon.mockClear();
        });
    });

    describe('remove test', () => {
        test('remove object successfully', async () => {
            const remove_spyon = jest.spyOn(AWSStorageProvider.prototype, 'remove').mockImplementation(() => {
                return ;
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
            }) ;
            expect(remove_spyon).toBeCalled();
            remove_spyon.mockClear();
        });
    });

    describe('list test', () => {
        test('list object successfully', async () => {
            const list_spyon = jest.spyOn(AWSStorageProvider.prototype, 'list').mockImplementation(() => {
                return ;
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
            }) ;
            expect(list_spyon).toBeCalled();
            list_spyon.mockClear();
        });
    });
});

