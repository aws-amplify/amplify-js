import { Credentials } from '@aws-amplify/core';
import Storage from '@aws-amplify/storage';
import {
	IdentifyEntitiesInput,
	IdentifyEntitiesOutput,
	IdentifyTextInput,
	IdentifyTextOutput,
	IdentifyLabelsInput,
	IdentifyLabelsOutput,
} from '../../src/types';
import { BlockList } from '../../src/types/AWSTypes';
import { AmazonAIIdentifyPredictionsProvider } from '../../src/Providers';
import {
	RekognitionClient,
	DetectLabelsCommandOutput,
	DetectLabelsCommand,
	DetectModerationLabelsCommandOutput,
	DetectModerationLabelsCommand,
	DetectFacesCommandOutput,
	DetectFacesCommand,
	SearchFacesByImageCommandOutput,
	SearchFacesByImageCommand,
	RecognizeCelebritiesCommandOutput,
	RecognizeCelebritiesCommand,
	DetectTextCommandOutput,
	DetectTextCommand,
} from '@aws-sdk/client-rekognition';
import {
	TextractClient,
	DetectDocumentTextCommand,
	AnalyzeDocumentCommand,
} from '@aws-sdk/client-textract';

// valid response
RekognitionClient.prototype.send = jest.fn((command) => {
	if (command instanceof DetectLabelsCommand) {
		const detectlabelsResponse: DetectLabelsCommandOutput = {
			Labels: [
				{
					Name: 'test',
					Instances: [
						{ BoundingBox: { Height: 0, Left: 0, Top: 0, Width: 0 } },
					],
				},
			],
			$metadata: null,
		};
		return Promise.resolve(detectlabelsResponse);
	} else if (command instanceof DetectModerationLabelsCommand) {
		const detectModerationLabelsResponse: DetectModerationLabelsCommandOutput =
			{
				ModerationLabels: [{ Name: 'test', Confidence: 0.0 }],
				$metadata: null,
			};
		return Promise.resolve(detectModerationLabelsResponse);
	} else if (command instanceof DetectFacesCommand) {
		const detectFacesResponse: DetectFacesCommandOutput = {
			FaceDetails: [{ AgeRange: { High: 0, Low: 0 } }],
			$metadata: null,
		};
		return Promise.resolve(detectFacesResponse);
	} else if (command instanceof SearchFacesByImageCommand) {
		const searchFacesByImageResponse: SearchFacesByImageCommandOutput = {
			FaceMatches: [
				{
					Face: {
						ExternalImageId: 'ExternalImageId',
						BoundingBox: { Height: 0, Left: 0, Top: 0, Width: 0 },
					},
					Similarity: 0.0,
				},
			],
			$metadata: null,
		};
		return Promise.resolve(searchFacesByImageResponse);
	} else if (command instanceof RecognizeCelebritiesCommand) {
		const recognizeCelebritiesResponse: RecognizeCelebritiesCommandOutput = {
			CelebrityFaces: [
				{
					Name: 'William',
					Urls: ['www.william.com'],
					Face: {
						BoundingBox: { Height: 0, Left: 0, Top: 0, Width: 0 },
						Pose: {
							Roll: 0,
						},
						Landmarks: [
							{
								Type: 'eyeLeft',
								X: 0.5,
								Y: 0.5,
							},
						],
					},
				},
			],
			$metadata: null,
		};
		return Promise.resolve(recognizeCelebritiesResponse);
	} else if (command instanceof DetectTextCommand) {
		const plainBlocks: DetectTextCommandOutput = {
			TextDetections: [
				{ Type: 'LINE', Id: 1, DetectedText: 'Hello world' },
				{ Type: 'WORD', Id: 2, ParentId: 1, DetectedText: 'Hello' },
				{ Type: 'WORD', Id: 3, ParentId: 1, DetectedText: 'world' },
			],
			$metadata: null,
		};
		return Promise.resolve(plainBlocks);
	}
}) as any;

