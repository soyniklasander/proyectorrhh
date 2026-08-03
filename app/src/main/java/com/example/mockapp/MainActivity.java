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
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

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
    private Button btnMock;
    private TextView tvLocation;

    private GeoPoint selectedLocation = null;
    private Marker locationMarker = null;
    private boolean isMocking = false;

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                stopMocking();
                Toast.makeText(context, getString(R.string.mock_location_not_enabled), Toast.LENGTH_LONG).show();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration.getInstance().load(getApplicationContext(), PreferenceManager.getDefaultSharedPreferences(getApplicationContext()));

        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.mapView);
        btnMock = findViewById(R.id.btnMock);
        tvLocation = findViewById(R.id.tvLocation);

        setupMap();

        btnMock.setOnClickListener(v -> toggleMocking());

        requestRequiredPermissions();
    }

    private void setupMap() {
        mapView.setMultiTouchControls(true);
        mapView.getController().setZoom(15.0);
        mapView.getController().setCenter(new GeoPoint(-12.0464, -77.0428)); // Default center: Lima, Peru

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
    }

    private void updateSelectedLocation(GeoPoint point) {
        selectedLocation = point;

        if (locationMarker == null) {
            locationMarker = new Marker(mapView);
            mapView.getOverlays().add(locationMarker);
        }

        locationMarker.setPosition(point);
        locationMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        mapView.invalidate();

        tvLocation.setText(String.format(getString(R.string.location_selected), point.getLatitude(), point.getLongitude()));

        if (isMocking) {
            startMockingService(); // Update ongoing service with new coordinates
        }
    }

    private void requestRequiredPermissions() {
        List<String> permissionsNeeded = new ArrayList<>();

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!permissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsNeeded.toArray(new String[0]), PERMISSIONS_REQUEST_CODE);
        }
    }

    private boolean isMockSettingsEnabled() {
        AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
        boolean isMockLocation = false;
        try {
            isMockLocation = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return isMockLocation;
    }

    private void toggleMocking() {
        if (!isMocking) {
            if (!isMockSettingsEnabled()) {
                Toast.makeText(this, getString(R.string.mock_location_not_enabled), Toast.LENGTH_LONG).show();
                return;
            }
            if (selectedLocation == null) {
                Toast.makeText(this, "Selecciona una ubicación primero", Toast.LENGTH_SHORT).show();
                return;
            }
            startMockingService();
            isMocking = true;
            btnMock.setText(getString(R.string.stop_mocking));
        } else {
            stopMocking();
        }
    }

    private void startMockingService() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.putExtra("LATITUDE", selectedLocation.getLatitude());
        serviceIntent.putExtra("LONGITUDE", selectedLocation.getLongitude());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
    }

    private void stopMocking() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        stopService(serviceIntent);
        isMocking = false;
        btnMock.setText(getString(R.string.start_mocking));
    }

    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();

        IntentFilter filter = new IntentFilter("MOCK_LOCATION_ERROR");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, filter);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        mapView.onPause();
        unregisterReceiver(errorReceiver);
    }
}
