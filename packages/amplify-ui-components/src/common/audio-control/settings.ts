// AudioRecorder settings
export const RECORDER_EXPORT_MIME_TYPE = 'application/octet-stream';
export const DEFAULT_EXPORT_SAMPLE_RATE = 16000;

export const FFT_SIZE = 2048; // window size in samples for Fast Fourier Transform (FFT)
export const FFT_MAX_DECIBELS = -10; // maximum power value in the scaling range for the FFT analysis data
export const FFT_MIN_DECIBELS = -90; // minimum power value in the scaling range for the FFT analysis data
export const FFT_SMOOTHING_TIME_CONSTANT = 0.85; // averaging constant with the last analysis frame
