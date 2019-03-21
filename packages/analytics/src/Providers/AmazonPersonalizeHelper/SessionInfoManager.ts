import {RequestParams, SessionInfo} from './DataType';
import {isEmpty, isEqual} from "lodash";
import { v1 as uuid } from 'uuid';
import {readCookie, setCookie, isCookieEnabled} from './AmazonPersonalizeCookie';
import { StorageHelper, ConsoleLogger as Logger, JS } from '@aws-amplify/core';

const PERSONALIZE_COOKIE = "_awsct";
const PERSONALIZE_COOKIE_USERID = "_awsct_uid";
const PERSONALIZE_COOKIE_SESSIONID = "_awsct_sid";
const TIMER_INTERVAL = 30 * 1000;
const DELIMITER = ".";
const COOKIE_EXPIRY_IN_DAYS = 7;
const logger = new Logger('AmazonPersonalizeProvider');

export class SessionInfoManager {
    private _isCookieEnabled;
    private _isBrowser;
    private _cache;
    private _timer;
    private _timerKey;

    constructor(prefixKey="") {
        this._timerKey = uuid().substr(0,15);
        this._isCookieEnabled = isCookieEnabled(PERSONALIZE_COOKIE);
        this._isBrowser = JS.browserOrNode().isBrowser;
        if (!this._isCookieEnabled) {
            this._cache = new StorageHelper().getStorage();
        }
        this._refreshTimer();
    }

    private _refreshTimer() {
        if (this._timer) {
            clearInterval(this._timer);
        }
        const that = this;
        this._timer = setInterval(
            () => {
                that._timerKey = uuid().substr(0,15);
            },
            TIMER_INTERVAL
        );
    }

    private storeValue(key: string, value: any): void {
        if (this._isCookieEnabled) {
            setCookie(key, value, COOKIE_EXPIRY_IN_DAYS);
        } else {
            this._cache.setItem(this._getCachePrefix(key), value);
        }
    }

    private retrieveValue(key: string): any {
        if (this._isCookieEnabled) {
            return readCookie(key);
        }
        return this._cache.getItem(this._getCachePrefix(key));
    }

    private _getCachePrefix(key): string {
        if (this._isBrowser) {
            return key + DELIMITER + window.location.host;
        }
        logger.debug("Not for browser");
    }

    public getTimerKey() {
        return this._timerKey;
    }

    public updateSessionInfo(userId: string, sessionInfo: SessionInfo) {
        const existUserId = sessionInfo.userId;
        const existSessionId = sessionInfo.sessionId;
        if (this._isRequireNewSession(userId, existUserId, existSessionId)) {
            const newSessionId = uuid();
            this.storeValue(PERSONALIZE_COOKIE_USERID, userId);
            this.storeValue(PERSONALIZE_COOKIE_SESSIONID, newSessionId);
            sessionInfo.sessionId = newSessionId;
        } else if (this._isRequireUpdateSessionInfo(userId, existUserId, existSessionId)){
            this.storeValue(PERSONALIZE_COOKIE_USERID, userId);
        }
        sessionInfo.userId = userId;
    }

    private _isRequireUpdateSessionInfo(userId: string, cachedSessionUserId: string, cachedSessionSessionId: string) :
    boolean {
        // anonymouse => sign in : hasSession && s_userId == null && curr_userId !=null
        const isNoCachedSession : boolean = isEmpty(cachedSessionSessionId);
        return !isNoCachedSession && isEmpty(cachedSessionUserId) && !isEmpty(userId);
    }    

    public retrieveSessionInfo(trackingId: string): SessionInfo {
        const sessionInfo = <SessionInfo>{};
        sessionInfo.trackingId = trackingId;
        sessionInfo.sessionId = this.retrieveValue(PERSONALIZE_COOKIE_SESSIONID);
        sessionInfo.userId = this.retrieveValue(PERSONALIZE_COOKIE_USERID);
        if (isEmpty(sessionInfo.sessionId)) {
            sessionInfo.sessionId = uuid();
            this.storeValue(PERSONALIZE_COOKIE_SESSIONID, sessionInfo.sessionId);
        }
        this.storeValue(PERSONALIZE_COOKIE,trackingId);
        return sessionInfo;
    }

    private _isRequireNewSession(
        userId: string, cachedSessionUserId: string, cachedSessionSessionId: string) : boolean {
        // new session => 1. no cached session info 2. signOut: s_userId !=null && curr_userId ==null
        // 3. switch account: s_userId !=null && curr_userId !=null && s_userId != curr_userId
        const isNoCachedSession : boolean = isEmpty(cachedSessionSessionId);
        const isSignoutCase : boolean = isEmpty(userId) && !isEmpty(cachedSessionUserId);
        const isSwitchUserCase : boolean = !isEmpty(userId) && !isEmpty(cachedSessionUserId)
            && !isEqual(userId, cachedSessionUserId);
        return isNoCachedSession || isSignoutCase || isSwitchUserCase;
    }
}


