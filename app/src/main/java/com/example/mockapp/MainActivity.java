package com.example.mockapp;

import android.Manifest;
import android.app.AppOpsManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import org.osmdroid.config.Configuration;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private MapView map;
    private Button btnToggleMock;
    private boolean isMocking = false;
    private BroadcastReceiver errorReceiver;

    private final ActivityResultLauncher<String[]> requestPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestMultiplePermissions(), result -> {
                boolean allGranted = true;
                for (Boolean isGranted : result.values()) {
                    if (!isGranted) {
                        allGranted = false;
                        break;
                    }
                }
                if (allGranted) {
                    if (!isMockLocationEnabled()) {
                        showMockLocationSettingsDialog();
                    } else {
                        setupMap();
                    }
                } else {
                    Toast.makeText(this, R.string.permissions_required_msg, Toast.LENGTH_LONG).show();
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration.getInstance().load(this, androidx.preference.PreferenceManager.getDefaultSharedPreferences(this));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        btnToggleMock = findViewById(R.id.btn_toggle_mock);

        btnToggleMock.setOnClickListener(v -> toggleMockLocation());

        errorReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (MockLocationService.MOCK_LOCATION_ERROR.equals(intent.getAction())) {
                    isMocking = false;
                    btnToggleMock.setText(R.string.btn_start_mocking);
                    showMockLocationSettingsDialog();
                }
            }
        };

        checkPermissions();
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
            requestPermissionLauncher.launch(permissionsToRequest.toArray(new String[0]));
        } else {
            if (!isMockLocationEnabled()) {
                showMockLocationSettingsDialog();
            } else {
                setupMap();
            }
        }
    }

    private void setupMap() {
        map.setMultiTouchControls(true);
        map.getController().setZoom(15.0);

        // Default to somewhere (e.g., Madrid) if no location
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038);
        map.getController().setCenter(startPoint);
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
            if (opsManager != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    isMockLocation = (opsManager.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
                } else {
                    isMockLocation = (opsManager.checkOpNoThrow(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
                }
            }
        } catch (Exception e) {
            return false;
        }
        return isMockLocation;
    }

    private void showMockLocationSettingsDialog() {
        new AlertDialog.Builder(this)
                .setTitle(R.string.mock_location_not_enabled_title)
                .setMessage(R.string.mock_location_not_enabled_msg)
                .setPositiveButton(R.string.open_settings, (dialog, which) -> {
                    startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
                })
                .setNegativeButton(R.string.cancel, null)
                .show();
    }

    private void toggleMockLocation() {
        if (!isMockLocationEnabled()) {
            showMockLocationSettingsDialog();
            return;
        }

        if (isMocking) {
            Intent serviceIntent = new Intent(this, MockLocationService.class);
            serviceIntent.setAction(MockLocationService.ACTION_STOP);
            startService(serviceIntent);
            btnToggleMock.setText(R.string.btn_start_mocking);
            isMocking = false;
        } else {
            GeoPoint center = (GeoPoint) map.getMapCenter();
            Intent serviceIntent = new Intent(this, MockLocationService.class);
            serviceIntent.setAction(MockLocationService.ACTION_START);
            serviceIntent.putExtra(MockLocationService.EXTRA_LATITUDE, center.getLatitude());
            serviceIntent.putExtra(MockLocationService.EXTRA_LONGITUDE, center.getLongitude());

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
            btnToggleMock.setText(R.string.btn_stop_mocking);
            isMocking = true;
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (map != null) {
            map.onResume();
        }
        IntentFilter filter = new IntentFilter(MockLocationService.MOCK_LOCATION_ERROR);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, filter);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (map != null) {
            map.onPause();
        }
        try {
            unregisterReceiver(errorReceiver);
        } catch (IllegalArgumentException e) {
            // Not registered
        }
    }
}