// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	public configure(options: InteractionsOptions): InteractionsOptions {
		const opt = options ? options.Interactions || options : {};
		logger.debug('configure Interactions', { opt });
		this._options = { bots: {}, ...opt, ...opt.Interactions };

		const aws_bots_config = this._options.aws_bots_config;
		const bots_config = this._options.bots;

		if (!Object.keys(bots_config).length && aws_bots_config) {
			// Convert aws_bots_config to bots object
			if (Array.isArray(aws_bots_config)) {
				aws_bots_config.forEach(bot => {
					this._options.bots[bot.name] = bot;
				});
			}
		}

		// configure bots to their specific providers
		Object.keys(bots_config).forEach(botKey => {
			const bot = bots_config[botKey];
			const providerName = bot.providerName || 'AWSLexProvider';

			// add default provider if required
			if (
				!this._pluggables.AWSLexProvider &&
				providerName === 'AWSLexProvider'
			) {
				this._pluggables.AWSLexProvider = new AWSLexProvider();
			}

			// configure bot with it's respective provider
			if (this._pluggables[providerName]) {
				this._pluggables[providerName].configure({ [bot.name]: bot });
			} else {
				logger.debug(
					`bot ${bot.name} was not configured as ${providerName} provider was not found`
				);
			}
		});

		return this._options;
	}

	public addPluggable(pluggable: InteractionsProvider) {
		if (pluggable && pluggable.getCategory() === 'Interactions') {
			if (!this._pluggables[pluggable.getProviderName()]) {
				// configure bots for the new plugin
				Object.keys(this._options.bots)
					.filter(
						botKey =>
							this._options.bots[botKey].providerName ===
							pluggable.getProviderName()
					)
					.forEach(botKey => {
						const bot = this._options.bots[botKey];
						pluggable.configure({ [bot.name]: bot });
					});

				this._pluggables[pluggable.getProviderName()] = pluggable;
				return;
			} else {
				throw new Error(
					'Pluggable ' + pluggable.getProviderName() + ' already plugged'
				);
			}
		}
	}

	public async send(
		botname: string,
		message: string
	): Promise<InteractionsResponse>;
	public async send(
		botname: string,
		message: InteractionsMessage
	): Promise<InteractionsResponse>;
	public async send(
		botname: string,
		message: object
	): Promise<InteractionsResponse>;
	public async send(
		botname: string,
		message: string | object
	): Promise<InteractionsResponse> {
		if (!this._options.bots || !this._options.bots[botname]) {
			return Promise.reject('Bot ' + botname + ' does not exist');
		}

		const botProvider =
			this._options.bots[botname].providerName || 'AWSLexProvider';

		if (!this._pluggables[botProvider]) {
			return Promise.reject(
				'Bot ' +
					botProvider +
					' does not have valid pluggin did you try addPluggable first?'
			);
		}
		return await this._pluggables[botProvider].sendMessage(botname, message);
	}

	public onComplete(
		botname: string,
		callback: (err, confirmation) => void
	): void {
		if (!this._options.bots || !this._options.bots[botname]) {
			throw new Error('Bot ' + botname + ' does not exist');
		}
		const botProvider =
			this._options.bots[botname].providerName || 'AWSLexProvider';

		if (!this._pluggables[botProvider]) {
			throw new Error(
				'Bot ' +
					botProvider +
					' does not have valid pluggin did you try addPluggable first?'
			);
		}
		this._pluggables[botProvider].onComplete(botname, callback);
	}
}

export const Interactions = new InteractionsClass();
Amplify.register(Interactions);
