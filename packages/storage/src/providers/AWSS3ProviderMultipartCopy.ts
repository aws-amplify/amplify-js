import { ConsoleLogger as Logger } from '@aws-amplify/core';
import {
	S3Client,
	CopyObjectCommandInput,
	HeadObjectCommand,
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
} from '@aws-sdk/client-s3';
import * as events from 'events';
import { CopyObjectConfig } from '../types';

const logger = new Logger('AWSS3ProviderMultipartCopy');

export interface CopyPart {
	partNumber: number;
	copySourceRange: string;
	bytes: number;
}

export const COPY_PROGRESS = 'copyProgress';

export interface AWSS3ProviderMultipartCopierParams {
	params: CopyObjectCommandInput;
	config: CopyObjectConfig;
	emitter: events.EventEmitter;
	s3client: S3Client;
	queueSize?: number;
}

export class AWSS3ProviderMultipartCopier {
	static minPartSize = 5 * 1024 * 1024; // 5MB, minimum requirement for a multipart copy
	static partSize = 10 * 1024 * 1024;
	private queueSize: number;
	private params: CopyObjectCommandInput | null = null;
	private completedParts: CompletedPart[] = [];
	private config: CopyObjectConfig = null;

	private bytesCopied = 0;
	private totalBytesToCopy = 0;
	private totalParts = 0;
	private emitter: events.EventEmitter;
	private s3client: S3Client = null;
	private destBucket: string;
	private destKey: string;
	private srcBucket: string;
	private srcKey: string;

	constructor({
		params,
		config,
		emitter,
		s3client,
		queueSize = 10,
	}: AWSS3ProviderMultipartCopierParams) {
		this.params = params;
		this.config = config;
		this.emitter = emitter;
		this.s3client = s3client;
		this.queueSize = queueSize;
		const { CopySource, Key, Bucket } = this.params;
		this.srcKey = CopySource.substr(CopySource.indexOf('/') + 1);
		this.srcBucket = CopySource.substr(0, CopySource.indexOf('/'));
		this.destKey = Key;
		this.destBucket = Bucket;
	}

	public async copy() {
		let uploadId: string = undefined;
		try {
			this.totalBytesToCopy = await this._getObjectSize();
			// ContentLength could be undefined if user doesn't expose the ContentLength header in CORS setting
			// Fallback to basic CopyObject if it's the case, or if the file is smaller than 5MB.
			if (
				this.totalBytesToCopy === undefined ||
				this.totalBytesToCopy <= AWSS3ProviderMultipartCopier.minPartSize
			) {
				const copyObjectCommand = new CopyObjectCommand(this.params);
				return this.s3client.send(copyObjectCommand);
			} else {
				this.totalParts = Math.ceil(
					this.totalBytesToCopy / AWSS3ProviderMultipartCopier.partSize
				);
				uploadId = await this._initMultipartUpload();
				const copyPartRequests = this._copyPartRequestsGenerator(uploadId);
				for await (const results of copyPartRequests) {
					results.forEach(result => {
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

	private async _cleanup(uploadId: string) {
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
			throw new Error('Multipart copy clean up failed');
		}
	}

	private async _initMultipartUpload(): Promise<string> {
		const { Key, Bucket } = this.params;
		const createMultipartUploadCommand = new CreateMultipartUploadCommand({
			Key,
			Bucket,
		});
		const response = await this.s3client.send(createMultipartUploadCommand);
		logger.debug(
			`Created multipart upload request with id ${response.UploadId}`
		);
		return response.UploadId;
	}

	/**
	 * Send a HEAD request to check the size of the object before doing a multipart copy.
	 **/
	private async _getObjectSize(): Promise<number> {
		const headObjectCommand = new HeadObjectCommand({
			Bucket: this.srcBucket,
			Key: this.srcKey,
		});
		const { ContentLength } = await this.s3client.send(headObjectCommand);
		return ContentLength;
	}
}
