import { pushNotification } from '../../../pushNotificationsClass.native';
import { PushNotificationPermissions } from '../../../types';

export async function requestPermissions(
	permissions: PushNotificationPermissions = {
		alert: true,
		badge: true,
		sound: true,
	}
): Promise<boolean> {
	return pushNotification.requestPermissions(permissions);
}
