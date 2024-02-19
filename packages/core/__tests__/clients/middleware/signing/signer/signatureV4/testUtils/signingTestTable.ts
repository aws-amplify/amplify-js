// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SignRequestOptions } from '../../../../../../../src/clients/middleware/signing/signer/signatureV4/types';
import { HttpRequest } from '../../../../../../../src/clients/types';
import { credentialsWithToken, signingOptions, url } from './data';

interface TestCase {
	name: string;
	request?: Partial<HttpRequest>;
	queryParams?: [string, string][];
	options?: SignRequestOptions;
	expectedAuthorization: string;
	expectedUrl: string;
}

export const signingTestTable: TestCase[] = [
	{
		name: 'basic values',
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date, Signature=ed540d965ed71159f0cf2af27a410746f74e972fb8cf976e7dd2295e21bba370',
		expectedUrl:
			'https://domain.fakeurl/?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=b2bdc8574c553b0652332bf38234b9916ba8f9f44d25635bb817e43a03b4bb75',
	},
	{
		name: 'utf8 url',
		request: { url: new URL(`${url}\u03A9`) },
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date, Signature=0260705547c9edbf83887d1871daf92e4dd1cd14fe5aa6049b0262b692a42944',
		expectedUrl:
			'https://domain.fakeurl/%CE%A9?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=9fe1147bc2119afa6d453fb4d7905426b50c29d40279dd1c2d2204be0d068686',
	},
	{
		name: 'basic query params',
		queryParams: [['foo', 'bar']],
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date, Signature=8867f03bdc06c350e3161f17c996fcb3d37d79a05ff219d70f89f8a29f56e784',
		expectedUrl:
			'https://domain.fakeurl/?foo=bar&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=60a370af8f549abf3e8d700ed92652c72a06e58dc495f7362df1b5f253d5c35d',
	},
	{
		name: 'empty query params',
		request: {
			method: 'POST',
		},
		queryParams: [['foo', '']],
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date, Signature=66645930d9d0841a65d3ad384205671bffc4f3c8f017318d7e40d1c2c5abbef9',
		expectedUrl:
			'https://domain.fakeurl/?foo=&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=8de709b2ef1ab770d62eb9ff2476e6979c22b15b651e3fcfc58a8abd50bec424',
	},
	{
		name: 'query params of equal values',
		request: {
			method: 'POST',
		},
		queryParams: [
			['foo', 'b'],
			['foo', 'a'],
			['foo', 'Zoo'],
			['foo', 'bar'],
		],
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date, Signature=f41abae910a13886267e000f63059c4e157bab50a6d07dba1a8bed8779f4e68b',
		expectedUrl:
			'https://domain.fakeurl/?foo=b&foo=a&foo=Zoo&foo=bar&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=97674b0a370aca53b1f66a60d1a7c31c7d80b843faf659cd57cb60b9b13ba7b2',
	},
	{
		name: 'query params not in order',
		request: {
			method: 'POST',
		},
		queryParams: [
			['foo', 'a'],
			['bar', 'b'],
			['Zoo', 'c'],
			['baz', 'd'],
		],
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date, Signature=dd137aa8dda85c6ce410e1ff783da63b8c6ad4ee00bf2b7c1c6dbe733a30eb80',
		expectedUrl:
			'https://domain.fakeurl/?foo=a&bar=b&Zoo=c&baz=d&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=5750204236a6fa87a59685a2378f94f0d2699b7b6b32a67b23f829db953957ce',
	},
	{
		name: 'unreserved characters in query params',
		request: {
			method: 'POST',
		},
		queryParams: [
			[
				'-._~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
				'-._~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
			],
		],
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date, Signature=41bd9fff7326a22cf0126afc1d401f1cbdffa287eca4e806edb8cb73a9adc98e',
		expectedUrl:
			'https://domain.fakeurl/?-._%7E0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz=-._%7E0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=828db109a0a3a6a840a522262088a272848e0121bf785c332511a0dfd3df04c6',
	},
	{
		name: 'reserved characters in query params',
		request: {
			method: 'POST',
		},
		queryParams: [['@#$%^&+=/,?><`";:\\|][{} ', '@#$%^&+=/,?><`";:\\|][{} ']],
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date, Signature=f327b38d72f04124c880907467b44e7338e9ff5c2bf01534af27174aaf929d63',
		expectedUrl:
			'https://domain.fakeurl/?%40%23%24%25%5E%26%2B%3D%2F%2C%3F%3E%3C%60%22%3B%3A%5C%7C%5D%5B%7B%7D+=%40%23%24%25%5E%26%2B%3D%2F%2C%3F%3E%3C%60%22%3B%3A%5C%7C%5D%5B%7B%7D+&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=deddbc9d8440a57bdc87d0b4e06b2859304e263af0896b7a4b0126b9d629a81a',
	},
	{
		name: 'mixed cased header keys',
		request: {
			headers: { fOo: 'foo', ZOO: 'zoobar' },
		},
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=foo;host;x-amz-date;zoo, Signature=184870aa03cf0f113eedc9f8796d460062bf25dc4c9b236430ba58cc56a9078b',
		expectedUrl:
			'https://domain.fakeurl/?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=b2bdc8574c553b0652332bf38234b9916ba8f9f44d25635bb817e43a03b4bb75',
	},
	{
		name: 'duplicate headers',
		request: {
			headers: { foo: 'a,z,p' },
		},
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=foo;host;x-amz-date, Signature=39b75b20e62d754be359ba39c4549b71cca2a1e139f9518ad741fd983126ba88',
		expectedUrl:
			'https://domain.fakeurl/?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=b2bdc8574c553b0652332bf38234b9916ba8f9f44d25635bb817e43a03b4bb75',
	},
	{
		name: 'duplicate out of order headers',
		request: {
			headers: { foo: 'z,a,p,a' },
		},
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=foo;host;x-amz-date, Signature=a3a7216abaa809ee23e04284f7424a174c9b41bc48b82f1bb8f2b338eb70fc37',
		expectedUrl:
			'https://domain.fakeurl/?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=b2bdc8574c553b0652332bf38234b9916ba8f9f44d25635bb817e43a03b4bb75',
	},
	{
		name: 'multiline values in header',
		request: {
			headers: { foo: 'a\n  b\n\tc' },
		},
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=foo;host;x-amz-date, Signature=1963fb52fc54543c28cc3d79517c321a090a87772b5744ed46416f9a575f564b',
		expectedUrl:
			'https://domain.fakeurl/?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=b2bdc8574c553b0652332bf38234b9916ba8f9f44d25635bb817e43a03b4bb75',
	},
	{
		name: 'unreserved characters in url',
		request: {
			url: new URL(
				`${url}-._~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`,
			),
		},
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date, Signature=298d61b98e17ec3b2aa025787c586b073dd0b331f8f8f74ff5d5654810bc8d83',
		expectedUrl:
			'https://domain.fakeurl/-._~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=82af8b9467cf48bfd865ca4061c95080a4f7bb5ad839cd6d55542cc93e4e4e2f',
	},
	{
		name: 'spaces in url',
		request: { url: new URL(`${url} path`) },
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date, Signature=a784d1fd673929c255d84e730d1445e44769d341ebea7284f6f58e2770f034e0',
		expectedUrl:
			'https://domain.fakeurl/%20path?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Signature=0100d882befcf809a55d34bf1e6ffacf42accdbce255b04d3acf6175c878a875',
	},
	{
		name: 'session token',
		options: { ...signingOptions, credentials: credentialsWithToken },
		expectedAuthorization:
			'AWS4-HMAC-SHA256 Credential=access-key-id/20200918/signing-region/signing-service/aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token, Signature=10fa345ac8828e6350dd55c784b1bfa85c4ae977c62abf522050cb9065d3e61e',
		expectedUrl:
			'https://domain.fakeurl/?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=access-key-id%2F20200918%2Fsigning-region%2Fsigning-service%2Faws4_request&X-Amz-Date=20200918T181818Z&X-Amz-SignedHeaders=host&X-Amz-Security-Token=session-token&X-Amz-Signature=14018e6e5b599a4bf0340427309af1c541409409043e2b070725437cb16847b9',
	},
];
