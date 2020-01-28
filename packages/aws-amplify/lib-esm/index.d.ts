import Analytics, {
	AnalyticsClass,
	AnalyticsProvider,
	AWSPinpointProvider,
	AWSKinesisProvider,
	AWSKinesisFirehoseProvider,
	AmazonPersonalizeProvider,
} from '@aws-amplify/analytics';
import Auth, { AuthClass } from '@aws-amplify/auth';
import Storage, { StorageClass } from '@aws-amplify/storage';
import API, { APIClass, graphqlOperation } from '@aws-amplify/api';
import PubSub, { PubSubClass } from '@aws-amplify/pubsub';
import Cache from '@aws-amplify/cache';
import Interactions, { InteractionsClass } from '@aws-amplify/interactions';
import * as UI from '@aws-amplify/ui';
import XR, { XRClass } from '@aws-amplify/xr';
import Predictions from '@aws-amplify/predictions';
import Amplify, {
	ConsoleLogger as Logger,
	Hub,
	JS,
	ClientDevice,
	Signer,
	I18n,
	ServiceWorker,
} from '@aws-amplify/core';
export default Amplify;
export {
	Auth,
	Analytics,
	Storage,
	API,
	PubSub,
	I18n,
	Logger,
	Hub,
	Cache,
	JS,
	ClientDevice,
	Signer,
	ServiceWorker,
	Interactions,
	UI,
	XR,
	Predictions,
};
export {
	AuthClass,
	AnalyticsClass,
	APIClass,
	StorageClass,
	PubSubClass,
	InteractionsClass,
	XRClass,
	AnalyticsProvider,
	AWSPinpointProvider,
	AWSKinesisProvider,
	AWSKinesisFirehoseProvider,
	AmazonPersonalizeProvider,
};
export { graphqlOperation };
