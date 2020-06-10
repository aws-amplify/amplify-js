#!/bin/bash

case $1 in
  export-env)
    echo 'export PATH="$PATH:/usr/local/opt/node@8/bin:~/.yarn/bin:~/project/node_modules/.bin:~/project/example/node_modules/.bin"' >> $BASH_ENV
	echo 'export ANDROID_HOME="/usr/local/share/android-sdk"' >> $BASH_ENV
	echo 'export ANDROID_SDK_ROOT="/usr/local/share/android-sdk"' >> $BASH_ENV
	echo 'export PATH="$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools:$PATH"' >> $BASH_ENV
	echo 'export QEMU_AUDIO_DRV=none' >> $BASH_ENV
	echo 'export JAVA_HOME=/Library/Java/Home' >> $BASH_ENV
	source $BASH_ENV
    ;;
  sdkmanager)
    yes | sdkmanager "platform-tools" "tools" >/dev/null
	yes | sdkmanager "platforms;android-29" >/dev/null
	yes | sdkmanager "system-images;android-29;google_apis;x86" >/dev/null
	yes | sdkmanager "emulator" --channel=3 >/dev/null
	yes | sdkmanager "build-tools;29.0.0" >/dev/null
	yes | sdkmanager --licenses >/dev/null
	yes | sdkmanager --list
	;;
esac