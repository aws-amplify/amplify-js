describe('currentUserCredentials test', () => {
        test('with federated info', async () => {
            const auth = new Auth(authOptions);

            const spyon = jest.spyOn(Cache, 'getItem')
                .mockImplementationOnce(() => {
                    return {
                        provider: 'google',
                        token: 'token',
                        user: {name: 'user'}
                    }
                });

            expect.assertions(1);
            expect(await auth.currentUserCredentials()).toBeUndefined();

            spyon.mockClear();
        });
    });

      describe('currentCrendentials', () => {
        test('happy case when auth has credentials', async () => {
            const auth = new Auth(authOptions);
            const cred = new CognitoIdentityCredentials({
                    IdentityPoolId: 'identityPoolId',
                }, {
                    region: 'region'
                });

            auth['credentials'] = cred;

            const spyon = jest.spyOn(Auth.prototype, "currentUserCredentials")
                .mockImplementationOnce(() => {
                    return new Promise((res, rej) => {
                        res();
                    })
                });

            const spyon2 = jest.spyOn(CognitoIdentityCredentials.prototype, 'refresh')
                .mockImplementationOnce((callback) => {
                    callback(null);
                });



            expect.assertions(1);
            expect(await auth.currentCredentials()).toEqual(cred);

            spyon.mockClear();
            spyon2.mockClear();
        });
    });