import { LanguageCode } from "aws-sdk/clients/transcribeservice";
import { AudioStream } from "aws-sdk/clients/polly";

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

export interface TranslateTextOutput {
    text: string,
    language: LanguageCode
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

export interface TextToSpeechOutput {
    speech: { url: string },
    audioStream: AudioStream,
    text: string,
    language: string
}

export interface StorageSource {
    key: string,
    level?: 'public' | 'private' | 'protected',
    identityId?: string,
}

 export interface FileSource {
    file: File
}

 export interface BytesSource {
    bytes: Buffer | ArrayBuffer | Blob | string
}

 export type ConvertSource = StorageSource | FileSource | BytesSource;

export interface SpeechToTextInput {
    transcription: {
        source: ConvertSource,
        language?: LanguageCode,
        maxSpeakers?: number
    }
}

export interface TranscriptionData {
    text: string,
    speaker: string,
    beginTime: number,
    endTime: number
}

export interface SpeechToTextOutput {
    transcription: {
        fullText: string,
        lines: Array<string>,
        linesDetailed: Array<TranscriptionData>
    }
}

export type IdentifySource = StorageSource | FileSource | BytesSource;

export interface IdentifyTextInput {
    text: {
        source: IdentifySource,
        format?: 'PLAIN' | 'FORM' | 'TABLE' | 'ALL'
    }
}

export interface Word {
    text?: string,
    polygon?: Polygon,
    boundingBox?: BoundingBox,
}

export interface LineDetailed {
    text?: string,
    polygon?: Polygon,
    boundingBox?: BoundingBox,
    page?: number
}

export interface Content {
    text?: string,
    selected?: boolean,
}

export interface TableCell extends Content {
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
    value: Content,
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

export interface IdentifyLabelsInput {
    labels: {
        source: IdentifySource,
        type: 'LABELS' | 'UNSAFE' | 'ALL'
    }
}

export interface Point {
    x?: Number,
    y?: Number,
}

export type Polygon = Point[];

export interface BoundingBox {
    width?: Number;
    height?: Number;
    left?: Number;
    top?: Number;
}

export interface IdentifyLabelsOutput {
    labels?: {
        name: string,
        boundingBoxes: BoundingBox[],
        metadata?: Object
    }[],
    unsafe?: 'YES' | 'NO' | 'UNKNOWN'
}

export interface IdentifyEntitiesInput {
    entities: {
        source: IdentifySource,
        collection?: string,
        maxFaces?: number,
    },
    celebrityDetection?: Boolean
}

export interface FaceAttributes {
    smile?: boolean,
    eyeglasses?: boolean,
    sunglasses?: boolean,
    gender?: string,
    beard?: boolean,
    mustache?: boolean,
    eyesOpen?: boolean,
    mouthOpen?: boolean,
    emotions?: string[]
}

export interface IdentifyEntitiesOutput {
    entities: {
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
        attributes?: FaceAttributes
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

export function isIdentifyLabelsInput(obj: any): obj is IdentifyLabelsInput {
    const key: keyof IdentifyLabelsInput = 'labels';
    return obj && obj.hasOwnProperty(key);
}

export function isIdentifyEntitiesInput(obj: any): obj is IdentifyEntitiesInput {
    const key: keyof IdentifyEntitiesInput = 'entities';
    return obj && obj.hasOwnProperty(key);
}
