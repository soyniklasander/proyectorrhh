package com.example.mockapp;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.osmdroid.api.IMapController;
import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSIONS_REQUEST_CODE = 100;
    private MapView mapView;
    private Button btnToggleMock;
    private boolean isMocking = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.mapView);
        btnToggleMock = findViewById(R.id.btnToggleMock);

        mapView.setTileSource(TileSourceFactory.MAPNIK);
        mapView.setBuiltInZoomControls(true);
        mapView.setMultiTouchControls(true);

        IMapController mapController = mapView.getController();
        mapController.setZoom(15.0);
        // Default point (Madrid for example)
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038);
        mapController.setCenter(startPoint);

        btnToggleMock.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (isMocking) {
                    stopMocking();
                } else {
                    if (checkPermissions()) {
                        startMocking();
                    } else {
                        requestPermissions();
                    }
                }
            }
        });

        requestPermissions();
    }

    private boolean checkPermissions() {
        boolean locationPermission = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean notificationPermission = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notificationPermission = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        return locationPermission && notificationPermission;
    }

    private void requestPermissions() {
        List<String> permissions = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
            permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!permissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), PERMISSIONS_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSIONS_REQUEST_CODE) {
            if (!checkPermissions()) {
                Toast.makeText(this, R.string.permissions_needed, Toast.LENGTH_LONG).show(); //(Toast.makeText(this, R.string.permissions_needed, Toast.LENGTH_LONG));
            }
        }
    }

    private void startMocking() {
        GeoPoint mapCenter = (GeoPoint) mapView.getMapCenter();
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_START);
        serviceIntent.putExtra(MockLocationService.EXTRA_LATITUDE, mapCenter.getLatitude());
        serviceIntent.putExtra(MockLocationService.EXTRA_LONGITUDE, mapCenter.getLongitude());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        isMocking = true;
        btnToggleMock.setText(R.string.stop_mocking);
        Toast.makeText(this, R.string.mock_app_needed, Toast.LENGTH_LONG).show();
    }

    private void stopMocking() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_STOP);
        startService(serviceIntent);

        isMocking = false;
        btnToggleMock.setText(R.string.start_mocking);
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
}
