import { RestClient } from './RestClient';

export function post(url: string, options) {
	const restClient = new RestClient({ headers: {}, endpoints: [] });

	return restClient.post(url, options);
}
