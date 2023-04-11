// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Foundation

enum NativeEvent {
    case tokenReceived
    case notificationOpened
    case launchNotificationOpened
    case backgroundMessageReceived
    case foregroundMessageReceived

    var key: String {
        switch(self) {
        case .tokenReceived:
            return "TOKEN_RECEIVED"
        case .notificationOpened:
            return "NOTIFICATION_OPENED"
        case .launchNotificationOpened:
            return "LAUNCH_NOTIFICATION_OPENED"
        case .backgroundMessageReceived:
            return "BACKGROUND_MESSAGE_RECEIVED"
        case .foregroundMessageReceived:
            return "FOREGROUND_MESSAGE_RECEIVED"
        }
    }

    var name: String {
        switch(self) {
        case .tokenReceived:
            return "TokenReceived"
        case .notificationOpened:
            return "NotificationOpened"
        case .launchNotificationOpened:
            return "LaunchNotificationOpened"
        case .foregroundMessageReceived:
            return "ForegroundMessageReceived"
        case .backgroundMessageReceived:
            return "BackgroundMessageReceived"
        }
    }
}

struct AmplifyRTNEvent {
    var type: NativeEvent
    var payload: Any
}

class AmplifyRTNEventManager {
    static let shared = AmplifyRTNEventManager()

    private var eventQueue: [AmplifyRTNEvent] = []
    private var sendEvent: ((AmplifyRTNEvent) -> Void)?

    func setSendEvent(sendEvent: @escaping (AmplifyRTNEvent) -> Void) {
        self.sendEvent = sendEvent
        flushQueuedEvents();
    }

    func sendEventToJS(_ event: AmplifyRTNEvent) {
        if let sendEvent = self.sendEvent {
            sendEvent(event)
        } else {
            eventQueue.append(event)
        }
    }

    private func flushQueuedEvents() {
        while (!eventQueue.isEmpty) {
            sendEventToJS(eventQueue.removeFirst())
        }
    }
}
