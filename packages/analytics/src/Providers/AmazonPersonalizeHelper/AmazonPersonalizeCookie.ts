import { ConsoleLogger as Logger, JS } from '@aws-amplify/core';

const logger = new Logger('AmazonPersonalizeProvider');

export const isCookieEnabled = (key: string): boolean => {
    const COOKIE_TEST_VALUE = "enabled";
    this.setCookie(key, COOKIE_TEST_VALUE, 1);
    const isEnabled = readCookie(key) === COOKIE_TEST_VALUE;
    return isEnabled;
};

export const setCookie = (cookieName,cookieValue,nDays): void => {
    const today = new Date();
    const expire = new Date();
    if (nDays === null || nDays === 0) {
        expire.setTime(today.getTime() + 3600000 * 24 * 1);
    } else {
        expire.setTime(today.getTime() + 3600000 * 24 * nDays);
    }

    const isBrowser = JS.browserOrNode().isBrowser;
    if (isBrowser) {
        document.cookie = cookieName + "=" + escape(cookieValue)
            + ";expires=" + expire.toUTCString();
    } else {
        logger.debug('Not for browser');
    }
};
/**
 * retrieve cookie from document cookie based on the cookie name 
 */
export const readCookie = (cookieName): string => {
    const isBrowser = JS.browserOrNode().isBrowser;
    if (isBrowser) {
        const theCookie = document.cookie;
        let ind = theCookie.indexOf(cookieName+"=");
        if (ind === -1) ind = theCookie.indexOf(";" + cookieName + "=");
        if (ind === -1 || cookieName === "") return "";
        let ind1 = theCookie.indexOf(";", ind + 1);
        if (ind1 === -1) ind1 = theCookie.length;
        return unescape(theCookie.substring(ind + cookieName.length + 1, ind1));
    } else {
        logger.debug('Not for browser');
    }
};
