// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { validateUserProfile } from '../../../../../src/pushNotifications/providers/customer-profiles/utils/validateUserProfile';
import {
	PushNotificationError,
	PushNotificationValidationErrorCode,
} from '../../../../../src/pushNotifications/errors';
import { UserProfile } from '../../../../../src/pushNotifications/providers/customer-profiles/types';

const MAX = 255;
const atMax = 'a'.repeat(MAX);
const overMax = 'a'.repeat(MAX + 1);

const expectInvalid = (userProfile: UserProfile) => {
	let error: unknown;
	try {
		validateUserProfile(userProfile);
	} catch (caught) {
		error = caught;
	}
	expect(error).toBeInstanceOf(PushNotificationError);
	expect((error as PushNotificationError).name).toBe(
		PushNotificationValidationErrorCode.InvalidUserProfile,
	);
};

describe('validateUserProfile (customer-profiles)', () => {
	describe('invalid profiles', () => {
		it('throws for an over-length customAttributes value (256)', () => {
			expectInvalid({ customAttributes: { key: overMax } });
		});

		it('throws for an over-length customAttributes key (256)', () => {
			expectInvalid({ customAttributes: { [overMax]: 'value' } });
		});

		it("throws for the reserved 'principalId' key", () => {
			expectInvalid({ customAttributes: { principalId: 'value' } });
		});

		it('throws for a non-string customAttributes value', () => {
			expectInvalid({
				customAttributes: { key: 123 as unknown as string },
			});
		});

		it('throws when customAttributes is not a plain object (array)', () => {
			expectInvalid({
				customAttributes: ['a'] as unknown as Record<string, string>,
			});
		});

		it('throws when customAttributes is null', () => {
			expectInvalid({
				customAttributes: null as unknown as Record<string, string>,
			});
		});

		it('throws for an over-length email', () => {
			expectInvalid({ email: overMax });
		});

		it('throws for an over-length name', () => {
			expectInvalid({ name: overMax });
		});

		it('throws for an over-length phone', () => {
			expectInvalid({ phone: overMax });
		});

		it('throws for an over-length location.city', () => {
			expectInvalid({ location: { city: overMax } });
		});

		it('throws for an over-length location.country', () => {
			expectInvalid({ location: { country: overMax } });
		});

		it('throws for an over-length location.postalCode', () => {
			expectInvalid({ location: { postalCode: overMax } });
		});

		it('throws for an over-length location.region', () => {
			expectInvalid({ location: { region: overMax } });
		});

		it('throws when location is null', () => {
			expectInvalid({
				location: null as unknown as UserProfile['location'],
			});
		});

		it('throws when location is an array', () => {
			expectInvalid({
				location: [] as unknown as UserProfile['location'],
			});
		});

		it('throws for a non-string top-level field', () => {
			expectInvalid({ name: 42 as unknown as string });
		});
	});

	describe('valid profiles', () => {
		it('passes for an undefined userProfile', () => {
			expect(() => {
				validateUserProfile(undefined);
			}).not.toThrow();
		});

		it('passes for an empty userProfile (no customAttributes)', () => {
			expect(() => {
				validateUserProfile({});
			}).not.toThrow();
		});

		it('passes for an empty-string customAttributes value', () => {
			expect(() => {
				validateUserProfile({ customAttributes: { key: '' } });
			}).not.toThrow();
		});

		it('passes at the 255-char boundary for keys and values', () => {
			expect(() => {
				validateUserProfile({ customAttributes: { [atMax]: atMax } });
			}).not.toThrow();
		});

		it('passes for email/name/phone/location at 255 chars', () => {
			expect(() => {
				validateUserProfile({
					email: atMax,
					name: atMax,
					phone: atMax,
					location: {
						city: atMax,
						country: atMax,
						postalCode: atMax,
						region: atMax,
					},
				});
			}).not.toThrow();
		});
	});
});
