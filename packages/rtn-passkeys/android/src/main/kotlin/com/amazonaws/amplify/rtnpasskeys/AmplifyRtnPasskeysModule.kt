// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpasskeys

import androidx.annotation.ChecksSdkIntAtLeast
import androidx.credentials.CreateCredentialResponse
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.PublicKeyCredential
import androidx.credentials.exceptions.CreateCredentialCancellationException
import androidx.credentials.exceptions.CreateCredentialProviderConfigurationException
import androidx.credentials.exceptions.CreateCredentialUnsupportedException
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialProviderConfigurationException
import androidx.credentials.exceptions.GetCredentialUnsupportedException
import androidx.credentials.exceptions.domerrors.DataError
import androidx.credentials.exceptions.domerrors.InvalidStateError
import androidx.credentials.exceptions.domerrors.NotAllowedError
import androidx.credentials.exceptions.publickeycredential.CreatePublicKeyCredentialDomException
import androidx.credentials.exceptions.publickeycredential.GetPublicKeyCredentialDomException

import com.facebook.fbreact.specs.NativeAmplifyRtnPasskeysSpec
import com.facebook.react.bridge.JSONArguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineDispatcher

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

import org.json.JSONObject

@ReactModule(name = AmplifyRtnPasskeysModule.NAME)
class AmplifyRtnPasskeysModule(
	reactContext: ReactApplicationContext,
	dispatcher: CoroutineDispatcher = Dispatchers.Default
) :
	NativeAmplifyRtnPasskeysSpec(reactContext) {

	private val moduleScope = CoroutineScope(dispatcher)

	override fun getName(): String {
		return NAME
	}

	companion object {
		const val NAME = "AmplifyRtnPasskeys"
	}

	@ChecksSdkIntAtLeast(api = android.os.Build.VERSION_CODES.P)
	override fun getIsPasskeySupported(): Boolean {
		// Requires Android SDK >= 28 (PIE)
		return android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P
	}

	override fun createPasskey(input: ReadableMap, promise: Promise) {
		if (!isPasskeySupported) {
			return promise.reject(
				"NOT_SUPPORTED",
				CreateCredentialUnsupportedException("CreatePasskeyNotSupported")
			)
		}

		val credentialManager = CredentialManager.create(reactApplicationContext.applicationContext)

		val requestJson = JSONObject(input.toHashMap()).toString()
		val request =
			CreatePublicKeyCredentialRequest(requestJson = requestJson)

		moduleScope.launch {
			try {
				val result: CreateCredentialResponse =
					credentialManager.createCredential(
						context = currentActivity ?: reactApplicationContext,
						request = request
					)

				val publicKeyResult =
					result as? CreatePublicKeyCredentialResponse
						?: throw Exception("CreatePasskeyFailed")

				val jsonObject = JSONObject(publicKeyResult.registrationResponseJson)

				promise.resolve(JSONArguments.fromJSONObject(jsonObject))
			} catch (e: Exception) {
				val errorCode = handlePasskeyFailure(e)
				promise.reject(errorCode, e)
			}
		}
	}

	override fun getPasskey(input: ReadableMap, promise: Promise) {
		if (!isPasskeySupported) {
			return promise.reject(
				"NOT_SUPPORTED",
				GetCredentialUnsupportedException("GetPasskeyNotSupported")
			)
		}

		val credentialManager = CredentialManager.create(reactApplicationContext.applicationContext)

		val requestJson = JSONObject(input.toHashMap()).toString()
		val options =
			GetPublicKeyCredentialOption(requestJson = requestJson)
		val request = GetCredentialRequest(credentialOptions = listOf(options))

		moduleScope.launch {
			try {
				val result: GetCredentialResponse =
					credentialManager.getCredential(
						context = currentActivity ?: reactApplicationContext,
						request = request
					)

				val publicKeyResult =
					result.credential as? PublicKeyCredential ?: throw Exception("GetPasskeyFailed")

				val jsonObject = JSONObject(publicKeyResult.authenticationResponseJson)

				promise.resolve(JSONArguments.fromJSONObject(jsonObject))
			} catch (e: Exception) {
				val errorCode = handlePasskeyFailure(e)
				promise.reject(errorCode, e)
			}
		}
	}

	private fun handlePasskeyFailure(e: Exception): String {
		return when (e) {
			is CreatePublicKeyCredentialDomException -> {
				when (e.domError) {
					is NotAllowedError -> "CANCELED"
					is InvalidStateError -> "DUPLICATE"
					is DataError -> "RELYING_PARTY_MISMATCH"
					else -> "FAILED"
				}
			}

			is GetPublicKeyCredentialDomException -> {
				when (e.domError) {
					is NotAllowedError -> "CANCELED"
					is DataError -> "RELYING_PARTY_MISMATCH"
					else -> "FAILED"
				}
			}

			is CreateCredentialCancellationException,
			is GetCredentialCancellationException -> "CANCELED"

			is CreateCredentialUnsupportedException,
			is CreateCredentialProviderConfigurationException,
			is GetCredentialUnsupportedException,
			is GetCredentialProviderConfigurationException -> "NOT_SUPPORTED"

			else -> "FAILED"
		}
	}
}
