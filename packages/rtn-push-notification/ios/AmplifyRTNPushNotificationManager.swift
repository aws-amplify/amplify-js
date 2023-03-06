// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Foundation
import AmplifyUtilsNotifications

private let isBackgroundModeKey = "isBackgroundMode"
private let completionHandlerIdKey = "completionHandlerId"

extension UNAuthorizationStatus {
    var description : String {
        switch self {
        case .notDetermined:
            return "NotDetermined"
        case .denied:
            return "Denied"
        case .authorized:
            return "Authorized"
        case .provisional:
            return "Provisional"
        case .ephemeral:
            return "Ephemeral"
        @unknown default:
            return "NotDetermined"
        }
    }
}

class AmplifyRTNPushNotificationManager  {
    static let shared = AmplifyRTNPushNotificationManager()

    private var cachedDeviceToken: String?
    private var launchNotification: Any?
    private var isBackgroundMode = false
    private var justExitedBackgroundMode = false
    private var remoteNotificationCompletionHandlers: [String: (UIBackgroundFetchResult) -> Void] = [:]
    private let sharedEventManager: AmplifyRTNEventManager

    init() {
        sharedEventManager = AmplifyRTNEventManager.shared
        setUpObservers()
    }

    deinit {
        removeObservers()
    }

    func handleLaunchOptions(launchOptions: [AnyHashable: Any]) {
        // to get the launch notification when the app is launched from the "killed" state
        if let remoteNotification = launchOptions[UIApplication.LaunchOptionsKey.remoteNotification],
           let application = RCTSharedApplication() {
            if application.applicationState != .background {
                launchNotification = remoteNotification
            }

            if application.applicationState == .background {
                // App woke up in the background by a remote notification
                isBackgroundMode = true
            }
        }
    }

    func requestPermissions(
        _ permissions: [AnyHashable: Any],
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        if RCTRunningInAppExtension() {
            reject("ERROR", "requestPermissions can not be called in App Extensions", nil)
            return
        }

        Task {
            var options: UNAuthorizationOptions = []

            if permissions["alert"] as? Bool == true {
                options.insert(.alert)
            }

            if permissions["badge"] as? Bool == true {
                options.insert(.badge)
            }

            if permissions["sound"] as? Bool == true {
                options.insert(.sound)
            }

            if permissions["criticalAlert"] as? Bool == true {
                options.insert(.criticalAlert)
            }

            if permissions["provisional"] as? Bool == true {
                options.insert(.provisional)
            }

            do {
                let granted = try await AUNotificationPermissions.request(options)
                resolve(granted)
            } catch {
                reject("ERROR", error.localizedDescription, error)
            }
        }
    }

    func getPermissionStatus(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            let status = await AmplifyUtilsNotifications.AUNotificationPermissions.status
            resolve(status.description)
        }
    }

    func getLaunchNotification(
        _ resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        let launchNotification = self.launchNotification
        self.launchNotification = nil
        resolve(launchNotification == nil ? NSNull() : launchNotification)
    }

    func setBadgeCount(_ count: Int) {
        DispatchQueue.main.async {
            RCTSharedApplication()?.applicationIconBadgeNumber = count
        }
    }

    func getBadgeCount(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            resolve(RCTSharedApplication()?.applicationIconBadgeNumber ?? 0)
        }
    }

    func didRegisterForRemoteNotificationsWithDeviceToken(deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()

        // Reduce frequency of tokenReceived event emitting to RN
        if (cachedDeviceToken != token) {
            cachedDeviceToken = token
            sharedEventManager.sendEventToJS(
                AmplifyRTNEvent(type: NativeEvent.tokenReceived, payload: ["token": cachedDeviceToken])
            )
        }
    }

    func didFailToRegisterForRemoteNotificationsWithError(error: Error) {
        print("Register for remote notifications failed due to \(error).")
    }

    func didReceiveRemoteNotification(
        userInfo: [AnyHashable: Any],
        completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        if let application = RCTSharedApplication() {
            if (application.applicationState == .inactive) {
                if justExitedBackgroundMode {
                    // When an end user taps on a notification to bring the App to the foreground
                    // and the App just exited from the background mode, we treat the tapped notification
                    // as the "launch notification."
                    setLaunchNotification(notification: userInfo)
                } else {
                    sharedEventManager.sendEventToJS(
                        AmplifyRTNEvent(type: NativeEvent.notificationOpened, payload: userInfo)
                    )
                }
            } else if (application.applicationState == .background) {
                let completionHandlerId = UUID().uuidString
                var userInfoCopy = userInfo

                remoteNotificationCompletionHandlers[completionHandlerIdKey] = completionHandler
                userInfoCopy[completionHandlerIdKey] = completionHandlerId

                sharedEventManager.sendEventToJS(
                    AmplifyRTNEvent(type: NativeEvent.backgroundMessageReceived, payload: userInfoCopy)
                )
            } else {
                sharedEventManager.sendEventToJS(
                    AmplifyRTNEvent(type: NativeEvent.foregroundMessageReceived, payload: userInfo)
                )
            }
        }

        // Expecting remoteNotificationCompletionHandlers[completionHandlerIdKey] to be called from JS to complete
        // the background notification
    }

    func completeNotification(_ completionHandlerId: String) {
        if let completionHandler = remoteNotificationCompletionHandlers[completionHandlerId] {
            completionHandler(.noData)
            remoteNotificationCompletionHandlers.removeValue(forKey: completionHandlerId)
        }
    }

    private func setUpObservers() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationWillEnterForeground),
            name: UIApplication.willEnterForegroundNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
    }

    private func removeObservers() {
        NotificationCenter.default.removeObserver(
            self,
            name: UIApplication.willEnterForegroundNotification,
            object: nil
        )
        NotificationCenter.default.removeObserver(
            self,
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
        NotificationCenter.default.removeObserver(
            self,
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
    }

    @objc
    private func applicationWillEnterForeground() {
        exitBackgroundMode()
    }

    @objc
    private func applicationDidEnterBackground() {
        justExitedBackgroundMode = false
    }

    @objc
    private func applicationDidBecomeActive() {
        registerForRemoteNotifications()
    }

    private func setLaunchNotification(notification: Any) {
        launchNotification = notification
        AmplifyRTNEventManager.shared.sendEventToJS(
            AmplifyRTNEvent(type: NativeEvent.launchNotificationOpened, payload: notification)
        )
    }

    private func exitBackgroundMode() {
        if isBackgroundMode {
            isBackgroundMode = false
            justExitedBackgroundMode = true
        }
    }

    private func registerForRemoteNotifications() {
        if RCTRunningInAppExtension() {
            return
        }

        DispatchQueue.main.async {
            RCTSharedApplication()?.registerForRemoteNotifications()
        }
    }
}
