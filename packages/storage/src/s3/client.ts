import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { Sha256 } from '@aws-crypto/sha256-browser';
import { parseUrl } from '@aws-sdk/url-parser';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { formatUrl } from '@aws-sdk/util-format-url';

// TODO Can we generated signed URLs for less?
export const generatePresignedUrl = async (
	objectUrl: string,
	region: string,
	credentials: any,
	method?: string
): Promise<any> => {
	const presignerOpt = {
		// TODO Should we standardize AWS credential format, or provide a utility function for escape hatches?
		credentials: {
			accessKeyId: credentials.accessKey,
			secretAccessKey: credentials.secretKey,
			sessionToken: credentials.sessionToken,
		},
		region,
		sha256: Sha256,
	};
	const requestMethod = method ? method : 'GET';
	const presigner = new S3RequestPresigner(presignerOpt);
	const s3ParsedUrl = parseUrl(objectUrl);

	const url = await presigner.presign(
		new HttpRequest({ ...s3ParsedUrl, method: requestMethod })
	);

	return formatUrl(url);
};
