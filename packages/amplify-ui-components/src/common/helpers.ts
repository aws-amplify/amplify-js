import { Hub, I18n, Logger } from '@aws-amplify/core';
import {
	UI_AUTH_CHANNEL,
	TOAST_AUTH_ERROR_EVENT,
	AUTH_STATE_CHANGE_EVENT,
	PHONE_EMPTY_ERROR_MESSAGE,
	COUNTRY_DIAL_CODE_SUFFIX,
	PHONE_SUFFIX,
} from './constants';
import {
	AuthState,
	AuthStateHandler,
	UsernameAlias,
} from '../common/types/auth-types';
import { PhoneNumberInterface } from '../components/amplify-auth-fields/amplify-auth-fields-interface';
import { Translations } from './Translations';
import Auth from '@aws-amplify/auth';

const logger = new Logger('helpers');

export interface ToastError {
	code?: string;
	name?: string;
	message: string;
}

export const hasShadowDom = (el: HTMLElement) => {
	return !!el.shadowRoot && !!(el as any).attachShadow;
};

/**
 * Finds closest element that matches the selector from the ancestor tree.
 * Trasverses through shadow DOM and slots.
 * 
 * Adpated from: https://stackoverflow.com/a/56105394
 */
export const closestElement = (selector: string, base: Element) => {
	function _closestFrom(el): Element {
		if (!el || el === document || el === window) return null;
		if (el.matches(selector)) return base; // return if current element matches the selector

		if (el.assignedSlot) el = el.assignedSlot; // traverse up slots if slotted
		const found = el.closest(selector);
		return found ? found : _closestFrom(el.getRootNode().host); // try to traverse up shadows
	}
	return _closestFrom(base);
};

export const dispatchToastHubEvent = (error: ToastError) => {
	Hub.dispatch(UI_AUTH_CHANNEL, {
		event: TOAST_AUTH_ERROR_EVENT,
		message: I18n.get(error.message),
	});
};

export const dispatchAuthStateChangeEvent: AuthStateHandler = (
	nextAuthState: AuthState,
	data?: object
) => {
	Hub.dispatch(UI_AUTH_CHANNEL, {
		event: AUTH_STATE_CHANGE_EVENT,
		message: nextAuthState,
		data,
	});
};

export const composePhoneNumberInput = (phoneNumber: PhoneNumberInterface) => {
	if (!phoneNumber.phoneNumberValue) {
		throw new Error(PHONE_EMPTY_ERROR_MESSAGE);
	}

	const sanitizedPhoneNumberValue = phoneNumber.phoneNumberValue.replace(
		/[-()\s]/g,
		''
	);

	return `${phoneNumber.countryDialCodeValue}${sanitizedPhoneNumberValue}`;
};

export const checkUsernameAlias = (usernameAlias: any) => {
	if (!(usernameAlias in UsernameAlias)) {
		throw new Error(
			`Invalid username Alias - ${usernameAlias}. Instead use ${Object.values(
				UsernameAlias
			)}`
		);
	}
};

export const onAuthUIStateChange = (authStateHandler: AuthStateHandler) => {
	const authUIStateHandler = async data => {
		const { payload } = data;
		switch (payload.event) {
			case AUTH_STATE_CHANGE_EVENT:
				if (payload.message) {
					if (payload.message === AuthState.SignedIn) {
						// for AuthState.SignedIn, use an Auth Guard
						try {
							const user = await Auth.currentAuthenticatedUser();
							authStateHandler(payload.message as AuthState, user);
						} catch (e) {
							logger.error('User is not authenticated');
						}
					} else {
						authStateHandler(payload.message as AuthState, payload.data);
					}
				}
				break;
		}
	};
	Hub.listen(UI_AUTH_CHANNEL, authUIStateHandler);
	
	const unsubscribe = () => {
		// Replace user's `authStateHandler` with a noop so that we don't trigger side-effects during the async `authUIStateHandler` when unsubscribed
		authStateHandler = () => {};
		
		Hub.remove(UI_AUTH_CHANNEL, authUIStateHandler);
	}
	
	return unsubscribe;
};

