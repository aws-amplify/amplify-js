/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import React from 'react';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Auth, I18n, Logger } from 'aws-amplify';
import { AmplifyButton, FormField, LinkCell, Header, ErrorRow, SignedOutMessage, Wrapper } from '../AmplifyUI';
import AuthPiece, { IAuthPieceProps, IAuthPieceState } from './AuthPiece';
import { AmplifyThemeType } from '../AmplifyTheme';
import TEST_ID from '../AmplifyTestIDs';
import { setTestId } from '../Utils';

const logger = new Logger('VerifyContact');

interface IVerifyContactProps extends IAuthPieceProps {}

interface IVerifyContactState extends IAuthPieceState {
	code?: string;
	pickAttr?: string;
	verifyAttr?: string;
}

export default class VerifyContact extends AuthPiece<IVerifyContactProps, IVerifyContactState> {
	constructor(props: IVerifyContactProps) {
		super(props);

		this._validAuthStates = ['verifyContact'];
		this.state = {
			verifyAttr: null,
			error: null,
		};

		this.verify = this.verify.bind(this);
		this.submit = this.submit.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		if (props.authData) {
			const { unverified } = props.authData;
			if (!unverified) {
				logger.debug('no unverified contact');
				return null;
			}

			const { email, phone_number } = unverified;
			if (email && !state.pickAttr) {
				return {
					pickAttr: 'email',
				};
			} else if (phone_number && !state.pickAttr) {
				return {
					pickAttr: 'phone_number',
				};
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	verify() {
		const user = this.props.authData;
		const attr = this.state.pickAttr;
		if (!attr) {
			this.error('Neither Email nor Phone Number selected');
			return;
		}

		const that = this;
		Auth.verifyCurrentUserAttribute(attr)
			.then((data) => {
				logger.debug(data);
				that.setState({ verifyAttr: attr });
			})
			.catch((err) => this.error(err));
	}

	submit() {
		const attr = this.state.verifyAttr;
		const { code } = this.state;
		Auth.verifyCurrentUserAttributeSubmit(attr, code)
			.then((data) => {
				logger.debug(data);
				this.changeState('signedIn', this.props.authData);
			})
			.catch((err) => this.error(err));
	}

	skip() {
		this.changeState('signedIn');
	}

	// Have to do it in this way to avoid null or undefined element in React.createElement()
	createPicker(unverified: { email?: string; phone_number?: string }) {
		const { email, phone_number } = unverified;
		if (email && phone_number) {
			return (
				<Picker
					selectedValue={this.state.pickAttr}
					onValueChange={(value, index) => this.setState({ pickAttr: value })}
					{...setTestId(TEST_ID.AUTH.VERIFY_CONTACT_PICKER)}
				>
					<Picker.Item label={I18n.get('Email')} value="email" />
					<Picker.Item label={I18n.get('Phone Number')} value="phone_number" />
				</Picker>
			);
		} else if (email) {
			return (
				<Picker
					selectedValue={this.state.pickAttr}
					onValueChange={(value, index) => this.setState({ pickAttr: value })}
					{...setTestId(TEST_ID.AUTH.VERIFY_CONTACT_PICKER)}
				>
					<Picker.Item label={I18n.get('Email')} value="email" />
				</Picker>
			);
		} else if (phone_number) {
			return (
				<Picker
					selectedValue={this.state.pickAttr}
					onValueChange={(value, index) => this.setState({ pickAttr: value })}
					{...setTestId(TEST_ID.AUTH.VERIFY_CONTACT_PICKER)}
				>
					<Picker.Item label={I18n.get('Phone Number')} value="phone_number" />
				</Picker>
			);
		} else {
			return null;
		}
	}

	verifyBody(theme: AmplifyThemeType) {
		const { unverified } = this.props.authData;
		if (!unverified) {
			logger.debug('no unverified contact');
			return null;
		}

		const { email, phone_number } = unverified;
		return (
			<View style={theme.sectionBody}>
				{this.createPicker(unverified)}
				<AmplifyButton
					theme={theme}
					text={I18n.get('Verify')}
					onPress={this.verify}
					disabled={!this.state.pickAttr}
					{...setTestId(TEST_ID.AUTH.VERIFY_BUTTON)}
				/>
			</View>
		);
	}

	submitBody(theme: AmplifyThemeType) {
		return (
			<View style={theme.sectionBody}>
				<FormField
					theme={theme}
					onChangeText={(text) => this.setState({ code: text })}
					label={I18n.get('Confirmation Code')}
					placeholder={I18n.get('Enter your confirmation code')}
					required={true}
					{...setTestId(TEST_ID.AUTH.CONFIRMATION_CODE_INPUT)}
				/>
				<AmplifyButton
					theme={theme}
					text={I18n.get('Submit')}
					onPress={this.submit}
					disabled={!this.state.code}
					{...setTestId(TEST_ID.AUTH.SUBMIT_BUTTON)}
				/>
			</View>
		);
	}

	showComponent(theme: AmplifyThemeType) {
		return (
			<Wrapper>
				<View style={theme.section}>
					<View>
						<Header theme={theme} testID={TEST_ID.AUTH.VERIFY_CONTACT_TEXT}>
							{I18n.get('Verify Contact')}
						</Header>
						{!this.state.verifyAttr && this.verifyBody(theme)}
						{this.state.verifyAttr && this.submitBody(theme)}
						<View style={theme.sectionFooter}>
							<LinkCell theme={theme} onPress={() => this.changeState('signedIn')} testID={TEST_ID.AUTH.SKIP_BUTTON}>
								{I18n.get('Skip')}
							</LinkCell>
						</View>
						<ErrorRow theme={theme}>{this.state.error}</ErrorRow>
					</View>
					<SignedOutMessage {...this.props} />
				</View>
			</Wrapper>
		);
	}
}
