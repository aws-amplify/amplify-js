// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Foundation

private let expectedEventNames: Set = [
    NativeEvent.tokenReceived.name,
    NativeEvent.backgroundMessageReceived.name,
    NativeEvent.foregroundMessageReceived.name,
    NativeEvent.notificationOpened.name,
    NativeEvent.launchNotificationOpened.name
]

@objc(AmplifyRTNPushNotification)
class AmplifyRTNPushNotification: RCTEventEmitter {

    var registeredEventNames: Set<String> = []
    var hasListeners = false

    // Override the bridge setter and getter to capture the launch options
    override var bridge: RCTBridge! {
        set(bridge) {
            super.bridge = bridge

            if let launchOptions = bridge.launchOptions {
                AmplifyRTNPushNotificationManager.shared.handleLaunchOptions(launchOptions: launchOptions)
            }
        }
        get {
            return super.bridge
        }
    }

    func notifyFlushQueuedEvents() {
        AmplifyRTNEventManager.shared.setSendEvent(sendEvent: self.sendEventToJS)
    }

    func sendEventToJS(event: AmplifyRTNEvent) {
        sendEvent(withName: event.type.name, body: event.payload)
    }

    override func addListener(_ eventName: String!) {
        super.addListener(eventName)
        registeredEventNames.insert(eventName)

        if (registeredEventNames == expectedEventNames) {
            notifyFlushQueuedEvents()
        }
    }

    override func supportedEvents() -> [String]! {
        return Array(expectedEventNames)
    }

    @objc
    func requestPermissions(
        _ permissions: [AnyHashable: Any],
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        AmplifyRTNPushNotificationManager.shared.requestPermissions(permissions, resolve: resolve, reject: reject)
    }

    @objc
    func getLaunchNotification(
        _ resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        AmplifyRTNPushNotificationManager.shared.getLaunchNotification(resolve, reject: reject)
    }

    @objc
    func setBadgeCount(_ count: Int) {
        AmplifyRTNPushNotificationManager.shared.setBadgeCount(count)
    }

    @objc
    func getBadgeCount(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        AmplifyRTNPushNotificationManager.shared.getBadgeCount(resolve, reject: reject)
    }

    @objc
    func completeNotification(_ completionHandlerId: String) {
        AmplifyRTNPushNotificationManager.shared.completeNotification(completionHandlerId)
    }

    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    override func constantsToExport() -> [AnyHashable : Any]! {
        return [
            "NativeEvent": [
                NativeEvent.backgroundMessageReceived.key: NativeEvent.backgroundMessageReceived.name,
                NativeEvent.foregroundMessageReceived.key: NativeEvent.foregroundMessageReceived.name,
                NativeEvent.notificationOpened.key: NativeEvent.notificationOpened.name,
                NativeEvent.launchNotificationOpened.key: NativeEvent.launchNotificationOpened.name,
                NativeEvent.tokenReceived.key: NativeEvent.tokenReceived.name,
            ],
        ]
    }
}
