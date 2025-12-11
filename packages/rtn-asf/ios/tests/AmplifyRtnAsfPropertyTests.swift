// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import XCTest

@testable import AmplifyRtnAsf

/// Property-based tests for AmplifyRtnAsf module
/// These tests verify correctness properties across many randomly generated inputs
class AmplifyRtnAsfPropertyTests: XCTestCase {
    
    private var sut: AmplifyRtnAsf!
    
    override func setUp() {
        super.setUp()
        sut = AmplifyRtnAsf()
    }
    
    override func tearDown() {
        sut = nil
        super.tearDown()
    }
    
    // MARK: - Property 2: Invalid Input Returns Null
    // **Feature: native-asf-context-data, Property 2: Invalid Input Returns Null**
    // **Validates: Requirements 1.4**
    //
    // *For any* empty string or whitespace-only string passed as userPoolId or clientId,
    // when `getContextData` is called, the function SHALL return null.
    
    /// Generates an array of invalid input strings (empty or whitespace-only)
    private func generateInvalidInputs() -> [String] {
        var inputs: [String] = []
        
        // Empty string
        inputs.append("")
        
        // Single whitespace characters
        inputs.append(" ")
        inputs.append("\t")
        inputs.append("\n")
        inputs.append("\r")
        inputs.append("\r\n")
        
        // Multiple whitespace characters
        for count in 2...10 {
            inputs.append(String(repeating: " ", count: count))
            inputs.append(String(repeating: "\t", count: count))
        }
        
        // Mixed whitespace
        inputs.append(" \t")
        inputs.append("\t ")
        inputs.append(" \n ")
        inputs.append("\t\n\r")
        inputs.append("   \t\t   ")
        inputs.append("\n\n\n")
        inputs.append(" \t \n \r ")
        
        // Random length whitespace strings (property-based approach)
        for _ in 0..<50 {
            let length = Int.random(in: 1...20)
            let whitespaceChars = [" ", "\t", "\n", "\r"]
            var randomWhitespace = ""
            for _ in 0..<length {
                randomWhitespace += whitespaceChars.randomElement()!
            }
            inputs.append(randomWhitespace)
        }
        
        return inputs
    }
    
    /// Generates valid non-empty, non-whitespace strings for testing
    private func generateValidInputs() -> [String] {
        return [
            "us-east-1_abc123",
            "eu-west-1_xyz789",
            "ap-southeast-1_test",
            "validClientId",
            "abc123def456",
            "a",
            "1",
            "test-pool-id",
            "client_id_with_underscore"
        ]
    }
    
    // MARK: - Property Test: Empty userPoolId returns nil
    
    func testGetContextDataWithEmptyUserPoolIdReturnsNil() {
        // **Feature: native-asf-context-data, Property 2: Invalid Input Returns Null**
        // **Validates: Requirements 1.4**
        
        let validClientIds = generateValidInputs()
        let invalidUserPoolIds = generateInvalidInputs()
        
        var testCount = 0
        
        // For any empty or whitespace-only userPoolId with any valid clientId
        for invalidUserPoolId in invalidUserPoolIds {
            for validClientId in validClientIds {
                let result = sut.getContextData(invalidUserPoolId, clientId: validClientId)
                
                XCTAssertNil(
                    result,
                    "Expected nil for invalid userPoolId '\(invalidUserPoolId.debugDescription)' " +
                    "with clientId '\(validClientId)', but got '\(result ?? "nil")'"
                )
                testCount += 1
            }
        }
        
        // Ensure we ran at least 100 iterations as per design doc requirements
        XCTAssertGreaterThanOrEqual(testCount, 100, "Property test should run at least 100 iterations")
        print("Property 2 (empty userPoolId): Ran \(testCount) test iterations")
    }
    
    // MARK: - Property Test: Empty clientId returns nil
    
    func testGetContextDataWithEmptyClientIdReturnsNil() {
        // **Feature: native-asf-context-data, Property 2: Invalid Input Returns Null**
        // **Validates: Requirements 1.4**
        
        let validUserPoolIds = generateValidInputs()
        let invalidClientIds = generateInvalidInputs()
        
        var testCount = 0
        
        // For any valid userPoolId with any empty or whitespace-only clientId
        for validUserPoolId in validUserPoolIds {
            for invalidClientId in invalidClientIds {
                let result = sut.getContextData(validUserPoolId, clientId: invalidClientId)
                
                XCTAssertNil(
                    result,
                    "Expected nil for userPoolId '\(validUserPoolId)' " +
                    "with invalid clientId '\(invalidClientId.debugDescription)', but got '\(result ?? "nil")'"
                )
                testCount += 1
            }
        }
        
        // Ensure we ran at least 100 iterations as per design doc requirements
        XCTAssertGreaterThanOrEqual(testCount, 100, "Property test should run at least 100 iterations")
        print("Property 2 (empty clientId): Ran \(testCount) test iterations")
    }
    
    // MARK: - Property Test: Both parameters empty returns nil
    
    func testGetContextDataWithBothParametersEmptyReturnsNil() {
        // **Feature: native-asf-context-data, Property 2: Invalid Input Returns Null**
        // **Validates: Requirements 1.4**
        
        let invalidInputs = generateInvalidInputs()
        
        var testCount = 0
        
        // For any combination of empty/whitespace-only inputs for both parameters
        for invalidUserPoolId in invalidInputs {
            for invalidClientId in invalidInputs {
                let result = sut.getContextData(invalidUserPoolId, clientId: invalidClientId)
                
                XCTAssertNil(
                    result,
                    "Expected nil for invalid userPoolId '\(invalidUserPoolId.debugDescription)' " +
                    "with invalid clientId '\(invalidClientId.debugDescription)', but got '\(result ?? "nil")'"
                )
                testCount += 1
            }
        }
        
        // Ensure we ran at least 100 iterations as per design doc requirements
        XCTAssertGreaterThanOrEqual(testCount, 100, "Property test should run at least 100 iterations")
        print("Property 2 (both empty): Ran \(testCount) test iterations")
    }
}
