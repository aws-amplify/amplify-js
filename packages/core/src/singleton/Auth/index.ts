import type { AuthConfig, AuthTokenOrchestrator, AuthTokenStore, AuthTokens, GetAuthTokensOptions, KeyValueStorageInterface, LibraryOptions, ResourceConfig, TokenRefresher } from "../../types";
import { Amplify } from '../../Singleton';
import { JWT } from "./types";
import { Buffer } from 'buffer'; // TODO: this needs to be a platform operation
import { AuthStorageKeys } from "./types";

export class DefaultAuthTokensOrchestrator implements AuthTokenOrchestrator {
    tokenStore: AuthTokenStore;
    tokenRefresher: TokenRefresher;
    authConfig: AuthConfig;

    setAuthConfig(authConfig: AuthConfig) {
        this.authConfig = authConfig;
    }
    setTokenRefresher(tokenRefresher: TokenRefresher) {
        this.tokenRefresher = tokenRefresher;
    }
    setAuthTokenStore(tokenStore: AuthTokenStore) {
        this.tokenStore = tokenStore;
    }
    async getTokens({ options }: { options?: GetAuthTokensOptions }): Promise<AuthTokens> {
        // TODO: how to handle if there are not tokens on tokenManager
        let tokens: AuthTokens;

        try {
            tokens = await this.tokenStore.loadTokens();
            const idTokenExpired = isTokenExpired({ expiresAt: tokens.idToken.payload.exp * 1000, clockDrift: tokens.clockDrift });
            const accessTokenExpired = isTokenExpired({ expiresAt: tokens.accessTokenExpAt, clockDrift: tokens.clockDrift });

            if ((options && options.forceRefresh) || idTokenExpired || accessTokenExpired) {
                tokens = await refreshTokens({ tokens, tokenRefresher: this.tokenRefresher, authConfig: this.authConfig });
            }
        } catch (err) {
            console.warn(err);
            throw new Error('No session');
        }

        return { ...tokens };
    }

    async setTokens({ tokens }: { tokens: AuthTokens }) {
        return await this.tokenStore.storeTokens(tokens);
    }

    async clearTokens() {
        return await this.tokenStore.clearTokens();
    }
}

function isTokenExpired({ expiresAt, clockDrift }: { expiresAt: number, clockDrift: number }): boolean {
    // compare expiration against token exp and clock drift
    const currentTime = Date.now();
    return currentTime + clockDrift > expiresAt;
}

async function refreshTokens({ tokens, tokenRefresher, authConfig }: { tokens: AuthTokens, tokenRefresher: TokenRefresher, authConfig: AuthConfig }): Promise<AuthTokens> {
    try {
        const newTokens = await tokenRefresher({ tokens, authConfig });
        await Amplify.Auth.setTokens(newTokens);
        return newTokens;
    } catch (err) {
        await Amplify.Auth.clearTokens();
        throw err;
    }
}

function decodeJWT(token: string): JWT {
    const tokenSplitted = token.split('.');
    if (tokenSplitted.length != 3) {
        throw new Error('Invalid token');
    }

    const payloadString = tokenSplitted[1];

    try {
        return {
            toString: () => token,
            payload: JSON.parse(Buffer.from(payloadString, 'base64').toString('utf8'))
        };
    } catch (err) {
        throw new Error('Invalid token payload')
    }
}


export class DefaultTokenStore implements AuthTokenStore {
    keyValueStorage: KeyValueStorageInterface;
    authConfig: AuthConfig;

    setAuthConfig(authConfigParam: AuthConfig) {
        this.authConfig = authConfigParam;
        return;
    }

    setKeyValueStorage(keyValueStorage: KeyValueStorageInterface) {
        this.keyValueStorage = keyValueStorage;
        return;
    }

    async loadTokens(): Promise<AuthTokens> {
        if (this.authConfig === undefined) {
            throw new Error('Auth not configured');
        }
        // TODO: migration logic should be here
        // Reading V5 tokens old format

        // Reading V6 tokens
        try {
            const name = 'Cognito'; // TODO: update after API review for Amplify.configure
            const authKeys = createKeysForAuthStorage(name, this.authConfig.userPoolWebClientId);
            const atString = await this.keyValueStorage.getItem(authKeys.accessToken);
            const itString = await this.keyValueStorage.getItem(authKeys.idToken);

            return {
                accessToken: decodeJWT(atString),
                idToken: decodeJWT(itString),
                accessTokenExpAt: Number.parseInt(await this.keyValueStorage.getItem(authKeys.accessTokenExpAt)) || 0,
                metadata: JSON.parse(await this.keyValueStorage.getItem(authKeys.metadata) || "{}"),
                clockDrift: Number.parseInt(await this.keyValueStorage.getItem(authKeys.clockDrift)) || 0
            }
        } catch (err) {
            throw new Error('No valid tokens');
        }
    }
    async storeTokens(tokens: AuthTokens): Promise<void> {
        if (this.authConfig === undefined) {
            throw new Error('Auth not configured');
        }

        const name = 'Cognito'; // TODO: update after API review for Amplify.configure
        const authKeys = createKeysForAuthStorage(name, this.authConfig.userPoolWebClientId);
        this.keyValueStorage.setItem(authKeys.accessToken, tokens.accessToken.toString());
        this.keyValueStorage.setItem(authKeys.idToken, tokens.idToken.toString());
        this.keyValueStorage.setItem(authKeys.accessTokenExpAt, `${tokens.accessTokenExpAt}`);
        this.keyValueStorage.setItem(authKeys.metadata, JSON.stringify(tokens.metadata));
        this.keyValueStorage.setItem(authKeys.clockDrift, `${tokens.clockDrift}`);
    }

    async clearTokens(): Promise<void> {
        if (this.authConfig === undefined) {
            throw new Error('Auth not configured');
        }

        const name = 'Cognito'; // TODO: update after API review for Amplify.configure
        const authKeys = createKeysForAuthStorage(name, this.authConfig.userPoolWebClientId);

        // Not calling clear because it can remove data that is not managed by AuthTokenStore
        await this.keyValueStorage.removeItem(authKeys.accessToken);
        await this.keyValueStorage.removeItem(authKeys.idToken);
        await this.keyValueStorage.removeItem(authKeys.accessTokenExpAt);
        await this.keyValueStorage.removeItem(authKeys.clockDrift);
        await this.keyValueStorage.removeItem(authKeys.metadata);
    }
}

const createKeysForAuthStorage = (provider: string, identifier: string) => {
    return getAuthStorageKeys(AuthStorageKeys)(`com.amplify.${provider}`, identifier);
}

export function getAuthStorageKeys<T extends Record<string, string>>(authKeys: T) {
    const keys = Object.values({ ...authKeys });
    return (prefix: string, identifier: string) =>
        keys.reduce(
            (acc, authKey) => ({
                ...acc,
                [authKey]: `${prefix}.${identifier}.${authKey}`,
            }),
            {} as AuthKeys<keyof T & string>
        );
}

type AuthKeys<AuthKey extends string> = {
    [Key in AuthKey]: string;
};