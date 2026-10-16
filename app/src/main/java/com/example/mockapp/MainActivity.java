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
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.osmdroid.config.Configuration;
import org.osmdroid.events.MapEventsReceiver;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.MapEventsOverlay;
import org.osmdroid.views.overlay.Marker;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSIONS_REQUEST_CODE = 100;

    private MapView map;
    private Button btnToggleMock;
    private TextView locationText;
    private Marker currentMarker;

    private boolean isMocking = false;
    private double selectedLat = 0.0;
    private double selectedLon = 0.0;

    private BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                stopMocking();
                Toast.makeText(MainActivity.this, R.string.mock_location_app_not_set, Toast.LENGTH_LONG).show();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize osmdroid configuration
        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        btnToggleMock = findViewById(R.id.btnToggleMock);
        locationText = findViewById(R.id.locationText);

        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);
        map.getController().setZoom(15.0);

        // Default center
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038); // Madrid
        map.getController().setCenter(startPoint);

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
        map.getOverlays().add(new MapEventsOverlay(mReceive));

        btnToggleMock.setOnClickListener(v -> {
            if (isMocking) {
                stopMocking();
            } else {
                if (checkPermissions()) {
                    if (isMockLocationEnabled()) {
                        startMocking();
                    } else {
                        Toast.makeText(this, R.string.mock_location_app_not_set, Toast.LENGTH_LONG).show();
                    }
                } else {
                    requestPermissions();
                }
            }
        });

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"));
        }
    }

    private void updateSelectedLocation(GeoPoint p) {
        selectedLat = p.getLatitude();
        selectedLon = p.getLongitude();

        if (currentMarker != null) {
            map.getOverlays().remove(currentMarker);
        }

        currentMarker = new Marker(map);
        currentMarker.setPosition(p);
        currentMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        map.getOverlays().add(currentMarker);
        map.invalidate();

        locationText.setText(String.format("Lat: %.6f, Lon: %.6f", selectedLat, selectedLon));

        if (isMocking) {
            // Update the running service
            Intent intent = new Intent(this, MockLocationService.class);
            intent.putExtra("lat", selectedLat);
            intent.putExtra("lon", selectedLon);
            ContextCompat.startForegroundService(this, intent);
        }
    }

    private void startMocking() {
        if (selectedLat == 0.0 && selectedLon == 0.0) {
            Toast.makeText(this, R.string.select_location_msg, Toast.LENGTH_SHORT).show();
            return;
        }

        Intent intent = new Intent(this, MockLocationService.class);
        intent.putExtra("lat", selectedLat);
        intent.putExtra("lon", selectedLon);
        ContextCompat.startForegroundService(this, intent);

        isMocking = true;
        btnToggleMock.setText(R.string.stop_mocking);
    }

    private void stopMocking() {
        Intent intent = new Intent(this, MockLocationService.class);
        stopService(intent);

        isMocking = false;
        btnToggleMock.setText(R.string.start_mocking);
    }

    private boolean checkPermissions() {
        boolean locationPermission = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean notificationPermission = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notificationPermission = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        return locationPermission && notificationPermission;
    }

    private void requestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(this,
                    new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION,
                            Manifest.permission.POST_NOTIFICATIONS
                    },
                    PERMISSIONS_REQUEST_CODE);
        } else {
            ActivityCompat.requestPermissions(this,
                    new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                    },
                    PERMISSIONS_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSIONS_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (isMockLocationEnabled()) {
                    startMocking();
                } else {
                    Toast.makeText(this, R.string.mock_location_app_not_set, Toast.LENGTH_LONG).show();
                }
            } else {
                Toast.makeText(this, R.string.permissions_required, Toast.LENGTH_SHORT).show();
            }
        }
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
            if (opsManager != null) {
                isMockLocation = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return isMockLocation;
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (map != null) map.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (map != null) map.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(errorReceiver);
    }
}
