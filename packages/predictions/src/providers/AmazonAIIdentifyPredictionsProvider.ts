// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify, ConsoleLogger, fetchAuthSession } from '@aws-amplify/core';
import {
	Category,
	PredictionsAction,
	getAmplifyUserAgentObject,
} from '@aws-amplify/core/internals/utils';
import { getUrl } from '@aws-amplify/storage';
import {
	DetectFacesCommand,
	DetectFacesCommandInput,
	DetectLabelsCommand,
	DetectLabelsCommandInput,
	DetectModerationLabelsCommand,
	DetectModerationLabelsCommandInput,
	DetectTextCommand,
	DetectTextCommandInput,
	RecognizeCelebritiesCommand,
	RekognitionClient,
	SearchFacesByImageCommand,
} from '@aws-sdk/client-rekognition';
import {
	AnalyzeDocumentCommand,
	AnalyzeDocumentCommandInput,
	DetectDocumentTextCommand,
	DetectDocumentTextCommandInput,
	TextractClient,
} from '@aws-sdk/client-textract';

import { PredictionsValidationErrorCode } from '../errors/types/validation';
import { assertValidationError } from '../errors/utils/assertValidationError';
import {
	BoundingBox,
	FaceAttributes,
	FeatureTypes,
	IdentifyEntitiesInput,
	IdentifyEntitiesOutput,
	IdentifyEntity,
	IdentifyFromCollection,
	IdentifyLabelsInput,
	IdentifyLabelsOutput,
	IdentifySource,
	IdentifyTextInput,
	IdentifyTextOutput,
	isFileSource,
	isIdentifyBytesSource,
	isIdentifyCelebrities,
	isIdentifyFromCollection,
	isIdentifyLabelsInput,
	isIdentifyTextInput,
	isStorageSource,
	isValidIdentifyInput,
} from '../types';
import { BlockList, Image, TextDetectionList } from '../types/AWSTypes';

import {
	categorizeRekognitionBlocks,
	categorizeTextractBlocks,
} from './IdentifyTextUtils';
import { blobToArrayBuffer, makeCamelCase, makeCamelCaseArray } from './Utils';

const logger = new ConsoleLogger('AmazonAIIdentifyPredictionsProvider');

export class AmazonAIIdentifyPredictionsProvider {
	private rekognitionClient?: RekognitionClient;
	private textractClient?: TextractClient;

	getProviderName() {
		return 'AmazonAIIdentifyPredictionsProvider';
	}

	identify(
		input: IdentifyTextInput | IdentifyLabelsInput | IdentifyEntitiesInput,
	): Promise<
		IdentifyTextOutput | IdentifyLabelsOutput | IdentifyEntitiesOutput
	> {
		assertValidationError(
			isValidIdentifyInput(input),
			PredictionsValidationErrorCode.InvalidInput,
		);

		if (isIdentifyTextInput(input)) {
			logger.debug('identifyText');

			return this.identifyText(input);
		} else if (isIdentifyLabelsInput(input)) {
			logger.debug('identifyLabels');

			return this.identifyLabels(input);
		} else {
			logger.debug('identifyEntities');

			return this.identifyEntities(input);
		}
	}

