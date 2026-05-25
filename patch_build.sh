#!/bin/bash
sed -i '/implementation '\''androidx.constraintlayout:constraintlayout:2.2.1'\''/a \    implementation '\''org.osmdroid:osmdroid-android:6.1.18'\''\n    implementation '\''androidx.preference:preference:1.2.1'\''' app/build.gradle
