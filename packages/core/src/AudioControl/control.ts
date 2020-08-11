import { exportBuffer } from './helper';

type SilenceDetectionConfig = {
	time: number;
	amplitude: number;
};

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

	public init() {
		window.AudioContext =
			window.AudioContext || (window as any).webkitAudioContext;
		this.audioContext = new AudioContext();
		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then(stream => {
				this.audioSupported = true;

				const sourceNode = this.audioContext.createMediaStreamSource(stream);
				const processorNode = this.audioContext.createScriptProcessor(
					4096,
					1,
					1
				);

				processorNode.onaudioprocess = audioProcessingEvent => {
					if (!this.recording) return;
					const stream = audioProcessingEvent.inputBuffer.getChannelData(0);
					this.streamBuffer.push(new Float32Array(stream)); // set to a copy of the stream
					this.streamBufferLength += stream.length;
					this.analyse();
				};

				var analyserNode = this.audioContext.createAnalyser();
				analyserNode.minDecibels = -90;
				analyserNode.maxDecibels = -10;
				analyserNode.smoothingTimeConstant = 0.85;

				sourceNode.connect(analyserNode);
				analyserNode.connect(processorNode);
				processorNode.connect(sourceNode.context.destination);

				this.analyserNode = analyserNode;
			})
			.catch(err => {
				this.audioSupported = false;
			});
	}

	private setupAudioNodes() {}

	public startRecording(onSilence: Function) {
		console.log('start recording');
		onSilence = onSilence || function() {};
		this.onSilence = onSilence;
		if (!this.audioSupported) return; // TODO: divide into two cases

		const context = this.audioContext;
		context.resume().then(() => {
			this.start = Date.now();
			this.recording = true;
		});
	}

	public stopRecording() {
		console.log('stop recording');
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
		var myBlob = new Blob([buffer]);

		var fileReader = new FileReader();
		fileReader.onload = () => {
			const playbackSource = this.audioContext.createBufferSource();
			this.audioContext.decodeAudioData(
				fileReader.result as ArrayBuffer,
				buf => {
					playbackSource.buffer = buf;
					playbackSource.connect(this.audioContext.destination);
					playbackSource.onended = function(event) {
						if (typeof callback === 'function') {
							callback();
						}
					};
					playbackSource.start(0);
				}
			);
		};
		fileReader.readAsArrayBuffer(myBlob);
	}

	private analyse() {
		const analyser = this.analyserNode;
		analyser.fftSize = 2048;
		var bufferLength = analyser.fftSize;
		var dataArray = new Uint8Array(bufferLength);
		var amplitude = this.options.amplitude;
		var time = this.options.time;

		analyser.getByteTimeDomainData(dataArray);

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
			this.onSilence();
		}
	}

	public exportWAV(callback: Function, exportSampleRate?: number) {
		if (!this.audioSupported) return;
		exportSampleRate =
			typeof exportSampleRate !== 'undefined' ? exportSampleRate : 16000;
		const recordSampleRate = this.audioContext.sampleRate;
		const blob = exportBuffer(
			[...this.streamBuffer],
			this.streamBufferLength,
			recordSampleRate,
			exportSampleRate
		);
		callback(blob);
		this.clear();
	}

	public getBuffers() {
		return this.streamBuffer;
	}
}
