// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* tslint:disable:max-line-length */

/**
 * Base types
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface PredictionsOptions {
	[key: string]: any;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface ProviderOptions {
	providerName?: string;
}

/**
 * Convert types
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */

export enum InterpretTextCategories {
	ALL = 'ALL',
	LANGUAGE = 'LANGUAGE',
	ENTITIES = 'ENTITIES',
	SENTIMENT = 'SENTIMENT',
	SYNTAX = 'SYNTAX',
	KEY_PHRASES = 'KEY_PHRASES',
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface InterpretTextInput {
	text: InterpretTextInputLanguage | InterpretTextOthers | InterpretTextAll;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface InterpretTextInputLanguage {
	source: {
		text: string;
	};
	type: InterpretTextCategories.LANGUAGE;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface InterpretTextOthers {
	source: {
		text: string;
		language: string;
	};
	type:
		| InterpretTextCategories.ENTITIES
		| InterpretTextCategories.SENTIMENT
		| InterpretTextCategories.SYNTAX
		| InterpretTextCategories.KEY_PHRASES;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface InterpretTextAll {
	source: {
		text: string;
	};
	type: InterpretTextCategories.ALL;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface TextEntities {
	type: string;
	text: string;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface KeyPhrases {
	text: string;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface TextSyntax {
	text: string;
	syntax: string;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface TextSentiment {
	predominant: string;
	positive: number;
	negative: number;
	neutral: number;
	mixed: number;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface InterpretTextOutput {
	textInterpretation: {
		language?: string;
		textEntities?: Array<TextEntities>;
		keyPhrases?: Array<KeyPhrases>;
		sentiment?: TextSentiment;
		syntax?: Array<TextSyntax>;
	};
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface TranslateTextInput {
	translateText: {
		source: {
			text: string;
			language?: string;
		};
		targetLanguage?: string;
	};
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface TranslateTextOutput {
	text: string;
	language: string;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface TextToSpeechInput {
	textToSpeech: {
		source: {
			text: string;
		};
		terminology?: string;
		voiceId?: string;
	};
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface TextToSpeechOutput {
	speech: { url: string };
	audioStream: Buffer;
	text: string;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface StorageSource {
	key: string;
	level?: 'public' | 'private' | 'protected';
	identityId?: string;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface FileSource {
	file: File;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface BytesSource {
	bytes: Buffer | ArrayBuffer | Blob | string;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface SpeechToTextInput {
	transcription: {
		source: BytesSource;
		language?: string;
	};
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface SpeechToTextOutput {
	transcription: {
		fullText: string;
	};
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type IdentifySource = StorageSource | FileSource | BytesSource;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface IdentifyTextInput {
	text: {
		source: IdentifySource;
		format?: 'PLAIN' | 'FORM' | 'TABLE' | 'ALL';
	};
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface Word {
	text?: string;
	polygon?: Polygon;
	boundingBox?: BoundingBox;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface LineDetailed {
	text?: string;
	polygon?: Polygon;
	boundingBox?: BoundingBox;
	page?: number;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface Content {
	text?: string;
	selected?: boolean;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface TableCell extends Content {
	boundingBox?: BoundingBox;
	polygon?: Polygon;
	rowSpan?: Number;
	columnSpan?: Number;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface Table {
	size: {
		rows: number;
		columns: number;
	};
	table: TableCell[][];
	polygon: Polygon;
	boundingBox: BoundingBox;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface KeyValue {
	key: string;
	value: Content;
	polygon: Polygon;
	boundingBox: BoundingBox;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface IdentifyTextOutput {
	text: {
		fullText: string;
		lines: string[];
		linesDetailed: LineDetailed[];
		words: Word[];
		keyValues?: KeyValue[];
		tables?: Table[];
		selections?: {
			selected: boolean;
			polygon: Polygon;
			boundingBox: BoundingBox;
		}[];
	};
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface IdentifyLabelsInput {
	labels: {
		source: IdentifySource;
		type: 'LABELS' | 'UNSAFE' | 'ALL';
	};
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface Point {
	x?: Number;
	y?: Number;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type Polygon = Array<Point> | Iterable<Point>;

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface BoundingBox {
	width?: Number;
	height?: Number;
	left?: Number;
	top?: Number;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface IdentifyLabelsOutput {
	labels?: {
		name: string;
		boundingBoxes: BoundingBox[];
		metadata?: Object;
	}[];
	unsafe?: 'YES' | 'NO' | 'UNKNOWN';
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface IdentifyEntitiesInput {
	entities: IdentifyFromCollection | IdentifyCelebrities | IdentifyEntities;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface IdentifyFromCollection {
	source: IdentifySource;
	collection: true;
	collectionId?: string;
	maxEntities?: number;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface IdentifyCelebrities {
	source: IdentifySource;
	celebrityDetection: true;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface IdentifyEntities {
	source: IdentifySource;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface FaceAttributes {
	smile?: boolean;
	eyeglasses?: boolean;
	sunglasses?: boolean;
	gender?: string;
	beard?: boolean;
	mustache?: boolean;
	eyesOpen?: boolean;
	mouthOpen?: boolean;
	emotions?: string[];
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface IdentifyEntitiesOutput {
	entities: {
		boundingBox?: BoundingBox;
		ageRange?: {
			low?: Number;
			high?: Number;
		};
		landmarks?: {
			type?: string;
			x?: number;
			y?: number;
		}[];
		attributes?: FaceAttributes;
		metadata?: object;
	}[];
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isIdentifyFromCollection(
	obj: any
): obj is IdentifyFromCollection {
	const key: keyof IdentifyFromCollection = 'collection';
	const keyId: keyof IdentifyFromCollection = 'collectionId';
	return obj && (obj.hasOwnProperty(key) || obj.hasOwnProperty(keyId));
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isIdentifyCelebrities(obj: any): obj is IdentifyCelebrities {
	const key: keyof IdentifyCelebrities = 'celebrityDetection';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isTranslateTextInput(obj: any): obj is TranslateTextInput {
	const key: keyof TranslateTextInput = 'translateText';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isTextToSpeechInput(obj: any): obj is TextToSpeechInput {
	const key: keyof TextToSpeechInput = 'textToSpeech';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isSpeechToTextInput(obj: any): obj is SpeechToTextInput {
	const key: keyof SpeechToTextInput = 'transcription';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isStorageSource(obj: any): obj is StorageSource {
	const key: keyof StorageSource = 'key';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isFileSource(obj: any): obj is FileSource {
	const key: keyof FileSource = 'file';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isBytesSource(obj: any): obj is BytesSource {
	const key: keyof BytesSource = 'bytes';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isIdentifyTextInput(obj: any): obj is IdentifyTextInput {
	const key: keyof IdentifyTextInput = 'text';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isIdentifyLabelsInput(obj: any): obj is IdentifyLabelsInput {
	const key: keyof IdentifyLabelsInput = 'labels';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isIdentifyEntitiesInput(
	obj: any
): obj is IdentifyEntitiesInput {
	const key: keyof IdentifyEntitiesInput = 'entities';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export function isInterpretTextInput(obj: any): obj is InterpretTextInput {
	const key: keyof InterpretTextInput = 'text';
	return obj && obj.hasOwnProperty(key);
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface Geometry {
	/**
	 * <p>An axis-aligned coarse representation of the detected text's location on the image.</p>
	 */
	BoundingBox?: BoundingBox;

	/**
	 * <p>Within the bounding box, a fine-grained polygon around the detected text.</p>
	 */
	Polygon?: Array<Point> | Iterable<Point>;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export interface Relationship {
	/**
	 * <p>The type of relationship that the blocks in the IDs array have with the current block. The relationship can be <code>VALUE</code> or <code>CHILD</code>.</p>
	 */
	Type?: 'VALUE' | 'CHILD' | string;

	/**
	 * <p>An array of IDs for related blocks. You can get the type of the relationship from the <code>Type</code> element.</p>
	 */
	Ids?: Array<string> | Iterable<string>;
}

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type FeatureType = 'TABLES' | 'FORMS' | string;
/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
export type FeatureTypes = FeatureType[];
