import AWSStorageProvider from '../src/providers/AWSS3Provider';
import { Storage as StorageClass } from '../src/Storage';
import { Storage as StorageCategory, StorageProvider } from '../src';
import axios, { CancelToken } from 'axios';

type CustomProviderConfig = {
	foo: boolean;
	bar: number;
};

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

const options = {
	bucket: 'bucket',
	region: 'region',
	credentials,
	level: 'level',
};

class TestCustomProvider implements StorageProvider {
	getProviderName(): string {
		return 'customProvider' as const;
	}

	getCategory() {
		return 'Storage' as const;
	}

	configure(o: any) {
		return o;
	}

	get(key: string, config: CustomProviderConfig) {
		return Promise.resolve('get');
	}

	put(key: string, object: any, config: CustomProviderConfig) {
		return Promise.resolve({ key: 'put' });
	}

	remove(key: string, config: CustomProviderConfig) {
		return Promise.resolve('remove');
	}

	list(key: string, config: CustomProviderConfig) {
		return Promise.resolve(['list']);
	}

}

class TestCustomProviderWithCopy extends TestCustomProvider implements StorageProvider {
	copy(src: { key: string }, dest: { key: string }, config: CustomProviderConfig) {
		return Promise.resolve({ key: 'copy' });
	}
}


