export default class JS {
	static isEmpty(obj: any): boolean;
	static sortByField(list: any, field: any, dir: any): boolean;
	static objectLessAttributes(obj: any, less: any): any;
	static filenameToContentType(filename: any, defVal?: string): string;
	static isTextFile(contentType: any): boolean;
	/**
	 * generate random string
	 */
	static generateRandomString(): string;
	static makeQuerablePromise(promise: any): any;
	/**
	 * Webpack adds node shim to the bundle overriding the `process` variable
	 * causing issues detecting nodejs environment. Creating a new function will
	 * help to avoid incorrect environment detection as new function will have
	 * it's `this` binded to global scope. Credit: https://stackoverflow.com/a/31090240
	 */
	static browserOrNode(): {
		isBrowser: any;
		isNode: any;
	};
	/**
	 * transfer the first letter of the keys to lowercase
	 * @param {Object} obj - the object need to be transferred
	 * @param {Array} whiteListForItself - whitelist itself from being transferred
	 * @param {Array} whiteListForChildren - whitelist its children keys from being transferred
	 */
	static transferKeyToLowerCase(
		obj: any,
		whiteListForItself?: any[],
		whiteListForChildren?: any[]
	): any;
	/**
	 * transfer the first letter of the keys to lowercase
	 * @param {Object} obj - the object need to be transferred
	 * @param {Array} whiteListForItself - whitelist itself from being transferred
	 * @param {Array} whiteListForChildren - whitelist its children keys from being transferred
	 */
	static transferKeyToUpperCase(
		obj: any,
		whiteListForItself?: any[],
		whiteListForChildren?: any[]
	): any;
	/**
	 * Return true if the object is a strict object
	 * which means it's not Array, Function, Number, String, Boolean or Null
	 * @param obj the Object
	 */
	static isStrictObject(obj: any): boolean;
}
