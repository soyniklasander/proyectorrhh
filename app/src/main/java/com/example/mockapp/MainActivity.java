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
import android.os.Process;
import android.provider.Settings;
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
import org.osmdroid.views.overlay.Marker;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private MapView map;
    private BroadcastReceiver errorReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration.getInstance().load(getApplicationContext(), getPreferences(MODE_PRIVATE));
        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);
        map.getController().setZoom(15.0);
        map.getController().setCenter(new GeoPoint(40.416775, -3.703790)); // Madrid default

        Button btnStart = findViewById(R.id.btn_start);
        Button btnStop = findViewById(R.id.btn_stop);

        btnStart.setOnClickListener(v -> {
            if (checkPermissions() && isMockLocationEnabled()) {
                GeoPoint center = (GeoPoint) map.getMapCenter();
                Intent intent = new Intent(this, MockLocationService.class);
                intent.putExtra("lat", center.getLatitude());
                intent.putExtra("lon", center.getLongitude());
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(intent);
                } else {
                    startService(intent);
                }
                Toast.makeText(this, "Simulando: " + center.getLatitude() + ", " + center.getLongitude(), Toast.LENGTH_SHORT).show();
            } else if (!isMockLocationEnabled()) {
                Toast.makeText(this, getString(R.string.mock_location_not_enabled), Toast.LENGTH_LONG).show();
                startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
            } else {
                requestPermissions();
            }
        });

        btnStop.setOnClickListener(v -> {
            stopService(new Intent(this, MockLocationService.class));
            Toast.makeText(this, getString(R.string.stop_mock), Toast.LENGTH_SHORT).show();
        });

        errorReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                    Toast.makeText(MainActivity.this, getString(R.string.mock_location_not_enabled), Toast.LENGTH_LONG).show();
                }
            }
        };

        IntentFilter filter = new IntentFilter("MOCK_LOCATION_ERROR");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, filter);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (map != null) {
            map.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (map != null) {
            map.onPause();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (errorReceiver != null) {
            unregisterReceiver(errorReceiver);
        }
    }

    private boolean checkPermissions() {
        boolean fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean notification = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notification = ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        return fine && coarse && notification;
    }

    private void requestPermissions() {
        List<String> permissions = new ArrayList<>();
        permissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        permissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS);
        }
        ActivityCompat.requestPermissions(this, permissions.toArray(new String[0]), PERMISSION_REQUEST_CODE);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (!checkPermissions()) {
                Toast.makeText(this, getString(R.string.permissions_required), Toast.LENGTH_SHORT).show();
            }
        }
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
                isMockLocation = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
            } else {
                isMockLocation = !Settings.Secure.getString(getContentResolver(), "mock_location").equals("0");
            }
        } catch (Exception e) {
            return false;
        }
        return isMockLocation;
    }
}
