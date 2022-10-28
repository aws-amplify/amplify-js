// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	public configure(config?: CacheConfig): CacheConfig {
		if (!config) {
			return this.config;
		}
		if (config.keyPrefix) {
			logger.warn(`Don't try to configure keyPrefix!`);
		}

		this.config = Object.assign({}, this.config, config, config.Cache);
		this.checkConfig();
		return this.config;
	}
}
