import CognitoUserSession from '../src/CognitoUserSession'
import { cognitoIdToken, refreshToken, accessToken } from './constants.js'

const cognitoUserSession = new CognitoUserSession({ IdToken: cognitoIdToken, RefreshToken: refreshToken, AccessToken: accessToken, ClockDrift: undefined })
describe('Getters for Cognito User Session', () => {

    test('Getting access token', () => {
        expect(cognitoUserSession.getIdToken()).toBe(cognitoIdToken)
    })

    test('Getting refresh token', () => {
        expect(cognitoUserSession.getRefreshToken()).toBe(refreshToken)
    })

    test('Getting access token', () => {
        expect(cognitoUserSession.getAccessToken()).toBe(accessToken)
    })

    test('Access token undefined', () => {
        expect(() => {
            new CognitoUserSession({ IdToken: cognitoIdToken, RefreshToken: refreshToken, AccessToken: null, ClockDrift: undefined })
        })
            .toThrowError('Id token and Access Token must be present.')
    })
})

/**
 * Clock drift is a unix timestamp and calc clock drift finds the minimum between issued time of the access token and the id token
 * and subtracts the current clock time from that minimum.
 */

describe('Calculations for Cognito User Attributes', () => {
    test('Calculate a clock drift', () => {
        const currDate = Math.floor(new Date() / 1000);
        const cognitoUserSessionClockDrift = new CognitoUserSession({ IdToken: cognitoIdToken, RefreshToken: refreshToken, AccessToken: accessToken, ClockDrift: currDate });

        expect(cognitoUserSessionClockDrift.getClockDrift()).toBe(currDate)
    })

    test('Getting undefined clock drift', () => {
        expect(cognitoUserSession.getClockDrift()).toBe(cognitoUserSession.calculateClockDrift())
    })

    test('JWT Expiration was hard-coded to be a time in the past so that this is guaranteed to be an invalid token', () => {
        expect(cognitoUserSession.isValid()).toBe(false)
    })

})