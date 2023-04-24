// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DateUtils } from './Util';
import {
	presignUrl,
	signRequest,
} from './clients/middleware/signing/signer/signatureV4';

export class Signer {
	/**
    * Sign a HTTP request, add 'Authorization' header to request param
    * @method sign
    * @memberof Signer
    * @static
    *
    * @param {object} request - HTTP request object
    <pre>
    request: {
        method: GET | POST | PUT ...
        url: ...,
        headers: {
            header1: ...
        },
        data: data
    }
    </pre>
    * @param {object} access_info - AWS access credential info
    <pre>
    access_info: {
        access_key: ...,
        secret_key: ...,
        session_token: ...
    }
    </pre>
    * @param {object} [service_info] - AWS service type and region, optional,
    *                                  if not provided then parse out from url
    <pre>
    service_info: {
        service: ...,
        region: ...
    }
    </pre>
    *
    * @returns {object} Signed HTTP request
    */
	static sign(request, accessInfo, serviceInfo) {
		request.headers = request.headers || {};

		if (request.body && !request.data) {
			throw new Error(
				'The attribute "body" was found on the request object. Please use the attribute "data" instead.'
			);
		}

		const requestToSign = {
			...request,
			body: request.data,
			url: new URL(request.url as string),
		};

		const options = getOptions(accessInfo, serviceInfo);
		const signedRequest: any = signRequest(requestToSign, options);
		// Prior to using `signRequest`, Signer accepted urls as strings and outputted urls as string. Coerce the property
		// back to a string so as not to disrupt consumers of Signer.
		signedRequest.url = signedRequest.url.toString();
		// HTTP headers should be case insensitive but, to maintain parity with the previous Signer implementation and
		// limit the impact of this implementation swap, replace lowercased headers with title cased ones.
		signedRequest.headers.Authorization = signedRequest.headers.authorization;
		signedRequest.headers['X-Amz-Security-Token'] =
			signedRequest.headers['x-amz-security-token'];
		delete signedRequest.headers.authorization;
		delete signedRequest.headers['x-amz-security-token'];
		return signedRequest;
	}

	static signUrl(
		urlToSign: string,
		accessInfo: any,
		serviceInfo?: any,
		expiration?: number
	): string;
	static signUrl(
		request: any,
		accessInfo: any,
		serviceInfo?: any,
		expiration?: number
	): string;
	static signUrl(
		urlOrRequest: string | any,
		accessInfo: any,
		serviceInfo?: any,
		expiration?: number
	): string {
		const urlToSign: string =
			typeof urlOrRequest === 'object' ? urlOrRequest.url : urlOrRequest;
		const method: string =
			typeof urlOrRequest === 'object' ? urlOrRequest.method : 'GET';
		const body: any =
			typeof urlOrRequest === 'object' ? urlOrRequest.body : undefined;

		const presignable = {
			body,
			method,
			url: new URL(urlToSign),
		};

		const options = getOptions(accessInfo, serviceInfo, expiration);
		const signedUrl = presignUrl(presignable, options);
		return signedUrl.toString();
	}
}

const getOptions = (accessInfo, serviceInfo, expiration?) => {
	const { access_key, secret_key, session_token } = accessInfo ?? {};
	const { region, service } = serviceInfo ?? {};
	const credentials = {
		accessKeyId: access_key,
		secretAccessKey: secret_key,
		sessionToken: session_token,
	};
	return {
		credentials,
		signingDate: DateUtils.getDateWithClockOffset(),
		signingRegion: region,
		signingService: service,
		...(expiration && { expiration }),
	};
};
