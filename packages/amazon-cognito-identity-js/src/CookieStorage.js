
import * as hardtack from 'hardtack';

/** @class */
export default class CookieStorage {

  /**
   * Constructs a new CookieStorage object
   * @param {object} data Creation options.
   * @param {string} data.domain Cookies domain (mandatory).
   * @param {string} data.path Cookies path (default: '/')
   * @param {integer} data.expires Cookie expiration (in days, default: 365)
   * @param {boolean} data.secure Cookie secure flag (default: true)
   */
  constructor(data) {
    this.domain = data.domain;
    if (data.path) {
      this.path = data.path;
    } else {
      this.path = '/';
    }
    if (Object.prototype.hasOwnProperty.call(data, 'expires')) {
      this.expires = new Date(
        (new Date() * 1) + (data.expires * 864e5)
      ).toUTCString();
    } else {
      this.expires = new Date((new Date() * 1) + (365 * 864e5)).toUTCString();
    }
    if (Object.prototype.hasOwnProperty.call(data, 'secure')) {
      this.secure = data.secure;
    } else {
      this.secure = true;
    }
  }

  /**
   * This is used to set a specific item in storage
   * @param {string} key - the key for the item
   * @param {object} value - the value
   * @returns {string} value that was set
   */
  setItem(key, value) {
    hardtack.set(key, value, {
      path: this.path,
      expires: this.expires,
      domain: this.domain,
      secure: this.secure,
    }
    );
    return hardtack.get(key);
  }

  /**
   * This is used to get a specific key from storage
   * @param {string} key - the key for the item
   * This is used to clear the storage
   * @returns {string} the data item
   */
  getItem(key) {
    return hardtack.get(key);
  }

  /**
   * This is used to remove an item from storage
   * @param {string} key - the key being set
   * @returns {string} value - value that was deleted
   */
  removeItem(key) {
    return hardtack.remove(key, {
      path: this.path,
      domain: this.domain,
      secure: this.secure,
    }
    );
  }

  /**
   * This is used to clear the storage
   * @returns {string} nothing
   */
  clear() {
    const cookies = hardtack.get();
    let index;
    for (index = 0; index < cookies.length; ++index) {
      hardtack.remove(cookies[index]);
    }
    return {};
  }
}
