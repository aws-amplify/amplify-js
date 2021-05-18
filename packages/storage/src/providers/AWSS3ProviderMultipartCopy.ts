import { ConsoleLogger as Logger } from '@aws-amplify/core';
import {
	S3Client,
	CopyObjectCommandInput,
	CopyObjectCommand,
	CreateMultipartUploadCommand,
	UploadPartCopyCommandOutput,
	CompleteMultipartUploadCommandInput,
	CompletedPart,
	CompleteMultipartUploadCommand,
	AbortMultipartUploadCommandInput,
	AbortMultipartUploadCommand,
	ListPartsCommand,
	UploadPartCopyCommand,
	ListObjectsV2Command,
	CopyObjectCommandOutput,
} from '@aws-sdk/client-s3';
import * as events from 'events';

const logger = new Logger('AWSS3ProviderMultipartCopier');
const DEFAULT_QUEUE_SIZE = 20;

enum AWSS3ProviderMultipartCopierErrors {
	CLEANUP_FAILED = 'Multipart copy clean up failed',
	NO_OBJECT_FOUND = 'Object does not exist',
	TOO_MANY_MATCH = 'More than one object matches with this prefix',
	OBJECT_KEY_MISMATCH = 'The specified source key and object key in S3 does not match',
}

export interface CopyPart {
	partNumber: number;
	copySourceRange: string;
	bytes: number;
}

export const COPY_PROGRESS = 'copyProgress';

export interface AWSS3ProviderMultipartCopierParams {
	params: CopyObjectCommandInput;
	emitter: events.EventEmitter;
	s3client: S3Client;
	queueSize?: number;
}

export class AWSS3ProviderMultipartCopier {
	static readonly minPartSize = 5 * 1024 * 1024; // 5MB, minimum requirement for a multipart copy
	static readonly partSize = 50 * 1024 * 1024;
	private queueSize: number;
	private params: CopyObjectCommandInput;
	private completedParts: CompletedPart[] = [];
	private bytesCopied = 0;
	private totalBytesToCopy = 0;
	private totalParts = 0;
	private emitter: events.EventEmitter;
	private s3client: S3Client;
	private destBucket: string;
	private destKey: string;
	private srcBucket: string;
	private srcKey: string;

	constructor({
		params,
		emitter,
		s3client,
		queueSize = DEFAULT_QUEUE_SIZE,
	}: AWSS3ProviderMultipartCopierParams) {
		this.params = params;
		this.emitter = emitter;
		this.s3client = s3client;
		this.queueSize = queueSize;
		const { CopySource, Key, Bucket } = this.params;
		this.srcKey = CopySource.substr(CopySource.indexOf('/') + 1);
		this.srcBucket = CopySource.substr(0, CopySource.indexOf('/'));
		this.destKey = Key;
		this.destBucket = Bucket;
	}

	/**
	 * Copies a file from srcKey to destKey.
	 * It will first make a ListObjectV2Command to make sure the file exist and get the object size.
	 * If the file size is less than 5MB, it will do a CopyObjectCommand, else, it will initiate a multipart copy.
	 *
	 * @async
	 * @param {boolean} [multipart] - If true, the copy request will prioritize using multipart copy,
	 * else it will use the basic CopyCommand.
	 * @throws Will throw an error if any of the requests fails, or if it's cancelled.
	 * @return {Promise<string | CopyObjectCommandOutput>} Key of the copied object.
	 */
	public async copy(
		multipart = true
	): Promise<string | CopyObjectCommandOutput> {
		let uploadId: string = undefined;
		try {
			this.totalBytesToCopy = await this._getObjectSize();
			// Fallback to basic CopyObject if the file is smaller than 5MB.
			if (
				!multipart ||
				this.totalBytesToCopy <= AWSS3ProviderMultipartCopier.minPartSize
			) {
				const copyObjectCommand = new CopyObjectCommand(this.params);
				const result = await this.s3client.send(copyObjectCommand);
				this.emitter.emit(COPY_PROGRESS, {
					loaded: this.totalBytesToCopy,
					total: this.totalBytesToCopy,
				});
				return result;
			} else {
				this.totalParts = Math.ceil(
					this.totalBytesToCopy / AWSS3ProviderMultipartCopier.partSize
				);
				uploadId = await this._initMultipartUpload();
				const copyPartRequests = this._copyPartRequestsGenerator(uploadId);
				for await (const results of copyPartRequests) {
					results.forEach((result: UploadPartCopyCommandOutput) => {
						this.completedParts.push({
							PartNumber: this.completedParts.length + 1,
							ETag: result.CopyPartResult.ETag,
						});
					});
					this.emitter.emit(COPY_PROGRESS, {
						loaded: this.bytesCopied,
						total: this.totalBytesToCopy,
					});
				}
				return await this._completeMultipartCopy(uploadId);
			}
		} catch (err) {
			if (uploadId !== undefined) {
				await this._cleanup(uploadId);
			}
			throw err;
		}
	}