	/**
	 * Verify user input source and converts it into source object readable by Rekognition and Textract.
	 * Note that Rekognition and Textract use the same source interface, so we need not worry about types.
	 * @param {IdentifySource} source - User input source that directs to the object user wants
	 * to identify (storage, file, or bytes).
	 * @return {Promise<Image>} - Promise resolving to the converted source object.
	 */
	private configureSource(source: IdentifySource): Promise<Image> {
		return new Promise((resolve, reject) => {
			if (isStorageSource(source)) {
				const storageConfig = {
					accessLevel: source.level,
					targetIdentityId: source.identityId,
				};

				getUrl({ key: source.key, options: storageConfig })
					.then(value => {
						const parser =
							/https:\/\/([a-zA-Z0-9%\-_.]+)\.s3\.[A-Za-z0-9%\-._~]+\/([a-zA-Z0-9%\-._~/]+)\?/;
						const parsedURL = value.url.toString().match(parser) ?? '';
						if (parsedURL.length < 3)
							reject(new Error('Invalid S3 key was given.'));
						resolve({
							S3Object: {
								Bucket: parsedURL[1],
								Name: decodeURIComponent(parsedURL[2]),
							},
						});
					})
					.catch(err => {
						reject(err);
					});
			} else if (isFileSource(source)) {
				blobToArrayBuffer(source.file)
					.then(buffer => {
						resolve({ Bytes: new Uint8Array(buffer) });
					})
					.catch(err => {
						reject(err);
					});
			} else if (isIdentifyBytesSource(source)) {
				const { bytes } = source;
				if (bytes instanceof Blob) {
					blobToArrayBuffer(bytes)
						.then(buffer => {
							resolve({ Bytes: new Uint8Array(buffer) });
						})
						.catch(err => {
							reject(err);
						});
				}
				if (bytes instanceof ArrayBuffer || bytes instanceof Buffer) {
					resolve({ Bytes: new Uint8Array(bytes) } as Image);
				}
				// everything else can be directly passed to Rekognition / Textract.
				resolve({ Bytes: bytes } as Image);
			} else {
				reject(new Error('Input source is not configured correctly.'));
			}
		});
	}

	/**
	 * Recognize text from real-world images and documents (plain text, forms and tables). Detects text in the input
	 * image and converts it into machine-readable text.
	 * @param {IdentifySource} source - Object containing the source image and feature types to analyze.
	 * @return {Promise<IdentifyTextOutput>} - Promise resolving to object containing identified texts.
	 */
	protected async identifyText(
		input: IdentifyTextInput,
	): Promise<IdentifyTextOutput> {
		const { credentials } = await fetchAuthSession();
		assertValidationError(
			!!credentials,
			PredictionsValidationErrorCode.NoCredentials,
		);

		const { identifyText = {} } =
			Amplify.getConfig().Predictions?.identify ?? {};
		const { region = '', defaults = {} } = identifyText;
		const { format: configFormat = 'PLAIN' } = defaults;

		this.rekognitionClient = new RekognitionClient({
			region,
			credentials,
			customUserAgent: _getPredictionsIdentifyAmplifyUserAgent(),
		});
		this.textractClient = new TextractClient({
			region,
			credentials,
			customUserAgent: _getPredictionsIdentifyAmplifyUserAgent(),
		});

		const inputDocument = await this.configureSource(input.text?.source);

		// get default value if format isn't specified in the input.
		const format = input.text?.format ?? configFormat;
		const featureTypes: FeatureTypes = []; // structures we want to analyze (e.g. [TABLES, FORMS]).
		if (format === 'FORM' || format === 'ALL') featureTypes.push('FORMS');
		if (format === 'TABLE' || format === 'ALL') featureTypes.push('TABLES');

		if (featureTypes.length === 0) {
			/**
			 * Empty featureTypes indicates that we will identify plain text. We will use rekognition (suitable
			 * for everyday images but has 50 word limit) first and see if reaches its word limit. If it does, then
			 * we call textract and use the data that identify more words.
			 */
			const textractParam: DetectDocumentTextCommandInput = {
				Document: inputDocument,
			};
			const rekognitionParam: DetectTextCommandInput = {
				Image: inputDocument,
			};

			const detectTextCommand = new DetectTextCommand(rekognitionParam);
			const rekognitionData =
				await this.rekognitionClient.send(detectTextCommand);

			const rekognitionResponse = categorizeRekognitionBlocks(
				rekognitionData.TextDetections as TextDetectionList,
			);
			if (rekognitionResponse.text.words.length < 50) {
				// did not hit the word limit, return the data
				return rekognitionResponse;
			}

			const detectDocumentTextCommand = new DetectDocumentTextCommand(
				textractParam,
			);

			const { Blocks } = await this.textractClient.send(
				detectDocumentTextCommand,
			);

			if (
				(rekognitionData.TextDetections?.length ?? 0) > (Blocks?.length ?? 0)
			) {
				return rekognitionResponse;
			}

			return categorizeTextractBlocks(Blocks as BlockList);
		} else {
			const param: AnalyzeDocumentCommandInput = {
				Document: inputDocument,
				FeatureTypes:
					featureTypes as AnalyzeDocumentCommandInput['FeatureTypes'],
			};

			const analyzeDocumentCommand = new AnalyzeDocumentCommand(param);
			const { Blocks } = await this.textractClient.send(analyzeDocumentCommand);

			return categorizeTextractBlocks(Blocks as BlockList);
		}
	}

