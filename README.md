# MockApp - GPS Spoofer

MockApp is an Android application that allows you to easily simulate your device's GPS location. This allows you to spoof your location when using other apps, like sharing your location in real-time.

## Features

* **Foreground Service:** Spoofs your location consistently even when the app is closed or running in the background.
* **Easy Interface:** Set a target latitude and longitude and start/stop mocking with a tap.

## Installation

1. Download the pre-built APK file located at: `app/build/outputs/apk/debug/app-debug.apk`
2. Transfer the APK to your Android device.
3. Tap on the APK file to install it. You may need to enable "Install unknown apps" from your device's settings if you haven't done so already.

## Configuration & Usage

For the GPS spoofer to work, you must set MockApp as your device's "Mock location app".

### 1. Enable Developer Options

If you haven't already enabled Developer Options on your device:
1. Go to your device's **Settings**.
2. Scroll down and tap on **About phone**.
3. Tap on **Software information**.
4. Tap the **Build number** 7 times rapidly until you see a message saying "You are now a developer!".

### 2. Set Mock Location App

1. Go back to your device's main **Settings** menu.
2. Scroll down to the bottom and tap on **Developer options**.
3. Scroll down to the **Location** section (or use the search bar to find "mock").
4. Tap on **Select mock location app**.
5. Select **MockApp** from the list.

### 3. Start Spoofing

1. Open **MockApp**.
2. Grant any location and notification permissions requested.
3. Enter your desired **Latitude** and **Longitude** (e.g., `37.422` and `-122.084` for Googleplex).
4. Tap **Start Spoofing**.
5. You can now close the app, and your location will remain spoofed. A persistent notification will indicate that the GPS is being mocked.
6. Open your favorite Maps or messaging app and see your new simulated location!
7. To stop spoofing, either tap **Stop Spoofing** in the app or tap the notification to return to the app and stop it.