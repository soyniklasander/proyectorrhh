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
import android.provider.Settings;
import android.widget.Button;
import android.widget.TextView;
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

    private MapView map = null;
    private Marker selectedMarker = null;
    private GeoPoint selectedLocation = null;
    private TextView tvStatus;
    private Button btnStart, btnStop;

    private static final int REQUEST_PERMISSIONS_REQUEST_CODE = 1;

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Toast.makeText(context, getString(R.string.mock_location_not_enabled), Toast.LENGTH_LONG).show();
            tvStatus.setText(getString(R.string.mock_location_not_enabled));
            updateServiceUI(false);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        tvStatus = findViewById(R.id.tvStatus);
        btnStart = findViewById(R.id.btnStart);
        btnStop = findViewById(R.id.btnStop);

        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);

        IMapController mapController = map.getController();
        mapController.setZoom(5.0);
        GeoPoint startPoint = new GeoPoint(40.416775, -3.703790); // Madrid by default
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
        MapEventsOverlay overlayEvents = new MapEventsOverlay(mReceive);
        map.getOverlays().add(overlayEvents);

        btnStart.setOnClickListener(v -> {
            if (checkMockLocationEnabled()) {
                if (selectedLocation != null) {
                    Intent serviceIntent = new Intent(this, MockLocationService.class);
                    serviceIntent.setAction(MockLocationService.ACTION_START);
                    serviceIntent.putExtra(MockLocationService.EXTRA_LAT, selectedLocation.getLatitude());
                    serviceIntent.putExtra(MockLocationService.EXTRA_LON, selectedLocation.getLongitude());

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        startForegroundService(serviceIntent);
                    } else {
                        startService(serviceIntent);
                    }
                    updateServiceUI(true);
                } else {
                    Toast.makeText(this, "Selecciona una ubicación en el mapa primero", Toast.LENGTH_SHORT).show();
                }
            } else {
                Toast.makeText(this, getString(R.string.mock_location_not_enabled), Toast.LENGTH_LONG).show();
                startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
            }
        });

        btnStop.setOnClickListener(v -> {
            Intent serviceIntent = new Intent(this, MockLocationService.class);
            serviceIntent.setAction(MockLocationService.ACTION_STOP);
            startService(serviceIntent);
            updateServiceUI(false);
        });

        requestPermissionsIfNecessary(new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.POST_NOTIFICATIONS
        });

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"));
        }

        updateServiceUI(false);
    }

    private void updateSelectedLocation(GeoPoint p) {
        selectedLocation = p;
        if (selectedMarker != null) {
            map.getOverlays().remove(selectedMarker);
        }
        selectedMarker = new Marker(map);
        selectedMarker.setPosition(p);
        selectedMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        map.getOverlays().add(selectedMarker);
        map.invalidate();
        tvStatus.setText(getString(R.string.location_selected) + ": " + p.getLatitude() + ", " + p.getLongitude());
    }

    private void updateServiceUI(boolean isRunning) {
        btnStart.setEnabled(!isRunning);
        btnStop.setEnabled(isRunning);
        if (isRunning) {
            tvStatus.setText(getString(R.string.service_running));
        } else {
            if (selectedLocation != null) {
                tvStatus.setText(getString(R.string.service_stopped) + " - " + getString(R.string.location_selected) + ": " + selectedLocation.getLatitude() + ", " + selectedLocation.getLongitude());
            } else {
                tvStatus.setText(getString(R.string.service_stopped));
            }
        }
    }

    private boolean checkMockLocationEnabled() {
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
    public void onResume() {
        super.onResume();
        if (map != null) {
            map.onResume();
        }
    }

    @Override
    public void onPause() {
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
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void requestPermissionsIfNecessary(String[] permissions) {
        ArrayList<String> permissionsToRequest = new ArrayList<>();
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission)
                    != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(permission);
            }
        }
        if (!permissionsToRequest.isEmpty() && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            ActivityCompat.requestPermissions(
                    this,
                    permissionsToRequest.toArray(new String[0]),
                    REQUEST_PERMISSIONS_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_PERMISSIONS_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            if (!allGranted) {
                Toast.makeText(this, getString(R.string.permissions_required), Toast.LENGTH_LONG).show();
            }
        }
    }
}
