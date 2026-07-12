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
import android.view.MotionEvent;
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
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.MapEventsOverlay;
import org.osmdroid.views.overlay.Marker;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1;
    private MapView map;
    private TextView tvCoordinates;
    private Button btnStart, btnStop;
    private Marker selectedMarker;
    private GeoPoint selectedLocation;
    private boolean isSimulating = false;

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                Toast.makeText(context, "Error: Configura la app como 'Aplicación de ubicación simulada' en las opciones de desarrollador.", Toast.LENGTH_LONG).show();
                stopSimulation();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Inicializar osmdroid configuration
        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, androidx.preference.PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        tvCoordinates = findViewById(R.id.tv_coordinates);
        btnStart = findViewById(R.id.btn_start);
        btnStop = findViewById(R.id.btn_stop);

        setupMap();
        checkPermissions();

        btnStart.setOnClickListener(v -> {
            if (selectedLocation != null) {
                if (isMockLocationEnabled()) {
                    startSimulation();
                } else {
                    Toast.makeText(this, "Por favor, selecciona esta app en 'Elegir aplicación para simular ubicación' en las Opciones de Desarrollador.", Toast.LENGTH_LONG).show();
                    startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
                }
            } else {
                Toast.makeText(this, "Selecciona una ubicación en el mapa primero.", Toast.LENGTH_SHORT).show();
            }
        });

        btnStop.setOnClickListener(v -> stopSimulation());
    }

    @Override
    protected void onResume() {
        super.onResume();
        map.onResume();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"));
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        map.onPause();
        unregisterReceiver(errorReceiver);
    }

    private void setupMap() {
        map.setMultiTouchControls(true);
        IMapController mapController = map.getController();
        mapController.setZoom(15.0);
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038); // Madrid
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
        map.getOverlays().add(new MapEventsOverlay(mReceive));
    }

    private void updateSelectedLocation(GeoPoint p) {
        if (isSimulating) {
            Toast.makeText(this, "Detén la simulación actual para seleccionar otra ubicación.", Toast.LENGTH_SHORT).show();
            return;
        }
        selectedLocation = p;
        if (selectedMarker != null) {
            map.getOverlays().remove(selectedMarker);
        }
        selectedMarker = new Marker(map);
        selectedMarker.setPosition(p);
        selectedMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        map.getOverlays().add(selectedMarker);
        map.invalidate();

        tvCoordinates.setText(String.format("Lat: %.5f, Lon: %.5f", p.getLatitude(), p.getLongitude()));
    }

    private void checkPermissions() {
        List<String> permissionsToRequest = new ArrayList<>();

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.ACCESS_FINE_LOCATION);
            permissionsToRequest.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!permissionsToRequest.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsToRequest.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            // Verificar si los permisos fueron concedidos, mostrar mensaje si no.
        }
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
                isMockLocation = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
            } else {
                isMockLocation = !android.provider.Settings.Secure.getString(getContentResolver(), "mock_location").equals("0");
            }
        } catch (Exception e) {
            return false;
        }
        return isMockLocation;
    }

    private void startSimulation() {
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

            isSimulating = true;
            btnStart.setEnabled(false);
            btnStop.setEnabled(true);
            Toast.makeText(this, "Simulación iniciada", Toast.LENGTH_SHORT).show();
        }
    }

    private void stopSimulation() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_STOP);
        startService(serviceIntent);

        isSimulating = false;
        btnStart.setEnabled(true);
        btnStop.setEnabled(false);
        Toast.makeText(this, "Simulación detenida", Toast.LENGTH_SHORT).show();
    }
}