const plainBlocks: BlockList = [
	{
		BlockType: 'LINE',
		Id: 'line1',
		Relationships: [
			{
				Ids: ['word1', 'word2'],
				Type: 'CHILD',
			},
		],
		Text: 'Hello world',
	},
	{
		BlockType: 'WORD',
		Id: 'word1',
		Text: 'Hello',
	},
	{
		BlockType: 'WORD',
		Id: 'word2',
		Text: 'world',
	},
];

const TableAndFormBlocks: BlockList = [
	...plainBlocks,
	{
		BlockType: 'SELECTION_ELEMENT',
		Id: 'selection1',
		SelectionStatus: 'SELECTED',
	},
	{
		BlockType: 'TABLE',
		Id: 'table1',
		Relationships: [
			{
				Ids: ['cell1', 'cell2'],
				Type: 'CHILD',
			},
		],
	},
	{
		BlockType: 'CELL',
		Id: 'cell1',
		Relationships: undefined,
		ColumnIndex: 1,
		RowIndex: 1,
	},
	{
		BlockType: 'CELL',
		Id: 'cell2',
		Relationships: [
			{
				Ids: ['word1', 'word2', 'selection1'],
				Type: 'CHILD',
			},
		],
		ColumnIndex: 2,
		RowIndex: 1,
	},
	{
		BlockType: 'KEY_VALUE_SET',
		Id: 'keyValue1',
		EntityTypes: ['KEY'],
		Relationships: [
			{
				Ids: ['word1'],
				Type: 'CHILD',
			},
			{
				Ids: ['keyValue2'],
				Type: 'VALUE',
			},
		],
	},
	{
		BlockType: 'KEY_VALUE_SET',
		Id: 'keyValue2',
		EntityTypes: ['VALUE'],
		Relationships: [
			{
				Ids: ['word2', 'selection1'],
				Type: 'CHILD',
			},
		],
	},
];
const detectDocumentTextResponse = {
	Blocks: plainBlocks,
};
const analyzeDocumentResponse = {
	Blocks: TableAndFormBlocks,
};

TextractClient.prototype.send = jest.fn((command) => {
	if (command instanceof DetectDocumentTextCommand) {
		return Promise.resolve(detectDocumentTextResponse);
	} else if (command instanceof AnalyzeDocumentCommand) {
		return Promise.resolve(analyzeDocumentResponse);
	}
}) as any;

jest.spyOn(Credentials, 'get').mockImplementation(() => {
	return Promise.resolve(credentials);
});

jest.spyOn(Storage, 'get').mockImplementation((key: string, config?) => {
	const level = config.level || 'public';
	let url: string;
	if (level === 'public') {
		url = `https://bucket-name.s3.us-west-2.amazonaws.com/public/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256`;
	} else {
		const identityId = config.identityId || credentials.identityId;
		// tslint:disable-next-line: max-line-length
		url = `https://bucket-name.s3.us-west-2.amazonaws.com/${level}/${identityId}/key.png?X-Amz-Algorithm=AWS4-HMAC-SHA256`;
	}
	return Promise.resolve(url);
});

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

const options = {
	identifyEntities: {
		proxy: false,
		region: 'us-west-2',
		celebrityDetectionEnabled: true,
		defaults: {
			collectionId: 'identifyEntities9de51ed0-beta',
			maxEntities: 50,
		},
	},
	identifyText: {
		proxy: false,
		region: 'us-west-2',
		defaults: {
			format: 'PLAIN',
		},
	},
	identifyLabels: {
		proxy: false,
		region: 'us-west-2',
		defaults: {
			type: 'LABELS',
		},
	},
};

