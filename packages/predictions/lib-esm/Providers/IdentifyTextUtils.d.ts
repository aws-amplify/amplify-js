import * as Rekognition from 'aws-sdk/clients/rekognition';
import * as Textract from 'aws-sdk/clients/textract';
import { IdentifyTextOutput, Table, KeyValue, Content } from '../types';
/**
 * Organizes blocks from Rekognition API to each of the categories and and structures
 * their data accordingly.
 * @param {Textract.BlockList} source - Array containing blocks returned from Textract API.
 * @return {IdentifyTextOutput} -  Object that categorizes each block and its information.
 */
export declare function categorizeRekognitionBlocks(
	blocks: Rekognition.TextDetectionList
): IdentifyTextOutput;
/**
 * Organizes blocks from Textract API to each of the categories and and structures
 * their data accordingly.
 * @param {Textract.BlockList} source - Array containing blocks returned from Textract API.
 * @return {IdentifyTextOutput} -  Object that categorizes each block and its information.
 */
export declare function categorizeTextractBlocks(
	blocks: Textract.BlockList
): IdentifyTextOutput;
/**
 * Constructs a table object using data from its children cells.
 * @param {Textract.Block} table - Table block that has references (`Relationships`) to its cells
 * @param {[id: string]: Textract.Block} blockMap - Maps block Ids to blocks.
 */
export declare function constructTable(
	table: Textract.Block,
	blockMap: {
		[key: string]: Textract.Block;
	}
): Table;
/**
 * Constructs a key value object from its children key and value blocks.
 * @param {Textract.Block} KeyValue - KeyValue block that has references (`Relationships`) to its children.
 * @param {[id: string]: Textract.Block} blockMap - Maps block Ids to blocks.
 */
export declare function constructKeyValue(
	keyBlock: Textract.Block,
	blockMap: {
		[key: string]: Textract.Block;
	}
): KeyValue;
/**
 * Extracts text and selection from input block's children.
 * @param {Textract.Block}} block - Block that we want to extract contents from.
 * @param {[id: string]: Textract.Block} blockMap - Maps block Ids to blocks.
 */
export declare function extractContentsFromBlock(
	block: Textract.Block,
	blockMap: {
		[id: string]: Textract.Block;
	}
): Content;
