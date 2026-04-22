package com.example.mockapp;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private MapView mapView;
    private Button btnToggleMock;
    private boolean isMocking = false;

    private static final int REQUEST_PERMISSIONS_REQUEST_CODE = 1;

    private BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                Toast.makeText(MainActivity.this, "Por favor, selecciona esta aplicación como 'App de ubicación de prueba' en las Opciones de Desarrollador.", Toast.LENGTH_LONG).show();
                startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
                stopMockService();
                isMocking = false;
                updateButtonState();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration.getInstance().load(getApplicationContext(), androidx.preference.PreferenceManager.getDefaultSharedPreferences(getApplicationContext()));

        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.mapView);
        btnToggleMock = findViewById(R.id.btnToggleMock);

        mapView.setTileSource(TileSourceFactory.MAPNIK);
        mapView.setBuiltInZoomControls(true);
        mapView.setMultiTouchControls(true);

        // Ubicación por defecto (ejemplo: Madrid)
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038);
        mapView.getController().setZoom(15.0);
        mapView.getController().setCenter(startPoint);

        btnToggleMock.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!isMocking) {
                    startMockService();
                } else {
                    stopMockService();
                }
                isMocking = !isMocking;
                updateButtonState();
            }
        });

        requestPermissionsIfNecessary(new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.WRITE_EXTERNAL_STORAGE,
                Manifest.permission.POST_NOTIFICATIONS
        });

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"));
        }
    }

    private void updateButtonState() {
        if (isMocking) {
            btnToggleMock.setText(R.string.stop_mocking);
        } else {
            btnToggleMock.setText(R.string.start_mocking);
        }
    }

    private void startMockService() {
        GeoPoint mapCenter = (GeoPoint) mapView.getMapCenter();
        Intent intent = new Intent(this, MockLocationService.class);
        intent.setAction(MockLocationService.ACTION_START);
        intent.putExtra(MockLocationService.EXTRA_LAT, mapCenter.getLatitude());
        intent.putExtra(MockLocationService.EXTRA_LON, mapCenter.getLongitude());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent);
        } else {
            startService(intent);
        }
        Toast.makeText(this, "Iniciando simulación de ubicación...", Toast.LENGTH_SHORT).show();
    }

    private void stopMockService() {
        Intent intent = new Intent(this, MockLocationService.class);
        intent.setAction(MockLocationService.ACTION_STOP);
        startService(intent);
        Toast.makeText(this, "Simulación detenida.", Toast.LENGTH_SHORT).show();
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
    }

    private void requestPermissionsIfNecessary(String[] permissions) {
        ArrayList<String> permissionsToRequest = new ArrayList<>();
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission)
                    != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(permission);
            }
        }
        if (permissionsToRequest.size() > 0) {
            ActivityCompat.requestPermissions(
                    this,
                    permissionsToRequest.toArray(new String[0]),
                    REQUEST_PERMISSIONS_REQUEST_CODE);
        }
    }
}
