package com.amazonaws.amplify.rtnpasskeys

import androidx.credentials.CreateCredentialResponse
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.PublicKeyCredential
import androidx.credentials.exceptions.CreateCredentialCancellationException
import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.CreateCredentialProviderConfigurationException
import androidx.credentials.exceptions.CreateCredentialUnsupportedException
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.GetCredentialProviderConfigurationException
import androidx.credentials.exceptions.GetCredentialUnsupportedException
import androidx.credentials.exceptions.domerrors.DataError
import androidx.credentials.exceptions.domerrors.InvalidStateError
import androidx.credentials.exceptions.domerrors.NotAllowedError
import androidx.credentials.exceptions.publickeycredential.CreatePublicKeyCredentialDomException
import androidx.credentials.exceptions.publickeycredential.GetPublicKeyCredentialDomException
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.fbreact.specs.NativeAmplifyRtnPasskeysSpec
import com.facebook.react.bridge.JSONArguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

@ReactModule(name = AmplifyRtnPasskeysModule.NAME)
class AmplifyRtnPasskeysModule(reactContext: ReactApplicationContext) :
	NativeAmplifyRtnPasskeysSpec(reactContext) {

	private val credentialManager =
		CredentialManager.create(reactApplicationContext.applicationContext)
	private val coroutineScope = CoroutineScope(Dispatchers.Default)


	override fun getName(): String {
		return NAME
	}

	override fun getIsPasskeySupported(): Boolean {
		return true
	}

	override fun createPasskey(input: ReadableMap, promise: Promise) {
		val requestJson = JSONObject(input.toHashMap()).toString()

		val request =
			CreatePublicKeyCredentialRequest(requestJson = requestJson)

		coroutineScope.launch {
			try {
				val result: CreateCredentialResponse =
					credentialManager.createCredential(context = reactApplicationContext, request = request)

				val publicKeyResult =
					result as? CreatePublicKeyCredentialResponse ?: throw Exception("PasskeyRegistrationFailed")

				val jsonObject = JSONObject(publicKeyResult.registrationResponseJson)

				promise.resolve(JSONArguments.fromJSONObject(jsonObject))
			} catch (e: CreateCredentialException) {
				val errorCode = handlePasskeyRegistrationFailure(e)
				promise.reject(errorCode, e)
			} catch (e: Exception) {
				promise.reject("FAILED", e)
			}
		}
	}

	override fun getPasskey(input: ReadableMap, promise: Promise) {
		val requestJson = JSONObject(input.toHashMap()).toString()
		val options =
			GetPublicKeyCredentialOption(requestJson = requestJson)
		val request = GetCredentialRequest(credentialOptions = listOf(options))

		coroutineScope.launch {
			try {
				val result: GetCredentialResponse =
					credentialManager.getCredential(context = reactApplicationContext, request = request)

				val publicKeyResult =
					result.credential as? PublicKeyCredential ?: throw Exception("PasskeyRetrievalFailed")

				val jsonObject = JSONObject(publicKeyResult.authenticationResponseJson)

				promise.resolve(JSONArguments.fromJSONObject(jsonObject))
			} catch (e: GetCredentialException) {
				val errorCode = handlePasskeyAuthenticationFailure(e)
				promise.reject(errorCode, e)
			} catch(e: Exception) {
				promise.reject("FAILED", e)
			}
		}
	}

	companion object {
		const val NAME = "AmplifyRtnPasskeys"
	}

	private fun handlePasskeyRegistrationFailure(e: CreateCredentialException): String {
		when (e) {
			is CreatePublicKeyCredentialDomException -> {
				when (e.domError) {
					is NotAllowedError -> {
						return "CANCELED"
					}
					is InvalidStateError -> {
						return "DUPLICATE"
					}
					is DataError -> {
						return "RELYING_PARTY_MISMATCH"
					}
				}
			}
			is CreateCredentialCancellationException -> {
				return "CANCELED"
			}
			is CreateCredentialUnsupportedException,
			is CreateCredentialProviderConfigurationException
				-> {
				return "NOT_SUPPORTED"
			}
		}
		return "UNKNOWN"
	}

	private fun handlePasskeyAuthenticationFailure(e: GetCredentialException): String {
		when (e) {
			is GetPublicKeyCredentialDomException -> {
				when (e.domError) {
					is NotAllowedError -> {
						return "CANCELED"
					}
					is DataError -> {
						return "RELYING_PARTY_MISMATCH"
					}
				}
			}
			is GetCredentialCancellationException -> {
				return "CANCELED"
			}
			is GetCredentialUnsupportedException,
			is GetCredentialProviderConfigurationException
				-> {
				return "NOT_SUPPORTED"
			}
		}
		return "UNKNOWN"
	}
}
