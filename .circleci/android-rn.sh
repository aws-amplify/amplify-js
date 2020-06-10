#!/bin/bash

case $1 in
  export-env)
    # echo 'export PATH="$PATH:/usr/local/opt/node@8/bin:~/.yarn/bin:~/project/node_modules/.bin:~/project/example/node_modules/.bin"' >> $BASH_ENV
	# echo 'export ANDROID_HOME="/usr/local/share/android-sdk"' >> $BASH_ENV
	# echo 'export ANDROID_SDK_ROOT="/usr/local/share/android-sdk"' >> $BASH_ENV
	echo 'export PATH="$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"' >> $BASH_ENV
	echo 'export QEMU_AUDIO_DRV=none' >> $BASH_ENV
	source $BASH_ENV
    ;;
  sdkmanager)
    yes | sdkmanager "platform-tools" "tools" >/dev/null
	yes | sdkmanager "platforms;android-24" >/dev/null
	yes | sdkmanager "system-images;android-24;default;armeabi-v7a" >/dev/null
	yes | sdkmanager "emulator" --channel=3 >/dev/null
	yes | sdkmanager "build-tools;29.0.0" >/dev/null
	yes | sdkmanager --licenses >/dev/null
	yes | sdkmanager --list
	;;
  wait-for-avd)
    boot=""
	echo "Waiting for AVD to finish booting"
	export PATH=$(dirname $(dirname $(command -v android)))/platform-tools:$PATH
	until [[ "$boot" =~ "1" ]]; do
	sleep 5
	boot=$(adb -e shell getprop sys.boot_completed 2>&1)
	done
	# extra time to let the OS settle
	sleep 15
	adb shell settings put global window_animation_scale 0
	adb shell settings put global transition_animation_scale 0
	adb shell settings put global animator_duration_scale 0
	echo "Android Virtual Device is now ready."
	;;
  start-emulator)
    ${ANDROID_SDK_HOME}/emulator/emulator @TestingAVD -version
    ${ANDROID_SDK_HOME}/emulator/emulator @TestingAVD -skin 470x860 -cores 1 -gpu auto -accel on -memory 1024 -no-audio -no-snapshot -no-boot-anim -no-window
	;;
esac