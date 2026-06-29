package com.example.mockapp;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.os.Bundle;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
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

public class MainActivity extends AppCompatActivity {

    private MapView map;
    private Marker selectedMarker;
    private double targetLat = 0.0;
    private double targetLon = 0.0;
    private Button btnStart;
    private Button btnStop;

    private static final int PERMISSION_REQUEST_CODE = 123;
    public static final String ACTION_MOCK_LOCATION_ERROR = "com.example.mockapp.MOCK_LOCATION_ERROR";
    public static final String EXTRA_LATITUDE = "EXTRA_LATITUDE";
    public static final String EXTRA_LONGITUDE = "EXTRA_LONGITUDE";

    private final BroadcastReceiver mockErrorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (ACTION_MOCK_LOCATION_ERROR.equals(intent.getAction())) {
                stopMockLocation();
                Toast.makeText(context, getString(R.string.enable_mock_app), Toast.LENGTH_LONG).show();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize osmdroid configuration
        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, androidx.preference.PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        map.setMultiTouchControls(true);
        map.getController().setZoom(15.0);
        map.getController().setCenter(new GeoPoint(40.416775, -3.703790)); // Madrid, default

        btnStart = findViewById(R.id.btnStart);
        btnStop = findViewById(R.id.btnStop);

        setupMapEvents();

        btnStart.setOnClickListener(v -> startMockLocation());
        btnStop.setOnClickListener(v -> stopMockLocation());

        checkPermissions();
    }

    private void checkPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {

                ActivityCompat.requestPermissions(this, new String[]{
                        Manifest.permission.POST_NOTIFICATIONS,
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                }, PERMISSION_REQUEST_CODE);
            }
        } else {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {

                ActivityCompat.requestPermissions(this, new String[]{
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                }, PERMISSION_REQUEST_CODE);
            }
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
                Toast.makeText(this, getString(R.string.permissions_required), Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void setupMapEvents() {
        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                targetLat = p.getLatitude();
                targetLon = p.getLongitude();

                if (selectedMarker == null) {
                    selectedMarker = new Marker(map);
                    map.getOverlays().add(selectedMarker);
                }
                selectedMarker.setPosition(p);
                selectedMarker.setTitle(getString(R.string.location_selected, String.format("%.5f", targetLat), String.format("%.5f", targetLon)));
                map.invalidate();

                Toast.makeText(MainActivity.this, selectedMarker.getTitle(), Toast.LENGTH_SHORT).show();
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                return false;
            }
        };
        MapEventsOverlay OverlayEvents = new MapEventsOverlay(mReceive);
        map.getOverlays().add(OverlayEvents);
    }

    private void startMockLocation() {
        if (targetLat == 0.0 && targetLon == 0.0) {
            Toast.makeText(this, "Selecciona una ubicación en el mapa primero", Toast.LENGTH_SHORT).show();
            return;
        }
        Intent intent = new Intent(this, MockLocationService.class);
        intent.putExtra(EXTRA_LATITUDE, targetLat);
        intent.putExtra(EXTRA_LONGITUDE, targetLon);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }
    }

    private void stopMockLocation() {
        Intent intent = new Intent(this, MockLocationService.class);
        stopService(intent);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (map != null) {
            map.onResume();
        }
        IntentFilter filter = new IntentFilter(ACTION_MOCK_LOCATION_ERROR);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(mockErrorReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(mockErrorReceiver, filter);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (map != null) {
            map.onPause();
        }
        unregisterReceiver(mockErrorReceiver);
    }
}
