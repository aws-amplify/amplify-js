import { LanguageCode } from 'aws-sdk/clients/transcribeservice';
import * as Rekognition from 'aws-sdk/clients/rekognition';
import * as Textract from 'aws-sdk/clients/textract';

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
            bytes: Buffer | ArrayBuffer | Blob | string; // TODO: Confirm the use of ArrayBuffer
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
    storage: {
        key: string,
        level?: 'public' | 'private' | 'protected',
        identityId?: string,
    },   
}

interface FileSource {
    file: File
}

interface BytesSource {
    bytes: Buffer | ArrayBuffer | Blob | string
}

export type IdentifySource = StorageSource | FileSource | BytesSource; 

export interface IdentifyEntityInput {
    entity: {
        source: IdentifySource,
        type: 'LABELS' | 'UNSAFE' | 'ALL'
    }
}

export interface IdentifyEntityOutput {
    entity?: {
        name: string,
        boundingBoxes: Rekognition.BoundingBox[],
        metadata?: Object
    }[],
    unsafe?: 'YES' | 'NO' | 'UNKNOWN'
}

export interface IdentifyFacesInput {
    face: {
        source: IdentifySource,
        collection?: string,
        maxFaces?: number,
        celebrityDetection: Boolean
    }
}

export interface IdentifyFacesOutput {
    face: {
        boundingBox?: Rekognition.BoundingBox,
        ageRange?: Rekognition.AgeRange,
        landmarks?: Rekognition.Landmark[],
        attributes?: {
            smile?: Rekognition.Smile,
            eyeglasses?: Rekognition.Eyeglasses,
            sunglasses?: Rekognition.Sunglasses,
            gender?: Rekognition.Gender,
            beard?: Rekognition.Beard,
            mustache?: Rekognition.Mustache,
            eyesOpen?: Rekognition.EyeOpen,
            mouthOpen?: Rekognition.MouthOpen,
            emotions?: Rekognition.Emotions
        },
        metadata?: object 
    }[]
}

// export interface IdentifyTextInput {
//     text: {
//         source: IdentifySource,
//         format?: 'PLAIN' | 'FORM' | 'TABLE' | 'ALL'
//     }
// }

// export interface IdentifyTextWord {
//     text: string,
//     polygon: Textract.Polygon,
//     boundingBox: Textract.BoundingBox,
// }

// export interface IdentifyTextLineDetailed {
//     text: string,
//     polygon: Textract.Polygon,
//     boundingBox: Textract.BoundingBox,
//     id: string,
//     page: number
// }

// export interface IdentifyTextCell {
//     text: string,
//     boundingBox: Textract.BoundingBox,
//     polygon: Textract.Polygon
// }

// export interface IdentifyTextTable {
//     size: {
//         rows: number,
//         columns: number
//     },
//     matrix: IdentifyTextCell[][],
//     polygon: Textract.Polygon,
//     boundingBox: Textract.BoundingBox
// }

// export interface IdentifyTextOutput {
//     text: {
//         fullText: string,
//         lines: string[],
//         linesDetailed: IdentifyTextLineDetailed[],
//         words: IdentifyTextWord[]
//         keyValues?: {
//             key: string,
//             value: string,
//             polygon: Textract.Polygon,
//             boundingBox: Textract.BoundingBox
//         }[],
//         tables?: IdentifyTextTable[],
//         selections?: {
//             value: string,
//             selected: boolean,
//             polygon: Textract.Polygon,
//             boundingBox: Textract.BoundingBox,
//         }[], 
//     }
// }

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

export function isStorageSource(obj: any): obj is StorageSource{
    const key: keyof StorageSource = 'storage';
    return obj && obj.hasOwnProperty(key);
}

export function isFileSource(obj: any): obj is FileSource{
    const key: keyof FileSource = 'file';
    return obj && obj.hasOwnProperty(key);
}

export function isBytesSource(obj: any): obj is BytesSource {
    const key: keyof BytesSource = 'bytes';
    return obj && obj.hasOwnProperty(key);
}


// export function isIdentifyTextInput(obj: any): obj is IdentifyTextInput {
//     const key: keyof IdentifyTextInput = 'text';
//     return obj && obj.hasOwnProperty(key);
// }

export function isIdentifyEntityInput(obj: any): obj is IdentifyEntityInput {
    const key: keyof IdentifyEntityInput = 'entity';
    return obj && obj.hasOwnProperty(key);
}

export function isIdentifyFacesInput(obj: any): obj is IdentifyFacesInput {
    const key: keyof IdentifyFacesInput = 'face';
    return obj && obj.hasOwnProperty(key);
}
