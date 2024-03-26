// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Convert types
 */

export type InterpretTextCategories =
	| 'all'
	| 'language'
	| 'entities'
	| 'sentiment'
	| 'syntax'
	| 'keyPhrases';

export interface InterpretTextInput {
	text: InterpretTextInputLanguage | InterpretTextOthers | InterpretTextAll;
}

export interface InterpretTextInputLanguage {
	source: {
		text: string;
	};
	type: Extract<InterpretTextCategories, 'language'>;
}

export interface InterpretTextOthers {
	source: {
		text: string;
		language: string;
	};
	type: Extract<
		InterpretTextCategories,
		'entities' | 'sentiment' | 'syntax' | 'keyPhrases'
	>;
}

export interface InterpretTextAll {
	source: {
		text: string;
	};
	type: Extract<InterpretTextCategories, 'all'>;
}

export interface TextEntities {
	type?: string;
	text?: string;
}

export type KeyPhrases = KeyPhrase[];
export interface KeyPhrase {
	text?: string;
}

export interface TextSyntax {
	text: string;
	syntax: string;
}

export interface TextSentiment {
	predominant: string;
	positive: number;
	negative: number;
	neutral: number;
	mixed: number;
}

export interface DetectParams {
	Text: string;
	LanguageCode: string;
}

export interface InterpretTextOutput {
	textInterpretation: {
		language?: string;
		textEntities?: TextEntities[];
		keyPhrases?: KeyPhrases;
		sentiment?: TextSentiment;
		syntax?: TextSyntax[];
	};
}

export interface TranslateTextInput {
	translateText: {
		source: {
			text: string;
			language?: string;
		};
		targetLanguage?: string;
	};
}

export interface TranslateTextOutput {
	text: string;
	language: string;
}

export interface TextToSpeechInput {
	textToSpeech: {
		source: {
			text: string;
		};
		terminology?: string;
		voiceId?: string;
	};
}

export interface TextToSpeechOutput {
	speech: { url: string };
	audioStream: Buffer;
	text: string;
}

export interface StorageSource {
	key: string;
	level?: 'guest' | 'private' | 'protected';
	identityId?: string;
}

export interface FileSource {
	file: File;
}

export type ConvertBytes = Buffer | ArrayBuffer | string;
export type IdentifyBytes = ConvertBytes | Blob;

export interface BytesSource<T> {
	bytes: T;
}

export interface SpeechToTextInput {
	transcription: {
		source: BytesSource<ConvertBytes>;
		language?: string;
	};
}

export interface TranscribeData {
	connection: WebSocket;
	raw: ConvertBytes;
	languageCode: string;
}

export interface SpeechToTextOutput {
	transcription: {
		fullText: string;
	};
}

export type IdentifySource =
	| StorageSource
	| FileSource
	| BytesSource<IdentifyBytes>;

export interface IdentifyTextInput {
	text: {
		source: IdentifySource;
		format?: 'PLAIN' | 'FORM' | 'TABLE' | 'ALL';
	};
}

export interface Word {
	text?: string;
	polygon?: Polygon;
	boundingBox?: BoundingBox;
}

export interface LineDetailed {
	text?: string;
	polygon?: Polygon;
	boundingBox?: BoundingBox;
	page?: number;
}

export interface Content {
	text?: string;
	selected?: boolean;
}

export interface TableCell extends Content {
	boundingBox?: BoundingBox;
	polygon?: Polygon;
	rowSpan?: number;
	columnSpan?: number;
}

export interface Table {
	size: {
		rows: number;
		columns: number;
	};
	table: TableCell[][];
	polygon?: Polygon;
	boundingBox?: BoundingBox;
}

export interface KeyValue {
	key: string;
	value: Content;
	polygon?: Polygon;
	boundingBox?: BoundingBox;
}

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
			polygon?: Polygon;
			boundingBox?: BoundingBox;
		}[];
	};
}

export interface IdentifyLabelsInput {
	labels: {
		source: IdentifySource;
		type: 'LABELS' | 'UNSAFE' | 'ALL';
	};
}

export interface Point {
	x?: number;
	y?: number;
}

export type Polygon = Point[] | Iterable<Point>;

export interface BoundingBox {
	width?: number;
	height?: number;
	left?: number;
	top?: number;
}

export interface IdentifyLabelsOutput {
	labels?: {
		name?: string;
		boundingBoxes?: (BoundingBox | undefined)[];
		metadata?: object;
	}[];
	unsafe?: 'YES' | 'NO' | 'UNKNOWN';
}

export interface IdentifyEntitiesInput {
	entities: IdentifyFromCollection | IdentifyCelebrities | IdentifyEntities;
}

export interface IdentifyFromCollection {
	source: IdentifySource;
	collection: true;
	collectionId?: string;
	maxEntities?: number;
}

