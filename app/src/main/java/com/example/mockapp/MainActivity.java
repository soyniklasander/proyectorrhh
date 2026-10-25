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

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private MapView mapView;
    private Button btnSpoof;
    private Marker targetMarker;
    private boolean isSpoofing = false;
    private double targetLat = 0.0;
    private double targetLon = 0.0;

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (MockLocationService.MOCK_LOCATION_ERROR.equals(intent.getAction())) {
                Toast.makeText(MainActivity.this, R.string.error_mock_provider, Toast.LENGTH_LONG).show();
                isSpoofing = false;
                updateButtonState();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Setup osmdroid config
        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, androidx.preference.PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.map_view);
        btnSpoof = findViewById(R.id.btn_spoof);

        setupMap();

        btnSpoof.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                toggleSpoofing();
            }
        });

        checkPermissions();

        IntentFilter filter = new IntentFilter(MockLocationService.MOCK_LOCATION_ERROR);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, filter);
        }
    }

    private void setupMap() {
        mapView.setMultiTouchControls(true);
        mapView.getController().setZoom(15.0);

        GeoPoint startPoint = new GeoPoint(40.7128, -74.0060); // Default to NY
        mapView.getController().setCenter(startPoint);
        targetLat = startPoint.getLatitude();
        targetLon = startPoint.getLongitude();

        targetMarker = new Marker(mapView);
        targetMarker.setPosition(startPoint);
        targetMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        mapView.getOverlays().add(targetMarker);

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                targetLat = p.getLatitude();
                targetLon = p.getLongitude();
                targetMarker.setPosition(p);
                mapView.invalidate();

                if (isSpoofing) {
                    startMockService(); // Update location while spoofing
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

    private void toggleSpoofing() {
        if (!isMockLocationEnabled()) {
            Toast.makeText(this, R.string.mock_location_not_enabled, Toast.LENGTH_LONG).show();
            // Optional: Intent to open developer settings
            // startActivity(new Intent(android.provider.Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
            return;
        }

        if (isSpoofing) {
            stopMockService();
        } else {
            startMockService();
        }
    }

    private void startMockService() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.putExtra(MockLocationService.EXTRA_LAT, targetLat);
        serviceIntent.putExtra(MockLocationService.EXTRA_LON, targetLon);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
        isSpoofing = true;
        updateButtonState();
    }

    private void stopMockService() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_STOP);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
        isSpoofing = false;
        updateButtonState();
    }

    private void updateButtonState() {
        if (isSpoofing) {
            btnSpoof.setText(R.string.stop_spoofing);
            btnSpoof.setBackgroundColor(ContextCompat.getColor(this, android.R.color.holo_red_dark));
        } else {
            btnSpoof.setText(R.string.start_spoofing);
            btnSpoof.setBackgroundColor(ContextCompat.getColor(this, R.color.purple_500));
        }
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
            isMockLocation = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
        } catch (Exception e) {
            return false;
        }
        return isMockLocation;
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
        if (!permissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    Toast.makeText(this, R.string.permissions_required, Toast.LENGTH_SHORT).show();
                    return;
                }
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mapView != null) mapView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mapView != null) mapView.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(errorReceiver);
    }
}
