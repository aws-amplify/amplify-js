package com.amazonaws.amplify.rtncore

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import java.math.BigInteger

fun parseBigInteger(key: String, payload: ReadableMap): BigInteger {
	val value = payload.getString(key) ?: throw IllegalArgumentException("Payload is missing $key")
	return BigInteger(value, 16)
}

class BigInteger {
	companion object {
		private const val nInHex = ("FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD1"
			+ "29024E088A67CC74020BBEA63B139B22514A08798E3404DD"
			+ "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245"
			+ "E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED"
			+ "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3D"
			+ "C2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F"
			+ "83655D23DCA3AD961C62F356208552BB9ED529077096966D"
			+ "670C354E4ABC9804F1746C08CA18217C32905E462E36CE3B"
			+ "E39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9"
			+ "DE2BCBF6955817183995497CEA956AE515D2261898FA0510"
			+ "15728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64"
			+ "ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7"
			+ "ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6B"
			+ "F12FFA06D98A0864D87602733EC86A64521F2B18177B200C"
			+ "BBE117577A615D6C770988C0BAD946E208E24FA074E5AB31"
			+ "43DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF")

		fun computeModPow(
			payload: ReadableMap,
			promise: Promise
		) = try {
			val base = parseBigInteger("base", payload)
			val exponent = parseBigInteger("exponent", payload)
			val divisor = parseBigInteger("divisor", payload)

			promise.resolve(base.modPow(exponent, divisor).toString(16))
		} catch (e: IllegalArgumentException) {
			promise.reject("ERROR", e.message)
		}

		fun computeS(
			payload: ReadableMap,
			promise: Promise
		) = try {
			val n = BigInteger(nInHex, 16)

			val g = parseBigInteger("g", payload)
			val x = parseBigInteger("x", payload)
			val k = parseBigInteger("k", payload)
			val a = parseBigInteger("a", payload)
			val b = parseBigInteger("b", payload)
			val u = parseBigInteger("u", payload)

			val exponent = a.add(u.multiply(x))
			val base = b.subtract(k.multiply(g.modPow(x, n)))

			promise.resolve(base.modPow(exponent, n).mod(n).toString(16))
		} catch (e: IllegalArgumentException) {
			promise.reject("ERROR", e.message)
		}
	}
}
