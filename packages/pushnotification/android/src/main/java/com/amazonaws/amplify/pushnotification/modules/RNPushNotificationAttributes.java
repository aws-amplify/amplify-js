/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
package com.amazonaws.amplify.pushnotification.modules;

import android.os.Bundle;
import androidx.annotation.NonNull;
import android.util.Log;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import org.json.JSONException;
import org.json.JSONObject;

public class RNPushNotificationAttributes {
    private static final String LOG_TAG = "RNPushNotificationAttributes";

    private static final String ID = "id";
    private static final String MESSAGE = "message";
    private static final String FIRE_DATE = "fireDate";
    private static final String TITLE = "title";
    private static final String TICKER = "ticker";
    private static final String AUTO_CANCEL = "autoCancel";
    private static final String LARGE_ICON = "largeIcon";
    private static final String SMALL_ICON = "smallIcon";
    private static final String BIG_TEXT = "bigText";
    private static final String SUB_TEXT = "subText";
    private static final String NUMBER = "number";
    private static final String SOUND = "sound";
    private static final String COLOR = "color";
    private static final String GROUP = "group";
    private static final String USER_INTERACTION = "userInteraction";
    private static final String PLAY_SOUND = "playSound";
    private static final String VIBRATE = "vibrate";
    private static final String VIBRATION = "vibration";
    private static final String ACTIONS = "actions";
    private static final String TAG = "tag";
    private static final String REPEAT_TYPE = "repeatType";
    private static final String REPEAT_TIME = "repeatTime";
    private static final String ONGOING = "ongoing";

    private final String id;
    private final String message;
    private final double fireDate;
    private final String title;
    private final String ticker;
    private final boolean autoCancel;
    private final String largeIcon;
    private final String smallIcon;
    private final String bigText;
    private final String subText;
    private final String number;
    private final String sound;
    private final String color;
    private final String group;
    private final boolean userInteraction;
    private final boolean playSound;
    private final boolean vibrate;
    private final double vibration;
    private final String actions;
    private final String tag;
    private final String repeatType;
    private final double repeatTime;
    private final boolean ongoing;

    public RNPushNotificationAttributes(Bundle bundle) {
        id = bundle.getString(ID);
        message = bundle.getString(MESSAGE);
        fireDate = bundle.getDouble(FIRE_DATE);
        title = bundle.getString(TITLE);
        ticker = bundle.getString(TICKER);
        autoCancel = bundle.getBoolean(AUTO_CANCEL);
        largeIcon = bundle.getString(LARGE_ICON);
        smallIcon = bundle.getString(SMALL_ICON);
        bigText = bundle.getString(BIG_TEXT);
        subText = bundle.getString(SUB_TEXT);
        number = bundle.getString(NUMBER);
        sound = bundle.getString(SOUND);
        color = bundle.getString(COLOR);
        group = bundle.getString(GROUP);
        userInteraction = bundle.getBoolean(USER_INTERACTION);
        playSound = bundle.getBoolean(PLAY_SOUND);
        vibrate = bundle.getBoolean(VIBRATE);
        vibration = bundle.getDouble(VIBRATION);
        actions = bundle.getString(ACTIONS);
        tag = bundle.getString(TAG);
        repeatType = bundle.getString(REPEAT_TYPE);
        repeatTime = bundle.getDouble(REPEAT_TIME);
        ongoing = bundle.getBoolean(ONGOING);
    }

