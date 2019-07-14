import { LanguageCode } from 'aws-sdk/clients/transcribeservice';

/**
 * Base types
 */
export interface PredictionsOptions {
    [key: string]: any,
}

export interface ProviderOptions {
    providerName?: string
}

/**
 * Convert types
 */

export interface TranslateTextInput {
    translateText: {
        source: {
            text: string,
            language?: LanguageCode
        },
        terminology?: string,
        targetLanguage?: LanguageCode
    }
}

export interface TextToSpeechInput {
    textToSpeech: {
        source: {
            text: string,
            language?: LanguageCode
        }
        terminology?: string,
        voiceId?: string
    }
}

export interface SpeechToTextInput {
    transcription: {
        source: {
            storage: {
                key: string,
                level?: string,
                identityId?: string
            },
            file: string,
            outputBucketName: string,
            bytes: Buffer | ArrayBuffer | Blob | string;
            language?: LanguageCode
        }
        maxSpeakers?: number,
        language?: LanguageCode
    }
}

/**
 * Identify types
 */
interface StorageSource {
    key: string,
    level?: 'public' | 'private' | 'protected',
    identityId?: string,
}

interface FileSource {
    file: File
}

interface BytesSource {
    bytes: Buffer | ArrayBuffer | Blob | string
}

export type IdentifySource = StorageSource | FileSource | BytesSource;

export interface IdentifyTextInput {
    text: {
        source: IdentifySource,
        format?: 'PLAIN' | 'FORM' | 'TABLE' | 'ALL'
    }
}

export interface Word {
    text: string,
    polygon: Polygon,
    boundingBox: BoundingBox,
}

export interface LineDetailed {
    text: string,
    polygon: Polygon,
    boundingBox: BoundingBox,
    page: number
}

export interface TableCell {
    text: string,
    selected?: boolean,
    boundingBox?: BoundingBox,
    polygon?: Polygon,
    rowSpan?: Number,
    columnSpan?: Number,
}

export interface Table {
    size: {
        rows: number,
        columns: number
    },
    table: TableCell[][],
    polygon: Polygon,
    boundingBox: BoundingBox
}

export interface KeyValue {
    key: string,
    value: {
        text?: string,
        selected?: boolean
    },
    polygon: Polygon,
    boundingBox: BoundingBox
}

export interface IdentifyTextOutput {
    text: {
        fullText: string,
        lines: string[],
        linesDetailed: LineDetailed[],
        words: Word[]
        keyValues?: KeyValue[],
        tables?: Table[],
        selections?: {
            selected: boolean,
            polygon: Polygon,
            boundingBox: BoundingBox,
        }[],
    }
}

export interface IdentifyEntityInput {
    entity: {
        source: IdentifySource,
        type: 'LABELS' | 'UNSAFE' | 'ALL'
    }
}

export type Polygon = {
    x: Number,
    y: Number
}[];

export interface BoundingBox {
    width?: Number;
    height?: Number;
    left?: Number;
    top?: Number;
}

export interface IdentifyEntityOutput {
    entity?: {
        name: string,
        boundingBoxes: BoundingBox[],
        metadata?: Object
    }[],
    unsafe?: 'YES' | 'NO' | 'UNKNOWN'
}

export interface IdentifyFacesInput {
    face: {
        source: IdentifySource,
        collection?: string,
        maxFaces?: number,
        celebrityDetection?: Boolean
    }
}

export interface IdentifyFacesOutput {
    face: {
        boundingBox?: BoundingBox,
        ageRange?: {
            low?: Number,
            high?: Number
        },
        landmarks?: {
            type?: string,
            x?: number,
            y?: number
        }[],
        attributes?: {
            smile?: boolean,
            eyeglasses?: boolean,
            sunglasses?: boolean,
            gender?: string,
            beard?: boolean,
            mustache?: boolean,
            eyesOpen?: boolean,
            mouthOpen?: boolean,
            emotions?: string[]
        },
        metadata?: object
    }[]
}


export function isTranslateTextInput(obj: any): obj is TranslateTextInput {
    const key: keyof TranslateTextInput = 'translateText';
    return obj && obj.hasOwnProperty(key);
}

export function isTextToSpeechInput(obj: any): obj is TextToSpeechInput {
    const key: keyof TextToSpeechInput = 'textToSpeech';
    return obj && obj.hasOwnProperty(key);
}

export function isSpeechToTextInput(obj: any): obj is SpeechToTextInput {
    const key: keyof SpeechToTextInput = 'transcription';
    return obj && obj.hasOwnProperty(key);
}

export function isStorageSource(obj: any): obj is StorageSource {
    const key: keyof StorageSource = 'key';
    console.log(obj, obj.hasOwnProperty(key));
    return obj && obj.hasOwnProperty(key);
}

export function isFileSource(obj: any): obj is FileSource {
    const key: keyof FileSource = 'file';
    return obj && obj.hasOwnProperty(key);
}

export function isBytesSource(obj: any): obj is BytesSource {
    const key: keyof BytesSource = 'bytes';
    return obj && obj.hasOwnProperty(key);
}

export function isIdentifyTextInput(obj: any): obj is IdentifyTextInput {
    const key: keyof IdentifyTextInput = 'text';
    return obj && obj.hasOwnProperty(key);
}

export function isIdentifyEntityInput(obj: any): obj is IdentifyEntityInput {
    const key: keyof IdentifyEntityInput = 'entity';
    return obj && obj.hasOwnProperty(key);
}

export function isIdentifyFacesInput(obj: any): obj is IdentifyFacesInput {
    const key: keyof IdentifyFacesInput = 'face';
    return obj && obj.hasOwnProperty(key);
}
