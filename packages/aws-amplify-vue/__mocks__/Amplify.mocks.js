module.exports = {
  Logger: function Logger(name) {
    this.name = name;
    this.info = jest.fn();
    this.error = jest.fn();
  },
  Auth: {
    currentAuthenticatedUser: jest.fn(() => Promise.resolve({})),
    verifyCurrentUserAttribute: jest.fn(() => Promise.resolve({ username: 'myTestUsername' })),
    confirmSignIn: jest.fn(() => Promise.resolve({})),
    confirmSignUp: jest.fn(() => Promise.resolve({})),
    forgotPassword: jest.fn(() => Promise.resolve({})),
    forgotPasswordSubmit: jest.fn(() => Promise.resolve({})),
    resendSignUp: jest.fn(() => Promise.resolve({})),
    setPreferredMFA: jest.fn(() => Promise.resolve({})),
    setupTOTP: jest.fn(() => Promise.resolve('gibberish')),
    signIn: jest.fn(() => Promise.resolve({})),
    signOut: jest.fn(() => Promise.resolve({})),
    signUp: jest.fn(() => Promise.resolve({})),
    verifyTotpToken: jest.fn(() => Promise.resolve({})),
  },
  AuthClass: {},
  Interactions: {
    onComplete: jest.fn(() => Promise.resolve({})),
    send: jest.fn(() => Promise.resolve({})),
  },
  Storage: {
    get: jest.fn(() => Promise.resolve({})),
    put: jest.fn(() => Promise.resolve({ key: 'testKey' })),
    list: jest.fn(() => Promise.resolve({})),
  },
};
