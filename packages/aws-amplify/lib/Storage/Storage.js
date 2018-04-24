"use strict";
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Common_1 = require("../Common");
var Auth_1 = require("../Auth");
var logger = new Common_1.ConsoleLogger('StorageClass');
var dispatchStorageEvent = function (track, attrs, metrics) {
    if (track) {
        Common_1.Hub.dispatch('storage', { attrs: attrs, metrics: metrics }, 'Storage');
    }
};
/**
 * Provide storage methods to use AWS S3
 */
var StorageClass = /** @class */ (function () {
    /**
     * Initialize Storage with AWS configurations
     * @param {Object} options - Configuration object for storage
     */
    function StorageClass(options) {
        this._options = options;
        logger.debug('Storage Options', this._options);
    }
    /**
     * Configure Storage part with aws configuration
     * @param {Object} config - Configuration of the Storage
     * @return {Object} - Current configuration
     */
    StorageClass.prototype.configure = function (options) {
        logger.debug('configure Storage');
        var opt = options ? options.Storage || options : {};
        if (options['aws_user_files_s3_bucket']) {
            opt = {
                bucket: options['aws_user_files_s3_bucket'],
                region: options['aws_user_files_s3_bucket_region']
            };
        }
        this._options = Object.assign({}, this._options, opt);
        if (!this._options.bucket) {
            logger.debug('Do not have bucket yet');
        }
        return this._options;
    };
    /**
    * Get a presigned URL of the file
    * @param {String} key - key of the object
    * @param {Object} [options] - { level : private|protected|public }
    * @return - A promise resolves to Amazon S3 presigned URL on success
    */
    StorageClass.prototype.get = function (key, options) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialsOK, opt, bucket, region, credentials, level, download, track, expires, prefix, final_key, s3, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.reject('No credentials')];
                        }
                        opt = Object.assign({}, this._options, options);
                        bucket = opt.bucket, region = opt.region, credentials = opt.credentials, level = opt.level, download = opt.download, track = opt.track, expires = opt.expires;
                        prefix = this._prefix(opt);
                        final_key = prefix + key;
                        s3 = this._createS3(opt);
                        logger.debug('get ' + key + ' from ' + final_key);
                        params = {
                            Bucket: bucket,
                            Key: final_key
                        };
                        if (download === true) {
                            return [2 /*return*/, new Promise(function (res, rej) {
                                    s3.getObject(params, function (err, data) {
                                        if (err) {
                                            dispatchStorageEvent(track, { method: 'get', result: 'failed' }, null);
                                            rej(err);
                                        }
                                        else {
                                            dispatchStorageEvent(track, { method: 'get', result: 'success' }, { fileSize: Number(data.Body['length']) });
                                            res(data);
                                        }
                                    });
                                })];
                        }
                        if (expires) {
                            params.Expires = expires;
                        }
                        return [2 /*return*/, new Promise(function (res, rej) {
                                try {
                                    var url = s3.getSignedUrl('getObject', params);
                                    dispatchStorageEvent(track, { method: 'get', result: 'success' }, null);
                                    res(url);
                                }
                                catch (e) {
                                    logger.warn('get signed url error', e);
                                    dispatchStorageEvent(track, { method: 'get', result: 'failed' }, null);
                                    rej(e);
                                }
                            })];
                }
            });
        });
    };
    /**
     * Put a file in S3 bucket specified to configure method
     * @param {Stirng} key - key of the object
     * @param {Object} object - File to be put in Amazon S3 bucket
     * @param {Object} [options] - { level : private|protected|public, contentType: MIME Types }
     * @return - promise resolves to object on success
     */
    StorageClass.prototype.put = function (key, object, options) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialsOK, opt, bucket, region, credentials, level, track, contentType, contentDisposition, cacheControl, expires, metadata, type, prefix, final_key, s3, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.reject('No credentials')];
                        }
                        opt = Object.assign({}, this._options, options);
                        bucket = opt.bucket, region = opt.region, credentials = opt.credentials, level = opt.level, track = opt.track;
                        contentType = opt.contentType, contentDisposition = opt.contentDisposition, cacheControl = opt.cacheControl, expires = opt.expires, metadata = opt.metadata;
                        type = contentType ? contentType : 'binary/octet-stream';
                        prefix = this._prefix(opt);
                        final_key = prefix + key;
                        s3 = this._createS3(opt);
                        logger.debug('put ' + key + ' to ' + final_key);
                        params = {
                            Bucket: bucket,
                            Key: final_key,
                            Body: object,
                            ContentType: type
                        };
                        if (cacheControl) {
                            params.CacheControl = cacheControl;
                        }
                        if (contentDisposition) {
                            params.ContentDisposition = contentDisposition;
                        }
                        if (expires) {
                            params.Expires = expires;
                        }
                        if (metadata) {
                            params.Metadata = metadata;
                        }
                        return [2 /*return*/, new Promise(function (res, rej) {
                                s3.upload(params, function (err, data) {
                                    if (err) {
                                        logger.warn("error uploading", err);
                                        dispatchStorageEvent(track, { method: 'put', result: 'failed' }, null);
                                        rej(err);
                                    }
                                    else {
                                        logger.debug('upload result', data);
                                        dispatchStorageEvent(track, { method: 'put', result: 'success' }, null);
                                        res({
                                            key: data.Key.substr(prefix.length)
                                        });
                                    }
                                });
                            })];
                }
            });
        });
    };
    /**
     * Remove the object for specified key
     * @param {String} key - key of the object
     * @param {Object} [options] - { level : private|protected|public }
     * @return - Promise resolves upon successful removal of the object
     */
    StorageClass.prototype.remove = function (key, options) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialsOK, opt, bucket, region, credentials, level, track, prefix, final_key, s3, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.reject('No credentials')];
                        }
                        opt = Object.assign({}, this._options, options);
                        bucket = opt.bucket, region = opt.region, credentials = opt.credentials, level = opt.level, track = opt.track;
                        prefix = this._prefix(opt);
                        final_key = prefix + key;
                        s3 = this._createS3(opt);
                        logger.debug('remove ' + key + ' from ' + final_key);
                        params = {
                            Bucket: bucket,
                            Key: final_key
                        };
                        return [2 /*return*/, new Promise(function (res, rej) {
                                s3.deleteObject(params, function (err, data) {
                                    if (err) {
                                        dispatchStorageEvent(track, { method: 'remove', result: 'failed' }, null);
                                        rej(err);
                                    }
                                    else {
                                        dispatchStorageEvent(track, { method: 'remove', result: 'success' }, null);
                                        res(data);
                                    }
                                });
                            })];
                }
            });
        });
    };
    /**
     * List bucket objects relative to the level and prefix specified
     * @param {String} path - the path that contains objects
     * @param {Object} [options] - { level : private|protected|public }
     * @return - Promise resolves to list of keys for all objects in path
     */
    StorageClass.prototype.list = function (path, options) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialsOK, opt, bucket, region, credentials, level, download, track, prefix, final_path, s3, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._ensureCredentials()];
                    case 1:
                        credentialsOK = _a.sent();
                        if (!credentialsOK) {
                            return [2 /*return*/, Promise.reject('No credentials')];
                        }
                        opt = Object.assign({}, this._options, options);
                        bucket = opt.bucket, region = opt.region, credentials = opt.credentials, level = opt.level, download = opt.download, track = opt.track;
                        prefix = this._prefix(opt);
                        final_path = prefix + path;
                        s3 = this._createS3(opt);
                        logger.debug('list ' + path + ' from ' + final_path);
                        params = {
                            Bucket: bucket,
                            Prefix: final_path
                        };
                        return [2 /*return*/, new Promise(function (res, rej) {
                                s3.listObjects(params, function (err, data) {
                                    if (err) {
                                        logger.warn('list error', err);
                                        dispatchStorageEvent(track, { method: 'list', result: 'failed' }, null);
                                        rej(err);
                                    }
                                    else {
                                        var list = data.Contents.map(function (item) {
                                            return {
                                                key: item.Key.substr(prefix.length),
                                                eTag: item.ETag,
                                                lastModified: item.LastModified,
                                                size: item.Size
                                            };
                                        });
                                        dispatchStorageEvent(track, { method: 'list', result: 'success' }, null);
                                        logger.debug('list', list);
                                        res(list);
                                    }
                                });
                            })];
                }
            });
        });
    };
    /**
     * @private
     */
    StorageClass.prototype._ensureCredentials = function () {
        // commented
        // will cause bug if another user logged in without refreshing page
        // if (this._options.credentials) { return Promise.resolve(true); }
        var _this = this;
        return Auth_1.default.currentCredentials()
            .then(function (credentials) {
            if (!credentials)
                return false;
            var cred = Auth_1.default.essentialCredentials(credentials);
            logger.debug('set credentials for storage', cred);
            _this._options.credentials = cred;
            return true;
        })
            .catch(function (err) {
            logger.warn('ensure credentials error', err);
            return false;
        });
    };
    /**
     * @private
     */
    StorageClass.prototype._prefix = function (options) {
        var credentials = options.credentials, level = options.level;
        var customPrefix = options.customPrefix || {};
        var privatePath = (customPrefix.private || 'private/') + credentials.identityId + '/';
        var protectedPath = (customPrefix.protected || 'protected/') + credentials.identityId + '/';
        var publicPath = customPrefix.public || 'public/';
        switch (level) {
            case 'private':
                return privatePath;
            case 'protected':
                return protectedPath;
            default:
                return publicPath;
        }
    };
    /**
     * @private
     */
    StorageClass.prototype._createS3 = function (options) {
        var bucket = options.bucket, region = options.region, credentials = options.credentials;
        Common_1.AWS.config.update({
            region: region,
            credentials: credentials
        });
        return new Common_1.S3({
            apiVersion: '2006-03-01',
            params: { Bucket: bucket },
            region: region
        });
    };
    return StorageClass;
}());
exports.default = StorageClass;
//# sourceMappingURL=Storage.js.map