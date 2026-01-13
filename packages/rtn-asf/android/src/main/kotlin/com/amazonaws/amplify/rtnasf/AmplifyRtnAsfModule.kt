// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnasf

import com.amazonaws.cognito.clientcontext.data.UserContextDataProvider
import com.facebook.fbreact.specs.NativeAmplifyRtnAsfSpec
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = AmplifyRtnAsfModule.NAME)
class AmplifyRtnAsfModule(reactContext: ReactApplicationContext) :
    NativeAmplifyRtnAsfSpec(reactContext) {

    override fun getName(): String = NAME

    companion object {
        const val NAME = "AmplifyRtnAsf"
    }

    override fun getContextData(userPoolId: String, clientId: String): String? {
        // Return null for empty or whitespace-only parameters
        // Property 2: Invalid Input Returns Null - validates Requirements 2.4
        if (userPoolId.isBlank() || clientId.isBlank()) {
            return null
        }

        return try {
            // The ASF SDK requires username for the signature, but for device fingerprinting
            // purposes we use an empty string as the username is not critical for the
            // context data collection - the important data is device fingerprint, not user identity.
            // The clientId is used as the signature secret.
            UserContextDataProvider.getInstance().getEncodedContextData(
                reactApplicationContext,
                "",  // username - not needed for device fingerprinting
                userPoolId,
                clientId  // signatureSecret
            )
        } catch (e: Exception) {
            // Return null on any exception to ensure graceful degradation
            null
        }
    }
}
