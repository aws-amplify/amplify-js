var __extends =
	(this && this.__extends) ||
	(function() {
		var extendStatics = function(d, b) {
			extendStatics =
				Object.setPrototypeOf ||
				({ __proto__: [] } instanceof Array &&
					function(d, b) {
						d.__proto__ = b;
					}) ||
				function(d, b) {
					for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
				};
			return extendStatics(d, b);
		};
		return function(d, b) {
			extendStatics(d, b);
			function __() {
				this.constructor = d;
			}
			d.prototype =
				b === null
					? Object.create(b)
					: ((__.prototype = b.prototype), new __());
		};
	})();
var __assign =
	(this && this.__assign) ||
	function() {
		__assign =
			Object.assign ||
			function(t) {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (var p in s)
						if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
				}
				return t;
			};
		return __assign.apply(this, arguments);
	};
var __awaiter =
	(this && this.__awaiter) ||
	function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function(resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function(thisArg, body) {
		var _ = {
				label: 0,
				sent: function() {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g;
		return (
			(g = { next: verb(0), throw: verb(1), return: verb(2) }),
			typeof Symbol === 'function' &&
				(g[Symbol.iterator] = function() {
					return this;
				}),
			g
		);
		function verb(n) {
			return function(v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError('Generator is already executing.');
			while (_)
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y['return']
									: op[0]
									? y['throw'] || ((t = y['return']) && t.call(y), 0)
									: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
import { Credentials } from '@aws-amplify/core';
import Storage from '@aws-amplify/storage';
import { AbstractIdentifyPredictionsProvider } from '../types/Providers';
import * as Rekognition from 'aws-sdk/clients/rekognition';
import {
	isStorageSource,
	isFileSource,
	isBytesSource,
	isIdentifyCelebrities,
	isIdentifyFromCollection,
} from '../types';
import * as Textract from 'aws-sdk/clients/textract';
import { makeCamelCase, makeCamelCaseArray, blobToArrayBuffer } from './Utils';
import {
	categorizeRekognitionBlocks,
	categorizeTextractBlocks,
} from './IdentifyTextUtils';
var AmazonAIIdentifyPredictionsProvider = /** @class */ (function(_super) {
	__extends(AmazonAIIdentifyPredictionsProvider, _super);
	function AmazonAIIdentifyPredictionsProvider() {
		return _super.call(this) || this;
	}
	AmazonAIIdentifyPredictionsProvider.prototype.getProviderName = function() {
		return 'AmazonAIIdentifyPredictionsProvider';
	};
	/**
	 * Verify user input source and converts it into source object readable by Rekognition and Textract.
	 * Note that Rekognition and Textract use the same source interface, so we need not worry about types.
	 * @param {IdentifySource} source - User input source that directs to the object user wants
	 * to identify (storage, file, or bytes).
	 * @return {Promise<Rekognition.Image>} - Promise resolving to the converted source object.
	 */
	AmazonAIIdentifyPredictionsProvider.prototype.configureSource = function(
		source
	) {
		return new Promise(function(res, rej) {
			if (isStorageSource(source)) {
				var storageConfig = {
					level: source.level,
					identityId: source.identityId,
				};
				Storage.get(source.key, storageConfig)
					.then(function(url) {
						var parser = /https:\/\/([a-zA-Z0-9%-_.]+)\.s3\.[A-Za-z0-9%-._~]+\/([a-zA-Z0-9%-._~/]+)\?/;
						var parsedURL = url.match(parser);
						if (parsedURL.length < 3) rej('Invalid S3 key was given.');
						res({ S3Object: { Bucket: parsedURL[1], Name: parsedURL[2] } });
					})
					.catch(function(err) {
						return rej(err);
					});
			} else if (isFileSource(source)) {
				blobToArrayBuffer(source.file)
					.then(function(buffer) {
						res({ Bytes: buffer });
					})
					.catch(function(err) {
						return rej(err);
					});
			} else if (isBytesSource(source)) {
				var bytes = source.bytes;
				if (bytes instanceof Blob) {
					blobToArrayBuffer(bytes)
						.then(function(buffer) {
							res({ Bytes: buffer });
						})
						.catch(function(err) {
							return rej(err);
						});
				}
				// everything else can be directly passed to Rekognition / Textract.
				res({ Bytes: bytes });
			} else {
				rej('Input source is not configured correctly.');
			}
		});
	};
	/**
	 * Recognize text from real-world images and documents (plain text, forms and tables). Detects text in the input
	 * image and converts it into machine-readable text.
	 * @param {IdentifySource} source - Object containing the source image and feature types to analyze.
	 * @return {Promise<IdentifyTextOutput>} - Promise resolving to object containing identified texts.
	 */
	AmazonAIIdentifyPredictionsProvider.prototype.identifyText = function(input) {
		var _this = this;
		return new Promise(function(res, rej) {
			return __awaiter(_this, void 0, void 0, function() {
				var credentials,
					_a,
					_b,
					_c,
					region,
					_d,
					_e,
					configFormat,
					inputDocument,
					format,
					featureTypes,
					textractParam_1,
					rekognitionParam,
					param;
				var _this = this;
				return __generator(this, function(_f) {
					switch (_f.label) {
						case 0:
							return [4 /*yield*/, Credentials.get()];
						case 1:
							credentials = _f.sent();
							if (!credentials) return [2 /*return*/, rej('No credentials')];
							(_a = this._config.identifyText),
								(_b = _a === void 0 ? {} : _a),
								(_c = _b.region),
								(region = _c === void 0 ? '' : _c),
								(_d = _b.defaults),
								(_e = (_d === void 0 ? {} : _d).format),
								(configFormat = _e === void 0 ? 'PLAIN' : _e);
							this.rekognition = new Rekognition({
								region: region,
								credentials: credentials,
							});
							this.textract = new Textract({
								region: region,
								credentials: credentials,
							});
							return [
								4 /*yield*/,
								this.configureSource(input.text.source)
									.then(function(data) {
										return (inputDocument = data);
									})
									.catch(function(err) {
										rej(err);
									}),
							];
						case 2:
							_f.sent();
							format = input.text.format || configFormat;
							featureTypes = [];
							if (format === 'FORM' || format === 'ALL')
								featureTypes.push('FORMS');
							if (format === 'TABLE' || format === 'ALL')
								featureTypes.push('TABLES');
							if (featureTypes.length === 0) {
								textractParam_1 = {
									Document: inputDocument,
								};
								rekognitionParam = {
									Image: inputDocument,
								};
								this.rekognition.detectText(rekognitionParam, function(
									rekognitionErr,
									rekognitionData
								) {
									if (rekognitionErr) return rej(rekognitionErr);
									var rekognitionResponse = categorizeRekognitionBlocks(
										rekognitionData.TextDetections
									);
									if (rekognitionResponse.text.words.length < 50) {
										// did not hit the word limit, return the data
										return res(rekognitionResponse);
									}
									_this.textract.detectDocumentText(textractParam_1, function(
										textractErr,
										textractData
									) {
										if (textractErr) return rej(textractErr);
										// use the service that identified more texts.
										if (
											rekognitionData.TextDetections.length >
											textractData.Blocks.length
										) {
											return res(rekognitionResponse);
										} else {
											return res(categorizeTextractBlocks(textractData.Blocks));
										}
									});
								});
							} else {
								param = {
									Document: inputDocument,
									FeatureTypes: featureTypes,
								};
								this.textract.analyzeDocument(param, function(err, data) {
									if (err) return rej(err);
									var blocks = data.Blocks;
									res(categorizeTextractBlocks(blocks));
								});
							}
							return [2 /*return*/];
					}
				});
			});
		});
	};
	/**
	 * Identify instances of real world entities from an image and if it contains unsafe content.
	 * @param {IdentifyLabelsInput} input - Object containing the source image and entity type to identify.
	 * @return {Promise<IdentifyLabelsOutput>} - Promise resolving to an array of identified entities.
	 */
	AmazonAIIdentifyPredictionsProvider.prototype.identifyLabels = function(
		input
	) {
		var _this = this;
		return new Promise(function(res, rej) {
			return __awaiter(_this, void 0, void 0, function() {
				var credentials,
					_a,
					_b,
					_c,
					region,
					_d,
					_e,
					type,
					inputImage,
					param,
					servicePromises,
					entityType;
				return __generator(this, function(_f) {
					switch (_f.label) {
						case 0:
							return [4 /*yield*/, Credentials.get()];
						case 1:
							credentials = _f.sent();
							if (!credentials) return [2 /*return*/, rej('No credentials')];
							(_a = this._config.identifyLabels),
								(_b = _a === void 0 ? {} : _a),
								(_c = _b.region),
								(region = _c === void 0 ? '' : _c),
								(_d = _b.defaults),
								(_e = (_d === void 0 ? {} : _d).type),
								(type = _e === void 0 ? 'LABELS' : _e);
							this.rekognition = new Rekognition({
								region: region,
								credentials: credentials,
							});
							return [
								4 /*yield*/,
								this.configureSource(input.labels.source)
									.then(function(data) {
										inputImage = data;
									})
									.catch(function(err) {
										return rej(err);
									}),
							];
						case 2:
							_f.sent();
							param = { Image: inputImage };
							servicePromises = [];
							entityType = input.labels.type || type;
							if (entityType === 'LABELS' || entityType === 'ALL') {
								servicePromises.push(this.detectLabels(param));
							}
							if (entityType === 'UNSAFE' || entityType === 'ALL') {
								servicePromises.push(this.detectModerationLabels(param));
							}
							// if (servicePromises.length === 0) {
							//     rej('You must specify entity type: LABELS | UNSAFE | ALL');
							// }
							Promise.all(servicePromises)
								.then(function(data) {
									var identifyResult = {};
									// concatenate resolved promises to a single object
									data.forEach(function(val) {
										identifyResult = __assign(
											__assign({}, identifyResult),
											val
										);
									});
									res(identifyResult);
								})
								.catch(function(err) {
									return rej(err);
								});
							return [2 /*return*/];
					}
				});
			});
		});
	};
	/**
	 * Calls Rekognition.detectLabels and organizes the returned data.
	 * @param {Rekognition.DetectLabelsRequest} param - parameter to be passed onto Rekognition
	 * @return {Promise<IdentifyLabelsOutput>} - Promise resolving to organized detectLabels response.
	 */
	AmazonAIIdentifyPredictionsProvider.prototype.detectLabels = function(param) {
		var _this = this;
		return new Promise(function(res, rej) {
			_this.rekognition.detectLabels(param, function(err, data) {
				if (err) return rej(err);
				if (!data.Labels) return res({ labels: null }); // no image was detected
				var detectLabelData = data.Labels.map(function(val) {
					var boxes = val.Instances
						? val.Instances.map(function(val) {
								return makeCamelCase(val.BoundingBox);
						  })
						: undefined;
					return {
						name: val.Name,
						boundingBoxes: boxes,
						metadata: {
							confidence: val.Confidence,
							parents: makeCamelCaseArray(val.Parents),
						},
					};
				});
				return res({ labels: detectLabelData });
			});
		});
	};
	/**
	 * Calls Rekognition.detectModerationLabels and organizes the returned data.
	 * @param {Rekognition.DetectLabelsRequest} param - Parameter to be passed onto Rekognition
	 * @return {Promise<IdentifyLabelsOutput>} - Promise resolving to organized detectModerationLabels response.
	 */
	AmazonAIIdentifyPredictionsProvider.prototype.detectModerationLabels = function(
		param
	) {
		var _this = this;
		return new Promise(function(res, rej) {
			_this.rekognition.detectModerationLabels(param, function(err, data) {
				if (err) return rej(err);
				if (data.ModerationLabels.length !== 0) {
					return res({ unsafe: 'YES' });
				} else {
					return res({ unsafe: 'NO' });
				}
			});
		});
	};
	/**
	 * Identify faces within an image that is provided as input, and match faces from a collection
	 * or identify celebrities.
	 * @param {IdentifyEntityInput} input - object containing the source image and face match options.
	 * @return {Promise<IdentifyEntityOutput>} Promise resolving to identify results.
	 */
	AmazonAIIdentifyPredictionsProvider.prototype.identifyEntities = function(
		input
	) {
		var _this = this;
		return new Promise(function(res, rej) {
			return __awaiter(_this, void 0, void 0, function() {
				var credentials,
					_a,
					_b,
					_c,
					region,
					_d,
					celebrityDetectionEnabled,
					_e,
					_f,
					_g,
					collectionIdConfig,
					_h,
					maxFacesConfig,
					inputImage,
					param,
					_j,
					_k,
					collectionId,
					_l,
					maxFaces,
					updatedParam;
				var _this = this;
				return __generator(this, function(_m) {
					switch (_m.label) {
						case 0:
							return [4 /*yield*/, Credentials.get()];
						case 1:
							credentials = _m.sent();
							if (!credentials) return [2 /*return*/, rej('No credentials')];
							(_a = this._config.identifyEntities),
								(_b = _a === void 0 ? {} : _a),
								(_c = _b.region),
								(region = _c === void 0 ? '' : _c),
								(_d = _b.celebrityDetectionEnabled),
								(celebrityDetectionEnabled = _d === void 0 ? false : _d),
								(_e = _b.defaults),
								(_f = _e === void 0 ? {} : _e),
								(_g = _f.collectionId),
								(collectionIdConfig = _g === void 0 ? '' : _g),
								(_h = _f.maxEntities),
								(maxFacesConfig = _h === void 0 ? 50 : _h);
							// default arguments
							this.rekognition = new Rekognition({
								region: region,
								credentials: credentials,
							});
							return [
								4 /*yield*/,
								this.configureSource(input.entities.source)
									.then(function(data) {
										return (inputImage = data);
									})
									.catch(function(err) {
										return rej(err);
									}),
							];
						case 2:
							_m.sent();
							param = { Image: inputImage };
							if (
								isIdentifyCelebrities(input.entities) &&
								input.entities.celebrityDetection
							) {
								if (!celebrityDetectionEnabled) {
									return [
										2 /*return*/,
										rej('Error: You have to enable celebrity detection first'),
									];
								}
								this.rekognition.recognizeCelebrities(param, function(
									err,
									data
								) {
									if (err) return rej(err);
									var faces = data.CelebrityFaces.map(function(celebrity) {
										return {
											boundingBox: makeCamelCase(celebrity.Face.BoundingBox),
											landmarks: makeCamelCaseArray(celebrity.Face.Landmarks),
											metadata: __assign(
												__assign(
													{},
													makeCamelCase(celebrity, ['Id', 'Name', 'Urls'])
												),
												{ pose: makeCamelCase(celebrity.Face.Pose) }
											),
										};
									});
									res({ entities: faces });
								});
							} else if (
								isIdentifyFromCollection(input.entities) &&
								input.entities.collection
							) {
								(_j = input.entities),
									(_k = _j.collectionId),
									(collectionId = _k === void 0 ? collectionIdConfig : _k),
									(_l = _j.maxEntities),
									(maxFaces = _l === void 0 ? maxFacesConfig : _l);
								updatedParam = __assign(__assign({}, param), {
									CollectionId: collectionId,
									MaxFaces: maxFaces,
								});
								this.rekognition.searchFacesByImage(updatedParam, function(
									err,
									data
								) {
									if (err) return rej(err);
									var faces = data.FaceMatches.map(function(val) {
										return {
											boundingBox: makeCamelCase(val.Face.BoundingBox),
											metadata: {
												externalImageId: _this.decodeExternalImageId(
													val.Face.ExternalImageId
												),
												similarity: val.Similarity,
											},
										};
									});
									res({ entities: faces });
								});
							} else {
								this.rekognition.detectFaces(param, function(err, data) {
									if (err) return rej(err);
									var faces = data.FaceDetails.map(function(detail) {
										// face attributes keys we want to extract from Rekognition's response
										var attributeKeys = [
											'Smile',
											'Eyeglasses',
											'Sunglasses',
											'Gender',
											'Beard',
											'Mustache',
											'EyesOpen',
											'MouthOpen',
										];
										var faceAttributes = makeCamelCase(detail, attributeKeys);
										if (detail.Emotions) {
											faceAttributes['emotions'] = detail.Emotions.map(function(
												emotion
											) {
												return emotion.Type;
											});
										}
										return {
											boundingBox: makeCamelCase(detail.BoundingBox),
											landmarks: makeCamelCaseArray(detail.Landmarks),
											ageRange: makeCamelCase(detail.AgeRange),
											attributes: makeCamelCase(detail, attributeKeys),
											metadata: {
												confidence: detail.Confidence,
												pose: makeCamelCase(detail.Pose),
											},
										};
									});
									res({ entities: faces });
								});
							}
							return [2 /*return*/];
					}
				});
			});
		});
	};
	AmazonAIIdentifyPredictionsProvider.prototype.decodeExternalImageId = function(
		externalImageId
	) {
		return ('' + externalImageId).replace(/::/g, '/');
	};
	return AmazonAIIdentifyPredictionsProvider;
})(AbstractIdentifyPredictionsProvider);
export default AmazonAIIdentifyPredictionsProvider;
//# sourceMappingURL=AmazonAIIdentifyPredictionsProvider.js.map
