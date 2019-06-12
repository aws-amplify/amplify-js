import { LanguageCode } from "aws-sdk/clients/transcribeservice";

/**
 * Base types
 */
export interface PredictionsOptions {
    [key: string]: any,
}

export interface AbstractProviderOptions {
    providerName?: string
}

export interface TranslateTextProviderOptions extends AbstractProviderOptions {
    terminology?: string,
    targetLanguage?: LanguageCode
}

export type TranslateTextInput = {
    translateText: {
        source: {
            text: string,
            language?: LanguageCode
        },
        providerOptions: TranslateTextProviderOptions
    }
};

export interface TextToSpeechProviderOptions extends AbstractProviderOptions {
    terminology?: string,
    voiceId?: string
}

export type TextToSpeechInput = {
    textToSpeech: {
        source: {
            text: string,
            language?: LanguageCode
        }
        providerOptions: TextToSpeechProviderOptions
    }
};

export interface SpeechToTextProviderOptions extends AbstractProviderOptions {
    maxSpeakers?: number,
    language?: LanguageCode
}

export type SpeechToTextInput = {
    transcription: {
        source: {
            storage: {
                key: string,
                level?: string,
                identityId?: string
            },
            file: File,
            bytes: Buffer | ArrayBuffer | Blob | string; // TODO: Confirm the use of ArrayBuffer
            language?: LanguageCode
        }
        providerOptions: SpeechToTextProviderOptions
    }
};

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
