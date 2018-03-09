jest.mock('../../src/Common/Builder', () => {
    return {
        default: null
    };
});

jest.mock('aws-sdk/clients/pinpoint', () => {
    const Pinpoint = () => {
        var pinpoint = null;
        return pinpoint;
    }

    Pinpoint.prototype.updateEndpoint = (params, callback) => {
        callback(null, 'data');
    }

    return Pinpoint;
});

jest.mock('url', () => {
    return {
        parse() {
            return {
                host: 'host'
            }
        }
    }
});

jest.mock('../../src/Common/Facet', () => {
    let ret = {util:{crypto:{lib:{}}}};
    ret['util']['crypto']['lib']['createHmac'] = () => {
        const update = () => {
            return { 
                digest() {
                    return 'encrypt'
                } 
            }};
        return { update };
    }
    ret['util']['crypto']['createHash'] = () => {
        const update = () => {
            return { 
                digest() {
                    return 'hash'
                } 
            }};
        return { update };
    }
    return {
        AWS: ret
    }; 
});

import Signer from '../../src/Common/Signer';
import AWS from '../../src/Common';


describe('Signer test', () => {
    describe('sign test', () => {
        test('happy case', () => {
            const request = {
                headers: {}
            }
            const access_info = {
                session_token: 'session_token'
            }
        
            const spyon = jest.spyOn(Date.prototype, 'toISOString').mockReturnValueOnce('0');

            const res = {"headers": {
                "Authorization": "AWS4-HMAC-SHA256 Credential=undefined/0///aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token, Signature=encrypt", 
                "X-Amz-Security-Token": "session_token", 
                "host": "host", 
                "x-amz-date": "0"}}
            expect(Signer.sign(request, access_info)).toEqual(res);

            spyon.mockClear();
        });
    });
});
