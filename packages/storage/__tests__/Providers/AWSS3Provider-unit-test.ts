/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import  StorageProvider  from '../../src/Providers/AWSS3Provider';
import { Hub, Credentials } from '@aws-amplify/core';
import * as S3 from 'aws-sdk/clients/s3';

/**
 * NOTE - These test cases use Hub.dispatch but they should
 * actually be using dispatchStorageEvent from Storage
 */

S3.prototype.getSignedUrl = jest.fn((key, params) => {
    return 'url';
});

S3.prototype.getObject = jest.fn((params, callback) => {
    callback(null, 'data');
});

S3.prototype.deleteObject = jest.fn((params, callback) => {
    callback(null, 'data');
});

S3.prototype.listObjects = jest.fn((params, callback) => {
    callback(null, {
        Contents: [{
            Key: 'public/path/itemsKey',
            ETag: 'etag',
            LastModified: 'lastmodified',
            Size: 'size'
        }]
    });
});

S3.ManagedUpload.prototype.send = jest.fn(() => { });

S3.ManagedUpload.prototype.promise = jest.fn(async => ({ Key: 'public/path/itemsKey' }));

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

const options_no_cred = {
        bucket: 'bucket',
        region: 'region',
        credentials: null,
        level: 'level'
    };

describe('StorageProvider test', () => {
    describe('getCategory test', () => {
        test('happy case', () => {
            const storage = new StorageProvider();
            storage.configure(options);
            expect(storage.getCategory()).toBe('Storage');
        });
    });

    describe('getProviderName test', () => {
        test('happy case', () => {
            const storage = new StorageProvider();
            storage.configure(options);
            expect(storage.getProviderName()).toBe('AWSS3');
        });
    });

    describe('configure test', () => {
        test('standard configuration', () => {
            const storage = new StorageProvider();
            
            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region'
            };

            const config = storage.configure(aws_options);
            expect(config).toEqual({
                AWSS3: {
                    "bucket": "bucket", "region": "region"
                }
            });
        });

        test('configuration for local testing', () => {
            const storage = new StorageProvider();

            const aws_options = {
                aws_user_files_s3_bucket: 'bucket',
                aws_user_files_s3_bucket_region: 'region',
                aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing: true

            }

            const config = storage.configure(aws_options);
            expect(config).toEqual({
                AWSS3: {
                    "bucket": "bucket",
                    "region": "region",
                    "dangerouslyConnectToHttpEndpointForTesting": true
                }
            });
        });
    });

    describe('get test', async () => {
        test('get object without download', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });
            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'getSignedUrl');
            expect.assertions(2);
            expect(await storage.get('key', { downloaded: false })).toBe('url');
            expect(spyon).toBeCalledWith('getObject', {"Bucket": "bucket", "Key": "public/key"});
            
            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('get object with tracking', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'getSignedUrl');
            const spyon2 = jest.spyOn(Hub, 'dispatch');

            expect.assertions(3);
            expect(await storage.get('key', { downloaded: false, track: true })).toBe('url');
            expect(spyon).toBeCalledWith(
                'getObject', 
                {
                    "Bucket": "bucket", 
                    "Key": "public/key"
                }
            );
            expect(spyon2).toBeCalledWith(
                'storage', 
                {
                    event: 'getSignedUrl',
                    data : {
                        attrs: {"method": "get", "result": "success"},
                        metrics: null
                    },
                    message: 'Signed URL: url'
                },
                'Storage', 
                Symbol.for('amplify_default')
            );

            spyon.mockClear();
            curCredSpyOn.mockClear();
            spyon2.mockClear();
        });

        test('get object with download successfully', async() => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return Promise.resolve(credentials);
                });

            const options_with_download = Object.assign({}, options, {download: true});
            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'getObject').mockImplementationOnce((params, callback) => {
                callback(null, { Body: [1,2] });
            });

            expect.assertions(2);
            expect(await storage.get('key', {download:true})).toEqual({Body: [1,2]});
            expect(spyon.mock.calls[0][0]).toEqual({"Bucket": "bucket", "Key": "public/key"});

            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('get object with download with failure', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const options_with_download = Object.assign({}, options, {download: true});
            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'getObject')
                .mockImplementationOnce((params, callback) => {
                    callback('err', null);
                });

            expect.assertions(1);
            try{
                await storage.get('key', {download:true});
            } catch (e) {
                expect(e).toBe('err');

            }
            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('get object with private option', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({
                            identityId: 'id'
                        });
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'getSignedUrl');

            expect.assertions(2);
            expect(await storage.get('key', {level: 'private'})).toBe('url');
            expect(spyon).toBeCalledWith('getObject', {"Bucket": "bucket", "Key": "private/id/key"});

            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('sets an empty custom public key', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({
                            identityId: 'id'
                        });
                    });
                });
            const storage = new StorageProvider();
            storage.configure(options);
            const spy = jest.spyOn(S3.prototype, 'getSignedUrl');
            await storage.get('my_key', {customPrefix: {public: ''}});
            expect(spy).toHaveBeenCalledWith('getObject', {"Bucket": "bucket", "Key": "my_key"});
        });

        test('sets a custom key for public accesses', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({
                            identityId: 'id'
                        });
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spy = jest.spyOn(S3.prototype, 'getSignedUrl');
            await storage.get('my_key', {customPrefix: {public: '123/'}});
            expect(spy).toHaveBeenCalledWith('getObject', {"Bucket": "bucket", "Key": "123/my_key"});
        });

        test('get object with expires option', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'getSignedUrl');

            expect.assertions(2);
            expect(await storage.get('key', { expires: 1200 })).toBe('url');
            expect(spyon).toBeCalledWith('getObject', {"Bucket": "bucket", "Key": "public/key", "Expires": 1200});

            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('get object with identityId option', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'getSignedUrl');

            expect.assertions(2);
            expect(await storage.get('key', { level: 'protected', identityId: 'identityId' })).toBe('url');
            expect(spyon).toBeCalledWith('getObject', {"Bucket": "bucket", "Key": "protected/identityId/key" });

            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('credentials not ok', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        rej('err');
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options_no_cred);
            expect.assertions(1);

            try {
                await storage.get('key', {});
            } catch (e) {
                expect(e).not.toBeNull();
            }

            curCredSpyOn.mockClear();
        });

        test('always ask for the current credentials', async () => {
            const storage = new StorageProvider();
            storage.configure(options);
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({
                            cred: 'cred1'
                        });
                    });
                });

            await storage.get('key', { downloaded: false });

            const curCredSpyOn2 = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({
                            cred: 'cred2'
                        });
                    });
                });

            await storage.get('key', { downloaded: false });

            expect(curCredSpyOn.mock.calls.length).toBe(2);

            curCredSpyOn.mockClear();
        });
    });

    describe('put test', () => {
        test('put object succefully', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'upload');

            expect.assertions(2);
            expect(await storage.put('key', 'obejct', {})).toEqual({"key": "path/itemsKey"});
            expect(spyon).toBeCalledWith({
                "Body": "obejct",
                "Bucket": "bucket",
                "ContentType": "binary/octet-stream",
                "Key": "public/key"
            });
            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('put object with track', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'upload');
            const spyon2 = jest.spyOn(Hub, 'dispatch');

            expect.assertions(3);
            expect(await storage.put('key', 'obejct', {track: true})).toEqual({"key": "path/itemsKey"});
            expect(spyon).toBeCalledWith({
                "Body": "obejct",
                "Bucket": "bucket",
                "ContentType": "binary/octet-stream",
                "Key": "public/key"
            });
            expect(spyon2).toBeCalledWith(
                'storage', 
                {
                    event: 'upload',
                    data : {
                        attrs: 
                        {
                            "method": "put", "result": "success"}, 
                            metrics: null,
                        },
                        message: 'Upload success for key'
                }, 
                'Storage', 
                Symbol.for('amplify_default')
            );

            spyon.mockClear();
            curCredSpyOn.mockClear();
            spyon2.mockClear();
        });

        test('put object failed', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.ManagedUpload.prototype, 'promise')
                .mockImplementationOnce(() => {
                    return Promise.reject('err');
                });

            expect.assertions(1);
            try{
                await storage.put('key', 'obejct', {});
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('put object with private and contenttype specified', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({
                            identityId: 'id'
                        });
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'upload');

            expect.assertions(2);
            expect(await storage.put(
                'key', 
                'obejct', 
                {level: 'private', contentType: 'text/plain'}
                )).toEqual({"key": "/itemsKey"});
            expect(spyon).toBeCalledWith({
                "Body": "obejct",
                "Bucket": "bucket",
                "ContentType": "text/plain",
                "Key": "private/id/key"
            });
            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('credentials not ok', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        rej('err');
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options_no_cred);
            expect.assertions(1);
            try{
                await storage.put('key', 'obj',{});
            } catch (e) {
                expect(e).not.toBeNull();
            }

            curCredSpyOn.mockClear();
        });
    });

    describe('remove test', () => {
        test('remove object successfully', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'deleteObject');

            expect.assertions(2);
            expect(await storage.remove('key', {})).toBe('data');
            expect(spyon.mock.calls[0][0]).toEqual({"Bucket": "bucket", "Key": "public/key"});

            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('remove object with track', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'deleteObject');
            const spyon2 = jest.spyOn(Hub, 'dispatch');

            expect.assertions(3);
            expect(await storage.remove('key', {track: true})).toBe('data');
            expect(spyon.mock.calls[0][0]).toEqual({"Bucket": "bucket", "Key": "public/key"});
            expect(spyon2).toBeCalledWith(
                'storage', 
                {
                    event: 'delete',
                    data : {
                        attrs: {"method": "remove", "result": "success"},
                        metrics: null,
                    },
                    message: 'Deleted key successfully'
                }, 
                'Storage',
                Symbol.for('amplify_default')
            );

            spyon.mockClear();
            curCredSpyOn.mockClear();
            spyon2.mockClear();
        });

        test('remove object failed', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'deleteObject')
                .mockImplementationOnce((params, callback) => {
                    callback('err', null);
                });

            expect.assertions(1);
            try{
                await storage.remove('key', {});
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('remove object with private', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({
                            identityId: 'id'
                        });
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'deleteObject');

            expect.assertions(2);
            expect(await storage.remove('key', {level: 'private'})).toBe('data');
            expect(spyon.mock.calls[0][0]).toEqual({"Bucket": "bucket", "Key": "private/id/key"});

            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('credentials not ok', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        rej('err');
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options_no_cred);
            expect.assertions(1);
            try{
                await storage.remove('key', {});
            } catch (e) {
                expect(e).not.toBeNull();
            }

            curCredSpyOn.mockClear();
        });
    });

    describe('list test', () => {
        test('list object successfully', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'listObjects');

            expect.assertions(2);
            expect(await storage.list('path', {level: 'public'})).toEqual([{
                "eTag": "etag",
                 "key": "path/itemsKey",
                "lastModified": "lastmodified",
                "size": "size"
                }]);
            expect(spyon.mock.calls[0][0]).toEqual({"Bucket": 'bucket', "Prefix": "public/path"});

            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('list object with track', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'listObjects');
            const spyon2 = jest.spyOn(Hub, 'dispatch');

            expect.assertions(3);
            expect(await storage.list('path', {level: 'public', track: true})).toEqual([{
                "eTag": "etag",
                 "key": "path/itemsKey",
                "lastModified": "lastmodified",
                "size": "size"
                }]);
            expect(spyon.mock.calls[0][0]).toEqual({"Bucket": 'bucket', "Prefix": "public/path"});
            expect(spyon2).toBeCalledWith(
                'storage',
                {
                    event: 'list',
                    data: {
                        attrs: { "method": "list", "result": "success" },
                        metrics: null
                    },
                    message: '1 items returned from list operation'
                },
                'Storage',
                Symbol.for('amplify_default')
            );
            spyon.mockClear();
            curCredSpyOn.mockClear();
            spyon2.mockClear();
        });

        test('list object failed', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res({});
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options);
            const spyon = jest.spyOn(S3.prototype, 'listObjects')
                .mockImplementationOnce((params, callback) => {
                    callback('err', null);
                });

            expect.assertions(1);
            try {
                await storage.list('path', {});
            } catch (e) {
                expect(e).toBe('err');
            }

            spyon.mockClear();
            curCredSpyOn.mockClear();
        });

        test('credentials not ok', async () => {
            const curCredSpyOn = jest.spyOn(Credentials, 'get')
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        rej('err');
                    });
                });

            const storage = new StorageProvider();
            storage.configure(options_no_cred);

            expect.assertions(1);
            try{
                await storage.list('path', {});
            } catch (e) {
                expect(e).not.toBeNull();
            }

            curCredSpyOn.mockClear();
        });
    });
});