	/**
	 * Identify instances of real world entities from an image and if it contains unsafe content.
	 * @param {IdentifyLabelsInput} input - Object containing the source image and entity type to identify.
	 * @return {Promise<IdentifyLabelsOutput>} - Promise resolving to an array of identified entities.
	 */
	protected async identifyLabels(
		input: IdentifyLabelsInput,
	): Promise<IdentifyLabelsOutput> {
		const { credentials } = await fetchAuthSession();
		assertValidationError(
			!!credentials,
			PredictionsValidationErrorCode.NoCredentials,
		);

		const { identifyLabels = {} } =
			Amplify.getConfig().Predictions?.identify ?? {};
		const { region = '', defaults = {} } = identifyLabels;
		const { type = 'LABELS' } = defaults;

		this.rekognitionClient = new RekognitionClient({
			region,
			credentials,
			customUserAgent: _getPredictionsIdentifyAmplifyUserAgent(),
		});

		const inputImage = await this.configureSource(input.labels?.source);
		const param = { Image: inputImage };
		const servicePromises: Promise<IdentifyLabelsOutput>[] = [];

		// get default argument
		const entityType = input.labels?.type ?? type;
		if (entityType === 'LABELS' || entityType === 'ALL') {
			servicePromises.push(this.detectLabels(param));
		}
		if (entityType === 'UNSAFE' || entityType === 'ALL') {
			servicePromises.push(this.detectModerationLabels(param));
		}

		return Promise.all(servicePromises).then(data => {
			let identifyResult: IdentifyLabelsOutput = {};
			// concatenate resolved promises to a single object
			data.forEach(val => {
				identifyResult = { ...identifyResult, ...val };
			});

			return identifyResult;
		});
	}

	/**
	 * Calls Rekognition.detectLabels and organizes the returned data.
	 * @param param - parameters as {@link DetectLabelsCommandInput} to be passed onto Rekognition
	 * @return a promise resolving to organized detectLabels response as {@link IdentifyLabelsOutput}.
	 */
	private async detectLabels(
		param: DetectLabelsCommandInput,
	): Promise<IdentifyLabelsOutput> {
		const detectLabelsCommand = new DetectLabelsCommand(param);
		const data = await this.rekognitionClient!.send(detectLabelsCommand);
		if (!data.Labels) return {}; // no image was detected
		const detectLabelData = data.Labels.map(label => {
			const boxes =
				label.Instances?.map(
					instance =>
						makeCamelCase(instance.BoundingBox) as BoundingBox | undefined,
				) || [];

			return {
				name: label.Name,
				boundingBoxes: boxes,
				metadata: {
					confidence: label.Confidence,
					parents: makeCamelCaseArray(label.Parents),
				},
			};
		});

		return { labels: detectLabelData };
	}

	/**
	 * Calls Rekognition.detectModerationLabels and organizes the returned data.
	 * @param param parameter to be passed onto Rekognition as {@link DetectModerationLabelsCommandInput}
	 * @return a promise resolving to organized detectModerationLabels response as {@link IdentifyLabelsOutput}.
	 */
	private async detectModerationLabels(
		param: DetectModerationLabelsCommandInput,
	): Promise<IdentifyLabelsOutput> {
		const detectModerationLabelsCommand = new DetectModerationLabelsCommand(
			param,
		);
		const data = await this.rekognitionClient!.send(
			detectModerationLabelsCommand,
		);
		if (data.ModerationLabels?.length !== 0) {
			return { unsafe: 'YES' };
		} else {
			return { unsafe: 'NO' };
		}
	}

