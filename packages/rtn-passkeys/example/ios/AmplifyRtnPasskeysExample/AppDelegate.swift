// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React
import ReactAppDependencyProvider
import React_RCTAppDelegate
import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
	var window: UIWindow?

	var reactNativeDelegate: ReactNativeDelegate?
	var reactNativeFactory: RCTReactNativeFactory?

	func application(
		_ application: UIApplication,
		didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
	) -> Bool {
		let delegate: ReactNativeDelegate = ReactNativeDelegate()
		let factory = RCTReactNativeFactory(delegate: delegate)
		delegate.dependencyProvider = RCTAppDependencyProvider()

		reactNativeDelegate = delegate
		reactNativeFactory = factory

		window = UIWindow(frame: UIScreen.main.bounds)

		factory.startReactNative(
			withModuleName: "AmplifyRtnPasskeysExample",
			in: window,
			launchOptions: launchOptions
		)

		return true
	}
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
	override func sourceURL(for bridge: RCTBridge) -> URL? {
		self.bundleURL()
	}

	override func bundleURL() -> URL? {
		#if DEBUG
			RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
		#else
			Bundle.main.url(forResource: "main", withExtension: "jsbundle")
		#endif
	}
}
