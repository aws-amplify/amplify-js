import android.app.Activity
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
import kotlinx.coroutines.test.runTest

import org.junit.*
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config


@RunWith(RobolectricTestRunner::class)
@Config(sdk = [Build.VERSION_CODES.P])
class AmplifyRtnPasskeysModuleTest {
    private val responseJson = """{"response":"json"}"""

    private val context = mockk<ReactApplicationContext>()
    private val promise = mockk<Promise>()

    private val readableMap = mockk<ReadableMap>()

    private val module = AmplifyRtnPasskeysModule(context)

    private val credentialManager = mockk<CredentialManager> {
        coEvery { getCredential(any(), any<GetCredentialRequest>()) } returns GetCredentialResponse(
            PublicKeyCredential(responseJson)
        )
        coEvery { createCredential(any(), any()) } returns CreatePublicKeyCredentialResponse(
            responseJson
        )
    }

    @Before
    fun setup() {
        // setup CredentialManager
        mockkObject(CredentialManager)
        every { CredentialManager.create(any()) } returns credentialManager

        // setup promise
        every { promise.resolve(any()) } returns Unit
        every { promise.reject(any(), any<Exception>()) } returns Unit

        // setup ReadableMap
        every { readableMap.toHashMap() } returns hashMapOf("user" to hashMapOf("name" to "james"))

        // setup ReactApplicationContext
        every { context.applicationContext } returns context
        every { context.currentActivity } returns mockk<Activity>()

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
        module.createPasskey(readableMap, promise)
        coVerify { promise.resolve(readableMap) }
    }

    @Test
    fun createPasskey_rejectsWithError_whenCreateCredentialResultIsInvalid() = runTest {
        coEvery { credentialManager.createCredential(any(), any()) } returns mockk()
        module.createPasskey(readableMap, promise)
        coVerify { credentialManager.createCredential(any(), any<CreateCredentialRequest>()) }
        coVerify { promise.reject("FAILED", any<Exception>()) }
    }

    @Test
    fun createPasskey_rejectsWithError_whenDomExceptionThrown() = runTest {
        coEvery {
            credentialManager.createCredential(
                any(),
                any()
            )
        } throws CreatePublicKeyCredentialDomException(NotAllowedError())
        module.createPasskey(readableMap, promise)
        coVerify { credentialManager.createCredential(any(), any<CreateCredentialRequest>()) }
        coVerify { promise.reject("CANCELED", any<CreatePublicKeyCredentialDomException>()) }
    }

    @Config(sdk = [Build.VERSION_CODES.O])
    @Test
    fun getPasskey_rejectsWithError_onUnsupportedDevice() {
        module.getPasskey(readableMap, promise)
        verify { promise.reject("NOT_SUPPORTED", any<GetCredentialUnsupportedException>()) }
    }

    @Test
    fun getPasskey_resolvesWithOutput_onSupportedDevice() = runTest {
        module.getPasskey(readableMap, promise)
        coVerify { promise.resolve(readableMap) }
    }

    @Test
    fun getPasskey_rejectsWithError_whenGetCredentialResultIsInvalid() = runTest {
        coEvery {
            credentialManager.getCredential(
                any(),
                any<GetCredentialRequest>()
            )
        } returns mockk<GetCredentialResponse> {
            every { credential } returns mockk()
        }
        module.getPasskey(readableMap, promise)
        coVerify { credentialManager.getCredential(any(), any<GetCredentialRequest>()) }
        coVerify { promise.reject("FAILED", any<Exception>()) }
    }

    @Test
    fun getPasskey_rejectsWithError_whenDomExceptionThrown() = runTest {
        coEvery {
            credentialManager.getCredential(
                any(),
                any<GetCredentialRequest>()
            )
        } throws GetPublicKeyCredentialDomException(DataError())
        module.getPasskey(readableMap, promise)
        coVerify { credentialManager.getCredential(any(), any<GetCredentialRequest>()) }
        coVerify {
            promise.reject(
                "RELYING_PARTY_MISMATCH",
                any<GetPublicKeyCredentialDomException>()
            )
        }
    }

}
