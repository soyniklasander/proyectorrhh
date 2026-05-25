#!/bin/bash
sed -i '/<uses-permission android:name="android.permission.POST_NOTIFICATIONS" \/>/a \    <uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />' app/src/main/AndroidManifest.xml