describe('Predictions identify provider test', () => {
	let predictionsProvider;

	beforeAll(() => {
		predictionsProvider = new AmazonAIIdentifyPredictionsProvider();
		predictionsProvider.configure(options);
	});
	describe('identifyText tests', () => {
		describe('identifyText::PLAIN tests', () => {
			const detectTextInput: IdentifyTextInput = {
				text: { source: { key: 'key' }, format: 'PLAIN' },
			};
			test('happy case plain document with rekognition', () => {
				const expected: IdentifyTextOutput = {
					text: {
						fullText: 'Hello world',
						lines: ['Hello world'],
						linesDetailed: [{ text: 'Hello world' }],
						words: [{ text: 'Hello' }, { text: 'world' }],
					},
				};
				return expect(
					predictionsProvider.identify(detectTextInput)
				).resolves.toMatchObject(expected);
			});
			test('error case no credentials', () => {
				jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
					return null;
				});
				return expect(
					predictionsProvider.identify(detectTextInput)
				).rejects.toMatch('No credentials');
			});

			test('plain document with textract', async () => {
				// we only call textract if rekognition.detectText reaches word limit of 50. Mock this:
				jest
					.spyOn(RekognitionClient.prototype, 'send')
					.mockImplementationOnce(() => {
						const plainBlocks: DetectTextCommandOutput = {
							TextDetections: [
								{ Type: 'LINE', Id: 1, DetectedText: 'Hello world' },
							],
							$metadata: null,
						};
						for (let i = 0; i < 50; ++i) {
							plainBlocks.TextDetections.push({
								Type: 'WORD',
								Id: i + 2,
								ParentId: 1,
								DetectedText: '',
							});
						}
						return Promise.resolve(plainBlocks);
					});
				// confirm that textract service has been called
				const spy = jest.spyOn(TextractClient.prototype, 'send');
				await predictionsProvider.identify(detectTextInput);
				expect(spy).toHaveBeenCalled();
			});
		});
		describe('identifyText::ALL tests', () => {
			const detectTextInput: IdentifyTextInput = {
				text: { source: { key: 'key' }, format: 'ALL' },
			};
			test('happy case analyzeDocument with FORMS and TABLES', () => {
				const expected = {
					text: {
						fullText: 'Hello world',
						keyValues: [
							{ key: 'Hello', value: { selected: true, text: 'world' } },
						],
						lines: ['Hello world'],
						linesDetailed: [{ text: 'Hello world' }],
						selections: [{ selected: true }],
						tables: [
							{
								size: { columns: 2, rows: 1 },
								table: [
									[{ text: '' }, { selected: true, text: 'Hello world' }],
								],
							},
						],
						words: [{ text: 'Hello' }, { text: 'world' }],
					},
				};
				expect(
					predictionsProvider.identify(detectTextInput)
				).resolves.toMatchObject(expected);
			});
		});
	});
	describe('identifyLabels tests', () => {
		describe('identifylabels tests', () => {
			const detectLabelInput: IdentifyLabelsInput = {
				labels: { source: { key: 'key' }, type: 'LABELS' },
			};
			test('happy case credentials exist', () => {
				const expected: IdentifyLabelsOutput = {
					labels: [
						{
							name: 'test',
							boundingBoxes: [{ height: 0, left: 0, top: 0, width: 0 }],
						},
					],
				};
				return expect(
					predictionsProvider.identify(detectLabelInput)
				).resolves.toMatchObject(expected);
			});
			test('error case credentials do not exist', () => {
				jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
					return null;
				});
				return expect(
					predictionsProvider.identify(detectLabelInput)
				).rejects.toMatch('No credentials');
			});
			test('error case credentials exist but service fails', () => {
				jest
					.spyOn(RekognitionClient.prototype, 'send')
					.mockImplementationOnce(() => {
						return Promise.reject('error');
					});
				return expect(
					predictionsProvider.identify(detectLabelInput)
				).rejects.toMatch('error');
			});
		});

		describe('identifyLabels::unsafe tests', () => {
			const detectModerationInput: IdentifyLabelsInput = {
				labels: { source: { key: 'key' }, type: 'UNSAFE' },
			};

			test('happy case credentials exist, unsafe image', () => {
				const expected: IdentifyLabelsOutput = { unsafe: 'YES' };
				return expect(
					predictionsProvider.identify(detectModerationInput)
				).resolves.toMatchObject(expected);
			});

			test('error case credentials exist but service fails', () => {
				jest
					.spyOn(RekognitionClient.prototype, 'send')
					.mockImplementationOnce(() => {
						return Promise.reject('error');
					});
				return expect(
					predictionsProvider.identify(detectModerationInput)
				).rejects.toMatch('error');
			});
		});

		describe('identifyLabels::all tests', () => {
			const detectModerationInput: IdentifyLabelsInput = {
				labels: { source: { key: 'key' }, type: 'ALL' },
			};

			test('happy case credentials exist', () => {
				const expected: IdentifyLabelsOutput = {
					labels: [
						{
							name: 'test',
							boundingBoxes: [{ height: 0, left: 0, top: 0, width: 0 }],
						},
					],
					unsafe: 'YES',
				};
				return expect(
					predictionsProvider.identify(detectModerationInput)
				).resolves.toMatchObject(expected);
			});

			test('error case credentials exist but service fails', () => {
				jest
					.spyOn(RekognitionClient.prototype, 'send')
					.mockImplementationOnce(() => {
						return Promise.reject('error');
					});
				return expect(
					predictionsProvider.identify(detectModerationInput)
				).rejects.toMatch('error');
			});
		});
	});
	describe('identifyFaces tests', () => {
		describe('identifyEntities::detctFaces tests', () => {
			const detectFacesInput: IdentifyEntitiesInput = {
				entities: {
					source: {
						key: 'key',
					},
					celebrityDetection: true,
				},
			};

			test('happy case credentials exist', () => {
				const expected: IdentifyEntitiesOutput = {
					entities: [
						{
							boundingBox: { height: 0, left: 0, top: 0, width: 0 },
							landmarks: [{ type: 'eyeLeft', x: 0.5, y: 0.5 }],
							metadata: {
								name: 'William',
								pose: { roll: 0 },
								urls: ['www.william.com'],
							},
						},
					],
				};
				return expect(
					predictionsProvider.identify(detectFacesInput)
				).resolves.toMatchObject(expected);
			});

			test('error case credentials do not exist', () => {
				jest.spyOn(Credentials, 'get').mockImplementationOnce(() => {
					return null;
				});
				return expect(
					predictionsProvider.identify(detectFacesInput)
				).rejects.toMatch('No credentials');
			});

			test('error case credentials exist but service fails', () => {
				jest
					.spyOn(RekognitionClient.prototype, 'send')
					.mockImplementationOnce(() => {
						return Promise.reject('error');
					});
				return expect(
					predictionsProvider.identify(detectFacesInput)
				).rejects.toMatch('error');
			});
		});

		describe('identifyEntities::recognizeCelebrities tests', () => {
			const recognizeCelebritiesInput: IdentifyEntitiesInput = {
				entities: {
					source: { key: 'key' },
					celebrityDetection: true,
				},
			};

			test('happy case credentials exist', () => {
				const expected: IdentifyEntitiesOutput = {
					entities: [{ boundingBox: { left: 0, top: 0, height: 0, width: 0 } }],
				};
				return expect(
					predictionsProvider.identify(recognizeCelebritiesInput)
				).resolves.toMatchObject(expected);
			});

			test('error case credentials exist but service fails', () => {
				jest
					.spyOn(RekognitionClient.prototype, 'send')
					.mockImplementationOnce(() => {
						return Promise.reject('error');
					});
				return expect(
					predictionsProvider.identify(recognizeCelebritiesInput)
				).rejects.toMatch('error');
			});
		});

		describe('identifyEntities::searchImageByFaces tests', () => {
			const searchByFacesInput: IdentifyEntitiesInput = {
				entities: {
					source: { key: 'key' },
					collectionId: 'collection',
					collection: true,
					maxEntities: 0,
				},
			};

			test('happy case credentials exist', () => {
				const expected: IdentifyEntitiesOutput = {
					entities: [{ boundingBox: { left: 0, top: 0, height: 0, width: 0 } }],
				};
				return expect(
					predictionsProvider.identify(searchByFacesInput)
				).resolves.toMatchObject(expected);
			});

			test('error case credentials exist but service fails', () => {
				jest
					.spyOn(RekognitionClient.prototype, 'send')
					.mockImplementationOnce(() => {
						return Promise.reject('error');
					});
				return expect(
					predictionsProvider.identify(searchByFacesInput)
				).rejects.toMatch('error');
			});
		});
	});

	describe('identify input source transformation tests', () => {
		const detectlabelsResponse: DetectLabelsCommandOutput = {
			Labels: [
				{
					Name: 'test',
					Instances: [
						{ BoundingBox: { Height: 0, Left: 0, Top: 0, Width: 0 } },
					],
				},
			],
			$metadata: null,
		};

		test('happy case input source valid public s3object', () => {
			const detectLabelInput: IdentifyLabelsInput = {
				labels: { source: { level: 'public', key: 'key' }, type: 'LABELS' },
			};
			jest
				.spyOn(RekognitionClient.prototype, 'send')
				.mockImplementationOnce((command) => {
					expect(
						(command as DetectLabelsCommand).input.Image.S3Object.Name
					).toMatch('public/key');
					return Promise.resolve(detectlabelsResponse);
				});
			predictionsProvider.identify(detectLabelInput);
		});

		test('happy case input source valid private s3object', async () => {
			const detectLabelInput: IdentifyLabelsInput = {
				labels: { source: { key: 'key', level: 'private' }, type: 'LABELS' },
			};
			jest
				.spyOn(RekognitionClient.prototype, 'send')
				.mockImplementationOnce((command) => {
					expect(
						(command as DetectLabelsCommand).input.Image.S3Object.Name
					).toMatch('private/identityId/key');
					return {};
				});
			await predictionsProvider.identify(detectLabelInput);
		});

		test('happy case input source valid protected s3object', () => {
			const detectLabelInput: IdentifyLabelsInput = {
				labels: {
					source: {
						key: 'key',
						identityId: credentials.identityId,
						level: 'protected',
					},
					type: 'LABELS',
				},
			};
			jest
				.spyOn(RekognitionClient.prototype, 'send')
				.mockImplementationOnce((command) => {
					expect(
						(command as DetectLabelsCommand).input.Image.S3Object.Name
					).toMatch('protected/identityId/key');
					return Promise.resolve(detectlabelsResponse);
				});
			predictionsProvider.identify(detectLabelInput);
		});

		test('happy case input source valid bytes', () => {
			const detectLabelInput: IdentifyLabelsInput = {
				labels: { source: { bytes: 'bytes' }, type: 'LABELS' },
			};
			jest
				.spyOn(RekognitionClient.prototype, 'send')
				.mockImplementationOnce((command) => {
					expect((command as DetectLabelsCommand).input.Image.Bytes).toMatch(
						'bytes'
					);
					return Promise.resolve(detectlabelsResponse);
				});
			predictionsProvider.identify(detectLabelInput);
		});

		test('happy case input source valid bytes', async () => {
			const fileInput = new Blob([Buffer.from('file')]);
			const detectLabelInput: IdentifyLabelsInput = {
				labels: { source: { bytes: fileInput }, type: 'LABELS' },
			};
			jest
				.spyOn(RekognitionClient.prototype, 'send')
				.mockImplementationOnce((command) => {
					expect(
						(command as DetectLabelsCommand).input.Image.Bytes
					).toMatchObject(fileInput);
					return {};
				});
			await predictionsProvider.identify(detectLabelInput);
		});

		// Failing test in CircleCI TODO fix
		test.skip('happy case input source valid file', async () => {
			const fileInput = new File([Buffer.from('file')], 'file');
			const detectLabelInput: IdentifyLabelsInput = {
				labels: { source: { file: fileInput }, type: 'LABELS' },
			};
			jest
				.spyOn(RekognitionClient.prototype, 'send')
				.mockImplementationOnce((command) => {
					expect(
						(command as DetectLabelsCommand).input.Image.Bytes
					).toMatchObject(fileInput);
					return {};
				});
			await predictionsProvider.identify(detectLabelInput);
		});

		test('error case invalid input source', () => {
			const detectLabelInput: IdentifyLabelsInput = {
				labels: { source: null, type: 'LABELS' },
			};
			return expect(
				predictionsProvider.identify(detectLabelInput)
			).rejects.toMatch('not configured correctly');
		});
	});
});
