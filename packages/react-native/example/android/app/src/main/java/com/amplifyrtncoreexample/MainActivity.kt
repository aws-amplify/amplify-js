package com.amplifyrtncoreexample

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

	override fun getMainComponentName(): String = "AmplifyRTNCoreExample"

	override fun createReactActivityDelegate(): ReactActivityDelegate = 
		DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
