import { pushNotification } from '../../../pushNotificationsClass.native';

export function enable(): void {
	return pushNotification.enable();
}
