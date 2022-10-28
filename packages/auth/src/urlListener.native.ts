// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	}

	handler =
		handler ||
		(({ url, ...rest }: { url: string }) => {
			logger.debug('urlListener', { url, ...rest });
			callback({ url });
		});

	// Handles backward compatibility. removeEventListener is only available on RN versions before 0.65.
	if (Linking.removeEventListener === typeof 'function') {
		Linking.removeEventListener('url', handler);
		Linking.addEventListener('url', handler);
	} else {
		// remove() method is only available on RN v0.65+.
		subscription?.remove?.();
		subscription = Linking.addEventListener('url', handler);
	}
	AppState.addEventListener('change', async newAppState => {
		if (newAppState === 'active') {
			const initialUrl = await Linking.getInitialURL();
			handler({ url: initialUrl });
		}
	});
};
