module.exports = {
  Logger: function Logger(name) {
    this.name = name;
    this.info = jest.fn();
    this.error = jest.fn();
  },
  Auth: {
    currentAuthenticatedUser: jest.fn(() => Promise.resolve({})),
    verifyCurrentUserAttribute: jest.fn(() => Promise.resolve({ username: 'myTestUsername' })),
    setupTOTP: jest.fn(() => Promise.resolve({})),
  },
  AuthClass: {},
};
