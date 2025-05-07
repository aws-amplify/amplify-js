package com.amazonaws.amplify.rtnpasskeys

import com.amazonaws.amplify.rtnpasskeys.AmplifyRtnPasskeysModule

import java.util.HashMap
import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.runner.RunWith
import org.junit.runners.JUnit4
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations
import org.mockito.Mockito.spy
import androidx.credentials.exceptions.CreateCredentialCancellationException
import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.CreateCredentialProviderConfigurationException
import androidx.credentials.exceptions.CreateCredentialUnsupportedException
import androidx.credentials.exceptions.CreateCredentialUnknownException
import androidx.credentials.exceptions.domerrors.DataError
import androidx.credentials.exceptions.domerrors.InvalidStateError
import androidx.credentials.exceptions.domerrors.NotAllowedError
import androidx.credentials.exceptions.publickeycredential.CreatePublicKeyCredentialDomException

@RunWith(JUnit4::class)
class AmplifyRtnPasskeysTest {

    private fun mockHandlePasskeyRegistrationFailure(e: CreateCredentialException): String {
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

    @Mock
    private lateinit var mockContext: ReactApplicationContext

    @Mock
    private lateinit var mockPromise: Promise

    @Mock
    private lateinit var mockReadableMap: ReadableMap

    @Mock
    private lateinit var mockApplicationContext: Context

	@Mock
	private lateinit var mockCredentialManager: HashMap<String, Any?>

    private lateinit var module: AmplifyRtnPasskeysModule

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)

        `when`(mockContext.applicationContext).thenReturn(mockApplicationContext)

        module = AmplifyRtnPasskeysModule(mockContext)

    }

    @Test
    fun `handlePasskeyRegistrationFailure should return CANCELED for NotAllowedError in CreatePublicKeyCredentialDomException`() {
        val expectedException = CreatePublicKeyCredentialDomException(NotAllowedError())

        assertEquals("CANCELED", module.handlePasskeyRegistrationFailure(expectedException))
    }

    @Test
    fun `handlePasskeyRegistrationFailure should return DUPLICATE for InvalidStateError in CreatePublicKeyCredentialDomException`() {
        val expectedException = CreatePublicKeyCredentialDomException(InvalidStateError())

        assertEquals("DUPLICATE", module.handlePasskeyRegistrationFailure(expectedException))
    }

    @Test
    fun `handlePasskeyRegistrationFailure should return RELYING_PARTY_MISMATCH for DataError in CreatePublicKeyCredentialDomException`() {
        val expectedException = CreatePublicKeyCredentialDomException(DataError())

        assertEquals("RELYING_PARTY_MISMATCH", module.handlePasskeyRegistrationFailure(expectedException))
    }

    @Test
    fun `handlePasskeyRegistrationFailure should return CANCELED for CreateCredentialCancellationException`() {
        val expectedException = CreateCredentialCancellationException()

        assertEquals("CANCELED", module.handlePasskeyRegistrationFailure(expectedException))
    }

    @Test
    fun `handlePasskeyRegistrationFailure should return NOT_SUPPORTED for CreateCredentialUnsupportedException`() {
        val expectedException = CreateCredentialUnsupportedException()

        assertEquals("NOT_SUPPORTED", module.handlePasskeyRegistrationFailure(expectedException))
    }

    @Test
    fun `handlePasskeyRegistrationFailure should return NOT_SUPPORTED for CreateCredentialProviderConfigurationException`() {
        val expectedException = CreateCredentialProviderConfigurationException()

        assertEquals("NOT_SUPPORTED", module.handlePasskeyRegistrationFailure(expectedException))
    }

    @Test
    fun `handlePasskeyRegistrationFailure should return UNKNOWN for CreateCredentialUnknownException`()  {
        val expectedException = CreateCredentialUnknownException()

        assertEquals("UNKNOWN", module.handlePasskeyRegistrationFailure(expectedException))
    }

    @Test
    fun `createPasskey should call toHashMap on the input`() {
        val mockMap = HashMap<String, Any?>()
        mockMap["challenge"] = "challenge_string"
        mockMap["rp"] = mapOf("id" to "example.com", "name" to "Example")
        mockMap["user"] = mapOf(
            "id" to "amplify523", 
            "name" to "Amplify User", 
            "displayName" to "Amplify User Display"
        )
        
        `when`(mockReadableMap.toHashMap()).thenReturn(mockMap)
        
        val moduleSpy = spy(module)
        
        doThrow(RuntimeException("Test exception")).`when`(moduleSpy).getIsPasskeySupported()
        
        try {
            moduleSpy.createPasskey(mockReadableMap, mockPromise)
        } catch (e: Exception) {}
        
        verify(mockReadableMap).toHashMap()
    }
}
