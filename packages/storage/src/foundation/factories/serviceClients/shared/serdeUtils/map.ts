// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type PropertyNameWithStringValue = string;

type PropertyNameWithSubsequentDeserializer<T> = [string, (arg: any) => T];

type Instruction<T> =
	| PropertyNameWithStringValue
	| PropertyNameWithSubsequentDeserializer<T>;

type InferInstructionResultType<T extends Instruction<any>> =
	| (T extends PropertyNameWithSubsequentDeserializer<infer R> ? R : string)
	| never;

/**
 * Maps an object to a new object using the provided instructions.
 * The instructions are a map of the returning mapped object's property names to a single instruction of how to map the
 * value from the original object to the new object. There are two types of instructions:
 *
 * 1. A string representing the property name of the original object to map to the new object. The value mapped from
 * the original object will be the same as the value in the new object, and it can ONLY be string.
 *
 * 2. An array of two elements. The first element is the property name of the original object to map to the new object.
 * The second element is a function that takes the value from the original object and returns the value to be mapped to
 * the new object. The function can return any type.
 *
 * Example:
 * ```typescript
 * const input = {
 *   Foo: 'foo',
 *   BarList: [{value: 'bar1'}, {value: 'bar2'}]
 * }
 * const output = map(input, {
 *   someFoo: 'Foo',
 *   bar: ['BarList', (barList) => barList.map(bar => bar.value)]
 *   baz: 'Baz' // Baz does not exist in input, so it will not be in the output.
 * });
 * // output = { someFoo: 'foo', bar: ['bar1', 'bar2'] }
 * ```
 *
 * @param obj The object containing the data to compose mapped object.
 * @param instructions The instructions mapping the object values to the new object.
 * @returns A new object with the mapped values.
 *
 * @internal
 */
export const map = <Instructions extends Record<string, Instruction<any>>>(
	obj: Record<string, any>,
	instructions: Instructions,
): {
	[K in keyof Instructions]: InferInstructionResultType<Instructions[K]>;
} => {
	const result = {} as Record<keyof Instructions, any>;
	for (const [key, instruction] of Object.entries(instructions)) {
		const [accessor, deserializer] = Array.isArray(instruction)
			? instruction
			: [instruction];
		if (Object.prototype.hasOwnProperty.call(obj, accessor)) {
			result[key as keyof Instructions] = deserializer
				? deserializer(obj[accessor])
				: String(obj[accessor]);
		}
	}

	return result;
};
