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
import android.view.MotionEvent;
import android.widget.Button;
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

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int REQUEST_PERMISSIONS_REQUEST_CODE = 1;

    private MapView map;
    private Button btnStartStop;
    private Marker selectedLocationMarker;
    private boolean isMocking = false;

    private BroadcastReceiver mockErrorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                Toast.makeText(MainActivity.this,
                    "Error: Asegúrate de habilitar esta app como 'Aplicación de ubicación simulada' en las Opciones de Desarrollador.",
                    Toast.LENGTH_LONG).show();
                stopMocking();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Setup osmdroid configuration
        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        btnStartStop = findViewById(R.id.btn_start_stop);

        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);
        map.getController().setZoom(15.0);

        // Set default location (e.g., center of Madrid)
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038);
        map.getController().setCenter(startPoint);

        setupMapEvents();

        btnStartStop.setOnClickListener(v -> {
            if (isMocking) {
                stopMocking();
            } else {
                startMocking();
            }
        });

        requestPermissionsIfNecessary(new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.POST_NOTIFICATIONS
        });

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(mockErrorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(mockErrorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"));
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            unregisterReceiver(mockErrorReceiver);
        } catch (IllegalArgumentException e) {
            // Receiver not registered
        }
    }

    private void setupMapEvents() {
        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                updateMarker(p);
                if (isMocking) {
                    updateServiceLocation(p);
                }
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                return false;
            }
        };
        map.getOverlays().add(new MapEventsOverlay(mReceive));
    }

    private void updateMarker(GeoPoint p) {
        if (selectedLocationMarker != null) {
            map.getOverlays().remove(selectedLocationMarker);
        }
        selectedLocationMarker = new Marker(map);
        selectedLocationMarker.setPosition(p);
        selectedLocationMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        map.getOverlays().add(selectedLocationMarker);
        map.invalidate();
    }

    private void startMocking() {
        if (selectedLocationMarker == null) {
            Toast.makeText(this, "Selecciona una ubicación en el mapa primero", Toast.LENGTH_SHORT).show();
            return;
        }

        GeoPoint point = selectedLocationMarker.getPosition();
        Intent intent = new Intent(this, MockLocationService.class);
        intent.putExtra("LATITUDE", point.getLatitude());
        intent.putExtra("LONGITUDE", point.getLongitude());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }

        isMocking = true;
        btnStartStop.setText("Detener Simulación");
        Toast.makeText(this, "Iniciando simulación...", Toast.LENGTH_SHORT).show();
    }

    private void stopMocking() {
        Intent intent = new Intent(this, MockLocationService.class);
        stopService(intent);

        isMocking = false;
        btnStartStop.setText("Iniciar Simulación");
    }

    private void updateServiceLocation(GeoPoint point) {
        Intent intent = new Intent(this, MockLocationService.class);
        intent.putExtra("LATITUDE", point.getLatitude());
        intent.putExtra("LONGITUDE", point.getLongitude());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        map.onResume();
    }

    @Override
    public void onPause() {
        super.onPause();
        map.onPause();
    }

    private void requestPermissionsIfNecessary(String[] permissions) {
        ArrayList<String> permissionsToRequest = new ArrayList<>();
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission)
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
        ArrayList<String> permissionsToRequest = new ArrayList<>();
        for (int i = 0; i < grantResults.length; i++) {
            permissionsToRequest.add(permissions[i]);
        }
        if (permissionsToRequest.size() > 0) {
            ActivityCompat.requestPermissions(
                    this,
                    permissionsToRequest.toArray(new String[0]),
                    REQUEST_PERMISSIONS_REQUEST_CODE);
        }
    }
}
