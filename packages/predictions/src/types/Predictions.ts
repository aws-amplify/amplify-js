import { LanguageCode } from 'aws-sdk/clients/transcribeservice';
import { Instance, BoundingBox, AgeRange, Landmark } from 'aws-sdk/clients/rekognition';

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

export type identifyEntityType = 'LABELS' | 'UNSAFE' | 'ALL';

export interface identifySource {
    storage?: {
        key: string,
        level?: 'public' | 'private' | 'protected',
        identityId?: string,
    },
    file?: File,
    bytes?: Buffer | ArrayBuffer | Blob | string
}

export interface IdentifyEntityInput {
    identifyEntity: {
        source: identifySource,
        type: identifyEntityType
    }
}

export interface IdentifyEntityOutput {
    entity?: {
        name: string,
        boundingBoxes: Instance[],
        metadata?: Object
    }[],
    unsafe?: 'YES' | 'NO' | 'UNKNOWN'
}

export interface IdentifyFacesInput {
    identifyFaces: {
        source: identifySource,
        collection?: string,
        maxFaces?: number,
        celebrityDetection: Boolean
    }
}

export interface IdentifyFacesOutput {
    face: {
        boundingBox: BoundingBox,
        ageRange?: AgeRange,
        landmarks?: Landmark[],
        attributes?: object,
        metadata?: object // TODO: object vs Object?
    }[]
}

export interface IdentifyTextInput {
    identifyText: {
        source: {
            storage: {
                bucket: string,
                key: string,
                level?: string
            },

        }
    }
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
