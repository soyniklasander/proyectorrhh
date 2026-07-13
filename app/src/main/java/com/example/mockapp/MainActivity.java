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
import android.preference.PreferenceManager;
import android.widget.Button;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.osmdroid.api.IMapController;
import org.osmdroid.config.Configuration;
import org.osmdroid.events.MapEventsReceiver;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.MapEventsOverlay;
import org.osmdroid.views.overlay.Marker;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSIONS_REQUEST_CODE = 100;
    private MapView mapView;
    private Marker selectedMarker;
    private double selectedLat = 0.0;
    private double selectedLon = 0.0;

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("com.example.mockapp.MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                Toast.makeText(context, R.string.mock_app_not_set, Toast.LENGTH_LONG).show();
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
        IMapController mapController = mapView.getController();
        mapController.setZoom(15.0);
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038); // Madrid
        mapController.setCenter(startPoint);

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                updateSelectedLocation(p);
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

        btnStart.setOnClickListener(v -> startMocking());
        btnStop.setOnClickListener(v -> stopMocking());

        checkPermissions();
    }

    private void updateSelectedLocation(GeoPoint p) {
        selectedLat = p.getLatitude();
        selectedLon = p.getLongitude();
        if (selectedMarker != null) {
            mapView.getOverlays().remove(selectedMarker);
        }
        selectedMarker = new Marker(mapView);
        selectedMarker.setPosition(p);
        selectedMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        mapView.getOverlays().add(selectedMarker);
        mapView.invalidate();
        Toast.makeText(this, getString(R.string.location_selected, selectedLat, selectedLon), Toast.LENGTH_SHORT).show();
    }

    private void checkPermissions() {
        List<String> permissions = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.FOREGROUND_SERVICE) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.FOREGROUND_SERVICE);
            }
        }

        if (!permissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), PERMISSIONS_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSIONS_REQUEST_CODE) {
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    Toast.makeText(this, R.string.permission_required, Toast.LENGTH_LONG).show();
                    return;
                }
            }
        }
    }

    private boolean isMockSettingsEnabled() {
        boolean isMockLocation = false;
        try {
            AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
            if (opsManager != null) {
                int mode = opsManager.unsafeCheckOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName());
                isMockLocation = (mode == AppOpsManager.MODE_ALLOWED);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return isMockLocation;
    }

    private void startMocking() {
        if (!isMockSettingsEnabled()) {
            Toast.makeText(this, R.string.mock_app_not_set, Toast.LENGTH_LONG).show();
            return;
        }
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.putExtra("lat", selectedLat);
        serviceIntent.putExtra("lon", selectedLon);
        ContextCompat.startForegroundService(this, serviceIntent);
    }

    private void stopMocking() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        stopService(serviceIntent);
    }

    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter("com.example.mockapp.MOCK_LOCATION_ERROR"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter("com.example.mockapp.MOCK_LOCATION_ERROR"));
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        mapView.onPause();
        unregisterReceiver(errorReceiver);
    }
}