package com.example.mockapp;

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
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import org.osmdroid.api.IMapController;
import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private MapView map;
    private Button btnToggleSimulation;
    private boolean isSimulating = false;

    private final BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("MOCK_LOCATION_ERROR".equals(intent.getAction())) {
                stopSimulation();
                showMockLocationDialog();
            }
        }
    };

    private final ActivityResultLauncher<String[]> requestPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), result -> {
                boolean allGranted = true;
                for (Boolean isGranted : result.values()) {
                    if (!isGranted) {
                        allGranted = false;
                        break;
                    }
                }
                if (!allGranted) {
                    Toast.makeText(this, R.string.permissions_required, Toast.LENGTH_LONG).show();
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration.getInstance().load(getApplicationContext(), PreferenceManager.getDefaultSharedPreferences(getApplicationContext()));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setBuiltInZoomControls(true);
        map.setMultiTouchControls(true);

        IMapController mapController = map.getController();
        mapController.setZoom(15.0);
        GeoPoint startPoint = new GeoPoint(40.416775, -3.703790); // Madrid by default
        mapController.setCenter(startPoint);

        btnToggleSimulation = findViewById(R.id.btn_toggle_simulation);
        btnToggleSimulation.setOnClickListener(v -> {
            if (isSimulating) {
                stopSimulation();
            } else {
                startSimulation();
            }
        });

        checkAndRequestPermissions();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter("MOCK_LOCATION_ERROR"));
        }
    }

    private void checkAndRequestPermissions() {
        List<String> permissionsNeeded = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(android.Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(android.Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(android.Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!permissionsNeeded.isEmpty()) {
            requestPermissionLauncher.launch(permissionsNeeded.toArray(new String[0]));
        }
    }

    private boolean isMockLocationApp() {
        boolean isMockApp = false;
        try {
            AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
            isMockApp = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
        } catch (Exception e) {
            // Ignore
        }
        return isMockApp;
    }

    private void showMockLocationDialog() {
        new AlertDialog.Builder(this)
                .setTitle(R.string.app_name)
                .setMessage(R.string.mock_location_permission_needed)
                .setPositiveButton(R.string.open_settings, (dialog, which) -> {
                    startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
                })
                .setNegativeButton(android.R.string.cancel, null)
                .show();
    }

    private void startSimulation() {
        if (!isMockLocationApp()) {
            showMockLocationDialog();
            return;
        }

        GeoPoint center = (GeoPoint) map.getMapCenter();
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.putExtra("lat", center.getLatitude());
        serviceIntent.putExtra("lon", center.getLongitude());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        isSimulating = true;
        btnToggleSimulation.setText(R.string.stop_simulation);
        Toast.makeText(this, R.string.simulation_started, Toast.LENGTH_SHORT).show();
    }

    private void stopSimulation() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        stopService(serviceIntent);
        isSimulating = false;
        btnToggleSimulation.setText(R.string.start_simulation);
        Toast.makeText(this, R.string.simulation_stopped, Toast.LENGTH_SHORT).show();
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

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            unregisterReceiver(errorReceiver);
        } catch (IllegalArgumentException e) {
            // Receiver not registered
        }
    }
}
