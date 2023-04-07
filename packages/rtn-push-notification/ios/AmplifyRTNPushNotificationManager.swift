// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Foundation
import AmplifyUtilsNotifications

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
    private var launchNotification: [AnyHashable: Any]?
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
        // 1. The host App launch is caused by a notification
        if let remoteNotification = launchOptions[UIApplication.LaunchOptionsKey.remoteNotification] as? [AnyHashable: Any],
           let application = RCTSharedApplication() {
            // 2. The host App is launched from terminated state to the foreground
            //    (including transitioning to foregound), i.e. .active .inactive.
            //    This happens under one of below conditions:
            //      a. Remote notifications are not able to launch the host App (without `content-available: 1`)
            //      b. Remote notifications background mode was not enabled on the host App
            //      c. The end user disabled background refresh of the host App
            // 3. This notification must be tapped by an end user which is recorded as the launch notification
            if application.applicationState != .background {
                launchNotification = remoteNotification

                // NOTE: the notification payload will also be passed into didReceiveRemoteNotification below after
                // this delegate method, didFinishLaunchingWithOptions completes.
                // As this notification will already be recorded as the launch notification, it should not be sent as
                // notificationOpened event, this check is handled in didReceiveRemoteNotification.
            }

            // Otherwise the host App is launched in the background, this notification will be sent to react-native
            // as backgroundMessageReceived event in didReceiveRemoteNotification below.
            // After the host App launched in the background, didFinishLaunchingWithOptions will no longer
            // be fired when an end user taps a notification.
            // After the host App launched in the background, it runs developers' react-native code as well.
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
            switch application.applicationState {
            case .background:
                let completionHandlerId = UUID().uuidString
                var userInfoCopy = userInfo

                remoteNotificationCompletionHandlers[completionHandlerIdKey] = completionHandler
                userInfoCopy[completionHandlerIdKey] = completionHandlerId

                sharedEventManager.sendEventToJS(
                    AmplifyRTNEvent(type: NativeEvent.backgroundMessageReceived, payload: userInfoCopy)
                )

                // Expecting remoteNotificationCompletionHandlers[completionHandlerIdKey] to be called from JS to complete
                // the background notification
            case .inactive:
                if let launchNotification = launchNotification {
                    if NSDictionary(dictionary: launchNotification).isEqual(to: userInfo) {
                        // When the last tapped notification is the same as the launch notification,
                        // it's sent as launchNotificationOpened event, and retrievable via getLaunchNotification.
                        AmplifyRTNEventManager.shared.sendEventToJS(
                            AmplifyRTNEvent(type: NativeEvent.launchNotificationOpened, payload: launchNotification)
                        )
                    } else {
                        // When a launch notification is recorded in handleLaunchOptions above,
                        // but the last tapped notification is not the recorded launch notification, the last
                        // tapped notification will be sent to react-native as notificationOpened event.
                        // This may happen when an end user rapidly tapped on multiple notifications.
                        self.launchNotification = nil
                        sharedEventManager.sendEventToJS(
                            AmplifyRTNEvent(type: NativeEvent.notificationOpened, payload: userInfo)
                        )
                    }
                } else {
                    // When there is no launch notification recorded, the last tapped notification
                    // will be sent to react-native as notificationOpened event.
                    sharedEventManager.sendEventToJS(
                        AmplifyRTNEvent(type: NativeEvent.notificationOpened, payload: userInfo)
                    )
                }
                completionHandler(.noData)
            case .active:
                sharedEventManager.sendEventToJS(
                    AmplifyRTNEvent(type: NativeEvent.foregroundMessageReceived, payload: userInfo)
                )
                completionHandler(.noData)
            @unknown default: break // we don't handle any possible new state added in the future for now
            }
        }
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
            selector: #selector(applicationDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
    }

    private func removeObservers() {
        NotificationCenter.default.removeObserver(
            self,
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )

        NotificationCenter.default.removeObserver(
            self,
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
    }

    @objc
    private func applicationDidBecomeActive() {
        registerForRemoteNotifications()
    }

    @objc
    private func applicationDidEnterBackground() {
        // When App enters background we remove the cached launchNotification
        // as when the App reopens after this point, there won't be a notification
        // that launched the App.
        launchNotification = nil
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
