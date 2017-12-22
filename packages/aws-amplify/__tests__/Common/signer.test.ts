jest.mock('aws-sdk-mobile-analytics/lib/StorageClients/LocalStorage', () => {
    const Storage = () => {}
    var ret =  {
        Storage: Storage
    }
    return ret;
});

import Signer from '../../src/Common/Signer';
import Storage from '../../src/Storage/Storage';

describe('Signer Tests', () => {
    test('sign test', () => {
        const result = Signer.sign(
            {
                "method": 'GET',
                "url": "https://amazonaws.com",
                "headers": {
                    "Authorization": "auth"
                },
                "data": "{}"
            },
            {
                "access_key": "123",
                "secret_key": "456",
                "session_token": "789"
            },
            {
                "service": "Amplify",
                "region": "us-east-2"
            }
        );
        expect(result).toHaveProperty('headers');
    });
});