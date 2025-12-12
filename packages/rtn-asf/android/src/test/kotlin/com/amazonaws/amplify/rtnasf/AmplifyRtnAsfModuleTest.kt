// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnasf

import com.amazonaws.cognito.clientcontext.data.UserContextDataProvider
import com.facebook.react.bridge.ReactApplicationContext
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.unmockkStatic
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class AmplifyRtnAsfModuleTest {

    private lateinit var mockContext: ReactApplicationContext
    private lateinit var module: AmplifyRtnAsfModule

    private lateinit var mockProvider: UserContextDataProvider

    @Before
    fun setUp() {
        mockContext = mockk(relaxed = true)
        every { mockContext.applicationContext } returns mockk(relaxed = true)
        module = AmplifyRtnAsfModule(mockContext)
        
        // Mock the UserContextDataProvider singleton
        mockProvider = mockk(relaxed = true)
        mockkStatic(UserContextDataProvider::class)
        every { UserContextDataProvider.getInstance() } returns mockProvider
    }

    @After
    fun tearDown() {
        unmockkStatic(UserContextDataProvider::class)
    }

    @Test
    fun getName_returnsCorrectName() {
        assert(module.name == "AmplifyRtnAsf") {
            "Expected module name to be 'AmplifyRtnAsf', but got '${module.name}'"
        }
    }

    @Test
    fun getContextData_withValidInputs_returnsEncodedData() {
        val userPoolId = "us-east-1_testPool123"
        val clientId = "testClientId456"
        val expectedEncodedData = "encodedContextDataString"

        every {
            mockProvider.getEncodedContextData(any(), any(), userPoolId, clientId)
        } returns expectedEncodedData

        val result = module.getContextData(userPoolId, clientId)

        assert(result == expectedEncodedData) {
            "Expected '$expectedEncodedData', but got '$result'"
        }
    }

    @Test
    fun getContextData_withEmptyUserPoolId_returnsNull() {
        val result = module.getContextData("", "validClientId")

        assert(result == null) {
            "Expected null for empty userPoolId, but got '$result'"
        }
    }

    @Test
    fun getContextData_withWhitespaceUserPoolId_returnsNull() {
        val result = module.getContextData("   ", "validClientId")

        assert(result == null) {
            "Expected null for whitespace-only userPoolId, but got '$result'"
        }
    }

    @Test
    fun getContextData_withEmptyClientId_returnsNull() {
        val result = module.getContextData("us-east-1_validPool", "")

        assert(result == null) {
            "Expected null for empty clientId, but got '$result'"
        }
    }

    @Test
    fun getContextData_withWhitespaceClientId_returnsNull() {
        val result = module.getContextData("us-east-1_validPool", "\t\n")

        assert(result == null) {
            "Expected null for whitespace-only clientId, but got '$result'"
        }
    }

    @Test
    fun getContextData_whenSdkThrowsException_returnsNull() {
        val userPoolId = "us-east-1_testPool"
        val clientId = "testClientId"

        every {
            mockProvider.getEncodedContextData(any(), any(), userPoolId, clientId)
        } throws RuntimeException("SDK initialization failed")

        val result = module.getContextData(userPoolId, clientId)

        assert(result == null) {
            "Expected null when SDK throws exception, but got '$result'"
        }
    }

    @Test
    fun getContextData_whenSdkThrowsIllegalStateException_returnsNull() {
        val userPoolId = "us-east-1_testPool"
        val clientId = "testClientId"

        every {
            mockProvider.getEncodedContextData(any(), any(), userPoolId, clientId)
        } throws IllegalStateException("Context not available")

        val result = module.getContextData(userPoolId, clientId)

        assert(result == null) {
            "Expected null when SDK throws IllegalStateException, but got '$result'"
        }
    }

    @Test
    fun getContextData_whenSdkThrowsNullPointerException_returnsNull() {
        val userPoolId = "us-east-1_testPool"
        val clientId = "testClientId"

        every {
            mockProvider.getEncodedContextData(any(), any(), userPoolId, clientId)
        } throws NullPointerException("Null context")

        val result = module.getContextData(userPoolId, clientId)

        assert(result == null) {
            "Expected null when SDK throws NullPointerException, but got '$result'"
        }
    }

    @Test
    fun getContextData_whenSdkReturnsNull_returnsNull() {
        val userPoolId = "us-east-1_testPool"
        val clientId = "testClientId"

        every {
            mockProvider.getEncodedContextData(any(), any(), userPoolId, clientId)
        } returns null

        val result = module.getContextData(userPoolId, clientId)

        assert(result == null) {
            "Expected null when SDK returns null, but got '$result'"
        }
    }

    @Test
    fun getContextData_withDifferentRegionFormats_returnsEncodedData() {
        val testCases = listOf(
            "us-east-1_abc123" to "encodedData1",
            "eu-west-1_xyz789" to "encodedData2",
            "ap-southeast-1_test" to "encodedData3",
            "us-west-2_pool" to "encodedData4"
        )

        for ((userPoolId, expectedData) in testCases) {
            every {
                mockProvider.getEncodedContextData(any(), any(), userPoolId, "clientId")
            } returns expectedData

            val result = module.getContextData(userPoolId, "clientId")

            assert(result == expectedData) {
                "Expected '$expectedData' for userPoolId '$userPoolId', but got '$result'"
            }
        }
    }
}