export const isHintValid = field => {
	return !(field['hint'] === null || typeof field['hint'] === 'string');
};

// Required attributes come from https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
export const getRequiredAttributesMap = () => ({
	address: {
		label: I18n.get(Translations.ADDRESS_LABEL),
		placeholder: I18n.get(Translations.ADDRESS_PLACEHOLDER),
	},
	nickname: {
		label: I18n.get(Translations.NICKNAME_LABEL),
		placeholder: I18n.get(Translations.NICKNAME_PLACEHOLDER),
	},
	birthdate: {
		label: I18n.get(Translations.BIRTHDATE_LABEL),
		placeholder: I18n.get(Translations.BIRTHDATE_PLACEHOLDER),
	},
	phone_number: {
		label: I18n.get(Translations.PHONE_LABEL),
		placeholder: I18n.get(Translations.PHONE_PLACEHOLDER),
	},
	email: {
		lable: I18n.get(Translations.EMAIL_LABEL),
		placeholder: I18n.get(Translations.EMAIL_PLACEHOLDER),
	},
	picture: {
		label: I18n.get(Translations.PICTURE_LABEL),
		placeholder: I18n.get(Translations.PICTURE_PLACEHOLDER),
	},
	family_name: {
		label: I18n.get(Translations.FAMILY_NAME_LABEL),
		placeholder: I18n.get(Translations.FAMILY_NAME_PLACEHOLDER),
	},
	preferred_username: {
		label: I18n.get(Translations.PREFERRED_USERNAME_LABEL),
		placeholder: I18n.get(Translations.PREFERRED_USERNAME_PLACEHOLDER),
	},
	gender: {
		label: I18n.get(Translations.GENDER_LABEL),
		placeholder: I18n.get(Translations.GENDER_PLACEHOLDER),
	},
	profile: {
		label: I18n.get(Translations.PROFILE_LABEL),
		placeholder: I18n.get(Translations.PROFILE_PLACEHOLDER),
	},
	given_name: {
		label: I18n.get(Translations.GIVEN_NAME_LABEL),
		placeholder: I18n.get(Translations.GIVEN_NAME_PLACEHOLDER),
	},
	zoneinfo: {
		label: I18n.get(Translations.ZONEINFO_LABEL),
		placeholder: I18n.get(Translations.ZONEINFO_PLACEHOLDER),
	},
	locale: {
		label: I18n.get(Translations.LOCALE_LABEL),
		placeholder: I18n.get(Translations.LOCALE_PLACEHOLDER),
	},
	updated_at: {
		label: I18n.get(Translations.UPDATED_AT_LABEL),
		placeholder: I18n.get(Translations.UPDATED_AT_PLACEHOLDER),
	},
	middle_name: {
		label: I18n.get(Translations.MIDDLE_NAME_LABEL),
		placeholder: I18n.get(Translations.MIDDLE_NAME_PLACEHOLDER),
	},
	website: {
		label: I18n.get(Translations.WEBSITE_LABEL),
		placeholder: I18n.get(Translations.WEBSITE_PLACEHOLDER),
	},
	name: {
		label: I18n.get(Translations.NAME_LABEL),
		placeholder: I18n.get(Translations.NAME_PLACEHOLDER),
	},
});

export function handlePhoneNumberChange(
	event,
	phoneNumber: PhoneNumberInterface
) {
	const name = event.target.name;
	const value = event.target.value;

	/** Cognito expects to have a string be passed when signing up. Since the Select input is separate
	 * input from the phone number input, we need to first capture both components values and combined
	 * them together.
	 */

	if (name === COUNTRY_DIAL_CODE_SUFFIX) {
		phoneNumber.countryDialCodeValue = value;
	}

	if (name === PHONE_SUFFIX) {
		phoneNumber.phoneNumberValue = value;
	}
}
