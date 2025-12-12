// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

package com.amazonaws.amplify.rtnasf

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class AmplifyRtnAsfPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == AmplifyRtnAsfModule.NAME) {
            AmplifyRtnAsfModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
            moduleInfos[AmplifyRtnAsfModule.NAME] = ReactModuleInfo(
                AmplifyRtnAsfModule.NAME,
                AmplifyRtnAsfModule.NAME,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                false,  // isCxxModule
                true    // isTurboModule
            )
            moduleInfos
        }
    }
}
