import { RestClient } from './RestClient';
import { PostOptions } from './types';

export function post(url: string, options: PostOptions) {
	const restClient = new RestClient({ headers: {}, endpoints: [] });

	return restClient.post(url, options);
}
