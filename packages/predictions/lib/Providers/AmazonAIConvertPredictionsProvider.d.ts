import { AbstractConvertPredictionsProvider } from '../types/Providers/AbstractConvertPredictionsProvider';
import {
	TranslateTextInput,
	TextToSpeechInput,
	SpeechToTextInput,
	TranslateTextOutput,
	TextToSpeechOutput,
	SpeechToTextOutput,
} from '../types';
export default class AmazonAIConvertPredictionsProvider extends AbstractConvertPredictionsProvider {
	private translate;
	private textToSpeech;
	constructor();
	getProviderName(): string;
	protected translateText(
		input: TranslateTextInput
	): Promise<TranslateTextOutput>;
	protected convertTextToSpeech(
		input: TextToSpeechInput
	): Promise<TextToSpeechOutput>;
	protected convertSpeechToText(
		input: SpeechToTextInput
	): Promise<SpeechToTextOutput>;
	static serializeDataFromTranscribe(message: any): string;
	private sendDataToTranscribe;
	private sendEncodedDataToTranscribe;
	private getAudioEventMessage;
	private pcmEncode;
	private inputSampleRate;
	private outputSampleRate;
	private downsampleBuffer;
	private openConnectionWithTranscribe;
	private generateTranscribeUrl;
}
