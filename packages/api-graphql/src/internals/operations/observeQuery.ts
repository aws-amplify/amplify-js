// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Observable } from 'rxjs';
import { findIndexByFields, resolvePKFields } from '../../utils';
import { SchemaModel } from '@aws-amplify/core/internals/utils';

export function observeQueryFactory(models: any, model: SchemaModel) {
	const { name } = model;

	const observeQuery = (arg?: any) =>
		new Observable(subscriber => {
			// what we'll be sending to our subscribers
			const items: object[] = [];

			// To enqueue subscription messages while we collect our initial
			// result set.
			const messageQueue = [] as {
				type: 'create' | 'update' | 'delete';
				item: object;
			}[];

			// operation to take when message(s) arrive.
			// this operation will be swapped out once initial "sync" is complete
			// to immediately ingest messsages.
			let receiveMessages = (...messages: typeof messageQueue) => {
				return messageQueue.push(...messages);
			};

			// start subscriptions
			const onCreateSub = models[name].onCreate(arg).subscribe({
				next(item: object) {
					receiveMessages({ item, type: 'create' });
				},
				error(error: any) {
					subscriber.error({ type: 'onCreate', error });
				},
			});
			const onUpdateSub = models[name].onUpdate(arg).subscribe({
				next(item: object) {
					receiveMessages({ item, type: 'update' });
				},
				error(error: any) {
					subscriber.error({ type: 'onUpdate', error });
				},
			});
			const onDeleteSub = models[name].onDelete(arg).subscribe({
				next(item: object) {
					receiveMessages({ item, type: 'delete' });
				},
				error(error: any) {
					subscriber.error({ type: 'onDelete', error });
				},
			});

			// consumes a list of messages and sends a snapshot
			function ingestMessages(messages: typeof messageQueue) {
				for (const message of messages) {
					const idx = findIndexByFields(message.item, items, pkFields as any);
					switch (message.type) {
						case 'create':
							if (idx < 0) items.push(message.item);
							break;
						case 'update':
							if (idx >= 0) items[idx] = message.item;
							break;
						case 'delete':
							if (idx >= 0) items.splice(idx, 1);
							break;
						default:
							console.error('Unrecognized message in observeQuery.', message);
					}
				}
				subscriber.next({
					items,
					isSynced: true,
				});
			}

			const pkFields = resolvePKFields(model);

			// initial results
			(async () => {
				let firstPage = true;
				let nextToken: string | null = null;
				while (!subscriber.closed && (firstPage || nextToken)) {
					firstPage = false;

					const {
						data: page,
						errors,
						nextToken: _nextToken,
					}: {
						data: any;
						errors: any;
						nextToken: string | null;
					} = await models[name].list({ ...arg, nextToken });
					nextToken = _nextToken;

					items.push(...page);

					// if there are no more pages and no items we already know about
					// that need to be merged in from sub, we're "synced"
					const isSynced =
						messageQueue.length === 0 &&
						(nextToken === null || nextToken === undefined);

					subscriber.next({
						items,
						isSynced,
					});

					if (Array.isArray(errors)) {
						for (const error of errors) {
							subscriber.error(error);
						}
					}
				}

				// play through the queue
				if (messageQueue.length > 0) {
					ingestMessages(messageQueue);
				}

				// switch the queue to write directly to the items collection
				receiveMessages = (...messages: typeof messageQueue) => {
					ingestMessages(messages);
					return items.length;
				};
			})();

			// when subscriber unsubscribes, tear down internal subs
			return () => {
				// 1. tear down internal subs
				onCreateSub.unsubscribe();
				onUpdateSub.unsubscribe();
				onDeleteSub.unsubscribe();

				// 2. there is no need to explicitly stop paging. instead, we
				// just check `subscriber.closed` above before fetching each page.
			};
		});

	return observeQuery;
}
