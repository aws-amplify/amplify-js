import { GraphQLScalarType } from '@aws-amplify/datastore';

export function getSQLiteType(
	scalar: keyof Omit<
		typeof GraphQLScalarType,
		'getJSType' | 'getValidationFunction' | 'getSQLiteType'
	>
): 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB' {
	switch (scalar) {
		case 'Boolean':
		case 'Int':
		case 'AWSTimestamp':
			return 'INTEGER';
		case 'ID':
		case 'String':
		case 'AWSDate':
		case 'AWSTime':
		case 'AWSDateTime':
		case 'AWSEmail':
		case 'AWSJSON':
		case 'AWSURL':
		case 'AWSPhone':
		case 'AWSIPAddress':
			return 'TEXT';
		case 'Float':
			return 'REAL';
		default:
			const _: never = scalar as never;
			throw new Error(`unknown type ${scalar as string}`);
	}
}
