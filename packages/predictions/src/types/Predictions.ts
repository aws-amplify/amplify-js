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