	/**
	 * Identify faces within an image that is provided as input, and match faces from a collection
	 * or identify celebrities.
	 * @param input - object of {@link IdentifyEntitiesInput} containing the source image and face match options.
	 * @return a promise resolving to identify results as {@link IdentifyEntitiesOutput}.
	 */
	protected async identifyEntities(
		input: IdentifyEntitiesInput,
	): Promise<IdentifyEntitiesOutput> {
		const { credentials } = await fetchAuthSession();
		assertValidationError(
			!!credentials,
			PredictionsValidationErrorCode.NoCredentials,
		);

		const { identifyEntities = {} } =
			Amplify.getConfig().Predictions?.identify ?? {};
		const {
			region = '',
			celebrityDetectionEnabled = false,
			defaults = {},
		} = identifyEntities;
		const {
			collectionId: collectionIdConfig = '',
			maxEntities: maxFacesConfig = 50,
		} = defaults;
		// default arguments

		this.rekognitionClient = new RekognitionClient({
			region,
			credentials,
			customUserAgent: _getPredictionsIdentifyAmplifyUserAgent(),
		});
		const inputImage = await this.configureSource(input.entities?.source);
		const param = { Attributes: ['ALL'], Image: inputImage };

		if (
			isIdentifyCelebrities(input.entities) &&
			input.entities.celebrityDetection
		) {
			assertValidationError(
				celebrityDetectionEnabled,
				PredictionsValidationErrorCode.CelebrityDetectionNotEnabled,
			);
			const recognizeCelebritiesCommand = new RecognizeCelebritiesCommand(
				param,
			);
			const data = await this.rekognitionClient.send(
				recognizeCelebritiesCommand,
			);
			const faces =
				data.CelebrityFaces?.map(
					celebrity =>
						({
							boundingBox: makeCamelCase(celebrity.Face?.BoundingBox),
							landmarks: makeCamelCaseArray(celebrity.Face?.Landmarks),
							metadata: {
								...makeCamelCase(celebrity, ['Id', 'Name', 'Urls']),
								pose: makeCamelCase(celebrity.Face?.Pose),
							},
						}) as IdentifyEntity,
				) ?? [];

			return { entities: faces };
		} else if (
			isIdentifyFromCollection(input.entities) &&
			input.entities.collection
		) {
			const {
				collectionId = collectionIdConfig,
				maxEntities: maxFaces = maxFacesConfig,
			} = input.entities as IdentifyFromCollection;
			// Concatenate additional parameters
			const updatedParam = {
				...param,
				CollectionId: collectionId,
				MaxFaces: maxFaces,
			};
			const searchFacesByImageCommand = new SearchFacesByImageCommand(
				updatedParam,
			);
			const data = await this.rekognitionClient.send(searchFacesByImageCommand);
			const faces =
				data.FaceMatches?.map(match => {
					const externalImageId = match.Face?.ExternalImageId
						? this.decodeExternalImageId(match.Face.ExternalImageId)
						: undefined;

					return {
						boundingBox: makeCamelCase(match.Face?.BoundingBox),
						metadata: {
							externalImageId,
							similarity: match.Similarity,
						},
					} as IdentifyEntity;
				}) ?? [];

			return { entities: faces };
		} else {
			const detectFacesCommand = new DetectFacesCommand(
				param as DetectFacesCommandInput,
			);
			const data = await this.rekognitionClient.send(detectFacesCommand);
			const faces =
				data.FaceDetails?.map(detail => {
					// face attributes keys we want to extract from Rekognition's response
					const attributeKeys = [
						'Smile',
						'Eyeglasses',
						'Sunglasses',
						'Gender',
						'Beard',
						'Mustache',
						'EyesOpen',
						'MouthOpen',
					];
					const faceAttributes = makeCamelCase(
						detail,
						attributeKeys,
					) as FaceAttributes;

					faceAttributes.emotions = detail.Emotions?.map(
						emotion => emotion.Type,
					);

					return {
						boundingBox: makeCamelCase(detail.BoundingBox),
						landmarks: makeCamelCaseArray(detail.Landmarks),
						ageRange: makeCamelCase(detail.AgeRange),
						attributes: faceAttributes,
						metadata: {
							confidence: detail.Confidence,
							pose: makeCamelCase(detail.Pose),
						},
					} as IdentifyEntity;
				}) ?? [];

			return { entities: faces };
		}
	}

	private decodeExternalImageId(externalImageId: string): string {
		return ('' + externalImageId).replace(/::/g, '/');
	}
}

function _getPredictionsIdentifyAmplifyUserAgent() {
	return getAmplifyUserAgentObject({
		category: Category.Predictions,
		action: PredictionsAction.Identify,
	});
}
