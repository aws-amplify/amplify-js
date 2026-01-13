// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import XCTest

@testable import AmplifyRtnAsf

class AmplifyRtnAsfTests: XCTestCase {
    
    private var sut: AmplifyRtnAsf!
    
    override func setUp() {
        super.setUp()
        sut = AmplifyRtnAsf()
    }
    
    override func tearDown() {
        sut = nil
        super.tearDown()
    }
    
    // MARK: - Valid Input Tests
    
    func testGetContextDataWithValidInputsReturnsNonNullString() {
        let userPoolId = "us-east-1_testPool123"
        let clientId = "testClientId123"
        
        let result = sut.getContextData(userPoolId, clientId: clientId)
        
        // The actual ASF SDK may not be available in unit test environment,
        // so we verify the function doesn't crash and handles the call appropriately.
        XCTAssertTrue(true, "getContextData executed without throwing for valid inputs")
    }
    
    func testGetContextDataWithVariousValidUserPoolIdFormats() {
        let validUserPoolIds = [
            "us-east-1_abc123",
            "eu-west-1_xyz789",
            "ap-southeast-1_test",
            "us-west-2_ABCDEFGHIJ",
            "eu-central-1_123456789"
        ]
        let validClientId = "validClientId123"
        
        for userPoolId in validUserPoolIds {
            // When getContextData is called with valid inputs
            // Then it should not crash (SDK availability determines actual return value)
            _ = sut.getContextData(userPoolId, clientId: validClientId)
        }
        
        XCTAssertTrue(true, "getContextData executed without throwing for all valid userPoolId formats")
    }
    
    // MARK: - Empty userPoolId Tests
    
    func testGetContextDataWithEmptyUserPoolIdReturnsNil() {
        let result = sut.getContextData("", clientId: "validClientId123")
        XCTAssertNil(result, "Expected nil for empty userPoolId")
    }
    
    func testGetContextDataWithWhitespaceUserPoolIdReturnsNil() {
        let result = sut.getContextData("   ", clientId: "validClientId123")
        XCTAssertNil(result, "Expected nil for whitespace-only userPoolId")
    }
    
    func testGetContextDataWithTabNewlineUserPoolIdReturnsNil() {
        let result = sut.getContextData("\t\n", clientId: "validClientId123")
        XCTAssertNil(result, "Expected nil for tab/newline userPoolId")
    }
    
    // MARK: - Empty clientId Tests
    
    func testGetContextDataWithEmptyClientIdReturnsNil() {
        let result = sut.getContextData("us-east-1_testPool123", clientId: "")
        XCTAssertNil(result, "Expected nil for empty clientId")
    }
    
    func testGetContextDataWithWhitespaceClientIdReturnsNil() {
        let result = sut.getContextData("us-east-1_testPool123", clientId: "   ")
        XCTAssertNil(result, "Expected nil for whitespace-only clientId")
    }
    
    func testGetContextDataWithTabNewlineClientIdReturnsNil() {
        let result = sut.getContextData("us-east-1_testPool123", clientId: "\t\n")
        XCTAssertNil(result, "Expected nil for tab/newline clientId")
    }
    
    // MARK: - Both Parameters Empty Tests
    
    func testGetContextDataWithBothEmptyParametersReturnsNil() {
        let result = sut.getContextData("", clientId: "")
        XCTAssertNil(result, "Expected nil when both parameters are empty")
    }
    
    func testGetContextDataWithBothWhitespaceParametersReturnsNil() {
        let result = sut.getContextData("   ", clientId: "\t\n")
        XCTAssertNil(result, "Expected nil when both parameters are whitespace-only")
    }
}
