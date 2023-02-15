// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Foundation

private let isBackgroundModeKey = "isBackgroundMode"
private let completionHandlerIdKey = "completionHandlerId"

class AmplifyRTNPushNotificationManager  {
    static let shared = AmplifyRTNPushNotificationManager()

    private var cachedDeviceToken: String?
    private var launchNotification: Any?
    private var isBackgroundMode = false
    private var justExitedBackgroundMode = false
    private var rctContentHasAppeared = false
    private var remoteNotificationCompletionHandlers: [String: (UIBackgroundFetchResult) -> Void] = [:]
    private let sharedEventManager: AmplifyRTNEventManager

    init() {
        sharedEventManager = AmplifyRTNEventManager.shared

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
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(rctContentDidAppear),
            name: Notification.Name.RCTContentDidAppear,
            object: nil
        )
    }

    deinit {
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
        NotificationCenter.default.removeObserver(
            self,
            name: Notification.Name.RCTContentDidAppear,
            object: nil
        )
    }

    func handleLaunchOptions(launchOptions: [AnyHashable: Any]) {
        // to ge the launch notification when the app is laucnhed from the "killed" state
        if let remoteNotification = launchOptions[UIApplication.LaunchOptionsKey.remoteNotification],
           let application = RCTSharedApplication(),
           application.applicationState != .background {
            launchNotification = remoteNotification
        }
    }

    func attachInitialProps(launchOptions: [AnyHashable: Any]) -> [AnyHashable: Any] {
        var props: [AnyHashable: Any] = [isBackgroundModeKey: isBackgroundMode]

        // if the App is waking up by a remote notification in the background
        // set the initial prop isBackgroundMode as true
        if launchOptions[UIApplication.LaunchOptionsKey.remoteNotification] != nil,
           let application = RCTSharedApplication(),
           application.applicationState == .background {
            isBackgroundMode = true
            props[isBackgroundModeKey] = isBackgroundMode
        }

        return props;
    }

    func requestPermissions(
        _ permissions: [AnyHashable: Any],
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        if RCTRunningInAppExtension() {
            reject("ERROR", "requestMessagingPermission can not be called in App Extensions", nil)
            return
        }

        let notificationCenter = UNUserNotificationCenter.current()
        var options: UNAuthorizationOptions = []

        if (permissions["alert"]) as? Bool == true {
            options.insert(.alert)
        }

        if (permissions["badge"]) as? Bool == true {
            options.insert(.badge)
        }

        if (permissions["sound"]) as? Bool == true {
            options.insert(.sound)
        }

        if #available(iOS 12, *) {
            if (permissions["criticalAlert"]) as? Bool == true {
                options.insert(.criticalAlert)
            }

            if (permissions["provisional"]) as? Bool == true {
                options.insert(.provisional)
            }
        }

        notificationCenter.requestAuthorization(options: options) { _, error in
            if error != nil {
                reject("ERROR", error?.localizedDescription, error)
            } else {
                self.resolvePermissionStatus(resolve: resolve, reject: reject)
            }
        }
    }

    func getPermissionStatus(
        _ resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        resolvePermissionStatus(resolve: resolve, reject: reject)
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
        let completionHandlerId = UUID().uuidString
        var userInfoCopy = userInfo

        remoteNotificationCompletionHandlers[completionHandlerIdKey] = completionHandler
        userInfoCopy[completionHandlerIdKey] = completionHandlerId

        if let application = RCTSharedApplication() {
            if (application.applicationState == .inactive) {
                if justExitedBackgroundMode {
                    // When an end user taps on a notification to bring the App to the foregroundand
                    // and the App just exited from the background mode, we treat the tapped notification
                    // as the "launch notification."
                    launchNotification = userInfo
                } else {
                    sharedEventManager.sendEventToJS(
                        AmplifyRTNEvent(type: NativeEvent.notificationOpened, payload: userInfo)
                    )
                }
            } else if (application.applicationState == .background) {
                sharedEventManager.sendEventToJS(
                    AmplifyRTNEvent(type: NativeEvent.backgroundMessageReceived, payload: userInfo)
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

    private func resolvePermissionStatus(
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            resolve(settings.authorizationStatus.rawValue)
        }
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

    @objc
    private func rctContentDidAppear() {
        rctContentHasAppeared = true
    }

    private func setLaunchNotification(notification: Any) {
        launchNotification = notification
        AmplifyRTNEventManager.shared.sendEventToJS(
            AmplifyRTNEvent(type: NativeEvent.launchNotificationOpened, payload: notification)
        )
    }

    private func exitBackgroundMode() {
        if let rctRootView = UIApplication.shared.delegate?.window??.rootViewController?.view as? RCTRootView,
           let appProperties = rctRootView.appProperties,
           let wasHeadless = appProperties[isBackgroundModeKey] as? Bool,
           wasHeadless == true {
            isBackgroundMode = false
            justExitedBackgroundMode = true
            var appPropertiesCopy = appProperties
            appPropertiesCopy[isBackgroundModeKey] = isBackgroundMode

            if (rctContentHasAppeared) {
                rctRootView.appProperties = appPropertiesCopy
            } else {
                // If the react App hasn't been rendered wait to set the appProperties
                // to ensure the react App can pick up updated props (isBackgroundMode)
                // and re-render
                var observer: NSObjectProtocol?
                let setAppProperties: (Notification) -> Void = { _ in
                    rctRootView.appProperties = appPropertiesCopy
                    if (observer != nil) {
                        NotificationCenter.default.removeObserver(observer!)
                    }
                }

                observer = NotificationCenter.default.addObserver(
                    forName: Notification.Name.RCTContentDidAppear,
                    object: nil,
                    queue: nil,
                    using: setAppProperties
                )
            }
        }
    }

    private func registerForRemoteNotifications() {
        if RCTRunningInAppExtension() {
            return
        }

        RCTSharedApplication()?.registerForRemoteNotifications()
    }
}
