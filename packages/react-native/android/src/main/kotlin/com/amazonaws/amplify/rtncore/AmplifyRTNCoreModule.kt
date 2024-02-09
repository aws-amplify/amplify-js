package com.amazonaws.amplify.rtncore

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

class AmplifyRTNCoreModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

	@ReactMethod
	fun computeModPow(payload: ReadableMap, promise: Promise) {
		BigInteger.computeModPow(payload, promise)
	}

	@ReactMethod
	fun computeS(payload: ReadableMap, promise: Promise) {
		BigInteger.computeS(payload, promise)
	}

  companion object {
    const val NAME = "AmplifyRTNCore"
  }
}
