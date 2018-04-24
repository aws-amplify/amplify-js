import { Logger } from './logger-interface';
/**
* Write logs
* @class Logger
*/
export declare class ConsoleLogger implements Logger {
    name: string;
    level: string;
    /**
    * @constructor
    * @param {string} name - Name of the logger
    */
    constructor(name: any, level?: string);
    static LOG_LEVEL: any;
    _padding(n: any): string;
    _ts(): string;
    /**
    * Write log
    * @method
    * @memeberof Logger
    * @param {string} type - log type, default INFO
    * @param {string|object} msg - Logging message or object
    */
    _log(type: string, ...msg: any[]): void;
    /**
    * Write General log. Default to INFO
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    log(...msg: any[]): void;
    /**
    * Write INFO log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    info(...msg: any[]): void;
    /**
    * Write WARN log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    warn(...msg: any[]): void;
    /**
    * Write ERROR log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    error(...msg: any[]): void;
    /**
    * Write DEBUG log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    debug(...msg: any[]): void;
    /**
    * Write VERBOSE log
    * @method
    * @memeberof Logger
    * @param {string|object} msg - Logging message or object
    */
    verbose(...msg: any[]): void;
}
