import { generateModels } from '@aws-amplify/graphql-generator';

export async function buildAmplifyConfig(schema: {
	transform: () => { schema: string };
}) {
	return {
		aws_project_region: 'us-east-2',
		aws_appsync_graphqlEndpoint: 'https://localhost/graphql',
		aws_appsync_region: 'us-west-1',
		aws_appsync_authenticationType: 'API_KEY',
		aws_appsync_apiKey: 'FAKE-KEY',
		modelIntrospection: JSON.parse(
			(
				await generateModels({
					schema: schema.transform().schema,
					target: 'introspection',
					directives: '',
				})
			)['model-introspection.json'] as any,
		),
	};
}
