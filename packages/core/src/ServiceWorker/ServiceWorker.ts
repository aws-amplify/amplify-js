// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '../Logger';
import { isBrowser } from '../utils';
import { AmplifyError } from '../errors';
import { record } from '../providers/pinpoint';
import { Amplify, fetchAuthSession } from '../singleton';

import { ServiceWorkerErrorCode, assert } from './errorHelpers';

/**
 * Provides a means to registering a service worker in the browser
 * and communicating with it via postMessage events.
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/
 *
 * postMessage events are currently not supported in all browsers. See:
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 *
 * At the minmum this class will register the service worker and listen
 * and attempt to dispatch messages on state change and record analytics
 * events based on the service worker lifecycle.
 */
export class ServiceWorkerClass {
	// The active service worker will be set once it is registered
	private _serviceWorker?: ServiceWorker;

	// The service worker registration object
	private _registration?: ServiceWorkerRegistration;

	// The application server public key for Push
	// https://web-push-codelab.glitch.me/
	private _publicKey?: string;

	// push subscription
	private _subscription?: PushSubscription;

	// The AWS Amplify logger
	private _logger: ConsoleLogger = new ConsoleLogger('ServiceWorker');

	/**
	 * Get the currently active service worker
	 */
	get serviceWorker(): ServiceWorker {
		assert(
			this._serviceWorker !== undefined,
			ServiceWorkerErrorCode.UndefinedInstance,
		);

		return this._serviceWorker;
	}

	/**
	 * Register the service-worker.js file in the browser
	 * Make sure the service-worker.js is part of the build
	 * for example with Angular, modify the angular-cli.json file
	 * and add to "assets" array "service-worker.js"
	 * @param {string} filePath Service worker file. Defaults to "/service-worker.js"
	 * @param {string} scope The service worker scope. Defaults to "/"
	 *  - API Doc: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
	 * @returns {Promise}
	 *	- resolve(ServiceWorkerRegistration)
	 *	- reject(Error)
	 **/
	register(filePath = '/service-worker.js', scope = '/') {
		this._logger.debug(`registering ${filePath}`);
		this._logger.debug(`registering service worker with scope ${scope}`);

		return new Promise((resolve, reject) => {
			if (navigator && 'serviceWorker' in navigator) {
				navigator.serviceWorker
					.register(filePath, {
						scope,
					})
					.then(registration => {
						if (registration.installing) {
							this._serviceWorker = registration.installing;
						} else if (registration.waiting) {
							this._serviceWorker = registration.waiting;
						} else if (registration.active) {
							this._serviceWorker = registration.active;
						}
						this._registration = registration;
						this._setupListeners();
						this._logger.debug(
							`Service Worker Registration Success: ${registration}`,
						);

						resolve(registration);
					})
					.catch(error => {
						this._logger.debug(`Service Worker Registration Failed ${error}`);

						reject(
							new AmplifyError({
								name: ServiceWorkerErrorCode.Unavailable,
								message: 'Service Worker not available',
								underlyingError: error,
							}),
						);
					});
			} else {
				reject(
					new AmplifyError({
						name: ServiceWorkerErrorCode.Unavailable,
						message: 'Service Worker not available',
					}),
				);
			}
		});
	}

	/**
	 * Enable web push notifications. If not subscribed, a new subscription will
	 * be created and registered.
	 * 	Test Push Server: https://web-push-codelab.glitch.me/
	 * 	Push Server Libraries: https://github.com/web-push-libs/
	 * 	API Doc: https://developers.google.com/web/fundamentals/codelabs/push-notifications/
	 * @param publicKey
	 * @returns {Promise}
	 * 	- resolve(PushSubscription)
	 *  - reject(Error)
	 */
	enablePush(publicKey: string) {
		assert(
			this._registration !== undefined,
			ServiceWorkerErrorCode.UndefinedRegistration,
		);
		this._publicKey = publicKey;

		return new Promise((resolve, reject) => {
			if (isBrowser()) {
				assert(
					this._registration !== undefined,
					ServiceWorkerErrorCode.UndefinedRegistration,
				);
				this._registration.pushManager.getSubscription().then(subscription => {
					if (subscription) {
						this._subscription = subscription;
						this._logger.debug(
							`User is subscribed to push: ${JSON.stringify(subscription)}`,
						);
						resolve(subscription);
					} else {
						this._logger.debug(`User is NOT subscribed to push`);

						return this._registration!.pushManager.subscribe({
							userVisibleOnly: true,
							applicationServerKey: this._urlB64ToUint8Array(publicKey),
						})
							.then(pushManagerSubscription => {
								this._subscription = pushManagerSubscription;
								this._logger.debug(
									`User subscribed: ${JSON.stringify(pushManagerSubscription)}`,
								);
								resolve(pushManagerSubscription);
							})
							.catch(error => {
								this._logger.error(error);
							});
					}
				});
			} else {
				reject(
					new AmplifyError({
						name: ServiceWorkerErrorCode.Unavailable,
						message: 'Service Worker not available',
					}),
				);
			}
		});
	}

	/**
	 * Convert a base64 encoded string to a Uint8 array for the push server key
	 * @param base64String
	 */
	private _urlB64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, '+')
			.replace(/_/g, '/');

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}

		return outputArray;
	}

	/**
	 * Send a message to the service worker. The service worker needs
	 * to implement `self.addEventListener('message') to handle the
	 * message. This ***currently*** does not work in Safari or IE.
	 * @param {object | string} message An arbitrary JSON object or string message to send to the service worker
	 *	- see: https://developer.mozilla.org/en-US/docs/Web/API/Transferable
	 * @returns {Promise}
	 **/
	send(message: object | string) {
		if (this._serviceWorker) {
			this._serviceWorker.postMessage(
				typeof message === 'object' ? JSON.stringify(message) : message,
			);
		}
	}

	/**
	 * Listen for service worker state change and message events
	 * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/state
	 **/
	_setupListeners() {
		this.serviceWorker.addEventListener('statechange', async () => {
			const currentState = this.serviceWorker.state;
			this._logger.debug(`ServiceWorker statechange: ${currentState}`);

			const {
				appId,
				region,
				bufferSize,
				flushInterval,
				flushSize,
				resendLimit,
			} = Amplify.getConfig().Analytics?.Pinpoint ?? {};
			const { credentials } = await fetchAuthSession();

			if (appId && region && credentials) {
				// Pinpoint is configured, record an event
				record({
					appId,
					region,
					category: 'Core',
					credentials,
					bufferSize,
					flushInterval,
					flushSize,
					resendLimit,
					event: {
						name: 'ServiceWorker',
						attributes: {
							state: currentState,
						},
					},
				});
			}
		});
		this.serviceWorker.addEventListener('message', event => {
			this._logger.debug(`ServiceWorker message event: ${event}`);
		});
	}
}
