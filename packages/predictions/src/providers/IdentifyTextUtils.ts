// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	BoundingBox,
	Content,
	Geometry,
	IdentifyTextOutput,
	KeyValue,
	Polygon,
	Table,
	TableCell,
} from '../types';
import { Block, BlockList, TextDetectionList } from '../types/AWSTypes';

import { makeCamelCase, makeCamelCaseArray } from './Utils';

function getBoundingBox(geometry?: Geometry): BoundingBox | undefined {
	return makeCamelCase(geometry?.BoundingBox);
}

function getPolygon(geometry?: Geometry): Polygon | undefined {
	if (!geometry?.Polygon) return undefined;

	return makeCamelCaseArray(Array.from(geometry.Polygon)) as Polygon;
}

/**
 * Organizes blocks from Rekognition API to each of the categories and and structures
 * their data accordingly.
 * @param {BlockList} source - Array containing blocks returned from Textract API.
 * @return {IdentifyTextOutput} -  Object that categorizes each block and its information.
 */
export function categorizeRekognitionBlocks(
	blocks: TextDetectionList,
): IdentifyTextOutput {
	// Skeleton IdentifyText API response. We will populate it as we iterate through blocks.
	const response: IdentifyTextOutput = {
		text: {
			fullText: '',
			words: [],
			lines: [],
			linesDetailed: [],
		},
	};
	// We categorize each block by running a forEach loop through them.
	blocks.forEach(block => {
		switch (block.Type) {
			case 'LINE':
				if (block.DetectedText) {
					response.text.lines.push(block.DetectedText);
				}
				response.text.linesDetailed.push({
					text: block.DetectedText,
					polygon: getPolygon(block.Geometry),
					boundingBox: getBoundingBox(block.Geometry),
					page: undefined, // rekognition doesn't have this info
				});
				break;
			case 'WORD':
				response.text.fullText += block.DetectedText + ' ';
				response.text.words.push({
					text: block.DetectedText,
					polygon: getPolygon(block.Geometry),
					boundingBox: getBoundingBox(block.Geometry),
				});
				break;
		}
	});
	// remove trailing space of fullText
	response.text.fullText = response.text.fullText.substr(
		0,
		response.text.fullText.length - 1,
	);

	return response;
}

/**
 * Organizes blocks from Textract API to each of the categories and and structures
 * their data accordingly.
 * @param {BlockList} source - Array containing blocks returned from Textract API.
 * @return {IdentifyTextOutput} -  Object that categorizes each block and its information.
 */
export function categorizeTextractBlocks(
	blocks: BlockList,
): IdentifyTextOutput {
	// Skeleton IdentifyText API response. We will populate it as we iterate through blocks.
	const response: IdentifyTextOutput = {
		text: {
			fullText: '',
			words: [],
			lines: [],
			linesDetailed: [],
		},
	};
	// if blocks is an empty array, ie. textract did not detect anything, return empty response.
	if (blocks.length === 0) return response;
	/**
	 * We categorize each of the blocks by running a forEach loop through them.
	 *
	 * For complex structures such as Tables and KeyValue, we need to trasverse through their children. To do so,
	 * we will post-process them after the for each loop. We do this by storing table and keyvalues in arrays and
	 * mapping other blocks in `blockMap` (id to block) so we can reference them easily later.
	 *
	 * Note that we do not map `WORD` and `TABLE` in `blockMap` because they will not be referenced by any other
	 * block except the Page block.
	 */
	const tableBlocks: BlockList = [];
	const keyValueBlocks: BlockList = [];
	const blockMap: Record<string, Block> = {};

	blocks.forEach(block => {
		switch (block.BlockType) {
			case 'LINE':
				if (block.Text) {
					response.text.lines.push(block.Text);
				}
				response.text.linesDetailed.push({
					text: block.Text,
					polygon: getPolygon(block.Geometry),
					boundingBox: getBoundingBox(block.Geometry),
					page: block.Page,
				});
				break;
			case 'WORD':
				response.text.fullText += block.Text + ' ';
				response.text.words.push({
					text: block.Text,
					polygon: getPolygon(block.Geometry),
					boundingBox: getBoundingBox(block.Geometry),
				});
				if (block.Id) {
					blockMap[block.Id] = block;
				}
				break;
			case 'SELECTION_ELEMENT': {
				const selectionStatus = block.SelectionStatus === 'SELECTED';
				if (!response.text.selections) response.text.selections = [];
				response.text.selections.push({
					selected: selectionStatus,
					polygon: getPolygon(block.Geometry)!,
					boundingBox: getBoundingBox(block.Geometry)!,
				});
				if (block.Id) {
					blockMap[block.Id] = block;
				}
				break;
			}
			case 'TABLE':
				tableBlocks.push(block);
				break;
			case 'KEY_VALUE_SET':
				keyValueBlocks.push(block);
				if (block.Id) {
					blockMap[block.Id] = block;
				}
				break;
			default:
				if (block.Id) {
					blockMap[block.Id] = block;
				}
		}
	});
	// remove trailing space in fullText
	response.text.fullText = response.text.fullText.substr(
		0,
		response.text.fullText.length - 1,
	);

	// Post-process complex structures if they exist.
	if (tableBlocks.length !== 0) {
		const tableResponse: Table[] = [];
		tableBlocks.forEach(table => {
			tableResponse.push(constructTable(table, blockMap));
		});
		response.text.tables = tableResponse;
	}
	if (keyValueBlocks.length !== 0) {
		const keyValueResponse: KeyValue[] = [];
		keyValueBlocks.forEach(keyValue => {
			// We need the KeyValue blocks of EntityType = `KEY`, which has both key and value references.
			if (keyValue.EntityTypes) {
				const entityTypes = Array.from(keyValue.EntityTypes);
				if (entityTypes.indexOf('KEY') !== -1) {
					keyValueResponse.push(constructKeyValue(keyValue, blockMap));
				}
			}
		});
		response.text.keyValues = keyValueResponse;
	}

	return response;
}

