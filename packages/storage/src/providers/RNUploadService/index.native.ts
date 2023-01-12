import { NativeModules, DeviceEventEmitter } from 'react-native';

export type UploadEvent = 'progress' | 'error' | 'completed' | 'cancelled';

export type NotificationArgs = {
	enabled: boolean;
};

export type StartUploadArgs = {
	url: string;
	path: string;
	method?: 'PUT' | 'POST';
	// Optional, because raw is default
	type?: 'raw' | 'multipart';
	// This option is needed for multipart type
	field?: string;
	customUploadId?: string;
	// parameters are supported only in multipart type
	/* 	parameters?: { [string]: string };
	 */ headers?: Object;
	notification?: NotificationArgs;
};

const NativeModule = NativeModules.RNFileUploader; // iOS is VydiaRNFileUploader and Android is NativeModules
const eventPrefix = 'RNFileUploader-';

// for IOS, register event listeners or else they don't fire on DeviceEventEmitter
if (NativeModules.VydiaRNFileUploader) {
	NativeModule.addListener(eventPrefix + 'progress');
	NativeModule.addListener(eventPrefix + 'error');
	NativeModule.addListener(eventPrefix + 'cancelled');
	NativeModule.addListener(eventPrefix + 'completed');
}

export const getFileInfo = (path: string): Promise<Object> => {
	return NativeModule.getFileInfo(path).then(data => {
		if (data.size) {
			// size comes back as a string on android so we convert it here.  if it's already a number this won't hurt anything
			data.size = +data.size;
		}
		return data;
	});
};

/* export const getMD5CheckSumFromFilePath = (
	filePath: string
): Promise<Object> => {
	return NativeModule.getCheckSumFromFilePath('MD5', filePath).then(data => {
		return data;
	});
};


 */ /*
 Starts uploading a file to an HTTP endpoint.
 Options object:
 {
	 url: string.  url to post to.
	 path: string.  path to the file on the device
	 headers: hash of name/value header pairs
	 method: HTTP method to use.  Default is "POST"
	 notification: hash for customizing tray notifiaction
		 enabled: boolean to enable/disabled notifications, true by default.
 }
 
 Returns a promise with the string ID of the upload.  Will reject if there is a connection problem, the file doesn't exist, or there is some other problem.
 
 It is recommended to add listeners in the .then of this promise.
 
 */
export const startUpload = (options): Promise<string> =>
	NativeModule.startUpload(options);

/*
 Cancels active upload by string ID of the upload.
 
 Upload ID is returned in a promise after a call to startUpload method,
 use it to cancel started upload.
 
 Event "cancelled" will be fired when upload is cancelled.
 
 Returns a promise with boolean true if operation was successfully completed.
 Will reject if there was an internal error or ID format is invalid.
 
 */
export const cancelUpload = (cancelUploadId: string): Promise<boolean> => {
	if (typeof cancelUploadId !== 'string') {
		return Promise.reject(new Error('Upload ID must be a string'));
	}
	return NativeModule.cancelUpload(cancelUploadId);
};

/*
 Listens for the given event on the given upload ID (resolved from startUpload).
 If you don't supply a value for uploadId, the event will fire for all uploads.
 Events (id is always the upload ID):
	 progress - { id: string, progress: int (0-100) }
	 error - { id: string, error: string }
	 cancelled - { id: string, error: string }
	 completed - { id: string }
 */
export const addListener = (
	eventType: UploadEvent,
	uploadId: string,
	listener: Function
) => {
	return DeviceEventEmitter.addListener(eventPrefix + eventType, data => {
		if (!uploadId || !data || !data.id || data.id === uploadId) {
			listener(data);
		}
	});
};

export default {
	startUpload,
	cancelUpload,
	addListener,
	getFileInfo,
	//getMD5CheckSumFromFilePath,
};
