/**
 * AWS request signer.
 * Refer to {@link http://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html|Signature Version 4}
 *
 * @class Signer
 */
export default class Signer {
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
	static sign(request: any, access_info: any, service_info?: any): any;
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
}
