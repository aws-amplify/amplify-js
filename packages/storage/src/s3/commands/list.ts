import {
	ListObjectsV2Request,
	S3Client,
	ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedParams } from '@aws-amplify/core';
import { getPrefix } from '../../common/S3ClientUtils';
import {
	S3ProviderListConfig,
	S3ClientOptions,
	S3ProviderListOutput,
} from '../../types';
import { getStorageConfig } from '../utils';

const MAX_PAGE_SIZE = 1000;

const queryS3 = async (
	path: string,
	params: ListObjectsV2Request,
	options: S3ClientOptions,
	awsCreds: any,
	sdkClient?: S3Client
): Promise<S3ProviderListOutput> => {
	const prefix = getPrefix({ ...options, credentials: awsCreds }); // TODO Standardize prefix generation across APIs
	const final_path = prefix + path;

	const listOutput: S3ProviderListOutput = {
		results: [],
		hasNextToken: false,
	};

	if (sdkClient) {
		//TODO Fix tree-shaking with SDK commands
		//params.Prefix = final_path;
		//const listObjectsV2Command = new ListObjectsV2Command({ ...params });
		//const response = await sdkClient.send(listObjectsV2Command);
		let response;

		if (response && response.Contents) {
			listOutput.results = response.Contents.map(item => {
				return {
					key: item.Key?.substr(prefix.length),
					eTag: item.ETag,
					lastModified: item.LastModified,
					size: item.Size,
				};
			});
			listOutput.nextToken = response.NextContinuationToken;
			listOutput.hasNextToken = !!response.IsTruncated;
		}
	} else {
		const path = `https://${options.bucket}.s3.${options.region}.amazonaws.com/?list-type=2&prefix=${prefix}`;

		let headers = {
			'Cache-Control': 'no-store',
			'X-Amz-Content-Sha256':
				'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
		};

		// Generate authorization headers
		// TODO Merge this with http client
		const signed_params = getSignedParams({
			region: options.region,
			params: {
				method: 'GET',
				data: null,
				url: path,
				headers,
			},
			credentials: {
				...awsCreds,
			},
			service: 's3',
		});
		headers = { ...signed_params.headers };

		const results = await fetch(path, {
			method: 'GET',
			body: null,
			mode: 'cors',
			headers,
		});

		// Parse XML response
		const responseBody = await results.text();
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(responseBody, 'text/xml');

		const xmlContents =
			xmlDoc.firstElementChild?.getElementsByTagName('Contents');

		if (xmlContents) {
			listOutput.results = Array.from(xmlContents).map(element => {
				return {
					key: element.children[0].innerHTML,
					eTag: element.children[2].innerHTML,
					lastModified: new Date(element.children[1].innerHTML),
					size: Number(element.children[3].innerHTML),
				};
			});

			//console.log('+xml response', xmlDoc);

			listOutput.hasNextToken =
				!!xmlDoc.firstElementChild?.getElementsByTagName('IsTruncated')[0]
					.innerHTML;
			if (listOutput.hasNextToken) {
				//listOutput.nextToken = xmlDoc.firstElementChild?.getElementsByTagName('NextToken')[0].innerHTML;
			}
		}
	}

	return listOutput;
};

export const list = async (
	path: string,
	awsCreds: any,
	config?: S3ProviderListConfig,
	sdkClientCreator?: (key: string, options: any) => Promise<S3Client> // S3 client escape hatch
): Promise<S3ProviderListOutput> => {
	const s3GlobalConfig = getStorageConfig();

	// Build request options & S3 command
	const options = Object.assign({}, s3GlobalConfig, config) as S3ClientOptions;
	const { bucket, track, pageSize, nextToken } = options;
	const params: ListObjectsV2Request = {
		Bucket: bucket,
		MaxKeys: MAX_PAGE_SIZE,
		ContinuationToken: nextToken,
	};

	// Initialize client
	const listOutput: S3ProviderListOutput = {
		results: [],
		hasNextToken: false,
	};
	let queryResult: S3ProviderListOutput;
	const sdkClient = sdkClientCreator && (await sdkClientCreator(path, options));

	if (pageSize === 'ALL') {
		// Automatically iterate over all pages
		do {
			queryResult = await queryS3(path, params, options, awsCreds, sdkClient);
			listOutput.results.push(...queryResult.results);

			if (queryResult.nextToken)
				params.ContinuationToken = queryResult.nextToken;
		} while (queryResult.nextToken);
	} else {
		// Return requested page
		if (pageSize && pageSize <= MAX_PAGE_SIZE) {
			params.MaxKeys = pageSize;
		} else {
			console.error(`pageSize should be from 0 - ${MAX_PAGE_SIZE}.`);
		}

		queryResult = await queryS3(path, params, options, awsCreds, sdkClient);
		listOutput.results.push(...listOutput.results);
		listOutput.hasNextToken = listOutput.hasNextToken;
		listOutput.nextToken = null ?? listOutput.nextToken;
	}

	return listOutput;
};
