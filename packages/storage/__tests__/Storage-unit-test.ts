import AWSStorageProvider from '../src/providers/AWSS3Provider';
import { Storage as StorageClass } from '../src/Storage';
import { Storage as StorageCategory } from '../src';
import axios, { CancelToken } from 'axios';
import { DeleteObjectCommandOutput } from '@aws-sdk/client-s3/';

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

			expect(storage.getPluggable(provider.getProviderName())).toBeInstanceOf(
				AWSStorageProvider
			);
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

	describe('type tests', () => {
		test('should use S3Provider config and output by default', async () => {
			jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => {
				return Promise.resolve('https://this-url-doesnt-exist.gg');
			});
			const storage = new StorageClass();
			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			storage.get('key', {
				download: false,
				contentType: 'text/plain',
			});
		});

		test('allow generic types if provider is specified', async () => {
			jest.spyOn(AWSStorageProvider.prototype, 'get').mockImplementation(() => {
				return Promise.resolve('https://this-url-doesnt-exist.gg');
			});
			const storage = new StorageClass();
			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			type CustomProviderConfig = {
				provider: 'customProvider';
				foo: boolean;
				bar: number;
			};
			storage.get<CustomProviderConfig>('key', {
				provider: 'customProvider',
				foo: false,
				bar: 10,
			});
		});
	});

	describe('get test', () => {
		test('get object without download', async () => {
			const get_spyon = jest
				.spyOn(AWSStorageProvider.prototype, 'get')
				.mockImplementation(() => {
					return Promise.resolve('https://this-url-doesnt-exist.gg');
				});
			const storage = new StorageClass();
			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			storage.get('key', { download: false });
			expect(get_spyon).toBeCalled();
			get_spyon.mockClear();
		});
		test('get without provider', async () => {
			const storage = new StorageClass();
			try {
				await storage.get('key');
			} catch (err) {
				expect(err).toEqual('No plugin found in Storage for the provider');
			}
		});
	});

	describe('put test', () => {
		test('put object successfully', async () => {
			const put_spyon = jest
				.spyOn(AWSStorageProvider.prototype, 'put')
				.mockImplementation(() => {
					return Promise.resolve({ key: 'new_object' });
				});
			const storage = new StorageClass();
			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			await storage.put('key', 'object');
			expect(put_spyon).toBeCalled();
			put_spyon.mockClear();
		});
		test('put without provider', async () => {
			const storage = new StorageClass();
			try {
				await storage.put('key', 'test upload');
			} catch (err) {
				expect(err).toEqual('No plugin found in Storage for the provider');
			}
		});
	});

	describe('remove test', () => {
		test('remove object successfully', async () => {
			const remove_spyon = jest
				.spyOn(AWSStorageProvider.prototype, 'remove')
				.mockImplementation(() => {
					return (Promise.resolve() as unknown) as Promise<
						DeleteObjectCommandOutput
					>;
				});
			const storage = new StorageClass();
			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			await storage.remove('key');
			expect(remove_spyon).toBeCalled();
			remove_spyon.mockClear();
		});
		test('remove without provider', async () => {
			const storage = new StorageClass();
			try {
				await storage.remove('key');
			} catch (err) {
				expect(err).toEqual('No plugin found in Storage for the provider');
			}
		});
	});

	describe('list test', () => {
		test('list object successfully', async () => {
			const list_spyon = jest
				.spyOn(AWSStorageProvider.prototype, 'list')
				.mockImplementation(() => {
					return Promise.resolve([]);
				});
			const storage = new StorageClass();
			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			await storage.list('path');
			expect(list_spyon).toBeCalled();
			list_spyon.mockClear();
		});
		test('list without provider', async () => {
			const storage = new StorageClass();
			try {
				await storage.list('');
			} catch (err) {
				expect(err).toEqual('No plugin found in Storage for the provider');
			}
		});
	});

	describe('copy test', () => {
		test('copy object successfully', async () => {
			const copySpyon = jest
				.spyOn(AWSStorageProvider.prototype, 'copy')
				.mockImplementation(() => Promise.resolve({ key: 'key' }));
			const storage = new StorageClass();
			const provider = new AWSStorageProvider();
			storage.addPluggable(provider);
			storage.configure(options);
			await storage.copy(
				{ key: 'src' },
				{ key: 'dest' }
			);
			expect(copySpyon).toBeCalled();
		});

		test('copy object without provider', async () => {
			const storage = new StorageClass();
			try {
				await storage.copy({ key: 'src' }, { key: 'dest' });
			} catch (err) {
				expect(err).toEqual('No plugin found in Storage for the provider');
			}
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
			cancelTokenSpy = jest
				.spyOn(axios.CancelToken, 'source')
				.mockImplementation(() => {
					return { token: tokenMock as unknown as CancelToken, cancel: cancelMock };
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
