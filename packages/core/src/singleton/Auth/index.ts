import type { AuthTokenOrchestrator, AuthTokenStore, AuthTokens, GetAuthTokensOptions, KeyValueStorageInterface, OidcProvider } from "../../types";
import { Amplify } from '../../Singleton';
import { CLOCK_DRIFT_KEY, JWT } from "./types";

export const DefaultAuthTokensOrchestrator: AuthTokenOrchestrator = {
    async getTokens({ options, tokenStore, keyValueStore }: { options?: GetAuthTokensOptions, tokenStore: AuthTokenStore, keyValueStore: KeyValueStorageInterface }): Promise<AuthTokens> {
        // TODO: how to handle if there are not tokens on tokenManager
        let tokens = await tokenStore.loadTokens(keyValueStore);
        debugger;
        if ((options && options.forceRefresh) ||
            isTokenExpired({ expiresAt: tokens.idToken.payload.exp, metadata: tokens.metadata }) ||
            isTokenExpired({ expiresAt: tokens.accessTokenExpAt, metadata: tokens.metadata })) {

            // tokens = await refreshTokens(tokens);
        }

        return { ...tokens };
    },
    async setTokens({ tokens, tokenStore, keyValueStore }: { tokens: AuthTokens, tokenStore: AuthTokenStore, keyValueStore: KeyValueStorageInterface }) {
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

    return currentTime + clockDrift < expiresAt;
}

async function refreshTokens(tokens: AuthTokens): Promise<AuthTokens> {
    const newTokens = await Amplify.Auth.tokenRefresher(tokens);

    await Amplify.Auth.setTokens(newTokens);

    return newTokens;
}

function decodeJWT(token: string): JWT {
    return {
        toString: () => token,
        payload: {

        }
    };
}

export const MyTokenStore: AuthTokenStore = {
    loadTokens: async function (keyValueStore: KeyValueStorageInterface): Promise<AuthTokens> {
        const atString = await keyValueStore.getItem('accessToken');
        const itString = await keyValueStore.getItem('idToken');

        let oidcProvider: OidcProvider = 'COGNITO';
        const customProvider = await keyValueStore.getItem('oidcProvider');
        if (customProvider) {
            oidcProvider = { custom: customProvider}
        }

        return {
            accessToken: decodeJWT(atString),
            idToken: decodeJWT(itString),
            accessTokenExpAt: Number.parseInt(await keyValueStore.getItem('accessTokenExpAt')) || 0,
            oidcProvider,
            metadata: JSON.parse(await keyValueStore.getItem('metadata') || "{}")
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