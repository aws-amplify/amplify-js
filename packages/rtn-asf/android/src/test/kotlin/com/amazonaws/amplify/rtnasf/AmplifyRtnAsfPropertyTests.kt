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
import kotlin.random.Random

/**
 * Property-based tests for AmplifyRtnAsf module
 * These tests verify correctness properties across many randomly generated inputs
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class AmplifyRtnAsfPropertyTests {

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

    // MARK: - Property 2: Invalid Input Returns Null
    // **Feature: native-asf-context-data, Property 2: Invalid Input Returns Null**
    // **Validates: Requirements 2.4**
    //
    // *For any* empty string or whitespace-only string passed as userPoolId or clientId,
    // when `getContextData` is called, the function SHALL return null.

    /**
     * Generates a list of invalid input strings (empty or whitespace-only)
     */
    private fun generateInvalidInputs(): List<String> {
        val inputs = mutableListOf<String>()

        // Empty string
        inputs.add("")

        // Single whitespace characters
        inputs.add(" ")
        inputs.add("\t")
        inputs.add("\n")
        inputs.add("\r")
        inputs.add("\r\n")

        // Multiple whitespace characters
        for (count in 2..10) {
            inputs.add(" ".repeat(count))
            inputs.add("\t".repeat(count))
        }

        // Mixed whitespace
        inputs.add(" \t")
        inputs.add("\t ")
        inputs.add(" \n ")
        inputs.add("\t\n\r")
        inputs.add("   \t\t   ")
        inputs.add("\n\n\n")
        inputs.add(" \t \n \r ")

        // Random length whitespace strings (property-based approach)
        val whitespaceChars = listOf(" ", "\t", "\n", "\r")
        for (i in 0 until 50) {
            val length = Random.nextInt(1, 21)
            val randomWhitespace = StringBuilder()
            for (j in 0 until length) {
                randomWhitespace.append(whitespaceChars.random())
            }
            inputs.add(randomWhitespace.toString())
        }

        return inputs
    }

    /**
     * Generates valid non-empty, non-whitespace strings for testing
     */
    private fun generateValidInputs(): List<String> {
        return listOf(
            "us-east-1_abc123",
            "eu-west-1_xyz789",
            "ap-southeast-1_test",
            "validClientId",
            "abc123def456",
            "a",
            "1",
            "test-pool-id",
            "client_id_with_underscore"
        )
    }

    // MARK: - Property Test: Empty userPoolId returns null

    /**
     * **Feature: native-asf-context-data, Property 2: Invalid Input Returns Null**
     * **Validates: Requirements 2.4**
     *
     * For any empty or whitespace-only userPoolId with any valid clientId,
     * getContextData should return null.
     */
    @Test
    fun testGetContextDataWithEmptyUserPoolIdReturnsNull() {
        val validClientIds = generateValidInputs()
        val invalidUserPoolIds = generateInvalidInputs()

        var testCount = 0

        // For any empty or whitespace-only userPoolId with any valid clientId
        for (invalidUserPoolId in invalidUserPoolIds) {
            for (validClientId in validClientIds) {
                val result = module.getContextData(invalidUserPoolId, validClientId)

                assert(result == null) {
                    "Expected null for invalid userPoolId '${invalidUserPoolId.escape()}' " +
                        "with clientId '$validClientId', but got '$result'"
                }
                testCount++
            }
        }

        // Ensure we ran at least 100 iterations as per design doc requirements
        assert(testCount >= 100) { "Property test should run at least 100 iterations, ran $testCount" }
        println("Property 2 (empty userPoolId): Ran $testCount test iterations")
    }

    // MARK: - Property Test: Empty clientId returns null

    /**
     * **Feature: native-asf-context-data, Property 2: Invalid Input Returns Null**
     * **Validates: Requirements 2.4**
     *
     * For any valid userPoolId with any empty or whitespace-only clientId,
     * getContextData should return null.
     */
    @Test
    fun testGetContextDataWithEmptyClientIdReturnsNull() {
        val validUserPoolIds = generateValidInputs()
        val invalidClientIds = generateInvalidInputs()

        var testCount = 0

        // For any valid userPoolId with any empty or whitespace-only clientId
        for (validUserPoolId in validUserPoolIds) {
            for (invalidClientId in invalidClientIds) {
                val result = module.getContextData(validUserPoolId, invalidClientId)

                assert(result == null) {
                    "Expected null for userPoolId '$validUserPoolId' " +
                        "with invalid clientId '${invalidClientId.escape()}', but got '$result'"
                }
                testCount++
            }
        }

        // Ensure we ran at least 100 iterations as per design doc requirements
        assert(testCount >= 100) { "Property test should run at least 100 iterations, ran $testCount" }
        println("Property 2 (empty clientId): Ran $testCount test iterations")
    }

    // MARK: - Property Test: Both parameters empty returns null

    /**
     * **Feature: native-asf-context-data, Property 2: Invalid Input Returns Null**
     * **Validates: Requirements 2.4**
     *
     * For any combination of empty/whitespace-only inputs for both parameters,
     * getContextData should return null.
     */
    @Test
    fun testGetContextDataWithBothParametersEmptyReturnsNull() {
        val invalidInputs = generateInvalidInputs()

        var testCount = 0

        // For any combination of empty/whitespace-only inputs for both parameters
        for (invalidUserPoolId in invalidInputs) {
            for (invalidClientId in invalidInputs) {
                val result = module.getContextData(invalidUserPoolId, invalidClientId)

                assert(result == null) {
                    "Expected null for invalid userPoolId '${invalidUserPoolId.escape()}' " +
                        "with invalid clientId '${invalidClientId.escape()}', but got '$result'"
                }
                testCount++
            }
        }

        // Ensure we ran at least 100 iterations as per design doc requirements
        assert(testCount >= 100) { "Property test should run at least 100 iterations, ran $testCount" }
        println("Property 2 (both empty): Ran $testCount test iterations")
    }

    /**
     * Helper extension function to escape special characters for readable error messages
     */
    private fun String.escape(): String {
        return this
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t")
    }
}
