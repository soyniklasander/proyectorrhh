package com.example.mockapp;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import org.osmdroid.config.Configuration;
import org.osmdroid.events.MapEventsReceiver;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.MapEventsOverlay;
import org.osmdroid.views.overlay.Marker;

public class MainActivity extends AppCompatActivity {

    private EditText latEditText, lngEditText;
    private Button startMockButton, stopMockButton;
    private LocationManager locationManager;
    private static final int PERMISSION_REQUEST_CODE = 1001;

    private MapView map;
    private Marker mapMarker;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Required by osmdroid
        Configuration.getInstance().load(getApplicationContext(), PreferenceManager.getDefaultSharedPreferences(getApplicationContext()));

        setContentView(R.layout.activity_main);

        latEditText = findViewById(R.id.latEditText);
        lngEditText = findViewById(R.id.lngEditText);
        startMockButton = findViewById(R.id.startMockButton);
        stopMockButton = findViewById(R.id.stopMockButton);
        map = findViewById(R.id.mapView);

        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);

        // Setup Map
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);
        map.getController().setZoom(15.0);
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038); // Madrid, Spain as default
        map.getController().setCenter(startPoint);

        mapMarker = new Marker(map);
        mapMarker.setPosition(startPoint);
        mapMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        map.getOverlays().add(mapMarker);

        updateEditTexts(startPoint);

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                mapMarker.setPosition(p);
                map.invalidate();
                updateEditTexts(p);
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                return false;
            }
        };
        MapEventsOverlay overlayEvents = new MapEventsOverlay(mReceive);
        map.getOverlays().add(overlayEvents);

        startMockButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (checkPermissions()) {
                    startMocking();
                } else {
                    requestPermissions();
                }
            }
        });

        stopMockButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                stopMocking();
            }
        });

        // Request permissions right away
        if (!checkPermissions()) {
            requestPermissions();
        }
    }

    private void updateEditTexts(GeoPoint p) {
        latEditText.setText(String.valueOf(p.getLatitude()));
        lngEditText.setText(String.valueOf(p.getLongitude()));
    }

    @Override
    public void onResume() {
        super.onResume();
        map.onResume(); //needed for compass, my location overlays, v6.0.0 and up
    }

    @Override
    public void onPause() {
        super.onPause();
        map.onPause();  //needed for compass, my location overlays, v6.0.0 and up
    }


    private boolean checkPermissions() {
        boolean fineLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean postNotifications = true;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            postNotifications = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }

        return fineLocation && postNotifications;
    }

    private void requestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                    Manifest.permission.POST_NOTIFICATIONS
            }, PERMISSION_REQUEST_CODE);
        } else {
            ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
            }, PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permissions granted
            } else {
                Toast.makeText(this, "Se requieren permisos para que la simulación funcione", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void startMocking() {
        String latStr = latEditText.getText().toString();
        String lngStr = lngEditText.getText().toString();

        if (latStr.isEmpty() || lngStr.isEmpty()) {
            Toast.makeText(this, "Por favor ingrese latitud y longitud", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            double lat = Double.parseDouble(latStr);
            double lng = Double.parseDouble(lngStr);

            // Start the foreground service
            Intent serviceIntent = new Intent(this, MockLocationService.class);
            serviceIntent.putExtra("lat", lat);
            serviceIntent.putExtra("lng", lng);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }

            Toast.makeText(this, "Servicio de ubicación simulada iniciado", Toast.LENGTH_SHORT).show();

        } catch (NumberFormatException e) {
            Toast.makeText(this, "Coordenadas inválidas", Toast.LENGTH_SHORT).show();
        } catch (SecurityException e) {
            Toast.makeText(this, "Por favor habilite esta aplicación en Opciones de desarrollador -> Seleccionar aplicación de ubicación de prueba", Toast.LENGTH_LONG).show();
        }
    }

    private void stopMocking() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        stopService(serviceIntent);
        Toast.makeText(this, "Servicio de ubicación simulada detenido", Toast.LENGTH_SHORT).show();
    }
}
