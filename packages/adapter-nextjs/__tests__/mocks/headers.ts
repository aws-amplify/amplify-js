import { NextApiRequest, NextApiResponse } from 'next/index.js';
import {
	NextApiRequestCookies,
	NextApiRequestQuery,
} from 'next/dist/server/api-utils/index.js';
import { Socket } from 'net';
import { IncomingMessage } from 'http';

export type NextApiRequestOptions = Partial<NextApiRequestMock>;
export class NextApiRequestMock
	extends IncomingMessage
	implements NextApiRequest
{
	public query: NextApiRequestQuery = {};
	public cookies: NextApiRequestCookies = {};
	public env: any = {};
	public body: any;

	constructor(options?: NextApiRequestOptions) {
		super(new Socket());

		if (options) {
			this.method = options.method;
			this.body = options.body;
			this.query = options.query || {};
			this.headers = options.headers || {};
			this.env = options.env || {};
		}
	}
}

const mockedJson = jest.fn();

export const NextApiResponseMock = {
	status: jest.fn().mockReturnValue({ json: mockedJson }),
} as unknown as jest.Mocked<NextApiResponse>;
