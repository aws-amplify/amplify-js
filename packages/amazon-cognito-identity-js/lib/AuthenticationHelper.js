'use strict';

exports.__esModule = true;

var _buffer = require('buffer/');

var _cryptoBrowserify = require('crypto-browserify');

var crypto = _interopRequireWildcard(_cryptoBrowserify);

var _BigInteger = require('./BigInteger');

var _BigInteger2 = _interopRequireDefault(_BigInteger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*!
                                                                                                                                                           * Copyright 2016 Amazon.com,
                                                                                                                                                           * Inc. or its affiliates. All Rights Reserved.
                                                                                                                                                           *
                                                                                                                                                           * Licensed under the Amazon Software License (the "License").
                                                                                                                                                           * You may not use this file except in compliance with the
                                                                                                                                                           * License. A copy of the License is located at
                                                                                                                                                           *
                                                                                                                                                           *     http://aws.amazon.com/asl/
                                                                                                                                                           *
                                                                                                                                                           * or in the "license" file accompanying this file. This file is
                                                                                                                                                           * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
                                                                                                                                                           * CONDITIONS OF ANY KIND, express or implied. See the License
                                                                                                                                                           * for the specific language governing permissions and
                                                                                                                                                           * limitations under the License.
                                                                                                                                                           */

var createHash = crypto.createHash;
var createHmac = crypto.createHmac;
var randomBytes = crypto.randomBytes;

var initN = 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1' + '29024E088A67CC74020BBEA63B139B22514A08798E3404DD' + 'EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245' + 'E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED' + 'EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D' + 'C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F' + '83655D23DCA3AD961C62F356208552BB9ED529077096966D' + '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B' + 'E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9' + 'DE2BCBF6955817183995497CEA956AE515D2261898FA0510' + '15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64' + 'ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7' + 'ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B' + 'F12FFA06D98A0864D87602733EC86A64521F2B18177B200C' + 'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31' + '43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF';

var newPasswordRequiredChallengeUserAttributePrefix = 'userAttributes.';

/** @class */

var AuthenticationHelper = function () {
  /**
   * Constructs a new AuthenticationHelper object
   * @param {string} PoolName Cognito user pool name.
   */
  function AuthenticationHelper(PoolName) {
    _classCallCheck(this, AuthenticationHelper);

    this.N = new _BigInteger2.default(initN, 16);
    this.g = new _BigInteger2.default('2', 16);
    this.k = new _BigInteger2.default(this.hexHash('00' + this.N.toString(16) + '0' + this.g.toString(16)), 16);

    this.smallAValue = this.generateRandomSmallA();
    this.getLargeAValue(function () {});

    this.infoBits = _buffer.Buffer.from('Caldera Derived Key', 'utf8');

    this.poolName = PoolName;
  }

  /**
   * @returns {BigInteger} small A, a random number
   */


  AuthenticationHelper.prototype.getSmallAValue = function getSmallAValue() {
    return this.smallAValue;
  };

  /**
   * @param {nodeCallback<BigInteger>} callback Called with (err, largeAValue)
   * @returns {void}
   */


  AuthenticationHelper.prototype.getLargeAValue = function getLargeAValue(callback) {
    var _this = this;

    if (this.largeAValue) {
      callback(null, this.largeAValue);
    } else {
      this.calculateA(this.smallAValue, function (err, largeAValue) {
        if (err) {
          callback(err, null);
        }

        _this.largeAValue = largeAValue;
        callback(null, _this.largeAValue);
      });
    }
  };

  /**
   * helper function to generate a random big integer
   * @returns {BigInteger} a random value.
   * @private
   */


  AuthenticationHelper.prototype.generateRandomSmallA = function generateRandomSmallA() {
    var hexRandom = randomBytes(128).toString('hex');

    var randomBigInt = new _BigInteger2.default(hexRandom, 16);
    var smallABigInt = randomBigInt.mod(this.N);

    return smallABigInt;
  };

  /**
   * helper function to generate a random string
   * @returns {string} a random value.
   * @private
   */


  AuthenticationHelper.prototype.generateRandomString = function generateRandomString() {
    return randomBytes(40).toString('base64');
  };

  /**
   * @returns {string} Generated random value included in password hash.
   */


  AuthenticationHelper.prototype.getRandomPassword = function getRandomPassword() {
    return this.randomPassword;
  };

  /**
   * @returns {string} Generated random value included in devices hash.
   */


  AuthenticationHelper.prototype.getSaltDevices = function getSaltDevices() {
    return this.SaltToHashDevices;
  };

  /**
   * @returns {string} Value used to verify devices.
   */


  AuthenticationHelper.prototype.getVerifierDevices = function getVerifierDevices() {
    return this.verifierDevices;
  };

  /**
   * Generate salts and compute verifier.
   * @param {string} deviceGroupKey Devices to generate verifier for.
   * @param {string} username User to generate verifier for.
   * @param {nodeCallback<null>} callback Called with (err, null)
   * @returns {void}
   */


  AuthenticationHelper.prototype.generateHashDevice = function generateHashDevice(deviceGroupKey, username, callback) {
    var _this2 = this;

    this.randomPassword = this.generateRandomString();
    var combinedString = '' + deviceGroupKey + username + ':' + this.randomPassword;
    var hashedString = this.hash(combinedString);

    var hexRandom = randomBytes(16).toString('hex');
    this.SaltToHashDevices = this.padHex(new _BigInteger2.default(hexRandom, 16));

    this.g.modPow(new _BigInteger2.default(this.hexHash(this.SaltToHashDevices + hashedString), 16), this.N, function (err, verifierDevicesNotPadded) {
      if (err) {
        callback(err, null);
      }

      _this2.verifierDevices = _this2.padHex(verifierDevicesNotPadded);
      callback(null, null);
    });
  };

  /**
   * Calculate the client's public value A = g^a%N
   * with the generated random number a
   * @param {BigInteger} a Randomly generated small A.
   * @param {nodeCallback<BigInteger>} callback Called with (err, largeAValue)
   * @returns {void}
   * @private
   */


  AuthenticationHelper.prototype.calculateA = function calculateA(a, callback) {
    var _this3 = this;

    this.g.modPow(a, this.N, function (err, A) {
      if (err) {
        callback(err, null);
      }

      if (A.mod(_this3.N).equals(_BigInteger2.default.ZERO)) {
        callback(new Error('Illegal paramater. A mod N cannot be 0.'), null);
      }

      callback(null, A);
    });
  };

  /**
   * Calculate the client's value U which is the hash of A and B
   * @param {BigInteger} A Large A value.
   * @param {BigInteger} B Server B value.
   * @returns {BigInteger} Computed U value.
   * @private
   */


  AuthenticationHelper.prototype.calculateU = function calculateU(A, B) {
    this.UHexHash = this.hexHash(this.padHex(A) + this.padHex(B));
    var finalU = new _BigInteger2.default(this.UHexHash, 16);

    return finalU;
  };

  /**
   * Calculate a hash from a bitArray
   * @param {Buffer} buf Value to hash.
   * @returns {String} Hex-encoded hash.
   * @private
   */


  AuthenticationHelper.prototype.hash = function hash(buf) {
    var hashHex = createHash('sha256').update(buf).digest('hex');
    return new Array(64 - hashHex.length).join('0') + hashHex;
  };

  /**
   * Calculate a hash from a hex string
   * @param {String} hexStr Value to hash.
   * @returns {String} Hex-encoded hash.
   * @private
   */


  AuthenticationHelper.prototype.hexHash = function hexHash(hexStr) {
    return this.hash(_buffer.Buffer.from(hexStr, 'hex'));
  };

  /**
   * Standard hkdf algorithm
   * @param {Buffer} ikm Input key material.
   * @param {Buffer} salt Salt value.
   * @returns {Buffer} Strong key material.
   * @private
   */


  AuthenticationHelper.prototype.computehkdf = function computehkdf(ikm, salt) {
    var prk = createHmac('sha256', salt).update(ikm).digest();
    var infoBitsUpdate = _buffer.Buffer.concat([this.infoBits, _buffer.Buffer.from(String.fromCharCode(1), 'utf8')]);
    var hmac = createHmac('sha256', prk).update(infoBitsUpdate).digest();
    return hmac.slice(0, 16);
  };

  /**
   * Calculates the final hkdf based on computed S value, and computed U value and the key
   * @param {String} username Username.
   * @param {String} password Password.
   * @param {BigInteger} serverBValue Server B value.
   * @param {BigInteger} salt Generated salt.
   * @param {nodeCallback<Buffer>} callback Called with (err, hkdfValue)
   * @returns {void}
   */


  AuthenticationHelper.prototype.getPasswordAuthenticationKey = function getPasswordAuthenticationKey(username, password, serverBValue, salt, callback) {
    var _this4 = this;

    if (serverBValue.mod(this.N).equals(_BigInteger2.default.ZERO)) {
      throw new Error('B cannot be zero.');
    }

    this.UValue = this.calculateU(this.largeAValue, serverBValue);

    if (this.UValue.equals(_BigInteger2.default.ZERO)) {
      throw new Error('U cannot be zero.');
    }

    var usernamePassword = '' + this.poolName + username + ':' + password;
    var usernamePasswordHash = this.hash(usernamePassword);

    var xValue = new _BigInteger2.default(this.hexHash(this.padHex(salt) + usernamePasswordHash), 16);
    this.calculateS(xValue, serverBValue, function (err, sValue) {
      if (err) {
        callback(err, null);
      }

      var hkdf = _this4.computehkdf(_buffer.Buffer.from(_this4.padHex(sValue), 'hex'), _buffer.Buffer.from(_this4.padHex(_this4.UValue.toString(16)), 'hex'));

      callback(null, hkdf);
    });
  };

  /**
   * Calculates the S value used in getPasswordAuthenticationKey
   * @param {BigInteger} xValue Salted password hash value.
   * @param {BigInteger} serverBValue Server B value.
   * @param {nodeCallback<string>} callback Called on success or error.
   * @returns {void}
   */


  AuthenticationHelper.prototype.calculateS = function calculateS(xValue, serverBValue, callback) {
    var _this5 = this;

    this.g.modPow(xValue, this.N, function (err, gModPowXN) {
      if (err) {
        callback(err, null);
      }

      var intValue2 = serverBValue.subtract(_this5.k.multiply(gModPowXN));
      intValue2.modPow(_this5.smallAValue.add(_this5.UValue.multiply(xValue)), _this5.N, function (err2, result) {
        if (err2) {
          callback(err2, null);
        }

        callback(null, result.mod(_this5.N));
      });
    });
  };

  /**
  * Return constant newPasswordRequiredChallengeUserAttributePrefix
  * @return {newPasswordRequiredChallengeUserAttributePrefix} constant prefix value
  */


  AuthenticationHelper.prototype.getNewPasswordRequiredChallengeUserAttributePrefix = function getNewPasswordRequiredChallengeUserAttributePrefix() {
    return newPasswordRequiredChallengeUserAttributePrefix;
  };

  /**
   * Converts a BigInteger (or hex string) to hex format padded with zeroes for hashing
   * @param {BigInteger|String} bigInt Number or string to pad.
   * @returns {String} Padded hex string.
   */


  AuthenticationHelper.prototype.padHex = function padHex(bigInt) {
    var hashStr = bigInt.toString(16);
    if (hashStr.length % 2 === 1) {
      hashStr = '0' + hashStr;
    } else if ('89ABCDEFabcdef'.indexOf(hashStr[0]) !== -1) {
      hashStr = '00' + hashStr;
    }
    return hashStr;
  };

  return AuthenticationHelper;
}();

exports.default = AuthenticationHelper;