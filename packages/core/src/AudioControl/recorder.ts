import { exportBuffer } from './encoder';

type Config = {
	time?: number;
	amplitude?: number;
};

class Recorder {
	private config: Config;
	private silenceCallback: Function;

	// AudioContext variables
	private node: ScriptProcessorNode;
	private analyser: AnalyserNode;

	// recording related states
	private start: number;
	private recording = false;
	private recLength: number;
	private recBuffer: Array<Float32Array>;
	private recSampleRate: number;

	constructor(source: MediaStreamAudioSourceNode, config?: Config) {
		// TODO: Review this
		const { time = 1500, amplitude = 0.2 } = config || {};
		this.config = {
			time,
			amplitude,
		};
		this.initAudio(source);
	}

	public record(onSilence: Function) {
		this.silenceCallback = onSilence;
		this.start = Date.now();
		this.recording = true;
	}

	public stop() {
		this.recording = false;
	}

	public clear() {
		this.recording = false;
		this.recLength = 0;
		this.recBuffer = [];
	}

	public exportWAV = (callback, sampleRate: number) => {
		const blob = exportBuffer(
			this.recBuffer,
			this.recLength,
			this.recSampleRate,
			sampleRate
		);
		callback(blob);
	};

	private initAudio(source: MediaStreamAudioSourceNode) {
		this.recSampleRate = source.context.sampleRate;
		// Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
		this.node = source.context.createScriptProcessor(4096, 1, 1);

		this.node.onaudioprocess = (ev: AudioProcessingEvent) => {
			if (!this.recording) return;
			const buffer = ev.inputBuffer.getChannelData(0);
			this.recBuffer.push(buffer);
			this.recLength += buffer.length;
			this.analyse();
		};

		this.analyser = source.context.createAnalyser();
		this.analyser.minDecibels = -90;
		this.analyser.maxDecibels = -10;
		this.analyser.smoothingTimeConstant = 0.85;

		source.connect(this.analyser);
		this.analyser.connect(this.node);
		this.node.connect(source.context.destination);
	}

	private analyse() {
		this.analyser.fftSize = 2048;
		const bufferLength = this.analyser.fftSize;
		const dataArray = new Uint8Array(bufferLength);
		const { amplitude, time } = this.config;

		this.analyser.getByteTimeDomainData;
		for (var i = 0; i < bufferLength; i++) {
			// Normalize between -1 and 1.
			var curr_value_time = dataArray[i] / 128 - 1.0;
			if (curr_value_time > amplitude || curr_value_time < -1 * amplitude) {
				this.start = Date.now();
			}
		}
		var newtime = Date.now();
		var elapsedTime = newtime - this.start;
		if (elapsedTime > time) {
			this.silenceCallback();
		}
	}
}

let audioContext: AudioContext;
let audioStream: MediaStream;
export const requestDevice = (): Promise<void> => {
	if (!audioContext) {
		window.AudioContext =
			window.AudioContext || (window as any).webkitAudioContext;
		audioContext = new AudioContext();
	}

	return navigator.mediaDevices
		.getUserMedia({ audio: true })
		.then(function(stream) {
			audioStream = stream;
		});
};

export const createRecorder = (config: Config) => {
	return new Recorder(
		audioContext.createMediaStreamSource(audioStream),
		config
	);
};

export const getAudioContext = () => {
	return audioContext;
};
