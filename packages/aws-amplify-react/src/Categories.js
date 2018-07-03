import { Amplify } from '@aws-amplify/core';

const Auth = Amplify.Auth;
const API = Amplify.API;
const Analytics = Amplify.Analytics;
const Storage = Amplify.Storage;
const PubSub = Amplify.PubSub;
const Interactions = Amplify.Interactions;

export { Auth, API, Analytics, Storage, PubSub, Interactions };