// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtncore

import android.os.Build
import android.content.pm.PackageManager
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.exceptions.*
import androidx.credentials.exceptions.publickeycredential.CreatePublicKeyCredentialDomException
import androidx.credentials.exceptions.publickeycredential.GetPublicKeyCredentialDomException
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
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
		private const val ERROR_TAG = "Passkey"
		private const val REGISTRATION_RESPONSE_KEY = "androidx.credentials.BUNDLE_KEY_REGISTRATION_RESPONSE_JSON"
    	private const val AUTHENTICATION_RESPONSE_KEY = "androidx.credentials.BUNDLE_KEY_AUTHENTICATION_RESPONSE_JSON"
		private const val ERROR_USER_CANCELLED = "UserCancelled"
    	private const val ERROR_NOT_SUPPORTED = "NotSupported"
    	private const val ERROR_NOT_CONFIGURED = "NotConfigured"
    	private const val ERROR_INTERRUPTED = "Interrupted"
    	private const val ERROR_UNKNOWN = "UnknownError"
    	private const val ERROR_NO_CREDENTIALS = "NoCredentials"
    }

	private fun isValidJson(json: String): Boolean {
		return try {
			org.json.JSONObject(json)
			true
		} catch (e: Exception) {
			false
		}
	}

    @ReactMethod
    fun createPasskey(requestJson: String, promise: Promise) {
		// Early validations
		if (currentActivity == null) {
			promise.reject(ERROR_TAG, "Activity is null")
			return
		}
	
		if (requestJson.isBlank()) {
			promise.reject(ERROR_TAG, "Invalid request: empty input")
			return
		}
	
		if (!isValidJson(requestJson)) {
			promise.reject(ERROR_TAG, "Invalid JSON input")
			return
		}
	
		coroutineScope.launch {
			try {
				val credentialManager = CredentialManager
					.create(reactApplicationContext.applicationContext)
				
				val result = credentialManager.createCredential(
					currentActivity!!,
					CreatePublicKeyCredentialRequest(requestJson)
				)
	
				val response = result.data.getString(REGISTRATION_RESPONSE_KEY)
				
				if (response == null) {
					promise.reject(ERROR_TAG, "No response received from credential manager")
				} else {
					promise.resolve(response)
				}
			} catch (e: CreateCredentialException) {
				promise.reject(ERROR_TAG, handlePasskeyRegistrationException(e))
			} catch (e: IllegalStateException) {
				promise.reject(ERROR_TAG, "Activity was destroyed during operation")
			} catch (e: Exception) {
				promise.reject(ERROR_TAG, "Unknown error: ${e.message}")
			}
		}
	}

    private fun handlePasskeyRegistrationException(e: CreateCredentialException): String {
		e.printStackTrace()
		return when (e) {
			is CreatePublicKeyCredentialDomException -> e.errorMessage.toString()
			is CreateCredentialCancellationException -> ERROR_USER_CANCELLED
			is CreateCredentialInterruptedException -> ERROR_INTERRUPTED
			is CreateCredentialProviderConfigurationException -> ERROR_NOT_CONFIGURED
			is CreateCredentialUnknownException -> ERROR_UNKNOWN
			is CreateCredentialUnsupportedException -> ERROR_NOT_SUPPORTED
			else -> e.errorMessage.toString()
		}
	}

    @ReactMethod
    fun getPasskey(requestJson: String, promise: Promise) {
		// Early validations
		if (currentActivity == null) {
			promise.reject(ERROR_TAG, "Activity is null")
			return
		}
	
		if (requestJson.isBlank()) {
			promise.reject(ERROR_TAG, "Invalid request: empty input")
			return
		}
	
		if (!isValidJson(requestJson)) {
			promise.reject(ERROR_TAG, "Invalid JSON input")
			return
		}
	
		coroutineScope.launch {
			try {
				val credentialManager = CredentialManager
					.create(reactApplicationContext.applicationContext)
				
				val result = credentialManager.getCredential(
					currentActivity!!,
					GetCredentialRequest(listOf(GetPublicKeyCredentialOption(requestJson)))
				)
	
				val response = result.credential.data.getString(AUTHENTICATION_RESPONSE_KEY)
				
				if (response == null) {
					promise.reject(ERROR_TAG, "No response received from credential manager")
				} else {
					promise.resolve(response)
				}
			} catch (e: GetCredentialException) {
				promise.reject(ERROR_TAG, handlePasskeyAuthenticationException(e))
			} catch (e: IllegalStateException) {
				promise.reject(ERROR_TAG, "Activity was destroyed during operation")
			} catch (e: Exception) {
				promise.reject(ERROR_TAG, "Unknown error: ${e.message}")
			}
		}
	}

	private fun handlePasskeyAuthenticationException(e: GetCredentialException): String {
		e.printStackTrace()
		return when (e) {
			is GetPublicKeyCredentialDomException -> e.errorMessage.toString()
			is GetCredentialCancellationException -> ERROR_USER_CANCELLED
			is GetCredentialInterruptedException -> ERROR_INTERRUPTED
			is GetCredentialProviderConfigurationException -> ERROR_NOT_CONFIGURED
			is GetCredentialUnknownException -> ERROR_UNKNOWN
			is GetCredentialUnsupportedException -> ERROR_NOT_SUPPORTED
			is NoCredentialException -> ERROR_NO_CREDENTIALS
			else -> e.errorMessage.toString()
		}
	}

    @ReactMethod
	fun getIsPasskeySupported(promise: Promise) {
    	try {
    	    val credentialManager = CredentialManager.create(reactApplicationContext.applicationContext)

        	// Check for minimum API level that supports Credential Manager
        	val hasMinimumApiLevel = Build.VERSION.SDK_INT >= Build.VERSION_CODES.N

        	// Ensure the device has biometric capabilities
        	val hasBiometricSupport = reactApplicationContext.packageManager.hasSystemFeature(
        	    PackageManager.FEATURE_FINGERPRINT
        	)

        	val isSupported = hasMinimumApiLevel && hasBiometricSupport
        	promise.resolve(isSupported)
    	} catch (e: Exception) {
    	    e.printStackTrace()
    	    promise.reject("PasskeyNotSupported", "Failed to check passkey support: ${e.message}")
    	}
	}
}
