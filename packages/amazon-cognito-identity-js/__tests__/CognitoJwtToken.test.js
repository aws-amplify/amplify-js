import CognitoJwtToken from '../src/CognitoJwtToken';
const subDecoded = '1234567890'
const nameDecoded = 'John Doe'
const iatDecoded = 1516239022

const sampleEncodedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
describe('Accessor methods', () => {
    const cognitoJwtToken = new CognitoJwtToken(sampleEncodedToken)
    
    test('Getting JWT Token', () => {
        expect (cognitoJwtToken.getJwtToken()).toBe(sampleEncodedToken)
    })

    test('Getting expiration for JWT', ()=>{
        expect(cognitoJwtToken.getExpiration()).toBe(cognitoJwtToken.payload.exp)
    })

    test('Get time issued at for JWT', () => {
        expect(cognitoJwtToken.getIssuedAt()).toBe(cognitoJwtToken.payload.iat)
    })

    test('Testing decode payload method returns an object', () =>{
        const decodedPayload = cognitoJwtToken.decodePayload()
        expect(decodedPayload.sub).toBe(subDecoded)
        expect(decodedPayload.name).toBe(nameDecoded)
        expect(decodedPayload.iat).toBe(iatDecoded)
    })

    test('Decoding error', ()=>{
        const badJWT = new CognitoJwtToken('incorrect Encoding')
        expect(badJWT.decodePayload()).toEqual({})
    })

    test('Bad parameters', () =>{
        const noPayloadToken = new CognitoJwtToken()
        expect(noPayloadToken.getJwtToken()).toBe('')
    })
})