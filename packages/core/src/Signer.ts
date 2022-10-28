// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	static sign(request, access_info, service_info = null) {
		request.headers = request.headers || {};

		if (request.body && !request.data) {
			throw new Error(
				'The attribute "body" was found on the request object. Please use the attribute "data" instead.'
			);
		}

		// datetime string and date string
		const dt = DateUtils.getDateWithClockOffset(),
			dt_str = dt.toISOString().replace(/[:\-]|\.\d{3}/g, ''),
			d_str = dt_str.substr(0, 8);

		const url_info = parse(request.url);
		request.headers['host'] = url_info.host;
		request.headers['x-amz-date'] = dt_str;
		if (access_info.session_token) {
			request.headers['X-Amz-Security-Token'] = access_info.session_token;
		}

		// Task 1: Create a Canonical Request
		const request_str = canonical_request(request);
		logger.debug(request_str);

		// Task 2: Create a String to Sign
		const serviceInfo = service_info || parse_service_info(request),
			scope = credential_scope(d_str, serviceInfo.region, serviceInfo.service),
			str_to_sign = string_to_sign(
				DEFAULT_ALGORITHM,
				request_str,
				dt_str,
				scope
			);

		// Task 3: Calculate the Signature
		const signing_key = get_signing_key(
				access_info.secret_key,
				d_str,
				serviceInfo
			),
			signature = get_signature(signing_key, str_to_sign);

		// Task 4: Adding the Signing information to the Request
		const authorization_header = get_authorization_header(
			DEFAULT_ALGORITHM,
			access_info.access_key,
			scope,
			signed_headers(request.headers),
			signature
		);
		request.headers['Authorization'] = authorization_header;

		return request;
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

		const now = DateUtils.getDateWithClockOffset()
			.toISOString()
			.replace(/[:\-]|\.\d{3}/g, '');
		const today = now.substr(0, 8);
		// Intentionally discarding search
		const { search, ...parsedUrl } = parse(urlToSign, true, true);
		const { host } = parsedUrl;
		const signedHeaders = { host };

		const { region, service } =
			serviceInfo || parse_service_info({ url: format(parsedUrl) });
		const credentialScope = credential_scope(today, region, service);

		// IoT service does not allow the session token in the canonical request
		// https://docs.aws.amazon.com/general/latest/gr/sigv4-add-signature-to-request.html
		const sessionTokenRequired =
			accessInfo.session_token && service !== IOT_SERVICE_NAME;
		const queryParams = {
			'X-Amz-Algorithm': DEFAULT_ALGORITHM,
			'X-Amz-Credential': [accessInfo.access_key, credentialScope].join('/'),
			'X-Amz-Date': now.substr(0, 16),
			...(sessionTokenRequired
				? { 'X-Amz-Security-Token': `${accessInfo.session_token}` }
				: {}),
			...(expiration ? { 'X-Amz-Expires': `${expiration}` } : {}),
			'X-Amz-SignedHeaders': Object.keys(signedHeaders).join(','),
		};

		const canonicalRequest = canonical_request({
			method,
			url: format({
				...parsedUrl,
				query: {
					...parsedUrl.query,
					...queryParams,
				},
			}),
			headers: signedHeaders,
			data: body,
		});

		const stringToSign = string_to_sign(
			DEFAULT_ALGORITHM,
			canonicalRequest,
			now,
			credentialScope
		);

		const signing_key = get_signing_key(accessInfo.secret_key, today, {
			region,
			service,
		});
		const signature = get_signature(signing_key, stringToSign);

		const additionalQueryParams = {
			'X-Amz-Signature': signature,
			...(accessInfo.session_token && {
				'X-Amz-Security-Token': accessInfo.session_token,
			}),
		};

		const result = format({
			protocol: parsedUrl.protocol,
			slashes: true,
			hostname: parsedUrl.hostname,
			port: parsedUrl.port,
			pathname: parsedUrl.pathname,
			query: {
				...parsedUrl.query,
				...queryParams,
				...additionalQueryParams,
			},
		});

		return result;
	}
}
