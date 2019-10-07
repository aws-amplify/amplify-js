import { BlobStream } from 'aws-sdk/clients/lexruntime';

export interface ISilenceDetectionConfig {
  time: number;
  amplitude: number;
}

// TODO: convert aws-lex-audio to typescript
export declare class AudioControl {
  startRecording: (
    silenceHandler: () => void,
    visualizerCallback: () => void,
    silenceDetectionConfig: ISilenceDetectionConfig
  ) => void;
  stopRecording: () => void;
  exportWAV: (_callback: (Blob) => void) => void;
  play: (stream: BlobStream, callback: () => void) => void;
  clear: () => void;
}

declare global {
  interface ILexAudio {
    audioControl: typeof AudioControl;
  }
  // tslint:disable-next-line: interface-name
  interface Window {
    LexAudio: ILexAudio;
  }
}
