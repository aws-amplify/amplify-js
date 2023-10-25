import { map } from 'rxjs';
import { GraphqlSubscriptionResult } from '../../types';
import {
	initializeModel,
	generateGraphQLDocument,
	buildGraphQLVariables,
	flattenItems,
} from '../APIClient';

export function subscriptionFactory(
	client,
	modelIntrospection,
	model,
	operation
) {
	const { name } = model as any;

	const subscription = (arg?: any, options?: any) => {
		const query = generateGraphQLDocument(
			modelIntrospection.models,
			name,
			operation
		);
		const variables = buildGraphQLVariables(
			model,
			operation,
			arg,
			modelIntrospection
		);

		const observable = client.graphql({
			query,
			variables,
		}) as GraphqlSubscriptionResult<object>;

		return observable.pipe(
			map(value => {
				const [key] = Object.keys(value.data);
				return value.data[key];
			})
		);
	};

	return subscription;
}
