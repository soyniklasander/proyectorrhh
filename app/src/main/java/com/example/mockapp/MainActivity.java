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
import android.provider.Settings;
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

    private static final int REQUEST_PERMISSIONS = 1;
    private MapView mapView;
    private TextView statusText;
    private Button toggleButton;
    private Marker selectedMarker;
    private boolean isServiceRunning = false;
    private GeoPoint selectedLocation = null;

    private BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (MockLocationService.MOCK_LOCATION_ERROR.equals(intent.getAction())) {
                stopMockService();
                promptMockLocationSettings();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration.getInstance().load(getApplicationContext(), androidx.preference.PreferenceManager.getDefaultSharedPreferences(getApplicationContext()));
        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.mapView);
        statusText = findViewById(R.id.statusText);
        toggleButton = findViewById(R.id.toggleButton);

        mapView.setMultiTouchControls(true);
        mapView.getController().setZoom(4.0);
        mapView.getController().setCenter(new GeoPoint(0.0, 0.0));

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                return false;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                if (isServiceRunning) {
                    Toast.makeText(MainActivity.this, "Detén la simulación antes de cambiar la ubicación.", Toast.LENGTH_SHORT).show();
                    return false;
                }
                updateMarker(p);
                return true;
            }
        };
        mapView.getOverlays().add(new MapEventsOverlay(mReceive));

        toggleButton.setOnClickListener(v -> {
            if (isServiceRunning) {
                stopMockService();
            } else {
                startMockService();
            }
        });

        requestPermissionsIfNecessary();
    }

    private void updateMarker(GeoPoint p) {
        if (selectedMarker == null) {
            selectedMarker = new Marker(mapView);
            mapView.getOverlays().add(selectedMarker);
        }
        selectedLocation = p;
        selectedMarker.setPosition(p);
        selectedMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        mapView.invalidate();
        statusText.setText(getString(R.string.location_selected, p.getLatitude(), p.getLongitude()));
    }

    private void requestPermissionsIfNecessary() {
        List<String> permissions = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS);
        }
        if (!permissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), REQUEST_PERMISSIONS);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_PERMISSIONS) {
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    Toast.makeText(this, R.string.permission_required, Toast.LENGTH_LONG).show();
                    return;
                }
            }
        }
    }

    private void startMockService() {
        if (selectedLocation == null) {
            Toast.makeText(this, "Selecciona una ubicación en el mapa primero.", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!isMockLocationEnabled()) {
            promptMockLocationSettings();
            return;
        }

        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.putExtra("lat", selectedLocation.getLatitude());
        serviceIntent.putExtra("lon", selectedLocation.getLongitude());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        isServiceRunning = true;
        toggleButton.setText(R.string.stop_mock);
    }

    private void stopMockService() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction("STOP");
        startService(serviceIntent);
        isServiceRunning = false;
        toggleButton.setText(R.string.start_mock);
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
                isMockLocation = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
            } else {
                isMockLocation = !android.provider.Settings.Secure.getString(getContentResolver(), "mock_location").equals("0");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return isMockLocation;
    }

    private void promptMockLocationSettings() {
        Toast.makeText(this, R.string.enable_mock_app, Toast.LENGTH_LONG).show();
        startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
    }

    @Override
    protected void onResume() {
        super.onResume();
        mapView.onResume();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter(MockLocationService.MOCK_LOCATION_ERROR), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter(MockLocationService.MOCK_LOCATION_ERROR));
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        mapView.onPause();
        unregisterReceiver(errorReceiver);
    }
}
