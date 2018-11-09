
import { Hub, Credentials } from '@aws-amplify/core';
import AWSStorageProvider from '../src/Providers/AWSS3Provider';
import {StorageOptions} from '../src/types';
import { default as Storage } from "../src/Storage";


const options_no_cred = {
        bucket: 'bucket',
        region: 'region',
        credentials: null,
        level: 'level'
    };

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
            credentials: credentials,
            level: 'level'
};

const get_spyon = jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => {
    return ;
});

const put_spyon = jest.spyOn(AWSStorageProvider.prototype, 'put').mockImplementation(() => {
    return ;
});

const remove_spyon = jest.spyOn(AWSStorageProvider.prototype, 'remove').mockImplementation(() => {
    return ;
});

const list_spyon = jest.spyOn(AWSStorageProvider.prototype, 'list').mockImplementation(() => {
    return ;
});

// const getObject_sypon = jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => {
//     return (null, 'data');
// });

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
                aws_user_files_s3_bucket_region: 'region'
            };

            const config = storage.configure(aws_options);
            expect(config).toEqual({
                bucket: 'bucket',
                region: 'region'
            });
        });
    });

    describe('get test', async () => {
        test('get object without download', async () => {
            
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
        });
    });
    

    describe('put test', () => {
        test('put object succefully', async () => {
            
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
        });
    });

    describe('remove test', () => {
        test('remove object successfully', async () => {

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
        });
    });

    describe('list test', () => {
        test('list object successfully', async () => {

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
        });
    });
});

