import android.os.Build

import androidx.credentials.CreateCredentialRequest
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.PublicKeyCredential
import androidx.credentials.exceptions.CreateCredentialUnsupportedException
import androidx.credentials.exceptions.GetCredentialUnsupportedException
import androidx.credentials.exceptions.domerrors.DataError
import androidx.credentials.exceptions.domerrors.NotAllowedError
import androidx.credentials.exceptions.publickeycredential.CreatePublicKeyCredentialDomException
import androidx.credentials.exceptions.publickeycredential.GetPublicKeyCredentialDomException

import com.amazonaws.amplify.rtnpasskeys.AmplifyRtnPasskeysModule

import com.facebook.react.bridge.JSONArguments
import com.facebook.react.bridge.Promise

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap

import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject
import io.mockk.mockkStatic
import io.mockk.verify

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest

import org.junit.Before
import org.junit.Test

import org.junit.runner.RunWith

import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@OptIn(ExperimentalCoroutinesApi::class)
@Config(sdk = [Build.VERSION_CODES.P])
class AmplifyRtnPasskeysModuleTest {
	private val responseJson = """{"response":"json"}"""

	private val context = mockk<ReactApplicationContext>(relaxed = true)

	private val promise = mockk<Promise>(relaxed = true)

	private val readableMap = mockk<ReadableMap> {
		every { toHashMap() } returns hashMapOf("user" to hashMapOf("name" to "james"))
	}

	private val credentialManager = mockk<CredentialManager>()

	private val module = AmplifyRtnPasskeysModule(context)

	@Before
	fun setup() {
		// setup CredentialManager
		mockkObject(CredentialManager)
		every { CredentialManager.create(any()) } returns credentialManager

		// setup JSONArguments
		mockkStatic(JSONArguments::class)
		every { JSONArguments.fromJSONObject(any()) } returns readableMap
	}

	@Test
	fun getName_returnsCorrectName() {
		assert(module.name == "AmplifyRtnPasskeys")
	}

	@Config(sdk = [Build.VERSION_CODES.O])
	@Test
	fun getIsPasskeySupported_returnsFalse_onUnsupportedDevice() {
		assert(!module.isPasskeySupported)
	}

	@Test
	fun getIsPasskeySupported_returnsTrue_onSupportedDevice() {
		assert(module.isPasskeySupported)
	}

	@Config(sdk = [Build.VERSION_CODES.O])
	@Test
	fun createPasskey_rejectsWithError_onUnsupportedDevice() {
		module.createPasskey(readableMap, promise)
		verify { promise.reject("NOT_SUPPORTED", any<CreateCredentialUnsupportedException>()) }
	}

	@Test
	fun createPasskey_resolvesWithOutput_onSupportedDevice() = runTest {
		coEvery {
			credentialManager.getCredential(
				any(),
				any<GetCredentialRequest>()
			)
		} returns GetCredentialResponse(
			PublicKeyCredential(responseJson)
		)
		coEvery {
			credentialManager.createCredential(
				any(),
				any()
			)
		} returns CreatePublicKeyCredentialResponse(
			responseJson
		)
		AmplifyRtnPasskeysModule(context, UnconfinedTestDispatcher(testScheduler)).createPasskey(
			readableMap,
			promise
		)
		verify { promise.resolve(readableMap) }
	}

	@Test
	fun createPasskey_rejectsWithError_whenCreateCredentialResultIsInvalid() = runTest {
		coEvery { credentialManager.createCredential(any(), any()) } returns mockk()
		AmplifyRtnPasskeysModule(context, UnconfinedTestDispatcher(testScheduler)).createPasskey(
			readableMap,
			promise
		)
		coVerify { credentialManager.createCredential(any(), any<CreateCredentialRequest>()) }
		verify { promise.reject("FAILED", any<Exception>()) }
	}

	@Test
	fun createPasskey_rejectsWithError_whenDomExceptionThrown() = runTest {
		coEvery {
			credentialManager.createCredential(
				any(),
				any()
			)
		} throws CreatePublicKeyCredentialDomException(NotAllowedError())
		AmplifyRtnPasskeysModule(context, UnconfinedTestDispatcher(testScheduler)).createPasskey(
			readableMap,
			promise
		)
		coVerify { credentialManager.createCredential(any(), any<CreateCredentialRequest>()) }
		verify { promise.reject("CANCELED", any<CreatePublicKeyCredentialDomException>()) }
	}

	@Config(sdk = [Build.VERSION_CODES.O])
	@Test
	fun getPasskey_rejectsWithError_onUnsupportedDevice() = runTest {
		module.getPasskey(readableMap, promise)
		verify { promise.reject("NOT_SUPPORTED", any<GetCredentialUnsupportedException>()) }
	}

	@Test
	fun getPasskey_resolvesWithOutput_onSupportedDevice() = runTest {
		coEvery {
			credentialManager.getCredential(
				any(),
				any<GetCredentialRequest>()
			)
		} returns GetCredentialResponse(
			PublicKeyCredential(responseJson)
		)
		coEvery {
			credentialManager.createCredential(
				any(),
				any()
			)
		} returns CreatePublicKeyCredentialResponse(
			responseJson
		)
		AmplifyRtnPasskeysModule(context, UnconfinedTestDispatcher(testScheduler)).getPasskey(
			readableMap,
			promise
		)
		verify { promise.resolve(readableMap) }
	}

	@Test
	fun getPasskey_rejectsWithError_whenGetCredentialResultIsInvalid() = runTest {
		coEvery {
			credentialManager.getCredential(
				any(),
				any<GetCredentialRequest>()
			)
		} returns mockk<GetCredentialResponse> {
			coEvery { credential } returns mockk()
		}
		AmplifyRtnPasskeysModule(context, UnconfinedTestDispatcher(testScheduler)).getPasskey(
			readableMap,
			promise
		)
		coVerify { credentialManager.getCredential(any(), any<GetCredentialRequest>()) }
		verify { promise.reject("FAILED", any<Exception>()) }
	}

	@Test
	fun getPasskey_rejectsWithError_whenDomExceptionThrown() = runTest {
		coEvery {
			credentialManager.getCredential(
				any(),
				any<GetCredentialRequest>()
			)
		} throws GetPublicKeyCredentialDomException(DataError())

		AmplifyRtnPasskeysModule(context, UnconfinedTestDispatcher(testScheduler)).getPasskey(
			readableMap,
			promise
		)
		coVerify { credentialManager.getCredential(any(), any<GetCredentialRequest>()) }
		verify {
			promise.reject(
				"RELYING_PARTY_MISMATCH",
				any<GetPublicKeyCredentialDomException>()
			)
		}
	}

}
