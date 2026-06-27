package com.example.mockapp;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.osmdroid.config.Configuration;
import org.osmdroid.events.MapEventsReceiver;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.MapEventsOverlay;
import org.osmdroid.views.overlay.Marker;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 100;
    private MapView mapView;
    private Marker selectedMarker;
    private Button btnToggleMock;
    private boolean isMocking = false;
    private GeoPoint selectedPoint;

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                isMocking = false;
                updateButtonState();
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle(R.string.mock_location_error_title)
                        .setMessage(R.string.mock_location_error)
                        .setPositiveButton(android.R.string.ok, null)
                        .show();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Osmdroid config
        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, androidx.preference.PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.mapView);
        btnToggleMock = findViewById(R.id.btnToggleMock);

        mapView.setMultiTouchControls(true);
        mapView.getController().setZoom(15.0);

        // Default point (Madrid)
        selectedPoint = new GeoPoint(40.4168, -3.7038);
        mapView.getController().setCenter(selectedPoint);

        setupMapEvents();

        btnToggleMock.setOnClickListener(v -> {
            if (isMocking) {
                stopMockService();
            } else {
                if (checkPermissions()) {
                    startMockService();
                }
            }
        });

        checkPermissions();
    }

    private void setupMapEvents() {
        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                updateSelectedPoint(p);
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                updateSelectedPoint(p);
                return true;
            }
        };
        MapEventsOverlay overlay = new MapEventsOverlay(mReceive);
        mapView.getOverlays().add(overlay);
        updateSelectedPoint(selectedPoint);
    }

    private void updateSelectedPoint(GeoPoint p) {
        selectedPoint = p;
        if (selectedMarker != null) {
            mapView.getOverlays().remove(selectedMarker);
        }
        selectedMarker = new Marker(mapView);
        selectedMarker.setPosition(p);
        selectedMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        mapView.getOverlays().add(selectedMarker);
        mapView.invalidate();

        if (isMocking) {
            // Update running service
            startMockService();
        }
    }

    private boolean checkPermissions() {
        boolean hasLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean hasNotification = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            hasNotification = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }

        if (!hasLocation || !hasNotification) {
            String[] perms;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                perms = new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.POST_NOTIFICATIONS};
            } else {
                perms = new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION};
            }
            ActivityCompat.requestPermissions(this, perms, PERMISSION_REQUEST_CODE);
            return false;
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permissions granted
            } else {
                Toast.makeText(this, R.string.location_permission_required, Toast.LENGTH_LONG).show();
            }
        }
    }

    private void startMockService() {
        Intent intent = new Intent(this, MockLocationService.class);
        intent.setAction(MockLocationService.ACTION_START);
        intent.putExtra(MockLocationService.EXTRA_LAT, selectedPoint.getLatitude());
        intent.putExtra(MockLocationService.EXTRA_LON, selectedPoint.getLongitude());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }
        isMocking = true;
        updateButtonState();
    }

    private void stopMockService() {
        Intent intent = new Intent(this, MockLocationService.class);
        intent.setAction(MockLocationService.ACTION_STOP);
        startService(intent);
        isMocking = false;
        updateButtonState();
    }

    private void updateButtonState() {
        if (isMocking) {
            btnToggleMock.setText(R.string.stop_mock);
        } else {
            btnToggleMock.setText(R.string.start_mock);
        }
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
        try {
            unregisterReceiver(errorReceiver);
        } catch (IllegalArgumentException e) {
            // Not registered
        }
    }
}
