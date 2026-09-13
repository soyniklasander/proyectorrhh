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
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.osmdroid.api.IMapController;
import org.osmdroid.config.Configuration;
import org.osmdroid.events.MapEventsReceiver;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.MapEventsOverlay;
import org.osmdroid.views.overlay.Marker;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 100;
    private MapView map;
    private Marker selectedMarker;
    private Button startStopButton;
    private boolean isSpoofing = false;
    private double selectedLat = 40.4168; // Madrid as default
    private double selectedLon = -3.7038;

    private final BroadcastReceiver mockErrorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (MockLocationService.ACTION_MOCK_ERROR.equals(intent.getAction())) {
                stopSpoofing();
                Toast.makeText(MainActivity.this, R.string.error_mock_app_not_set, Toast.LENGTH_LONG).show();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.mapView);
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);

        IMapController mapController = map.getController();
        mapController.setZoom(9.5);
        GeoPoint startPoint = new GeoPoint(selectedLat, selectedLon);
        mapController.setCenter(startPoint);

        selectedMarker = new Marker(map);
        selectedMarker.setPosition(startPoint);
        selectedMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        map.getOverlays().add(selectedMarker);

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                selectedLat = p.getLatitude();
                selectedLon = p.getLongitude();
                selectedMarker.setPosition(p);
                map.invalidate();
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                return false;
            }
        };
        map.getOverlays().add(new MapEventsOverlay(mReceive));

        startStopButton = findViewById(R.id.startStopButton);
        startStopButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (isSpoofing) {
                    stopSpoofing();
                } else {
                    if (checkPermissions() && isMockLocationEnabled()) {
                        startSpoofing();
                    }
                }
            }
        });

        checkPermissions();
    }

    @Override
    protected void onResume() {
        super.onResume();
        map.onResume();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(mockErrorReceiver, new IntentFilter(MockLocationService.ACTION_MOCK_ERROR), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(mockErrorReceiver, new IntentFilter(MockLocationService.ACTION_MOCK_ERROR));
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        map.onPause();
        unregisterReceiver(mockErrorReceiver);
    }

    private boolean checkPermissions() {
        List<String> requiredPermissions = new ArrayList<>();

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requiredPermissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requiredPermissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requiredPermissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!requiredPermissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, requiredPermissions.toArray(new String[0]), PERMISSION_REQUEST_CODE);
            return false;
        }
        return true;
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
                Toast.makeText(this, R.string.permission_required, Toast.LENGTH_SHORT).show();
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

        if (!isMockLocation) {
            Toast.makeText(this, R.string.error_mock_app_not_set, Toast.LENGTH_LONG).show();
        }
        return isMockLocation;
    }

    private void startSpoofing() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_START);
        serviceIntent.putExtra(MockLocationService.EXTRA_LAT, selectedLat);
        serviceIntent.putExtra(MockLocationService.EXTRA_LON, selectedLon);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        isSpoofing = true;
        startStopButton.setText(R.string.stop_spoofing);
    }

    private void stopSpoofing() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_STOP);
        startService(serviceIntent);

        isSpoofing = false;
        startStopButton.setText(R.string.start_spoofing);
    }
}
