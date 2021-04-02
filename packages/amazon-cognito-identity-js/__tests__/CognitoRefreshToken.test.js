import CognitoRefreshToken from '../src/CognitoRefreshToken'

describe('Cognito Refresh Token ', () => {
    const cognitoRefToken = new CognitoRefreshToken('JWT Refresh Token')
    test('Constructor methods', () => {
        expect(cognitoRefToken.getToken()).toBe(cognitoRefToken.token)
    })
})