    private RNPushNotificationAttributes(JSONObject jsonObject) {
        try {
            id = jsonObject.has(ID) ? jsonObject.getString(ID) : null;
            message = jsonObject.has(MESSAGE) ? jsonObject.getString(MESSAGE) : null;
            fireDate = jsonObject.has(FIRE_DATE) ? jsonObject.getDouble(FIRE_DATE) : 0.0;
            title = jsonObject.has(TITLE) ? jsonObject.getString(TITLE) : null;
            ticker = jsonObject.has(TICKER) ? jsonObject.getString(TICKER) : null;
            autoCancel = jsonObject.has(AUTO_CANCEL) ? jsonObject.getBoolean(AUTO_CANCEL) : true;
            largeIcon = jsonObject.has(LARGE_ICON) ? jsonObject.getString(LARGE_ICON) : null;
            smallIcon = jsonObject.has(SMALL_ICON) ? jsonObject.getString(SMALL_ICON) : null;
            bigText = jsonObject.has(BIG_TEXT) ? jsonObject.getString(BIG_TEXT) : null;
            subText = jsonObject.has(SUB_TEXT) ? jsonObject.getString(SUB_TEXT) : null;
            number = jsonObject.has(NUMBER) ? jsonObject.getString(NUMBER) : null;
            sound = jsonObject.has(SOUND) ? jsonObject.getString(SOUND) : null;
            color = jsonObject.has(COLOR) ? jsonObject.getString(COLOR) : null;
            group = jsonObject.has(GROUP) ? jsonObject.getString(GROUP) : null;
            userInteraction = jsonObject.has(USER_INTERACTION) ? jsonObject.getBoolean(USER_INTERACTION) : false;
            playSound = jsonObject.has(PLAY_SOUND) ? jsonObject.getBoolean(PLAY_SOUND) : true;
            vibrate = jsonObject.has(VIBRATE) ? jsonObject.getBoolean(VIBRATE) : true;
            vibration = jsonObject.has(VIBRATION) ? jsonObject.getDouble(VIBRATION) : 1000;
            actions = jsonObject.has(ACTIONS) ? jsonObject.getString(ACTIONS) : null;
            tag = jsonObject.has(TAG) ? jsonObject.getString(TAG) : null;
            repeatType = jsonObject.has(REPEAT_TYPE) ? jsonObject.getString(REPEAT_TYPE) : null;
            repeatTime = jsonObject.has(REPEAT_TIME) ? jsonObject.getDouble(REPEAT_TIME) : 0.0;
            ongoing = jsonObject.has(ONGOING) ? jsonObject.getBoolean(ONGOING) : false;
        } catch (JSONException e) {
            throw new IllegalStateException("Exception while initializing RNPushNotificationAttributes from JSON", e);
        }
    }

    @NonNull
    public static RNPushNotificationAttributes fromJson(String notificationAttributesJson) throws JSONException {
        JSONObject jsonObject = new JSONObject(notificationAttributesJson);
        return new RNPushNotificationAttributes(jsonObject);
    }

    /**
     * User to find notifications:
     * <p>
     * https://github.com/facebook/react-native/blob/master/Libraries/PushNotificationIOS/RCTPushNotificationManager.m#L294
     *
     * @param userInfo map of fields to match
     * @return true all fields in userInfo object match, false otherwise
     */
    public boolean matches(ReadableMap userInfo) {
        Bundle bundle = toBundle();

        ReadableMapKeySetIterator iterator = userInfo.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();

            if (!bundle.containsKey(key))
                return false;

            switch (userInfo.getType(key)) {
                case Null: {
                    if (bundle.get(key) != null)
                        return false;
                    break;
                }
                case Boolean: {
                    if (userInfo.getBoolean(key) != bundle.getBoolean(key))
                        return false;
                    break;
                }
                case Number: {
                    if ((userInfo.getDouble(key) != bundle.getDouble(key)) && (userInfo.getInt(key) != bundle.getInt(key)))
                        return false;
                    break;
                }
                case String: {
                    if (!userInfo.getString(key).equals(bundle.getString(key)))
                        return false;
                    break;
                }
                case Map:
                    return false;//there are no maps in the bundle
                case Array:
                    return false;//there are no arrays in the bundle
            }
        }