describe('Storage', () => {
	describe('constructor test', () => {
		test('happy case', () => {
			new StorageClass();
		});
	});

	describe('getPluggable test', () => {
		test('happy case', () => {
			const storage = new StorageClass();

			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);

			expect(storage.getPluggable(provider.getProviderName())).toBeInstanceOf(AWSStorageProvider);
		});
	});

	describe('removePluggable test', () => {
		test('happy case', () => {
			const storage = new StorageClass();

			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);

			storage.removePluggable(provider.getProviderName());

			expect(storage.getPluggable(provider.getProviderName())).toBeNull();
		});
	});

	describe('configure test', () => {
		test('configure with aws-exports file', () => {
			const storage = new StorageClass();

			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
			};

			const config = storage.configure(aws_options);

			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
				},
			});
		});

		test('configure with bucket and region', () => {
			const storage = new StorageClass();

			const aws_options = {
				bucket: 'bucket',
				region: 'region',
			};

			const config = storage.configure(aws_options);

			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
				},
			});
		});

		test('Configure with Storage object', () => {
			const storage = new StorageClass();

			const aws_options = {
				Storage: {
					bucket: 'bucket',
					region: 'region',
				},
			};

			const config = storage.configure(aws_options);

			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
				},
			});
		});

		test('Configure with Provider object', () => {
			const storage = new StorageClass();

			const aws_options = {
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
				},
			};

			const config = storage.configure(aws_options);

			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
				},
			});
		});

		test('Configure with Storage and Provider object', () => {
			const storage = new StorageClass();

			const aws_options = {
				Storage: {
					AWSS3: {
						bucket: 'bucket',
						region: 'region',
					},
				},
			};

			const config = storage.configure(aws_options);

			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
				},
			});
		});

		test('Second configure call changing bucket name only', () => {
			const storage = new StorageClass();

			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
			};

			storage.configure(aws_options);
			const config = storage.configure({ bucket: 'another-bucket' });
			expect(config).toEqual({
				AWSS3: {
					bucket: 'another-bucket',
					region: 'region',
				},
			});
		});

		test('Second configure call changing bucket, region and with Storage attribute', () => {
			const storage = new StorageClass();

			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
			};

			storage.configure(aws_options);
			const config = storage.configure({
				Storage: { bucket: 'another-bucket', region: 'another-region' },
			});
			expect(config).toEqual({
				AWSS3: {
					bucket: 'another-bucket',
					region: 'another-region',
				},
			});
		});

		test('Second configure call changing bucket, region and with Provider attribute', () => {
			const storage = new StorageClass();

			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
			};

			storage.configure(aws_options);
			const config = storage.configure({
				AWSS3: { bucket: 'another-s3-bucket', region: 'another-s3-region' },
			});
			expect(config).toEqual({
				AWSS3: {
					bucket: 'another-s3-bucket',
					region: 'another-s3-region',
				},
			});
		});
		test('backwards compatible issue, second configure call', () => {
			const storage = new StorageClass();

			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
			};

			storage.configure(aws_options);
			const config = storage.configure({ level: 'private' });
			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
					level: 'private',
				},
			});
		});

		test('vault level is always private', () => {
			const storage = StorageCategory;
			expect.assertions(3);
			storage.vault.configure = jest.fn().mockImplementation(configure => {
				expect(configure).toEqual({
					AWSS3: { bucket: 'bucket', level: 'private', region: 'region' },
				});
			});
			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
			};

			storage.configure(aws_options);
			storage.configure({ Storage: { level: 'protected' } });
			storage.configure({ Storage: { level: 'public' } });
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
					region: 'region',
				},
			});
		});

		test('backwards compatible issue, third configure call track', () => {
			const storage = new StorageClass();

			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
			};

			storage.configure(aws_options);
			storage.configure({ level: 'protected' });
			const config = storage.configure({ track: true });
			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
					level: 'protected',
					track: true,
				},
			});
		});

		test('backwards compatible issue, third configure to update level', () => {
			const storage = new StorageClass();
			const aws_options = {
				aws_user_files_s3_bucket: 'bucket',
				aws_user_files_s3_bucket_region: 'region',
			};

			storage.configure(aws_options);
			storage.configure({ level: 'private' });
			const config = storage.configure({ level: 'protected' });
			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket',
					region: 'region',
					level: 'protected',
				},
			});
		});

		test('should add server side encryption to storage config when present', () => {
			const storage = new StorageClass();
			const awsconfig = {
				aws_user_files_s3_bucket: 'testBucket',
				aws_user_files_s3_bucket_region: 'imaregion',
			};

			storage.configure(awsconfig);
			const config = storage.configure({
				serverSideEncryption: 'iamencrypted',
			});
			expect(config).toEqual({
				AWSS3: {
					bucket: 'testBucket',
					region: 'imaregion',
					serverSideEncryption: 'iamencrypted',
				},
			});
		});

		test('should add SSECustomerAlgorithm to storage config when present', () => {
			const storage = new StorageClass();
			const awsconfig = {
				aws_user_files_s3_bucket: 'thisIsABucket',
				aws_user_files_s3_bucket_region: 'whatregionareyou',
			};

			storage.configure(awsconfig);
			const config = storage.configure({ SSECustomerAlgorithm: '23s2sc' });
			expect(config).toEqual({
				AWSS3: {
					bucket: 'thisIsABucket',
					region: 'whatregionareyou',
					SSECustomerAlgorithm: '23s2sc',
				},
			});
		});

		test('should add SSECustomerKey to storage config when present', () => {
			const storage = new StorageClass();
			const awsconfig = {
				aws_user_files_s3_bucket: 'buckbuckbucket',
				aws_user_files_s3_bucket_region: 'thisisaregion',
			};

			storage.configure(awsconfig);
			const config = storage.configure({ SSECustomerKey: 'iamakey' });
			expect(config).toEqual({
				AWSS3: {
					bucket: 'buckbuckbucket',
					region: 'thisisaregion',
					SSECustomerKey: 'iamakey',
				},
			});
		});

		test('should add SSECustomerKeyMD5 to storage config when present', () => {
			const storage = new StorageClass();
			const awsconfig = {
				aws_user_files_s3_bucket: 'buckbuckbucaket',
				aws_user_files_s3_bucket_region: 'ohnoregion',
			};

			storage.configure(awsconfig);
			const config = storage.configure({ SSECustomerKeyMD5: 'somekey' });
			expect(config).toEqual({
				AWSS3: {
					bucket: 'buckbuckbucaket',
					region: 'ohnoregion',
					SSECustomerKeyMD5: 'somekey',
				},
			});
		});

		test('should add SSEKMSKeyId to storage config when present', () => {
			const storage = new StorageClass();
			const awsconfig = {
				aws_user_files_s3_bucket: 'bucket2',
				aws_user_files_s3_bucket_region: 'region1',
			};

			storage.configure(awsconfig);
			const config = storage.configure({ SSEKMSKeyId: 'giveMeAnId' });
			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket2',
					region: 'region1',
					SSEKMSKeyId: 'giveMeAnId',
				},
			});
		});

		test('should not add randomKeyId to storage config object when present', () => {
			const storage = new StorageClass();
			const awsconfig = {
				aws_user_files_s3_bucket: 'bucket2',
				aws_user_files_s3_bucket_region: 'region1',
			};

			storage.configure(awsconfig);
			const config = storage.configure({ randomKeyId: 'someRandomKey' });
			expect(config).toEqual({
				AWSS3: {
					bucket: 'bucket2',
					region: 'region1',
				},
			});
		});

		test('should add customPrefix to AWSS3 provider object if is defined', () => {
			const storage = new StorageClass();
			const awsconfig = {
				aws_user_files_s3_bucket: 'i_am_a_bucket',
				aws_user_files_s3_bucket_region: 'IAD',
			};

			storage.configure(awsconfig);
			const config = storage.configure({
				customPrefix: {
					protected: 'iamprotected',
					private: 'iamprivate',
					public: 'opentotheworld',
				},
			});

			expect(config).toEqual({
				AWSS3: {
					bucket: 'i_am_a_bucket',
					region: 'IAD',
					customPrefix: {
						protected: 'iamprotected',
						private: 'iamprivate',
						public: 'opentotheworld',
					},
				},
			});
		});

		test('should not add customPrefix to AWSS3 provider object if value is undefined', () => {
			const storage = new StorageClass();
			const awsconfig = {
				aws_user_files_s3_bucket: 'you_dont_know_this_bucket',
				aws_user_files_s3_bucket_region: 'WD3',
			};

			storage.configure(awsconfig);
			const config = storage.configure({
				customPrefix: undefined,
			});

			expect(config).toEqual({
				AWSS3: {
					bucket: 'you_dont_know_this_bucket',
					region: 'WD3',
				},
				customPrefix: {},
			});
		});
	});

	describe('get test', () => {
		let storage: StorageClass;
		let provider: StorageProvider;
		let getSpy: jest.SpyInstance;

		beforeEach(() => {
			storage = new StorageClass();
			provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			getSpy = jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => Promise.resolve('url'));
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		describe('with default S3 provider', () => {
			test('get object without download', async () => {
				const url = await storage.get('key', { download: false });
				expect(getSpy).toBeCalled();
				expect(url).toEqual('url');
				getSpy.mockClear();
			});

			test('get object with download', async () => {
				const blob = { Body: new Blob(['body']) };
				getSpy = jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => {
					return Promise.resolve(blob);
				});
				const getOutput = await storage.get('key', { download: true });
				expect(getSpy).toBeCalled();
				expect(getOutput).toBe(blob);
				getSpy.mockClear();
			});

			test('get object with all available config', async () => {
				storage.get('key', {
					download: false,
					contentType: 'text/plain',
					contentDisposition: 'contentDisposition',
					contentLanguage: 'contentLanguage',
					contentEncoding: 'contentEncoding',
					cacheControl: 'cacheControl',
					identityId: 'identityId',
					expires: 100,
					progressCallback: () => {},
					SSECustomerAlgorithm: 'aes256',
					SSECustomerKey: 'key',
					SSECustomerKeyMD5: 'md5',
					customPrefix: {
						public: 'public',
						protected: 'protected',
						private: 'private',
					},
					level: 'private',
					track: false,
				});
			});
		});

		test('get without provider', async () => {
			const storage = new StorageClass();
			try {
				await storage.get('key');
			} catch (err) {
				expect(err).toEqual('No plugin found in Storage for the provider');
			}
		});

		test('get with custom provider', async () => {
			const customProvider = new TestCustomProvider();
			const customProviderGetSpy = jest
				.spyOn(customProvider, 'get')
				.mockImplementation(() => Promise.resolve('string'));
			storage.addPluggable(customProvider);
			await storage.get<TestCustomProvider>('key', {
				provider: 'customProvider',
				foo: false,
				bar: 10,
			});
			expect(customProviderGetSpy).toBeCalled();
		});
		// backwards compatible with current custom provider user
		test('get with custom provider should work with no generic type provided', async () => {
			const customProvider = new TestCustomProvider();
			const customProviderGetSpy = jest
				.spyOn(customProvider, 'get')
				.mockImplementation(() => Promise.resolve('string'));
			storage.addPluggable(customProvider);
			await storage.get('key', {
				provider: 'customProvider',
				config1: true,
				config2: false,
				config3: 'config',
			});
			expect(customProviderGetSpy).toBeCalled();
		});
	});

	describe('put test', () => {
		let storage: StorageClass;
		let provider: StorageProvider;
		let putSpy: jest.SpyInstance;

		beforeEach(() => {
			storage = new StorageClass();
			provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			putSpy = jest
				.spyOn(AWSStorageProvider.prototype, 'put')
				.mockImplementation(() => Promise.resolve({ key: 'new_object' }));
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		describe('with default provider', () => {
			test('put object successfully', async () => {
				await storage.put('key', 'object');
				expect(putSpy).toBeCalled();
				putSpy.mockClear();
			});

			test('call put object with all available config', async () => {
				const putRes = await storage.put('key', 'object', {
					progressCallback: _progress => {},
					serverSideEncryption: 'serverSideEncryption',
					SSECustomerAlgorithm: 'aes256',
					SSECustomerKey: 'key',
					SSECustomerKeyMD5: 'md5',
					SSEKMSKeyId: 'id',
					acl: 'acl',
					cacheControl: 'cacheControl',
					contentDisposition: 'contentDisposition',
					contentEncoding: 'contentEncoding',
					contentType: 'contentType',
					expires: new Date(),
					metadata: {
						key: 'value',
					},
					tagging: 'tag',
				});
				expect(putRes).toEqual({ key: 'new_object' });
			});
		});

		test('put without provider', async () => {
			const storage = new StorageClass();
			try {
				await storage.put('key', 'test upload');
			} catch (err) {
				expect(err).toEqual('No plugin found in Storage for the provider');
			}
		});

		test('put with custom provider', async () => {
			const customProvider = new TestCustomProvider();
			const customProviderPutSpy = jest.spyOn(customProvider, 'put').mockImplementation(() =>
				Promise.resolve({
					key: 'new_object',
				})
			);
			storage.addPluggable(customProvider);
			await storage.put<TestCustomProvider>('key', 'object', {
				provider: 'customProvider',
				foo: false,
				bar: 40,
			});
			expect(customProviderPutSpy).toBeCalled();
		});
		// backwards compatible with current custom provider user
		test('put with custom provider should work with no generic type provided', async () => {
			const customProvider = new TestCustomProvider();
			const customProviderPutSpy = jest.spyOn(customProvider, 'put').mockImplementation(() =>
				Promise.resolve({
					key: 'new_object',
				})
			);
			storage.addPluggable(customProvider);
			await storage.put('key', 'object', {
				provider: 'customProvider',
				config1: true,
				config2: false,
				config3: 'config',
			});
			storage.put('key', 'obj', {
				track: false,
			});
			expect(customProviderPutSpy).toBeCalled();
		});
	});

	describe('remove test', () => {
		let storage: StorageClass;
		let provider: StorageProvider;
		let removeSpy: jest.SpyInstance;

		beforeEach(() => {
			storage = new StorageClass();
			provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			removeSpy = jest
				.spyOn(AWSStorageProvider.prototype, 'remove')
				.mockImplementation(() => Promise.resolve({ $metadata: {} }));
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		describe('with default provider', () => {
			test('remove object successfully', async () => {
				await storage.remove('key');
				expect(removeSpy).toBeCalled();
				removeSpy.mockClear();
			});
			test('call remove with all available config', async () => {
				storage.remove('key', {
					track: false,
					level: 'public',
					customPrefix: {
						public: 'public',
						protected: 'protected',
						private: 'private',
					},
				});
				expect(removeSpy).toBeCalled();
				removeSpy.mockClear();
			});
		});
		test('remove without provider', async () => {
			const storage = new StorageClass();
			try {
				await storage.remove('key');
			} catch (err) {
				expect(err).toEqual('No plugin found in Storage for the provider');
			}
		});
		test('remove with custom provider', async () => {
			const customProvider = new TestCustomProvider();
			const customProviderRemoveSpy = jest
				.spyOn(customProvider, 'remove')
				.mockImplementation(() => Promise.resolve('remove'));
			storage.addPluggable(customProvider);
			storage.remove<TestCustomProvider>('key', {
				provider: 'customProvider',
				foo: false,
				bar: 40,
			});
			expect(customProviderRemoveSpy).toBeCalled();
		});
		// backwards compatible with current custom provider user
		test('remove with custom provider should work with no generic type provided', async () => {
			const customProvider = new TestCustomProvider();
			const customProviderRemoveSpy = jest
				.spyOn(customProvider, 'remove')
				.mockImplementation(() => Promise.resolve('remove'));
			storage.addPluggable(customProvider);
			storage.remove('key', {
				provider: 'customProvider',
				config1: true,
				config2: false,
				config3: 'config',
			});
			expect(customProviderRemoveSpy).toBeCalled();
		});
	});

	describe('list test', () => {
		let storage: StorageClass;
		let provider: StorageProvider;
		let listSpy: jest.SpyInstance;

		beforeEach(() => {
			storage = new StorageClass();
			provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			listSpy = jest.spyOn(AWSStorageProvider.prototype, 'list').mockImplementation(() => Promise.resolve([]));
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		describe('with default provider', () => {
			test('list object successfully', async () => {
				await storage.list('path');
				expect(listSpy).toBeCalled();
				listSpy.mockClear();
			});

			test('call list object with all available config', async () => {
				storage.list('path', {
					track: false,
					maxKeys: 10,
					level: 'public',
					customPrefix: {
						public: 'public',
						protected: 'protected',
						private: 'private',
					},
				});
			});
		});

		test('list without provider', async () => {
			const storage = new StorageClass();
			try {
				await storage.list('');
			} catch (err) {
				expect(err).toEqual('No plugin found in Storage for the provider');
			}
		});

		test('list with customProvider', async () => {
			const customProvider = new TestCustomProvider();
			const customProviderListSpy = jest.spyOn(customProvider, 'list').mockImplementation(() => Promise.resolve([]));
			storage.addPluggable(customProvider);
			await storage.list<TestCustomProvider>('path', {
				provider: 'customProvider',
				foo: false,
				bar: 40,
			});
			expect(customProviderListSpy).toBeCalled();
		});
		// backwards compatible with current custom provider user
		test('list with customProvider should work with no generic type provided', async () => {
			const customProvider = new TestCustomProvider();
			const customProviderListSpy = jest.spyOn(customProvider, 'list').mockImplementation(() => Promise.resolve([]));
			storage.addPluggable(customProvider);
			await storage.list('path', {
				provider: 'customProvider',
				config1: true,
				config2: false,
				config3: 'config',
			});
			expect(customProviderListSpy).toBeCalled();
		});
	});

	describe('copy test', () => {
		let storage: StorageClass;
		let provider: StorageProvider;
		let copySpy: jest.SpyInstance;

		beforeEach(() => {
			storage = new StorageClass();
			provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			copySpy = jest
				.spyOn(AWSStorageProvider.prototype, 'copy')
				.mockImplementation(() => Promise.resolve({ key: 'key' }));
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		describe('default provider', () => {
			test('copy object successfully', async () => {
				await storage.copy({ key: 'src' }, { key: 'dest' });
				expect(copySpy).toBeCalled();
				copySpy.mockReset();
			});
			test('call copy object with all available config', async () => {
				storage.copy(
					{ key: 'src', level: 'protected', identityId: 'identityId' },
					{ key: 'dest', level: 'public' },
					{
						cacheControl: 'cacheControl',
						contentDisposition: 'contentDisposition',
						contentLanguage: 'contentLanguage',
						contentType: 'contentType',
						expires: new Date(),
						tagging: 'tagging',
						acl: 'acl',
						metadata: { key: 'value' },
						serverSideEncryption: 'sse',
						SSECustomerAlgorithm: 'aes256',
						SSECustomerKey: 'key',
						SSECustomerKeyMD5: 'md5',
						SSEKMSKeyId: 'id',
					}
				);
			});
		});
		test('copy object without provider', async () => {
			const storage = new StorageClass();
			try {
				await storage.copy({ key: 'src' }, { key: 'dest' });
			} catch (err) {
				expect(err).toEqual('No plugin found in Storage for the provider');
			}
		});
		test('copy object with custom provider', async () => {
			const customProviderWithCopy = new TestCustomProviderWithCopy();
			const customProviderCopySpy = jest.spyOn(customProviderWithCopy, 'copy').mockImplementation(() =>
				Promise.resolve({
					key: 'key',
				})
			);
			storage.addPluggable(customProviderWithCopy);
			storage.copy<TestCustomProviderWithCopy>(
				{ key: 'src' },
				{ key: 'dest' },
				{
					provider: 'customProvider',
					foo: false,
					bar: 40,
				}
			);
			expect(customProviderCopySpy).toBeCalled();
		});
		// backwards compatible with current custom provider user
		test('copy object with custom provider should work with no generic type provided', async () => {
			const customProviderWithCopy = new TestCustomProviderWithCopy();
			const customProviderCopySpy = jest.spyOn(customProviderWithCopy, 'copy').mockImplementation(() =>
				Promise.resolve({
					key: 'key',
				})
			);
			storage.addPluggable(customProviderWithCopy);
			storage.copy(
				{ key: 'src' },
				{ key: 'dest' },
				{
					provider: 'customProvider',
					config1: true,
					config2: false,
					config3: 'config',
				}
			);
			expect(customProviderCopySpy).toBeCalled();
		});
	});

	describe('cancel test', () => {
		let isCancelSpy: jest.SpyInstance;
		let cancelTokenSpy: jest.SpyInstance;
		let cancelMock: jest.Mock;
		let tokenMock: jest.Mock;

		beforeEach(() => {
			cancelMock = jest.fn();
			tokenMock = jest.fn();
			isCancelSpy = jest.spyOn(axios, 'isCancel').mockReturnValue(true);
			cancelTokenSpy = jest.spyOn(axios.CancelToken, 'source').mockImplementation(() => {
				return { token: (tokenMock as unknown) as CancelToken, cancel: cancelMock };
			});
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		test('happy case - cancel upload', async () => {
			jest.spyOn(AWSStorageProvider.prototype, 'put').mockImplementation(() => {
				return Promise.resolve({ key: 'new_object' });
			});
			const storage = new StorageClass();
			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			const request = storage.put('test.txt', 'test upload');
			storage.cancel(request, 'request cancelled');
			expect(cancelTokenSpy).toBeCalledTimes(1);
			expect(cancelMock).toHaveBeenCalledTimes(1);
			try {
				await request;
			} catch (err) {
				expect(err).toEqual('request cancelled');
				expect(storage.isCancelError(err)).toBeTruthy();
			}
		});

		test('happy case - cancel download', async () => {
			jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => {
				return Promise.resolve('some_file_content');
			});
			const storage = new StorageClass();
			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			const request = storage.get('test.txt', {
				download: true,
			});
			storage.cancel(request, 'request cancelled');
			expect(cancelTokenSpy).toHaveBeenCalledTimes(1);
			expect(cancelMock).toHaveBeenCalledWith('request cancelled');
			try {
				await request;
			} catch (err) {
				expect(err).toEqual('request cancelled');
				expect(storage.isCancelError(err)).toBeTruthy();
			}
		});

		test('happy case - cancel copy', async () => {
			const storage = new StorageClass();
			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			const request = storage.copy({ key: 'src' }, { key: 'dest' }, {});
			storage.cancel(request, 'request cancelled');
			expect(cancelTokenSpy).toHaveBeenCalledTimes(1);
			expect(cancelMock).toHaveBeenCalledWith('request cancelled');
			try {
				await request;
			} catch (err) {
				expect(err).toEqual('request cancelled');
				expect(storage.isCancelError(err)).toBeTruthy();
			}
		});

		test('isCancelError called', () => {
			const storage = new StorageClass();
			storage.isCancelError({});
			expect(isCancelSpy).toHaveBeenCalledTimes(1);
		});
	});
});
