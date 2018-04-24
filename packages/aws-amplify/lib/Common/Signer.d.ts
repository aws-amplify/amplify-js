/**
* AWS request signer.
* Refer to {@link http://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html|Signature Version 4}
*
* @class Signer
*/
export default class Signer {
    static sign: (request: any, access_info: any, service_info?: any) => any;
    static signUrl: (urlToSign: String, accessInfo: any, serviceInfo?: any, expiration?: Number) => any;
}
