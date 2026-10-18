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
import android.widget.Button;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;

public class MainActivity extends AppCompatActivity {

    private MapView map;
    private Button btnStart;
    private Button btnStop;
    private boolean isMocking = false;

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("com.example.mockapp.MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                stopMocking();
                Toast.makeText(MainActivity.this, R.string.mock_location_not_enabled, Toast.LENGTH_LONG).show();
            }
        }
    };

    private final ActivityResultLauncher<String[]> requestPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), result -> {
                Boolean fineLocationGranted = result.getOrDefault(Manifest.permission.ACCESS_FINE_LOCATION, false);
                Boolean coarseLocationGranted = result.getOrDefault(Manifest.permission.ACCESS_COARSE_LOCATION, false);

                if (fineLocationGranted != null && fineLocationGranted && coarseLocationGranted != null && coarseLocationGranted) {
                    setupMap();
                } else {
                    Toast.makeText(this, R.string.location_permission_required, Toast.LENGTH_SHORT).show();
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration.getInstance().load(getApplicationContext(), androidx.preference.PreferenceManager.getDefaultSharedPreferences(getApplicationContext()));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        btnStart = findViewById(R.id.btnStart);
        btnStop = findViewById(R.id.btnStop);

        checkPermissionsAndSetupMap();

        btnStart.setOnClickListener(v -> {
            if (isMockLocationEnabled()) {
                startMocking();
            } else {
                Toast.makeText(this, R.string.mock_location_not_enabled, Toast.LENGTH_LONG).show();
                startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
            }
        });

        btnStop.setOnClickListener(v -> stopMocking());

        IntentFilter filter = new IntentFilter("com.example.mockapp.MOCK_LOCATION_ERROR");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, filter);
        }
    }

    private void checkPermissionsAndSetupMap() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            setupMap();
        } else {
            requestPermissionLauncher.launch(new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                    Manifest.permission.POST_NOTIFICATIONS
            });
        }
    }

    private void setupMap() {
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);
        // Default center
        map.getController().setZoom(15.0);
        map.getController().setCenter(new GeoPoint(-12.0464, -77.0428)); // Lima, Peru
    }

    private boolean isMockLocationEnabled() {
        AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
        if (opsManager != null) {
            try {
                return opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED;
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }

    private void startMocking() {
        GeoPoint center = (GeoPoint) map.getMapCenter();
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.putExtra("lat", center.getLatitude());
        serviceIntent.putExtra("lon", center.getLongitude());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        isMocking = true;
        btnStart.setEnabled(false);
        btnStop.setEnabled(true);
    }

    private void stopMocking() {
        stopService(new Intent(this, MockLocationService.class));
        isMocking = false;
        btnStart.setEnabled(true);
        btnStop.setEnabled(false);
    }

    @Override
    public void onResume() {
        super.onResume();
        if (map != null) map.onResume();
    }

    @Override
    public void onPause() {
        super.onPause();
        if (map != null) map.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(errorReceiver);
    }
}
