#!/bin/bash

# Based on:
# https://github.com/react-native-community/react-native-circleci-orb

case $1 in
  export-env)
    echo 'export PATH="$PATH:/usr/local/opt/node@10/bin:~/.yarn/bin:~/project/node_modules/.bin:~/project/example/node_modules/.bin"' >> $BASH_ENV
    echo 'export ANDROID_HOME="/usr/local/share/android-sdk"' >> $BASH_ENV
    echo 'export ANDROID_SDK_ROOT="/usr/local/share/android-sdk"' >> $BASH_ENV
    echo 'export PATH="$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools:$PATH"' >> $BASH_ENV
    echo 'export QEMU_AUDIO_DRV=none' >> $BASH_ENV
    echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> $BASH_ENV
    source $BASH_ENV
    ;;
  install-node)
    set +e
	curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh | bash
	echo 'export NVM_DIR=$HOME/.nvm' >> $BASH_ENV
	echo 'source $NVM_DIR/nvm.sh' >> $BASH_ENV
	source ~/.bashrc
	command -v nvm
	nvm install 10
	nvm alias default 10
	;;
  sdkmanager)
	yes | sdkmanager "platform-tools" "tools" >/dev/null
	yes | sdkmanager "platforms;android-28" "system-images;android-28;default;x86_64" >/dev/null
	yes | sdkmanager "emulator" >/dev/null
	yes | sdkmanager "build-tools;28.0.3" >/dev/null
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
    $ANDROID_HOME/emulator/emulator @TestingAVD -version
	$ANDROID_HOME/emulator/emulator @TestingAVD -cores 1 -gpu auto -accel on -memory 1024 -no-audio -no-snapshot -no-boot-anim -no-window
	;;
esac