/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *	 http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { createMachine, MachineConfig } from 'xstate';

// SRPSignInState state machine
const srpSignInStateMachine: MachineConfig<any, any, any> = {
	id: 'srpSignInState',
	initial: 'notStarted',
	context: {},
	states: {
		notStarted: {
			on: {
				initiateSRP: 'initiatingSRPA',
				throwAuthError: 'error',
			},
		},
		initiatingSRPA: {
			on: {
				respondPasswordVerifier: 'respondingPasswordVerifier',
				throwPasswordVerifierError: 'error',
				throwAuthError: 'error',
				cancelSRPSignIn: 'cancelling',
			},
		},
		respondingPasswordVerifier: {
			on: {
				finalizeSRPSignIn: 'signedIn',
				respondNextAuthChallenge: 'nextAuthChallenge',
				cancelSRPSignIn: 'cancelling',
			},
		},
		nextAuthChallenge: {
			type: 'final',
		},
		signedIn: {
			type: 'final',
		},
		cancelling: {
			on: {
				restoreToNotInitialized: 'notStarted',
			},
		},
		error: {
			type: 'final',
		},
	},
};

const finalMachine = createMachine(srpSignInStateMachine);
