// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Adapted from AWS SDK Smithy protocol test:
 * https://github.com/aws/aws-sdk-js-v3/blob/main/private/aws-protocoltests-restxml/test/functional/restxml.spec.ts,
 * which is originated from Smithy test:
 * https://github.com/awslabs/smithy/blob/5948784942e447858bb53025f0ce72e46da9e32e/smithy-aws-protocol-tests/model/restXml
 */

const cases = [
	{
		spec: 'BodyWithXmlName',
		xml: '<Ahoy><nested><name>Phreddy</name></nested></Ahoy>',
		expected: {
			nested: {
				name: 'Phreddy',
			},
		},
	},
	{
		spec: 'FlattenedXmlMap',
		xml: `<FlattenedXmlMapInputOutput>
				<myMap>
						<key>foo</key>
						<value>Foo</value>
				</myMap>
				<myMap>
						<key>baz</key>
						<value>Baz</value>
				</myMap>
		</FlattenedXmlMapInputOutput>`,
		expected: {
			myMap: [
				{ key: 'foo', value: 'Foo' },
				{ key: 'baz', value: 'Baz' },
			],
		},
	},
	{
		spec: 'FlattenedXmlMapWithXmlName',
		xml: `<FlattenedXmlMapWithXmlNameInputOutput>
				<KVP>
						<K>a</K>
						<V>A</V>
				</KVP>
				<KVP>
						<K>b</K>
						<V>B</V>
				</KVP>
		</FlattenedXmlMapWithXmlNameInputOutput>`,
		expected: {
			KVP: [
				{ K: 'a', V: 'A' },
				{ K: 'b', V: 'B' },
			],
		},
	},
	{
		spec: 'FlattenedXmlMapWithXmlNamespace',
		xml: `<FlattenedXmlMapWithXmlNamespaceOutput>
				<KVP xmlns="https://the-member.example.com">
						<K xmlns="https://the-key.example.com">a</K>
						<V xmlns="https://the-value.example.com">A</V>
				</KVP>
				<KVP xmlns="https://the-member.example.com">
						<K xmlns="https://the-key.example.com">b</K>
						<V xmlns="https://the-value.example.com">B</V>
				</KVP>
		</FlattenedXmlMapWithXmlNamespaceOutput>`,
		expected: {
			KVP: [
				{ K: 'a', V: 'A' },
				{ K: 'b', V: 'B' },
			],
		},
	},
	{
		spec: 'RestXmlDateTimeWithNegativeOffset',
		xml: `<DatetimeOffsetsOutput>
				<datetime>2019-12-16T22:48:18-01:00</datetime>
		</DatetimeOffsetsOutput>`,
		expected: {
			datetime: '2019-12-16T22:48:18-01:00',
		},
	},
	{
		spec: 'RestXmlDateTimeWithPositiveOffset',
		xml: `<DatetimeOffsetsOutput>
				<datetime>2019-12-17T00:48:18+01:00</datetime>
		</DatetimeOffsetsOutput>`,
		expected: {
			datetime: '2019-12-17T00:48:18+01:00',
		},
	},
	{
		spec: 'HttpPayloadWithMemberXmlName',
		xml: `<Hola><name>Phreddy</name></Hola>`,
		expected: {
			name: 'Phreddy',
		},
	},
	{
		spec: 'HttpPayloadWithStructure',
		xml: `<NestedPayload>
				<greeting>hello</greeting>
				<name>Phreddy</name>
		</NestedPayload>`,
		expected: {
			greeting: 'hello',
			name: 'Phreddy',
		},
	},
	{
		spec: 'HttpPayloadWithXmlNamespaceAndPrefix',
		xml: `<PayloadWithXmlNamespaceAndPrefix xmlns:baz="http://foo.com">
				<name>Phreddy</name>
		</PayloadWithXmlNamespaceAndPrefix>`,
		expected: {
			name: 'Phreddy',
		},
	},
	{
		spec: 'NestedXmlMapResponse',
		xml: `<NestedXmlMapsInputOutput>
				<nestedMap>
						<entry>
								<key>foo</key>
								<value>
										<entry>
												<key>bar</key>
												<value>Bar</value>
										</entry>
								</value>
						</entry>
				</nestedMap>
		</NestedXmlMapsInputOutput>`,
		expected: {
			nestedMap: {
				entry: {
					key: 'foo',
					value: {
						entry: {
							key: 'bar',
							value: 'Bar',
						},
					},
				},
			},
		},
	},
	{
		spec: 'FlatNestedXmlMapResponse',
		xml: `<NestedXmlMapsInputOutput>
				<flatNestedMap>
						<key>foo</key>
						<value>
								<entry>
										<key>bar</key>
										<value>Bar</value>
								</entry>
						</value>
				</flatNestedMap>
		</NestedXmlMapsInputOutput>`,
		expected: {
			flatNestedMap: {
				key: 'foo',
				value: {
					entry: {
						key: 'bar',
						value: 'Bar',
					},
				},
			},
		},
	},
	{
		spec: 'RecursiveShapes',
		xml: `<RecursiveShapesInputOutput>
				<nested>
						<foo>Foo1</foo>
						<nested>
								<bar>Bar1</bar>
								<recursiveMember>
										<foo>Foo2</foo>
										<nested>
												<bar>Bar2</bar>
										</nested>
								</recursiveMember>
						</nested>
				</nested>
		</RecursiveShapesInputOutput>`,
		expected: {
			nested: {
				foo: 'Foo1',
				nested: {
					bar: 'Bar1',
					recursiveMember: {
						foo: 'Foo2',
						nested: {
							bar: 'Bar2',
						},
					},
				},
			},
		},
	},
	{
		spec: 'SimpleScalarPropertiesComplexEscapes',
		xml: `<SimpleScalarPropertiesInputOutput>
				<stringValue>escaped data: &amp;lt;&#xD;&#10;</stringValue>
		</SimpleScalarPropertiesInputOutput>`,
		expected: {
			stringValue: 'escaped data: &lt;\r\n',
		},
	},
	{
		spec: 'SimpleScalarPropertiesWithEscapedCharacter',
		xml: `<SimpleScalarPropertiesInputOutput>
				<stringValue>&lt;string&gt;</stringValue>
		</SimpleScalarPropertiesInputOutput>`,
		expected: {
			stringValue: '<string>',
		},
	},
	{
		spec: 'SimpleScalarPropertiesWithXMLPreamble',
		xml: `<?xml version = "1.0" encoding = "UTF-8"?>
		<SimpleScalarPropertiesInputOutput>
				<![CDATA[characters representing CDATA]]>
				<stringValue>string</stringValue>
				<!--xml comment-->
		</SimpleScalarPropertiesInputOutput>`,
		expected: expect.objectContaining({
			stringValue: 'string',
		}), // Non-browser parser from AWS SDK populates extra property. It won'd affect service handler.
	},
	{
		spec: '',
		xml: `<?xml version = "1.0" encoding = "UTF-8"?>
		<SimpleScalarPropertiesInputOutput>
				<stringValue> string with white    space </stringValue>
		</SimpleScalarPropertiesInputOutput>`,
		expected: {
			stringValue: ' string with white    space ',
		},
	},
	{
		spec: 'SimpleScalarPropertiesPureWhiteSpace',
		xml: `<?xml version = "1.0" encoding = "UTF-8"?>
		<SimpleScalarPropertiesInputOutput>
				<stringValue>  </stringValue>
		</SimpleScalarPropertiesInputOutput>`,
		expected: {
			stringValue: '  ',
		},
	},
	{
		spec: 'XmlAttributes',
		xml: `<XmlAttributesInputOutput test="test">
				<foo>hi</foo>
		</XmlAttributesInputOutput>`,
		expected: {
			foo: 'hi',
			test: 'test',
		},
	},
	{
		spec: 'XmlEmptyLists',
		xml: `<XmlListsInputOutput>
				<stringList/>
				<stringSet></stringSet>
		</XmlListsInputOutput>`,
		expected: {
			stringList: '',
			stringSet: '',
		},
	},
	{
		spec: 'XmlEmptyMaps',
		xml: `<XmlMapsInputOutput>
				<myMap></myMap>
		</XmlMapsInputOutput>`,
		expected: {
			myMap: '',
		},
	},
	{
		spec: 'XmlEmptySelfClosedMaps',
		xml: `<XmlMapsInputOutput>
				<myMap/>
		</XmlMapsInputOutput>`,
		expected: {
			myMap: '',
		},
	},
	{
		spec: 'XmlEmptyStrings',
		xml: `<XmlEmptyStringsInputOutput>
				<emptyString></emptyString>
		</XmlEmptyStringsInputOutput>`,
		expected: {
			emptyString: '',
		},
	},
	{
		spec: 'XmlEmptySelfClosedStrings',
		xml: `<XmlEmptyStringsInputOutput>
				<emptyString/>
		</XmlEmptyStringsInputOutput>`,
		expected: {
			emptyString: '',
		},
	},
	{
		spec: 'XmlEnums',
		xml: `<XmlEnumsInputOutput>
				<fooEnum1>Foo</fooEnum1>
				<fooEnum2>0</fooEnum2>
				<fooEnum3>1</fooEnum3>
				<fooEnumList>
						<member>Foo</member>
						<member>0</member>
				</fooEnumList>
				<fooEnumSet>
						<member>Foo</member>
						<member>0</member>
				</fooEnumSet>
				<fooEnumMap>
						<entry>
								<key>hi</key>
								<value>Foo</value>
						</entry>
						<entry>
								<key>zero</key>
								<value>0</value>
						</entry>
				</fooEnumMap>
		</XmlEnumsInputOutput>`,
		expected: {
			fooEnum1: 'Foo',

			fooEnum2: '0',

			fooEnum3: '1',

			fooEnumList: {
				member: ['Foo', '0'],
			},

			fooEnumSet: {
				member: ['Foo', '0'],
			},

			fooEnumMap: {
				entry: [
					{ key: 'hi', value: 'Foo' },
					{ key: 'zero', value: '0' },
				],
			},
		},
	},
	{
		spec: 'XmlIntEnums',
		xml: `<XmlIntEnumsInputOutput>
				<intEnum1>1</intEnum1>
				<intEnum2>2</intEnum2>
				<intEnum3>3</intEnum3>
				<intEnumList>
						<member>1</member>
						<member>2</member>
				</intEnumList>
				<intEnumSet>
						<member>1</member>
						<member>2</member>
				</intEnumSet>
				<intEnumMap>
						<entry>
								<key>a</key>
								<value>1</value>
						</entry>
						<entry>
								<key>b</key>
								<value>2</value>
						</entry>
				</intEnumMap>
		</XmlIntEnumsInputOutput>`,
		expected: {
			intEnum1: '1',

			intEnum2: '2',

			intEnum3: '3',

			intEnumList: {
				member: ['1', '2'],
			},

			intEnumSet: {
				member: ['1', '2'],
			},

			intEnumMap: {
				entry: [
					{ key: 'a', value: '1' },
					{ key: 'b', value: '2' },
				],
			},
		},
	},
	{
		spec: 'XmlLists',
		xml: `<XmlListsInputOutput>
				<stringList>
						<member>foo</member>
						<member>bar</member>
				</stringList>
				<stringSet>
						<member>foo</member>
						<member>bar</member>
				</stringSet>
				<integerList>
						<member>1</member>
						<member>2</member>
				</integerList>
				<booleanList>
						<member>true</member>
						<member>false</member>
				</booleanList>
				<timestampList>
						<member>2014-04-29T18:30:38Z</member>
						<member>2014-04-29T18:30:38Z</member>
				</timestampList>
				<enumList>
						<member>Foo</member>
						<member>0</member>
				</enumList>
				<intEnumList>
						<member>1</member>
						<member>2</member>
				</intEnumList>
				<nestedStringList>
						<member>
								<member>foo</member>
								<member>bar</member>
						</member>
						<member>
								<member>baz</member>
								<member>qux</member>
						</member>
				</nestedStringList>
				<renamed>
						<item>foo</item>
						<item>bar</item>
				</renamed>
				<flattenedList>hi</flattenedList>
				<flattenedList>bye</flattenedList>
				<customName>yep</customName>
				<customName>nope</customName>
				<flattenedListWithMemberNamespace xmlns="https://xml-member.example.com">a</flattenedListWithMemberNamespace>
				<flattenedListWithMemberNamespace xmlns="https://xml-member.example.com">b</flattenedListWithMemberNamespace>
				<flattenedListWithNamespace>a</flattenedListWithNamespace>
				<flattenedListWithNamespace>b</flattenedListWithNamespace>
				<myStructureList>
						<item>
								<value>1</value>
								<other>2</other>
						</item>
						<item>
								<value>3</value>
								<other>4</other>
						</item>
				</myStructureList>
				<flattenedStructureList>
						<value>5</value>
						<other>6</other>
				</flattenedStructureList>
				<flattenedStructureList>
						<value>7</value>
						<other>8</other>
				</flattenedStructureList>
		</XmlListsInputOutput>`,
		expected: {
			booleanList: {
				member: ['true', 'false'],
			},
			customName: ['yep', 'nope'],
			enumList: {
				member: ['Foo', '0'],
			},
			flattenedList: ['hi', 'bye'],
			flattenedListWithMemberNamespace: ['a', 'b'],
			flattenedListWithNamespace: ['a', 'b'],
			flattenedStructureList: [
				{ other: '6', value: '5' },
				{ other: '8', value: '7' },
			],
			intEnumList: {
				member: ['1', '2'],
			},
			integerList: {
				member: ['1', '2'],
			},
			myStructureList: {
				item: [
					{
						other: '2',
						value: '1',
					},
					{
						other: '4',
						value: '3',
					},
				],
			},
			nestedStringList: {
				member: [
					{
						member: ['foo', 'bar'],
					},
					{
						member: ['baz', 'qux'],
					},
				],
			},
			renamed: {
				item: ['foo', 'bar'],
			},
			stringList: {
				member: ['foo', 'bar'],
			},
			stringSet: {
				member: ['foo', 'bar'],
			},
			timestampList: {
				member: ['2014-04-29T18:30:38Z', '2014-04-29T18:30:38Z'],
			},
		},
	},
	{
		spec: 'XmlMaps',
		xml: `<XmlMapsInputOutput>
				<myMap>
						<entry>
								<key>foo</key>
								<value>
										<hi>there</hi>
								</value>
						</entry>
						<entry>
								<key>baz</key>
								<value>
										<hi>bye</hi>
								</value>
						</entry>
				</myMap>
		</XmlMapsInputOutput>`,
		expected: {
			myMap: {
				entry: [
					{
						key: 'foo',
						value: { hi: 'there' },
					},
					{
						key: 'baz',
						value: { hi: 'bye' },
					},
				],
			},
		},
	},
	{
		spec: 'XmlMapsXmlName',
		xml: `<XmlMapsXmlNameInputOutput>
				<myMap>
						<entry>
								<Attribute>foo</Attribute>
								<Setting>
										<hi>there</hi>
								</Setting>
						</entry>
						<entry>
								<Attribute>baz</Attribute>
								<Setting>
										<hi>bye</hi>
								</Setting>
						</entry>
				</myMap>
		</XmlMapsXmlNameInputOutput>`,
		expected: {
			myMap: {
				entry: [
					{ Attribute: 'foo', Setting: { hi: 'there' } },
					{ Attribute: 'baz', Setting: { hi: 'bye' } },
				],
			},
		},
	},
	{
		spec: 'XmlNamespaces',
		xml: `<XmlNamespacesInputOutput xmlns="http://foo.com">
				<nested>
						<foo xmlns:baz="http://baz.com">Foo</foo>
						<values xmlns="http://qux.com">
								<member xmlns="http://bux.com">Bar</member>
								<member xmlns="http://bux.com">Baz</member>
						</values>
				</nested>
		</XmlNamespacesInputOutput>`,
		expected: {
			nested: {
				foo: 'Foo',
				values: {
					member: ['Bar', 'Baz'],
				},
			},
		},
	},
	{
		spec: 'XmlUnionsWithStructMember',
		xml: `<XmlUnionsInputOutput>
				<unionValue>
					<structValue>
							<stringValue>string</stringValue>
							<booleanValue>true</booleanValue>
							<byteValue>1</byteValue>
							<shortValue>2</shortValue>
							<integerValue>3</integerValue>
							<longValue>4</longValue>
							<floatValue>5.5</floatValue>
							<doubleValue>6.5</doubleValue>
					</structValue>
				</unionValue>
		</XmlUnionsInputOutput>`,
		expected: {
			unionValue: {
				structValue: {
					stringValue: 'string',
					booleanValue: 'true',
					byteValue: '1',
					shortValue: '2',
					integerValue: '3',
					longValue: '4',
					floatValue: '5.5',
					doubleValue: '6.5',
				},
			},
		},
	},
	{
		spec: 'XmlUnionsWithStringMember',
		xml: `<XmlUnionsInputOutput>
				<unionValue>
					<stringValue>some string</stringValue>
				</unionValue>
		</XmlUnionsInputOutput>`,
		expected: {
			unionValue: {
				stringValue: 'some string',
			},
		},
	},
	{
		spec: 'XmlUnionsWithBooleanMember',
		xml: `<XmlUnionsInputOutput>
				<unionValue>
					<booleanValue>true</booleanValue>
				</unionValue>
		</XmlUnionsInputOutput>`,
		expected: {
			unionValue: {
				booleanValue: 'true',
			},
		},
	},
	{
		spec: 'XmlUnionsWithUnionMember',
		xml: `<XmlUnionsInputOutput>
				<unionValue>
					<unionValue>
							<booleanValue>true</booleanValue>
					</unionValue>
				</unionValue>
		</XmlUnionsInputOutput>`,
		expected: {
			unionValue: {
				unionValue: {
					booleanValue: 'true',
				},
			},
		},
	},
];

export default cases;
