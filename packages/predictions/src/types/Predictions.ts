import { LanguageCode } from 'aws-sdk/clients/transcribeservice';
import * as Rekognition from 'aws-sdk/clients/rekognition';

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

export type IdentifyEntityType = 'LABELS' | 'UNSAFE' | 'ALL';

export interface IdentifySource {
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
        source: IdentifySource,
        type: IdentifyEntityType
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
    identifyFaces: {
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

export function isIdentifyEntityInput(obj: any): obj is IdentifyEntityInput {
    const key: keyof IdentifyEntityInput = 'identifyEntity';
    return obj && obj.hasOwnProperty(key);
}

export function isIdentifyFacesInput(obj: any): obj is IdentifyFacesInput {
    const key: keyof IdentifyFacesInput = 'identifyFaces';
    return obj && obj.hasOwnProperty(key);
}
