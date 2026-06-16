package com.example.mockapp;

import android.Manifest;
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

    private static final int REQUEST_PERMISSIONS_REQUEST_CODE = 1;
    private MapView map = null;
    private Marker targetMarker = null;
    private double selectedLat = 0.0;
    private double selectedLon = 0.0;
    private boolean isLocationSelected = false;

    private BroadcastReceiver mockErrorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                Toast.makeText(context, R.string.mock_location_error, Toast.LENGTH_LONG).show();
                Intent settingsIntent = new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS);
                try {
                    startActivity(settingsIntent);
                } catch (Exception e) {
                    Toast.makeText(context, "No se pudo abrir las Opciones de Desarrollador", Toast.LENGTH_SHORT).show();
                }
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, PreferenceManager.getDefaultSharedPreferences(ctx));
        Configuration.getInstance().setUserAgentValue(getPackageName());

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.mapView);
        map.setMultiTouchControls(true);
        map.getController().setZoom(15.0);

        GeoPoint startPoint = new GeoPoint(40.4167, -3.7033); // Madrid, por defecto
        map.getController().setCenter(startPoint);

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                updateMarker(p);
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                return false;
            }
        };
        map.getOverlays().add(new MapEventsOverlay(mReceive));

        Button btnStart = findViewById(R.id.btnStart);
        Button btnStop = findViewById(R.id.btnStop);

        btnStart.setOnClickListener(v -> startMocking());
        btnStop.setOnClickListener(v -> stopMocking());

        requestPermissionsIfNecessary(new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.WRITE_EXTERNAL_STORAGE,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ? Manifest.permission.POST_NOTIFICATIONS : null
        });
    }

    private void updateMarker(GeoPoint p) {
        if (targetMarker == null) {
            targetMarker = new Marker(map);
            map.getOverlays().add(targetMarker);
        }
        targetMarker.setPosition(p);
        targetMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        map.invalidate();

        selectedLat = p.getLatitude();
        selectedLon = p.getLongitude();
        isLocationSelected = true;
    }

    private void startMocking() {
        if (!isLocationSelected) {
            Toast.makeText(this, "Selecciona una ubicación en el mapa primero", Toast.LENGTH_SHORT).show();
            return;
        }

        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.putExtra("lat", selectedLat);
        serviceIntent.putExtra("lon", selectedLon);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ContextCompat.startForegroundService(this, serviceIntent);
        } else {
            startService(serviceIntent);
        }
        Toast.makeText(this, "Simulando: " + selectedLat + ", " + selectedLon, Toast.LENGTH_SHORT).show();
    }

    private void stopMocking() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        stopService(serviceIntent);
        Toast.makeText(this, R.string.stop_mocking, Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onResume() {
        super.onResume();
        map.onResume();

        IntentFilter filter = new IntentFilter("MOCK_LOCATION_ERROR");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(mockErrorReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(mockErrorReceiver, filter);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        map.onPause();
        unregisterReceiver(mockErrorReceiver);
    }

    private void requestPermissionsIfNecessary(String[] permissions) {
        java.util.ArrayList<String> permissionsToRequest = new java.util.ArrayList<>();
        for (String permission : permissions) {
            if (permission != null && ContextCompat.checkSelfPermission(this, permission)
                    != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(permission);
            }
        }
        if (!permissionsToRequest.isEmpty()) {
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
                Toast.makeText(this, R.string.permissions_required, Toast.LENGTH_LONG).show();
            }
        }
    }
}
