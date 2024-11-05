// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Foundation

enum ParseError: Error {
    case missingValue(String)
    case invalidValue(String)
}

@objc(BigInteger)
class BigInteger: NSObject {
    static let nInHex: String = "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF"

    @objc(computeModPow:withResolver:withRejecter:)
    static func computeModPow(
        _ payload: [String: String],
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock) -> Void {
            do {
                let base = try parseBigInteger("base", from: payload)
                let exponent = try parseBigInteger("exponent", from: payload)
                let divisor = try parseBigInteger("divisor", from: payload)
                let result = base.pow(exponent, andMod: divisor) as! JKBigInteger
                
                resolve(result.stringValue(withRadix: 16))
            } catch let error as ParseError {
                reject("ERROR", error.localizedDescription, nil)
            } catch {
                reject("ERROR", "An unexpected error occurred", nil)
            }
    }
    
    static func computeS(
        _ payload: [String: String],
        resolve: RCTPromiseResolveBlock,
        reject: RCTPromiseRejectBlock
    ) -> Void {
        do {
            let N = JKBigInteger(string: nInHex, andRadix: 16)!
            
            let g = try parseBigInteger("g", from: payload)
            let x = try parseBigInteger("x", from: payload)
            let k = try parseBigInteger("k", from: payload)
            let a = try parseBigInteger("a", from: payload)
            let b = try parseBigInteger("b", from: payload)
            let u = try parseBigInteger("u", from: payload)
            
            let exponent = a.add((u.multiply(x) as! JKBigInteger)) as! JKBigInteger
            var base = b.subtract((k.multiply((g.pow(x, andMod: N) as! JKBigInteger)) as! JKBigInteger)) as! JKBigInteger
            base = self.mod(base, by: N)
            var result = base.pow(exponent, andMod: N) as! JKBigInteger
            result = self.mod(result, by: N)
            
            resolve(result.stringValue(withRadix: 16))
        } catch let error as ParseError {
            reject("ERROR", error.localizedDescription, nil)
        } catch {
            reject("ERROR", "An unexpected error occurred", nil)
        }
    }
    
    static private func mod(_ dividend: JKBigInteger, by divisor: JKBigInteger ) -> JKBigInteger {
        return (divisor.add((dividend.remainder(divisor) as! JKBigInteger)) as! JKBigInteger).remainder(divisor) as! JKBigInteger
    }
    
    static private func parseBigInteger(_ key: String, from payload: [String: String]) throws -> JKBigInteger {
        guard let value = payload[key] else {
            throw ParseError.missingValue("Payload is missing `\(key)`")
        }
        
        guard let parsedValue = JKBigInteger(string: value, andRadix: 16) else {
            throw ParseError.invalidValue("Invalid value for `\(key)`")
        }
        
        return parsedValue
    }
}
