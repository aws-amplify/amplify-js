// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0);
				customAttrs[tmp[0]] = tmp[1];
			});
		}

		const defaultAttrs =
			typeof this._config.attributes === 'function'
				? await this._config.attributes()
				: this._config.attributes;

		const attributes = Object.assign(
			{
				type: event.type,
				target: `${event.target.localName} with id ${event.target.id}`,
			},
			defaultAttrs,
			customAttrs
		);

		logger.debug('events needed to be recorded', events);
		logger.debug('attributes needed to be attached', customAttrs);
		if (events.indexOf(event.type) < 0) {
			logger.debug(`event ${event.type} is not selected to be recorded`);
			return;
		}

		this._tracker(
			{
				name: eventName || 'event',
				attributes,
			},
			this._config.provider
		).catch(e => {
			logger.debug(`Failed to record the ${event.type} event', ${e}`);
		});
	}
}