export interface IdentifyCelebrities {
	source: IdentifySource;
	celebrityDetection: true;
}

export interface IdentifyEntities {
	source: IdentifySource;
}

export interface FaceAttributes {
	smile?: boolean;
	eyeglasses?: boolean;
	sunglasses?: boolean;
	gender?: string;
	beard?: boolean;
	mustache?: boolean;
	eyesOpen?: boolean;
	mouthOpen?: boolean;
	emotions?: (string | undefined)[];
}

export interface EntityAgeRange {
	low?: number;
	high?: number;
}

export interface EntityLandmark {
	type?: string;
	x?: number;
	y?: number;
}

export interface EntityMetadata {
	id?: string;
	name?: string;
	pose?: {
		roll?: number;
		yaw?: number;
		pitch?: number;
	};
	urls?: string[];
	externalImageId?: string;
	similarity?: number;
	confidence?: number;
}

export interface IdentifyEntity {
	boundingBox?: BoundingBox;
	ageRange?: EntityAgeRange;
	landmarks?: (EntityLandmark | undefined)[];
	attributes?: FaceAttributes;
	metadata?: EntityMetadata;
}

export interface IdentifyEntitiesOutput {
	entities: IdentifyEntity[];
}

export function isValidConvertInput(obj: any) {
	return (
		isTranslateTextInput(obj) ||
		isTextToSpeechInput(obj) ||
		isSpeechToTextInput(obj)
	);
}

export function isValidIdentifyInput(obj: any) {
	return (
		isIdentifyTextInput(obj) ||
		isIdentifyLabelsInput(obj) ||
		isIdentifyEntitiesInput(obj)
	);
}

export function isValidInterpretInput(obj: any) {
	return isInterpretTextInput(obj);
}

export function isIdentifyFromCollection(
	obj: any,
): obj is IdentifyFromCollection {
	const key: keyof IdentifyFromCollection = 'collection';
	const keyId: keyof IdentifyFromCollection = 'collectionId';

	return (
		obj &&
		(Object.prototype.hasOwnProperty.call(obj, key) ||
			Object.prototype.hasOwnProperty.call(obj, keyId))
	);
}

export function isIdentifyCelebrities(obj: any): obj is IdentifyCelebrities {
	const key: keyof IdentifyCelebrities = 'celebrityDetection';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isTranslateTextInput(obj: any): obj is TranslateTextInput {
	const key: keyof TranslateTextInput = 'translateText';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isTextToSpeechInput(obj: any): obj is TextToSpeechInput {
	const key: keyof TextToSpeechInput = 'textToSpeech';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isSpeechToTextInput(obj: any): obj is SpeechToTextInput {
	const key: keyof SpeechToTextInput = 'transcription';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isStorageSource(obj: any): obj is StorageSource {
	const key: keyof StorageSource = 'key';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isFileSource(obj: any): obj is FileSource {
	const key: keyof FileSource = 'file';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isConvertBytesSource(
	obj: any,
): obj is BytesSource<ConvertBytes> {
	const key: keyof BytesSource<ConvertBytes> = 'bytes';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isIdentifyBytesSource(
	obj: any,
): obj is BytesSource<IdentifyBytes> {
	const key: keyof BytesSource<IdentifyBytes> = 'bytes';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isIdentifyTextInput(obj: any): obj is IdentifyTextInput {
	const key: keyof IdentifyTextInput = 'text';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isIdentifyLabelsInput(obj: any): obj is IdentifyLabelsInput {
	const key: keyof IdentifyLabelsInput = 'labels';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isIdentifyEntitiesInput(
	obj: any,
): obj is IdentifyEntitiesInput {
	const key: keyof IdentifyEntitiesInput = 'entities';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isInterpretTextInput(obj: any): obj is InterpretTextInput {
	const key: keyof InterpretTextInput = 'text';

	return obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function isInterpretTextOthers(
	text: InterpretTextInput['text'],
): text is InterpretTextOthers {
	return (text as InterpretTextOthers).source.language !== undefined;
}

export interface Geometry {
	/**
	 * <p>An axis-aligned coarse representation of the detected text's location on the image.</p>
	 */
	BoundingBox?: BoundingBox;

	/**
	 * <p>Within the bounding box, a fine-grained polygon around the detected text.</p>
	 */
	Polygon?: Point[] | Iterable<Point>;
}

export interface Relationship {
	/**
	 * <p>The type of relationship that the blocks in the IDs array have with the current block. The relationship can be <code>VALUE</code> or <code>CHILD</code>.</p>
	 */
	Type?: 'VALUE' | 'CHILD' | string;

	/**
	 * <p>An array of IDs for related blocks. You can get the type of the relationship from the <code>Type</code> element.</p>
	 */
	Ids?: string[] | Iterable<string>;
}

export type FeatureType = 'TABLES' | 'FORMS' | string;
export type FeatureTypes = FeatureType[];
