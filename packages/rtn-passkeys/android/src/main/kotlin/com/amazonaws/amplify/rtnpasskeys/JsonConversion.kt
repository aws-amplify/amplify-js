// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnpasskeys

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap

import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

/**
 * Converts org.json values into React Native bridge values.
 *
 * Mirrors com.facebook.react.bridge.JSONArguments, which was removed in React Native 0.82,
 * so the module builds against every React Native version in the supported peer range.
 */
internal object JsonConversion {
	@Throws(JSONException::class)
	fun fromJSONObject(obj: JSONObject): ReadableMap {
		val result = Arguments.createMap()
		val keys = obj.keys()
		while (keys.hasNext()) {
			val key = keys.next()
			when (val value = obj.get(key)) {
				is JSONObject -> result.putMap(key, fromJSONObject(value))
				is JSONArray -> result.putArray(key, fromJSONArray(value))
				is String -> result.putString(key, value)
				is Boolean -> result.putBoolean(key, value)
				is Int -> result.putInt(key, value)
				is Double -> result.putDouble(key, value)
				is Long -> result.putDouble(key, value.toDouble())
				else ->
					if (obj.isNull(key)) {
						result.putNull(key)
					} else {
						throw JSONException("Unexpected value when parsing JSON object. key: $key")
					}
			}
		}
		return result
	}

	@Throws(JSONException::class)
	fun fromJSONArray(arr: JSONArray): ReadableArray {
		val result = Arguments.createArray()
		for (i in 0 until arr.length()) {
			when (val value = arr.get(i)) {
				is JSONObject -> result.pushMap(fromJSONObject(value))
				is JSONArray -> result.pushArray(fromJSONArray(value))
				is String -> result.pushString(value)
				is Boolean -> result.pushBoolean(value)
				is Int -> result.pushInt(value)
				is Double -> result.pushDouble(value)
				is Long -> result.pushDouble(value.toDouble())
				else ->
					if (arr.isNull(i)) {
						result.pushNull()
					} else {
						throw JSONException("Unexpected value when parsing JSON array. index: $i")
					}
			}
		}
		return result
	}
}
