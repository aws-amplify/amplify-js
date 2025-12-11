// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Foundation
import AWSCognitoIdentityProviderASF

@objc(AmplifyRtnAsfSwift)
public class AmplifyRtnAsf: NSObject {

    @objc
    public func getContextData(
        _ userPoolId: String,
        clientId: String
    ) -> String? {
        // Return nil for empty or whitespace-only parameters
        // Property 2: Invalid Input Returns Null - validates Requirements 1.4
        let trimmedUserPoolId = userPoolId.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedClientId = clientId.trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard !trimmedUserPoolId.isEmpty, !trimmedClientId.isEmpty else {
            return nil
        }

        // Use the AWSCognitoIdentityProviderASF SDK to collect device context data
        return AWSCognitoIdentityProviderASF.userContextData(
            forUserPool: userPoolId,
            clientId: clientId
        )
    }
}
