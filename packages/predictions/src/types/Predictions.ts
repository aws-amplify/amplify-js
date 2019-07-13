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
