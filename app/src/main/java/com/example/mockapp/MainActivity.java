package com.example.mockapp;

import android.Manifest;
import android.app.AppOpsManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.preference.PreferenceManager;

import org.osmdroid.config.Configuration;
import org.osmdroid.events.MapEventsReceiver;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.MapEventsOverlay;
import org.osmdroid.views.overlay.Marker;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private MapView mapView;
    private Marker currentMarker;
    private GeoPoint selectedPoint;

    private static final int PERMISSIONS_REQUEST_CODE = 100;

    private BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                Toast.makeText(MainActivity.this, R.string.mock_app_not_set, Toast.LENGTH_LONG).show();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration.getInstance().load(getApplicationContext(), PreferenceManager.getDefaultSharedPreferences(getApplicationContext()));
        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.map_view);
        mapView.setMultiTouchControls(true);
        mapView.getController().setZoom(15.0);

        // Initial point (e.g. Madrid)
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038);
        mapView.getController().setCenter(startPoint);

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                selectedPoint = p;
                if (currentMarker == null) {
                    currentMarker = new Marker(mapView);
                    mapView.getOverlays().add(currentMarker);
                }
                currentMarker.setPosition(p);
                mapView.invalidate();
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                return false;
            }
        };
        mapView.getOverlays().add(new MapEventsOverlay(mReceive));

        Button btnStart = findViewById(R.id.btn_start);
        Button btnStop = findViewById(R.id.btn_stop);

        btnStart.setOnClickListener(v -> startMockLocation());
        btnStop.setOnClickListener(v -> stopMockLocation());

        checkAndRequestPermissions();
    }

    private void checkAndRequestPermissions() {
        List<String> permissionsNeeded = new ArrayList<>();
        permissionsNeeded.add(Manifest.permission.ACCESS_FINE_LOCATION);
        permissionsNeeded.add(Manifest.permission.ACCESS_COARSE_LOCATION);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS);
        }

        List<String> permissionsToRequest = new ArrayList<>();
        for (String p : permissionsNeeded) {
            if (ContextCompat.checkSelfPermission(this, p) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(p);
            }
        }

        if (!permissionsToRequest.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsToRequest.toArray(new String[0]), PERMISSIONS_REQUEST_CODE);
        }
    }

    private boolean isMockSettingsON() {
        boolean isMockLocation = false;
        try {
            AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
            isMockLocation = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
        } catch (Exception e) {
            return false;
        }
        return isMockLocation;
    }

    private void startMockLocation() {
        if (!isMockSettingsON()) {
            Toast.makeText(this, R.string.mock_app_not_set, Toast.LENGTH_LONG).show();
            return;
        }

        if (selectedPoint == null) {
            Toast.makeText(this, R.string.select_location, Toast.LENGTH_SHORT).show();
            return;
        }

        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.putExtra("lat", selectedPoint.getLatitude());
        serviceIntent.putExtra("lon", selectedPoint.getLongitude());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
    }

    private void stopMockLocation() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        stopService(serviceIntent);
    }

    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"));
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        mapView.onPause();
        unregisterReceiver(errorReceiver);
    }
}
