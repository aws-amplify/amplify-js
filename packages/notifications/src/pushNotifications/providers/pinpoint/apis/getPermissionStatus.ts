import { pushNotification } from '../../../pushNotificationsClass.native';
import { PushNotificationPermissionStatus } from '../../../types';

export async function getPermissionStatus(): Promise<PushNotificationPermissionStatus> {
	return pushNotification.getPermissionStatus();
}