        return true;
    }

    public Bundle toBundle() {
        Bundle bundle = new Bundle();
        bundle.putString(ID, id);
        bundle.putString(MESSAGE, message);
        bundle.putDouble(FIRE_DATE, fireDate);
        bundle.putString(TITLE, title);
        bundle.putString(TICKER, ticker);
        bundle.putBoolean(AUTO_CANCEL, autoCancel);
        bundle.putString(LARGE_ICON, largeIcon);
        bundle.putString(SMALL_ICON, smallIcon);
        bundle.putString(BIG_TEXT, bigText);
        bundle.putString(SUB_TEXT, subText);
        bundle.putString(NUMBER, number);
        bundle.putString(SOUND, sound);
        bundle.putString(COLOR, color);
        bundle.putString(GROUP, group);
        bundle.putBoolean(USER_INTERACTION, userInteraction);
        bundle.putBoolean(PLAY_SOUND, playSound);
        bundle.putBoolean(VIBRATE, vibrate);
        bundle.putDouble(VIBRATION, vibration);
        bundle.putString(ACTIONS, actions);
        bundle.putString(TAG, tag);
        bundle.putString(REPEAT_TYPE, repeatType);
        bundle.putDouble(REPEAT_TIME, repeatTime);
        bundle.putBoolean(ONGOING, ongoing);
        return bundle;
    }

    public JSONObject toJson() {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put(ID, id);
            jsonObject.put(MESSAGE, message);
            jsonObject.put(FIRE_DATE, fireDate);
            jsonObject.put(TITLE, title);
            jsonObject.put(TICKER, ticker);
            jsonObject.put(AUTO_CANCEL, autoCancel);
            jsonObject.put(LARGE_ICON, largeIcon);
            jsonObject.put(SMALL_ICON, smallIcon);
            jsonObject.put(BIG_TEXT, bigText);
            jsonObject.put(SUB_TEXT, subText);
            jsonObject.put(NUMBER, number);
            jsonObject.put(SOUND, sound);
            jsonObject.put(COLOR, color);
            jsonObject.put(GROUP, group);
            jsonObject.put(USER_INTERACTION, userInteraction);
            jsonObject.put(PLAY_SOUND, playSound);
            jsonObject.put(VIBRATE, vibrate);
            jsonObject.put(VIBRATION, vibration);
            jsonObject.put(ACTIONS, actions);
            jsonObject.put(TAG, tag);
            jsonObject.put(REPEAT_TYPE, repeatType);
            jsonObject.put(REPEAT_TIME, repeatTime);
            jsonObject.put(ONGOING, ongoing);
        } catch (JSONException e) {
            Log.e(LOG_TAG, "Exception while converting RNPushNotificationAttributes to " +
                    "JSON. Returning an empty object", e);
            return new JSONObject();
        }
        return jsonObject;
    }

    @Override
    // For debugging
    public String toString() {
        return "RNPushNotificationAttributes{" +
                "id='" + id + '\'' +
                ", message='" + message + '\'' +
                ", fireDate=" + fireDate +
                ", title='" + title + '\'' +
                ", ticker='" + ticker + '\'' +
                ", autoCancel=" + autoCancel +
                ", largeIcon='" + largeIcon + '\'' +
                ", smallIcon='" + smallIcon + '\'' +
                ", bigText='" + bigText + '\'' +
                ", subText='" + subText + '\'' +
                ", number='" + number + '\'' +
                ", sound='" + sound + '\'' +
                ", color='" + color + '\'' +
                ", group='" + group + '\'' +
                ", userInteraction=" + userInteraction +
                ", playSound=" + playSound +
                ", vibrate=" + vibrate +
                ", vibration=" + vibration +
                ", actions='" + actions + '\'' +
                ", tag='" + tag + '\'' +
                ", repeatType='" + repeatType + '\'' +
                ", repeatTime=" + repeatTime +
                ", ongoing=" + ongoing +
                '}';
    }

    public String getId() {
        return id;
    }

    public double getFireDate() {
        return fireDate;
    }

}