/**
 * Constructs a table object using data from its children cells.
 * @param {Block} table - Table block that has references (`Relationships`) to its cells
 * @param {[id: string]: Block} blockMap - Maps block Ids to blocks.
 */
function constructTable(table: Block, blockMap: Record<string, Block>): Table {
	const tableMatrix: TableCell[][] = [];
	// visit each of the cell associated with the table's relationship.
	for (const tableRelation of table.Relationships ?? []) {
		for (const cellId of tableRelation.Ids ?? []) {
			const cellBlock: Block = blockMap[cellId];
			if (cellBlock.RowIndex && cellBlock.ColumnIndex) {
				const row = cellBlock.RowIndex - 1; // textract starts indexing at 1, so subtract it by 1.
				const col = cellBlock.ColumnIndex - 1; // textract starts indexing at 1, so subtract it by 1.
				// extract data contained inside the cell.
				const content = extractContentsFromBlock(cellBlock, blockMap);
				const cell: TableCell = {
					text: content.text,
					boundingBox: getBoundingBox(cellBlock.Geometry),
					polygon: getPolygon(cellBlock.Geometry),
					selected: content.selected,
					rowSpan: cellBlock.RowSpan,
					columnSpan: cellBlock.ColumnSpan,
				};
				if (!tableMatrix[row]) tableMatrix[row] = [];
				tableMatrix[row][col] = cell;
			}
		}
	}
	const rowSize = tableMatrix.length;
	const columnSize = tableMatrix[0].length;
	const boundingBox = getBoundingBox(table.Geometry);
	const polygon = getPolygon(table.Geometry);

	// Note that we leave spanned cells undefined for distinction
	return {
		size: { rows: rowSize, columns: columnSize },
		table: tableMatrix,
		boundingBox,
		polygon,
	};
}

/**
 * Constructs a key value object from its children key and value blocks.
 * @param {Block} KeyValue - KeyValue block that has references (`Relationships`) to its children.
 * @param {[id: string]: Block} blockMap - Maps block Ids to blocks.
 */
function constructKeyValue(
	keyBlock: Block,
	blockMap: Record<string, Block>,
): KeyValue {
	let keyText = '';
	let valueText = '';
	let valueSelected = false;
	for (const keyValueRelation of keyBlock.Relationships ?? []) {
		if (keyValueRelation.Type === 'CHILD') {
			// relation refers to key
			const contents = extractContentsFromBlock(keyBlock, blockMap);
			keyText = contents.text ?? '';
		} else if (keyValueRelation.Type === 'VALUE') {
			// relation refers to value
			for (const valueId of keyValueRelation.Ids ?? []) {
				const valueBlock = blockMap[valueId];
				const contents = extractContentsFromBlock(valueBlock, blockMap);
				valueText = contents.text ?? '';
				if (contents.selected != null) valueSelected = contents.selected;
			}
		}
	}

	return {
		key: keyText,
		value: { text: valueText, selected: valueSelected },
		polygon: getPolygon(keyBlock.Geometry),
		boundingBox: getBoundingBox(keyBlock.Geometry),
	};
}

/**
 * Extracts text and selection from input block's children.
 * @param {Block}} block - Block that we want to extract contents from.
 * @param {[id: string]: Block} blockMap - Maps block Ids to blocks.
 */
function extractContentsFromBlock(
	block: Block,
	blockMap: Record<string, Block>,
): Content {
	let words = '';
	let isSelected = false;

	if (!block.Relationships) {
		// some block might have no content
		return { text: '', selected: undefined };
	}
	for (const relation of block.Relationships) {
		for (const contentId of relation.Ids ?? []) {
			const contentBlock = blockMap[contentId];
			if (contentBlock.BlockType === 'WORD') {
				words += contentBlock.Text + ' ';
			} else if (contentBlock.BlockType === 'SELECTION_ELEMENT') {
				isSelected = contentBlock.SelectionStatus === 'SELECTED';
			}
		}
	}

	words = words.substr(0, words.length - 1); // remove trailing space.

	return { text: words, selected: isSelected };
}
