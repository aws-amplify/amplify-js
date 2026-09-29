// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import android.os.Build

import com.amazonaws.amplify.rtnpasskeys.JsonConversion

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.JavaOnlyArray
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReadableType

import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkStatic

import org.json.JSONArray
import org.json.JSONObject

import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [Build.VERSION_CODES.P])
class JsonConversionTest {
	@Before
	fun setup() {
		// Native-backed maps/arrays need JNI; use the Java-only implementations in unit tests.
		mockkStatic(Arguments::class)
		every { Arguments.createMap() } answers { JavaOnlyMap() }
		every { Arguments.createArray() } answers { JavaOnlyArray() }
	}

	@After
	fun teardown() {
		unmockkStatic(Arguments::class)
	}

	@Test
	fun fromJSONObject_convertsAllValueTypes() {
		val json = JSONObject(
			"""
			{
				"string": "value",
				"bool": true,
				"int": 42,
				"double": 1.5,
				"long": 3000000000,
				"nullValue": null,
				"nested": { "id": "abc" },
				"list": ["a", 1, false, null, { "k": "v" }, [2]]
			}
			""".trimIndent()
		)

		val map = JsonConversion.fromJSONObject(json)

		assert(map.getString("string") == "value")
		assert(map.getBoolean("bool"))
		assert(map.getInt("int") == 42)
		assert(map.getDouble("double") == 1.5)
		assert(map.getInt("long") == 3000000000L.toInt())
		assert(map.getType("nullValue") == ReadableType.Null)
		assert(map.getMap("nested")?.getString("id") == "abc")

		val list = map.getArray("list")!!
		assert(list.size() == 6)
		assert(list.getString(0) == "a")
		assert(list.getInt(1) == 1)
		assert(!list.getBoolean(2))
		assert(list.getType(3) == ReadableType.Null)
		assert(list.getMap(4)?.getString("k") == "v")
		assert(list.getArray(5)?.getInt(0) == 2)
	}

	@Test
	fun fromJSONArray_convertsNestedValues() {
		val array = JsonConversion.fromJSONArray(JSONArray("""[{"a": [1, 2]}, "b"]"""))

		assert(array.size() == 2)
		assert(array.getMap(0)?.getArray("a")?.getInt(1) == 2)
		assert(array.getString(1) == "b")
	}
}
