import { CognitoAccessToken, CognitoIdToken, CognitoRefreshToken } from 'amazon-cognito-identity-js';

/** AuthDetails */
export const authDetailData = {
    ValidationData: {},
    Username: 'user@amzn.com',
    Password: 'abc123',
    AuthParameters: {},
    ClientMetadata: {},
};

/** CognitoJWT */
export const expDecoded = 1217742717705
export const nameDecoded = "John Doe"
export const iatDecoded = 1617566244000
export const sampleEncodedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEyMTc3NDI3MTc3MDUsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTYxNzU2NjI0NDAwMH0.hSVQZ0wsFlPNTh54b7qnY-hU-MQtJUBnlqgc6P8wwzQ'

/** CognitoUserAttribute */
export const testName = 'testName'
export const testValue = 'testValue'

/** CognitoUserSession */
export const cognitoIdToken = new CognitoIdToken({ IdToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxMjE3NzQyNzE3NzA1IiwibmFtZSI6IklkIFRva2VuIiwiaWF0IjoxNjE3NTY2MjQ0MDAwfQ.Fgd2Np6mBVMMxDFrnij_YHlC2gEx2C6OT9uQiMCyufw' })
export const refreshToken = new CognitoRefreshToken({ RefreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxMjE3NzQyNzE3NzA1IiwibmFtZSI6IlJlZnJlc2ggVG9rZW4iLCJpYXQiOjE2MTc1NjYyNDQwMDB9.L5asUv2DOMOmKc5GMLo80mAAsy_TeOK17EhiMyTwk2U' })
export const accessToken = new CognitoAccessToken({ AccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxMjE3NzQyNzE3NzA1IiwibmFtZSI6IkFjY2VzcyBUb2tlbiIsImlhdCI6MTYxNzU2NjI0NDAwMH0.fov43VHqnJGFEzwHublLSDoL4RSZJCnoBuL-HLfoDHc' })

/** CognitoUserPool */
export const userPoolId = 'us-east-1_QdbSdK39m'
export const clientId = '3pu8tnp684l4lmlfoth25ojmd2'
export const userName = 'peculiarAmazonian'
export const password = 'Very$ecur3'