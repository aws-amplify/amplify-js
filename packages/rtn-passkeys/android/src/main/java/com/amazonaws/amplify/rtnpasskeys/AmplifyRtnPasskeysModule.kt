package com.amazonaws.amplify.rtnpasskeys

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.fbreact.specs.NativeAmplifyRtnPasskeysSpec

@ReactModule(name = AmplifyRtnPasskeysModule.NAME)
class AmplifyRtnPasskeysModule(reactContext: ReactApplicationContext) :
	NativeAmplifyRtnPasskeysSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = "AmplifyRtnPasskeys"
  }
}
