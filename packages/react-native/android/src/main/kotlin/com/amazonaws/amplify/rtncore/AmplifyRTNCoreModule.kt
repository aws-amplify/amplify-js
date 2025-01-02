// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtncore

import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

import androidx.credentials.CredentialManager
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.exceptions.*
import androidx.credentials.exceptions.publickeycredential.CreatePublicKeyCredentialDomException
import androidx.credentials.exceptions.publickeycredential.GetPublicKeyCredentialDomException

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

class AmplifyRTNCoreModule(reactContext: ReactApplicationContext) :
	ReactContextBaseJavaModule(reactContext) {
	private val coroutineScope = CoroutineScope(Dispatchers.Default)

	override fun getName(): String {
		return NAME
	}

	@ReactMethod
	fun computeModPow(
		payload: ReadableMap,
		promise: Promise,
	) {
		BigInteger.computeModPow(payload, promise)
	}

	@ReactMethod
	fun computeS(
		payload: ReadableMap,
		promise: Promise,
	) {
		BigInteger.computeS(payload, promise)
	}

	@ReactMethod
	fun getDeviceName(promise: Promise) {
		promise.resolve(Build.MODEL)
	}

	companion object {
		const val NAME = "AmplifyRTNCore"
	}

	@ReactMethod
	fun createPasskey(requestJson: String, promise: Promise) {
		val credentialManager = CredentialManager.create(reactApplicationContext.applicationContext)
		val createPublicKeyCredentialRequest = CreatePublicKeyCredentialRequest(requestJson)

		coroutineScope.launch {
			try {
				val result = currentActivity?.let {
					credentialManager.createCredential(
						it,
						createPublicKeyCredentialRequest
					)
				}

				val response =
					result?.data?.getString("androidx.credentials.BUNDLE_KEY_REGISTRATION_RESPONSE_JSON")
				promise.resolve(response)
			} catch (e: CreateCredentialException) {
				promise.reject("Passkey", handlePasskeyRegistrationException(e))
			}
		}
	}

	private fun handlePasskeyRegistrationException(e: CreateCredentialException): String {
		e.printStackTrace()
		when (e) {
			is CreatePublicKeyCredentialDomException -> {
				return e.errorMessage.toString()
			}

			is CreateCredentialCancellationException -> {
				return "UserCancelled"
			}

			is CreateCredentialInterruptedException -> {
				return "Interrupted"
			}

			is CreateCredentialProviderConfigurationException -> {
				return "NotConfigured"
			}

			is CreateCredentialUnknownException -> {
				return "UnknownError"
			}

			is CreateCredentialUnsupportedException -> {
				return "NotSupported"
			}

			else -> {
				return e.errorMessage.toString()
			}
		}
	}

	@ReactMethod
	fun getPasskey(requestJson: String, promise: Promise) {
		val credentialManager = CredentialManager.create(reactApplicationContext.applicationContext)
		val getCredentialRequest =
			GetCredentialRequest(listOf(GetPublicKeyCredentialOption(requestJson)))

		coroutineScope.launch {
			try {
				val result =
					currentActivity?.let { credentialManager.getCredential(it, getCredentialRequest) }

				val response =
					result?.credential?.data?.getString("androidx.credentials.BUNDLE_KEY_AUTHENTICATION_RESPONSE_JSON")
				promise.resolve(response)
			} catch (e: GetCredentialException) {
				promise.reject("Passkey", handlePasskeyAuthenticationException(e))
			}
		}
	}

	private fun handlePasskeyAuthenticationException(e: GetCredentialException): String {
		e.printStackTrace()
		when (e) {
			is GetPublicKeyCredentialDomException -> {
				return e.errorMessage.toString()
			}

			is GetCredentialCancellationException -> {
				return "UserCancelled"
			}

			is GetCredentialInterruptedException -> {
				return "Interrupted"
			}

			is GetCredentialProviderConfigurationException -> {
				return "NotConfigured"
			}

			is GetCredentialUnknownException -> {
				return "UnknownError"
			}

			is GetCredentialUnsupportedException -> {
				return "NotSupported"
			}

			is NoCredentialException -> {
				return "NoCredentials"
			}

			else -> {
				return e.errorMessage.toString()
			}
		}
	}
}
