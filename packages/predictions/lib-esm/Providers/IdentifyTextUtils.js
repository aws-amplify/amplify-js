import { makeCamelCaseArray, makeCamelCase } from './Utils';
function getBoundingBox(geometry) {
	if (!geometry) return undefined;
	return makeCamelCase(geometry.BoundingBox);
}
function getPolygon(geometry) {
	if (!geometry) return undefined;
	return makeCamelCaseArray(geometry.Polygon);
}
/**
 * Organizes blocks from Rekognition API to each of the categories and and structures
 * their data accordingly.
 * @param {Textract.BlockList} source - Array containing blocks returned from Textract API.
 * @return {IdentifyTextOutput} -  Object that categorizes each block and its information.
 */
export function categorizeRekognitionBlocks(blocks) {
	// Skeleton IdentifyText API response. We will populate it as we iterate through blocks.
	var response = {
		text: {
			fullText: '',
			words: [],
			lines: [],
			linesDetailed: [],
		},
	};
	// We categorize each block by running a forEach loop through them.
	blocks.forEach(function(block) {
		switch (block.Type) {
			case 'LINE':
				response.text.lines.push(block.DetectedText);
				response.text.linesDetailed.push({
					text: block.DetectedText,
					polygon: getPolygon(block.Geometry),
					boundingBox: getBoundingBox(block.Geometry),
					page: null,
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
		response.text.fullText.length - 1
	);
	return response;
}
/**
 * Organizes blocks from Textract API to each of the categories and and structures
 * their data accordingly.
 * @param {Textract.BlockList} source - Array containing blocks returned from Textract API.
 * @return {IdentifyTextOutput} -  Object that categorizes each block and its information.
 */
export function categorizeTextractBlocks(blocks) {
	// Skeleton IdentifyText API response. We will populate it as we iterate through blocks.
	var response = {
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
	var tableBlocks = Array();
	var keyValueBlocks = Array();
	var blockMap = {};
	blocks.forEach(function(block) {
		switch (block.BlockType) {
			case 'LINE':
				response.text.lines.push(block.Text);
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
				blockMap[block.Id] = block;
				break;
			case 'SELECTION_ELEMENT':
				var selectionStatus =
					block.SelectionStatus === 'SELECTED' ? true : false;
				if (!response.text.selections) response.text.selections = [];
				response.text.selections.push({
					selected: selectionStatus,
					polygon: getPolygon(block.Geometry),
					boundingBox: getBoundingBox(block.Geometry),
				});
				blockMap[block.Id] = block;
				break;
			case 'TABLE':
				tableBlocks.push(block);
				break;
			case 'KEY_VALUE_SET':
				keyValueBlocks.push(block);
				blockMap[block.Id] = block;
				break;
			default:
				blockMap[block.Id] = block;
		}
	});
	// remove trailing space in fullText
	response.text.fullText = response.text.fullText.substr(
		0,
		response.text.fullText.length - 1
	);
	// Post-process complex structures if they exist.
	if (tableBlocks.length !== 0) {
		var tableResponse_1 = Array();
		tableBlocks.forEach(function(table) {
			tableResponse_1.push(constructTable(table, blockMap));
		});
		response.text.tables = tableResponse_1;
	}
	if (keyValueBlocks.length !== 0) {
		var keyValueResponse_1 = Array();
		keyValueBlocks.forEach(function(keyValue) {
			// We need the KeyValue blocks of EntityType = `KEY`, which has both key and value references.
			if (keyValue.EntityTypes.indexOf('KEY') !== -1) {
				keyValueResponse_1.push(constructKeyValue(keyValue, blockMap));
			}
		});
		response.text.keyValues = keyValueResponse_1;
	}
	return response;
}
/**
 * Constructs a table object using data from its children cells.
 * @param {Textract.Block} table - Table block that has references (`Relationships`) to its cells
 * @param {[id: string]: Textract.Block} blockMap - Maps block Ids to blocks.
 */
export function constructTable(table, blockMap) {
	var tableMatrix;
	tableMatrix = [];
	// visit each of the cell associated with the table's relationship.
	table.Relationships.forEach(function(tableRelation) {
		tableRelation.Ids.forEach(function(cellId) {
			var cellBlock = blockMap[cellId];
			var row = cellBlock.RowIndex - 1; // textract starts indexing at 1, so subtract it by 1.
			var col = cellBlock.ColumnIndex - 1; // textract starts indexing at 1, so subtract it by 1.
			// extract data contained inside the cell.
			var content = extractContentsFromBlock(cellBlock, blockMap);
			var cell = {
				text: content.text,
				boundingBox: getBoundingBox(cellBlock.Geometry),
				polygon: getPolygon(cellBlock.Geometry),
				selected: content.selected,
				rowSpan: cellBlock.RowSpan,
				columnSpan: cellBlock.ColumnSpan,
			};
			if (!tableMatrix[row]) tableMatrix[row] = [];
			tableMatrix[row][col] = cell;
		});
	});
	var rowSize = tableMatrix.length;
	var columnSize = tableMatrix[0].length;
	// Note that we leave spanned cells undefined for distinction
	return {
		size: { rows: rowSize, columns: columnSize },
		table: tableMatrix,
		boundingBox: getBoundingBox(table.Geometry),
		polygon: getPolygon(table.Geometry),
	};
}
/**
 * Constructs a key value object from its children key and value blocks.
 * @param {Textract.Block} KeyValue - KeyValue block that has references (`Relationships`) to its children.
 * @param {[id: string]: Textract.Block} blockMap - Maps block Ids to blocks.
 */
export function constructKeyValue(keyBlock, blockMap) {
	var keyText = '';
	var valueText = '';
	var valueSelected;
	keyBlock.Relationships.forEach(function(keyValueRelation) {
		if (keyValueRelation.Type === 'CHILD') {
			// relation refers to key
			var contents = extractContentsFromBlock(keyBlock, blockMap);
			keyText = contents.text;
		} else if (keyValueRelation.Type === 'VALUE') {
			// relation refers to value
			keyValueRelation.Ids.forEach(function(valueId) {
				var valueBlock = blockMap[valueId];
				var contents = extractContentsFromBlock(valueBlock, blockMap);
				valueText = contents.text;
				if (contents.selected != null) valueSelected = contents.selected;
			});
		}
	});
	return {
		key: keyText,
		value: { text: valueText, selected: valueSelected },
		polygon: getPolygon(keyBlock.Geometry),
		boundingBox: getBoundingBox(keyBlock.Geometry),
	};
}
/**
 * Extracts text and selection from input block's children.
 * @param {Textract.Block}} block - Block that we want to extract contents from.
 * @param {[id: string]: Textract.Block} blockMap - Maps block Ids to blocks.
 */
export function extractContentsFromBlock(block, blockMap) {
	var words = '';
	var isSelected;
	if (!block.Relationships) {
		// some block might have no content
		return { text: '', selected: undefined };
	}
	block.Relationships.forEach(function(relation) {
		relation.Ids.forEach(function(contentId) {
			var contentBlock = blockMap[contentId];
			if (contentBlock.BlockType === 'WORD') {
				words += contentBlock.Text + ' ';
			} else if (contentBlock.BlockType === 'SELECTION_ELEMENT') {
				isSelected = contentBlock.SelectionStatus === 'SELECTED' ? true : false;
			}
		});
	});
	words = words.substr(0, words.length - 1); // remove trailing space.
	return { text: words, selected: isSelected };
}
//# sourceMappingURL=IdentifyTextUtils.js.map
