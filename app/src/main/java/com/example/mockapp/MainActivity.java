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
import android.widget.Button;
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

    private static final int PERMISSION_REQUEST_CODE = 100;

    private MapView mapView;
    private Button btnToggleMock;
    private boolean isMocking = false;
    private GeoPoint selectedLocation = new GeoPoint(40.416775, -3.703790); // Madrid by default
    private Marker currentMarker;

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                stopMockingService();
                Toast.makeText(context, R.string.mock_location_not_enabled, Toast.LENGTH_LONG).show();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration.getInstance().load(this, androidx.preference.PreferenceManager.getDefaultSharedPreferences(this));

        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.mapView);
        btnToggleMock = findViewById(R.id.btnToggleMock);

        setupMap();

        btnToggleMock.setOnClickListener(v -> {
            if (isMocking) {
                stopMockingService();
            } else {
                if (checkPermissions()) {
                    if (isMockLocationEnabled()) {
                        startMockingService();
                    } else {
                        Toast.makeText(this, R.string.mock_location_not_enabled, Toast.LENGTH_LONG).show();
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

    private void setupMap() {
        mapView.setMultiTouchControls(true);
        mapView.getController().setZoom(15.0);
        mapView.getController().setCenter(selectedLocation);

        currentMarker = new Marker(mapView);
        currentMarker.setPosition(selectedLocation);
        currentMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        mapView.getOverlays().add(currentMarker);

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                selectedLocation = p;
                currentMarker.setPosition(p);
                mapView.invalidate();
                if (isMocking) {
                    MockLocationService.updateLocation(p.getLatitude(), p.getLongitude());
                }
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                return false;
            }
        };
        mapView.getOverlays().add(new MapEventsOverlay(mReceive));
    }

    private void startMockingService() {
        Intent intent = new Intent(this, MockLocationService.class);
        intent.putExtra("lat", selectedLocation.getLatitude());
        intent.putExtra("lon", selectedLocation.getLongitude());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }
        isMocking = true;
        btnToggleMock.setText(R.string.stop_mocking);
    }

    private void stopMockingService() {
        Intent intent = new Intent(this, MockLocationService.class);
        stopService(intent);
        isMocking = false;
        btnToggleMock.setText(R.string.start_mocking);
    }

    private boolean checkPermissions() {
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
        return permissionsNeeded.isEmpty();
    }

    private void requestPermissions() {
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
            ActivityCompat.requestPermissions(this, permissionsNeeded.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (checkPermissions()) {
                if (isMockLocationEnabled()) {
                    startMockingService();
                } else {
                    Toast.makeText(this, R.string.mock_location_not_enabled, Toast.LENGTH_LONG).show();
                }
            } else {
                Toast.makeText(this, R.string.permission_required, Toast.LENGTH_LONG).show();
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
        mapView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        mapView.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(errorReceiver);
        if (isMocking) {
            stopMockingService();
        }
    }
}
