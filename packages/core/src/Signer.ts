// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DateUtils } from './Util';
import {
	presignUrl,
	signRequest,
	TOKEN_QUERY_PARAM,
} from './clients/middleware/signing/signer/signatureV4';

const IOT_SERVICE_NAME = 'iotdevicegateway';
// Best practice regex to parse the service and region from an AWS endpoint
const AWS_ENDPOINT_REGEX = /([^\.]+)\.(?:([^\.]*)\.)?amazonaws\.com(.cn)?$/;

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

		const options = getOptions(requestToSign, accessInfo, serviceInfo);
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

		const options = getOptions(
			presignable,
			accessInfo,
			serviceInfo,
			expiration
		);
		const signedUrl = presignUrl(presignable, options);
		if (
			accessInfo.session_token &&
			!sessionTokenRequiredInSigning(options.signingService)
		) {
			signedUrl.searchParams.append(
				TOKEN_QUERY_PARAM,
				accessInfo.session_token
			);
		}
		return signedUrl.toString();
	}
}

const getOptions = (request, accessInfo, serviceInfo, expiration?) => {
	const { access_key, secret_key, session_token } = accessInfo ?? {};
	const { region: urlRegion, service: urlService } = parseServiceInfo(
		request.url
	);
	const { region = urlRegion, service = urlService } = serviceInfo ?? {};
	const credentials = {
		accessKeyId: access_key,
		secretAccessKey: secret_key,
		...(sessionTokenRequiredInSigning(service)
			? { sessionToken: session_token }
			: {}),
	};
	return {
		credentials,
		signingDate: DateUtils.getDateWithClockOffset(),
		signingRegion: region,
		signingService: service,
		...(expiration && { expiration }),
	};
};

// TODO: V6 investigate whether add to custom clients' general signer implementation.
const parseServiceInfo = (url: URL) => {
	const host = url.host;
	const matched = host.match(AWS_ENDPOINT_REGEX) ?? [];
	let parsed = matched.slice(1, 3);

	if (parsed[1] === 'es') {
		// Elastic Search
		parsed = parsed.reverse();
	}

	return {
		service: parsed[0],
		region: parsed[1],
	};
};

// IoT service does not allow the session token in the canonical request
// https://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html
// TODO: V6 investigate whether add to custom clients' general signer implementation.
const sessionTokenRequiredInSigning = (service: string) =>
	service !== IOT_SERVICE_NAME;
