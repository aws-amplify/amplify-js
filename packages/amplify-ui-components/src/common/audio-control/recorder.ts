import { exportBuffer } from './helper';

interface SilenceDetectionConfig {
  time: number;
  amplitude: number;
}

export class AudioRecorder {
  private options: SilenceDetectionConfig;
  private audioContext: AudioContext;
  private audioSupported: boolean;

  private analyserNode: AnalyserNode;
  private onSilence: Function;

  // input mic stream is stored in a buffer
  private streamBuffer: Float32Array[] = [];
  private streamBufferLength = 0;

  // recording props
  private start: number;
  private recording = false;

  constructor(options: SilenceDetectionConfig) {
    this.options = options;
    this.init();
  }

  private init() {
    window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContext();
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        this.audioSupported = true;
        this.setupAudioNodes(stream);
      })
      .catch(() => {
        this.audioSupported = false;
      });
  }

  private async setupAudioNodes(stream: MediaStream) {
    console.log(this.audioContext);

    await this.audioContext
      .resume()
      .then(() => console.log('resumed'))
      .catch(() => console.error('what?'));
    const sourceNode = this.audioContext.createMediaStreamSource(stream);
    const processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

    processorNode.onaudioprocess = audioProcessingEvent => {
      if (!this.recording) return;
      const stream = audioProcessingEvent.inputBuffer.getChannelData(0);
      this.streamBuffer.push(new Float32Array(stream)); // set to a copy of the stream
      this.streamBufferLength += stream.length;
      this.analyse();
    };

    const analyserNode = this.audioContext.createAnalyser();
    analyserNode.minDecibels = -90;
    analyserNode.maxDecibels = -10;
    analyserNode.smoothingTimeConstant = 0.85;

    sourceNode.connect(analyserNode);
    analyserNode.connect(processorNode);
    processorNode.connect(sourceNode.context.destination);

    this.analyserNode = analyserNode;
  }

  public startRecording(onSilence?: Function) {
    const silenceHandler = onSilence || function() {};
    this.onSilence = silenceHandler;
    if (this.recording || !this.audioSupported) return;

    const context = this.audioContext;
    context.resume().then(() => {
      this.start = Date.now();
      this.recording = true;
    });
  }

  public stopRecording() {
    if (!this.audioSupported) return;
    this.recording = false;
  }

  public clear() {
    this.stopRecording();
    this.streamBufferLength = 0;
    this.streamBuffer = [];
  }

  public play(buffer: Uint8Array, callback: Function) {
    if (!buffer) return;
    const myBlob = new Blob([buffer]);

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const playbackSource = this.audioContext.createBufferSource();
      this.audioContext.decodeAudioData(fileReader.result as ArrayBuffer, buf => {
        playbackSource.buffer = buf;
        playbackSource.connect(this.audioContext.destination);
        playbackSource.onended = function(_event) {
          if (typeof callback === 'function') {
            callback();
          }
        };
        playbackSource.start(0);
      });
    };
    fileReader.readAsArrayBuffer(myBlob);
  }

  private analyse() {
    const analyser = this.analyserNode;
    analyser.fftSize = 2048;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const amplitude = this.options.amplitude;
    const time = this.options.time;

    analyser.getByteTimeDomainData(dataArray);

    for (let i = 0; i < bufferLength; i++) {
      // Normalize between -1 and 1.
      const curr_value_time = dataArray[i] / 128 - 1.0;
      if (curr_value_time > amplitude || curr_value_time < -1 * amplitude) {
        this.start = Date.now();
      }
    }
    const newtime = Date.now();
    const elapsedTime = newtime - this.start;
    if (elapsedTime > time) {
      this.onSilence();
    }
  }

  public exportWAV(callback: Function, exportSampleRate: number = 16000) {
    if (!this.audioSupported) return;
    const recordSampleRate = this.audioContext.sampleRate;
    const blob = exportBuffer(this.streamBuffer, this.streamBufferLength, recordSampleRate, exportSampleRate);
    callback(blob);
    this.clear();
  }
}
