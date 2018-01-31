import { CacheConfig } from '../types';
/**
* Default cache config
*/
export declare const defaultConfig: CacheConfig;
/**
 * return the byte size of the string
 * @param str
 */
export declare function getByteLength(str: string): number;
/**
 * get current time
 */
export declare function getCurrTime(): number;
/**
 * check if passed value is an integer
 */
export declare function isInteger(value: any): boolean;
