<<<<<<< HEAD
import Analytics, { AnalyticsClass, AnalyticsProvider, AWSPinpointProvider, AWSKinesisProvider } from '@aws-amplify/analytics';
import Auth, { AuthClass } from '@aws-amplify/auth';
import Storage, { StorageClass } from '@aws-amplify/storage';
import API, { APIClass, graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import Cache from '@aws-amplify/cache';
import { ConsoleLogger as Logger, Hub, JS, ClientDevice, Signer, I18n, Amplify, ServiceWorker } from '@aws-amplify/core';
=======
import Analytics, { AnalyticsClass, AnalyticsProvider, AWSPinpointProvider, AWSKinesisProvider } from './Analytics';
import Auth, { AuthClass } from './Auth';
import Storage, { StorageClass } from './Storage';
import API, { APIClass, graphqlOperation } from './API';
import PubSub from './PubSub';
import Cache from './Cache';
import Interactions from './Interactions';
import { ConsoleLogger as Logger, Hub, JS, ClientDevice, Signer, I18n, Amplify, ServiceWorker } from './Common';
>>>>>>> upstream/master
export default Amplify;
export { Auth, Analytics, Storage, API, PubSub, I18n, Logger, Hub, Cache, JS, ClientDevice, Signer, ServiceWorker, Interactions };
export { AuthClass, AnalyticsClass, APIClass, StorageClass, AnalyticsProvider, AWSPinpointProvider, AWSKinesisProvider };
export { graphqlOperation };
