import type { AuthTokenOrchestrator, AuthTokenStore, AuthTokens, GetAuthTokensOptions, KeyValueStorageInterface, OidcProvider, TokenRefresher } from "../../types";
import { Amplify } from '../../Singleton';
import { CLOCK_DRIFT_KEY, JWT } from "./types";
import { Buffer } from 'buffer'; // TODO: this needs to be a platform operation

export const DefaultAuthTokensOrchestrator: AuthTokenOrchestrator = {
    async getTokens({ options, tokenStore, keyValueStore, tokenRefresher }:
        { options?: GetAuthTokensOptions, tokenStore: AuthTokenStore, keyValueStore: KeyValueStorageInterface, tokenRefresher: TokenRefresher }): Promise<AuthTokens> {
        // TODO: how to handle if there are not tokens on tokenManager
        let tokens: AuthTokens;
        
        try {
            tokens = await tokenStore.loadTokens(keyValueStore); 
            const idTokenExpired = isTokenExpired({ expiresAt: tokens.idToken.payload.exp * 1000, metadata: tokens.metadata });
            const accessTokenExpired = isTokenExpired({ expiresAt: tokens.accessTokenExpAt, metadata: tokens.metadata });
            debugger;
            if ((options && options.forceRefresh) || idTokenExpired ||accessTokenExpired) {
                tokens = await refreshTokens({ tokens, tokenRefresher });
            }
        } catch (err) {
            console.warn(err);
            throw new Error('No session');
        }

        return { ...tokens };
    },
    async setTokens({ tokens, tokenStore, keyValueStore }:
        { tokens: AuthTokens, tokenStore: AuthTokenStore, keyValueStore: KeyValueStorageInterface }) {
        return await tokenStore.storeTokens(keyValueStore, tokens);
    },
    async clearTokens({ tokenStore, keyValueStore }: { tokenStore: AuthTokenStore, keyValueStore: KeyValueStorageInterface }) {
        return await tokenStore.clearTokens(keyValueStore);
    },
}

function isTokenExpired({ expiresAt, metadata }: { expiresAt: number, metadata: Record<string, string> }): boolean {
    // compare expiration against token exp and clock drift
    const currentTime = Date.now();
    // TODO: other AuthN providers should use this key for clockDrift
    const clockDrift = Number.parseInt(metadata[CLOCK_DRIFT_KEY]) || 0;
    return currentTime + clockDrift > expiresAt;
}

async function refreshTokens({ tokens, tokenRefresher }: { tokens: AuthTokens, tokenRefresher: TokenRefresher }): Promise<AuthTokens> {
    debugger;
    try {
        const newTokens = await tokenRefresher(tokens);
        await Amplify.Auth.setTokens(newTokens);
        return newTokens;
    } catch(err) {
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

export const DefaultTokenStore: AuthTokenStore = {
    loadTokens: async function (keyValueStore: KeyValueStorageInterface): Promise<AuthTokens> {
        try {
            const atString = await keyValueStore.getItem('accessToken');
            const itString = await keyValueStore.getItem('idToken');

            let oidcProvider: OidcProvider = 'COGNITO';
            const customProvider = await keyValueStore.getItem('oidcProvider');
            if (customProvider) {
                oidcProvider = { custom: customProvider }
            }

            return {
                accessToken: decodeJWT(atString),
                idToken: decodeJWT(itString),
                accessTokenExpAt: Number.parseInt(await keyValueStore.getItem('accessTokenExpAt')) || 0,
                oidcProvider,
                metadata: JSON.parse(await keyValueStore.getItem('metadata') || "{}")
            }
        } catch( err ) {
            throw new Error('No tokens');
        }
    },
    storeTokens: async function (keyValueStore: KeyValueStorageInterface, tokens: AuthTokens): Promise<void> {
        keyValueStore.setItem('accessToken', tokens.accessToken.toString());
        keyValueStore.setItem('idToken', tokens.idToken.toString());
        keyValueStore.setItem('accessTokenExpAt', `${tokens.accessTokenExpAt}`);
        keyValueStore.setItem('metadata', JSON.stringify(tokens.metadata));
    },
    clearTokens: async function (keyValueStore: KeyValueStorageInterface): Promise<void> {
        await keyValueStore.clear();
    }
}