package com.amazonaws.amplify.rtnpasskeys

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.fbreact.specs.NativeAmplifyRtnPasskeysSpec
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

@ReactModule(name = AmplifyRtnPasskeysModule.NAME)
class AmplifyRtnPasskeysModule(reactContext: ReactApplicationContext) :
	NativeAmplifyRtnPasskeysSpec(reactContext) {

  	override fun getName(): String {
   		return NAME
  	}

	override fun getIsPasskeySupported(): Boolean {
		TODO("Not yet implemented")
	}

	override fun createPasskey(input: ReadableMap?, promise: Promise?) {
		TODO("Not yet implemented")
	}

	override fun getPasskey(input: ReadableMap?, promise: Promise?) {
		TODO("Not yet implemented")
	}

	companion object {
    const val NAME = "AmplifyRtnPasskeys"
  }
}
