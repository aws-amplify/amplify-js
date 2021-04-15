import CognitoUserSession from '../src/CognitoUserSession'
import { ivCognitoUserSession, ivRefreshToken, ivAccessToken, ivCognitoIdToken, ivRefreshToken } from './constants.js'


describe('Getters for Cognito User Session', () => {

    test('Getting access token', () => {
        expect(ivCognitoUserSession.getIdToken()).toBe(ivCognitoIdToken)
    })

    test('Getting refresh token', () => {
        expect(ivCognitoUserSession.getRefreshToken()).toBe(ivRefreshToken)
    })

    test('Getting access token', () => {
        expect(ivCognitoUserSession.getAccessToken()).toBe(ivAccessToken)
    })

    test('Access token undefined', () => {
        expect(() => {
            new CognitoUserSession({ IdToken: ivCognitoIdToken, RefreshToken: ivRefreshToken, AccessToken: null, ClockDrift: undefined })
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
        expect(ivCognitoUserSession.getClockDrift()).toBe(currDate)
    })

    test('Getting undefined clock drift', () => {
        expect(ivCognitoUserSession.getClockDrift()).toEqual(ivCognitoUserSession.calculateClockDrift())
    })

    test('JWT Expiration was hard-coded to be a time in the past so that this is guaranteed to be an invalid token', () => {
        expect(ivCognitoUserSession.isValid()).toBe(false)
    })

})