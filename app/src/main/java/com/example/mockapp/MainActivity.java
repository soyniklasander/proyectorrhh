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
import android.util.Log;

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

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private MapView map;
    private Button btnMock;
    private TextView statusText;
    private GeoPoint selectedLocation = null;
    private Marker currentMarker = null;
    private boolean isServiceRunning = false;

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                Toast.makeText(context, R.string.developer_options_required, Toast.LENGTH_LONG).show();
                stopMockLocationService();
                // Optionally redirect to settings
                // startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Handle osmdroid configuration
        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, androidx.preference.PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        btnMock = findViewById(R.id.btnMock);
        statusText = findViewById(R.id.statusText);

        map.setMultiTouchControls(true);
        GeoPoint startPoint = new GeoPoint(40.416775, -3.703790); // Default to Madrid, Spain
        map.getController().setZoom(15.0);
        map.getController().setCenter(startPoint);

        setupMapEvents();

        btnMock.setOnClickListener(v -> {
            if (isServiceRunning) {
                stopMockLocationService();
            } else {
                startMockLocationService();
            }
        });

        checkPermissions();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"));
        }
    }

    private void setupMapEvents() {
        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                updateSelectedLocation(p);
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                updateSelectedLocation(p);
                return true;
            }
        };
        MapEventsOverlay OverlayEvents = new MapEventsOverlay(getBaseContext(), mReceive);
        map.getOverlays().add(OverlayEvents);
    }

    private void updateSelectedLocation(GeoPoint p) {
        selectedLocation = p;
        if (currentMarker != null) {
            map.getOverlays().remove(currentMarker);
        }
        currentMarker = new Marker(map);
        currentMarker.setPosition(p);
        currentMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        map.getOverlays().add(currentMarker);
        map.invalidate();

        String coords = String.format("%.4f, %.4f", p.getLatitude(), p.getLongitude());
        statusText.setText(getString(R.string.location_selected, p.getLatitude(), p.getLongitude()));

        // Update service if it's already running
        if (isServiceRunning) {
            Intent intent = new Intent(this, MockLocationService.class);
            intent.putExtra("lat", selectedLocation.getLatitude());
            intent.putExtra("lon", selectedLocation.getLongitude());
            startService(intent);
        }
    }

    private void checkPermissions() {
        String[] permissions;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions = new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                    Manifest.permission.POST_NOTIFICATIONS
            };
        } else {
            permissions = new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
            };
        }

        boolean allGranted = true;
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }

        if (!allGranted) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            if (!allGranted) {
                Toast.makeText(this, R.string.permissions_required, Toast.LENGTH_LONG).show();
            }
        }
    }

    public boolean isMockLocationApp() {
        boolean isMockApp = false;
        try {
            AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
            isMockApp = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
        } catch (Exception e) {
            Log.e("MockApp", "Error checking mock location app", e);
        }
        return isMockApp;
    }

    private void startMockLocationService() {
        if (!isMockLocationApp()) {
            Toast.makeText(this, R.string.developer_options_required, Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
            return;
        }

        if (selectedLocation == null) {
            Toast.makeText(this, "Seleccione una ubicación en el mapa primero", Toast.LENGTH_SHORT).show();
            return;
        }

        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.putExtra("lat", selectedLocation.getLatitude());
        serviceIntent.putExtra("lon", selectedLocation.getLongitude());

        ContextCompat.startForegroundService(this, serviceIntent);
        isServiceRunning = true;
        btnMock.setText(R.string.stop_mock);
    }

    private void stopMockLocationService() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        stopService(serviceIntent);
        isServiceRunning = false;
        btnMock.setText(R.string.start_mock);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (map != null) {
            map.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (map != null) {
            map.onPause();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            unregisterReceiver(errorReceiver);
        } catch (IllegalArgumentException e) {
            // Receiver not registered
        }
    }
}
