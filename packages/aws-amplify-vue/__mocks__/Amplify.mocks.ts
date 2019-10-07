export class Logger {
  private name: string;
  public info = jest.fn();
  public error = jest.fn();

  constructor(name: string) {
    this.name = name;
  }
};

export const Auth = {
  currentAuthenticatedUser: jest.fn(() => Promise.resolve({})),
  verifyCurrentUserAttribute: jest.fn(() =>
    Promise.resolve({ username: 'myTestUsername' })
  ),
  completeNewPassword: jest.fn(() => Promise.resolve({})),
  confirmSignIn: jest.fn(() => Promise.resolve({})),
  confirmSignUp: jest.fn(() => Promise.resolve({})),
  forgotPassword: jest.fn(() => Promise.resolve({})),
  forgotPasswordSubmit: jest.fn(() => Promise.resolve({})),
  resendSignUp: jest.fn(() => Promise.resolve({})),
  setPreferredMFA: jest.fn(() => Promise.resolve({})),
  setupTOTP: jest.fn(() => Promise.resolve('gibberish')),
  signIn: jest.fn(() =>
    Promise.resolve({
      challengeName: 'CUSTOM_CHALLENGE',
      challengeParam: { trigger: 'true' },
    })
  ),
  signOut: jest.fn(() => Promise.resolve({})),
  signUp: jest.fn(() => Promise.resolve({})),
  verifiedContact: jest.fn(() => Promise.resolve({})),
  verifyTotpToken: jest.fn(() => Promise.resolve({})),
};

export class AuthClass {};

export const Interactions = {
  onComplete: jest.fn(() => Promise.resolve({})),
  send: jest.fn(() => Promise.resolve({})),
};

export const Storage = {
  get: jest.fn(() => Promise.resolve({})),
  put: jest.fn(() => Promise.resolve({ key: 'testKey' })),
  list: jest.fn(() => Promise.resolve({})),
};

export const I18n = {
  get: jest.fn(key => `i18n ${key}`),
};

export const XR = {
  loadScene: jest.fn(() => Promise.resolve({})),
  start: jest.fn(),
  isMuted: jest.fn(() => false),
  isVRCapable: jest.fn(() => false),
  onSceneEvent: jest.fn(),
  setMuted: jest.fn(),
  enableAudio: jest.fn(),
  enterVR: jest.fn(),
  exitVR: jest.fn(),
  isVRPresentationActive: jest.fn(() => false),
};
