import { AcceptType } from '../../types';
export const convert = (
	stream: Blob,
	accept: AcceptType
): Promise<ArrayBuffer | Blob | Uint8Array> => {
    return new Promise(async (res, rej) => {
        const blobURL = URL.createObjectURL(stream);
        const request = new XMLHttpRequest();
        request.responseType = 'arraybuffer';
        request.onload = _event => {
            if (accept === 'ArrayBuffer') {
                return res(request.response);
            } else {
                return res(new Uint8Array(request.response));
            }
        };
        request.onerror = rej;
        request.open('GET', blobURL, true);
        request.send();
    });
};