	private async _completeMultipartCopy(uploadId: string) {
		const input: CompleteMultipartUploadCommandInput = {
			Bucket: this.params.Bucket,
			Key: this.params.Key,
			UploadId: uploadId,
			MultipartUpload: {
				Parts: this.completedParts,
			},
		};
		logger.debug('Completing the multipart upload', this.completedParts);
		const completeUploadCommand = new CompleteMultipartUploadCommand(input);
		try {
			const result = await this.s3client.send(completeUploadCommand);
			return result.Key;
		} catch (err) {
			logger.error(
				'error happend while finishing the copy. Aborting the multipart copy',
				err
			);
			throw err;
		}
	}

	private async *_copyPartRequestsGenerator(
		uploadId: string
	): AsyncGenerator<UploadPartCopyCommandOutput[]> {
		let partNumber = 1;
		while (this.bytesCopied < this.totalBytesToCopy) {
			const parts = this._makeParts(partNumber);
			yield Promise.all(
				parts.map(async part => {
					const output = await this.s3client.send(
						new UploadPartCopyCommand({
							Bucket: this.destBucket,
							Key: this.destKey,
							CopySource: `${this.srcBucket}/${this.srcKey}`,
							CopySourceRange: part.copySourceRange,
							PartNumber: part.partNumber,
							UploadId: uploadId,
						})
					);
					partNumber++;
					this.bytesCopied += part.bytes;
					this.emitter.emit(COPY_PROGRESS, {
						loaded: this.bytesCopied,
						total: this.totalBytesToCopy,
					});
					return output;
				})
			);
		}
	}

	private _makeParts(startPartNum: number): CopyPart[] {
		const parts: CopyPart[] = [];
		const partsRemaining = this.totalParts - startPartNum + 1;
		for (let i = 0; i < Math.min(this.queueSize, partsRemaining); i++) {
			const startByte =
				(startPartNum + i - 1) * AWSS3ProviderMultipartCopier.partSize;
			const endByte =
				Math.min(
					startByte + AWSS3ProviderMultipartCopier.partSize,
					this.totalBytesToCopy
				) - 1;
			parts.push({
				partNumber: startPartNum + i,
				copySourceRange: `bytes=${startByte}-${endByte}`,
				bytes: endByte - startByte + 1,
			});
		}
		return parts;
	}

	private async _cleanup(uploadId: string): Promise<void> {
		this.bytesCopied = 0;
		this.completedParts = [];
		this.totalBytesToCopy = 0;

		const input: AbortMultipartUploadCommandInput = {
			Bucket: this.params.Bucket,
			Key: this.params.Key,
			UploadId: uploadId,
		};

		await this.s3client.send(new AbortMultipartUploadCommand(input));

		const result = await this.s3client.send(new ListPartsCommand(input));

		if (result && result.Parts && result.Parts.length > 0) {
			throw new Error(AWSS3ProviderMultipartCopierErrors.CLEANUP_FAILED);
		}
	}

	private async _initMultipartUpload(): Promise<string> {
		const { CopySource, ...multipartUploadInput } = this.params;
		const createMultipartUploadCommand = new CreateMultipartUploadCommand(
			multipartUploadInput
		);
		const response = await this.s3client.send(createMultipartUploadCommand);
		logger.debug(
			`Created multipart upload request with id ${response.UploadId}`
		);
		return response.UploadId;
	}

	private async _getObjectSize(): Promise<number> {
		const listObjectCommand = new ListObjectsV2Command({
			Bucket: this.srcBucket,
			MaxKeys: 1,
			Prefix: this.srcKey,
		});
		const { Contents, IsTruncated } = await this.s3client.send(
			listObjectCommand
		);
		if (Contents.length === 0) {
			throw new Error(
				`${AWSS3ProviderMultipartCopierErrors.NO_OBJECT_FOUND}, key: ${this.srcKey}`
			);
		} else if (IsTruncated) {
			throw new Error(
				`${AWSS3ProviderMultipartCopierErrors.TOO_MANY_MATCH}, prefix: ${this.srcKey}`
			);
		}
		const sourceObject = Contents[0];
		if (sourceObject.Key !== this.srcKey) {
			throw new Error(
				`${AWSS3ProviderMultipartCopierErrors.OBJECT_KEY_MISMATCH}, provided: ${this.srcKey}, from s3: ${sourceObject.Key}`
			);
		}
		return sourceObject.Size;
	}
}
