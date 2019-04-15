export interface MLOptions {
    [key: string]: any,
}

export interface TranslateTextOptions {
    text: string,
    sourceLanguage?: string,
    destinationLanguage: string,
    provider?: string,
}