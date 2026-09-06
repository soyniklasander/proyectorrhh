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
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import org.osmdroid.config.Configuration;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSIONS_REQUEST_CODE = 100;
    private MapView map;
    private Button btnStart, btnStop;
    private TextView statusText;
    private boolean isRunning = false;

    private BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (MockLocationService.ACTION_ERROR.equals(intent.getAction())) {
                stopSimulation();
                Toast.makeText(MainActivity.this, R.string.error_mock_app, Toast.LENGTH_LONG).show();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Setup osmdroid config
        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, androidx.preference.PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        btnStart = findViewById(R.id.btnStart);
        btnStop = findViewById(R.id.btnStop);
        statusText = findViewById(R.id.statusText);

        map.setMultiTouchControls(true);
        map.getController().setZoom(15.0);

        // Set an initial center (e.g., Madrid)
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038);
        map.getController().setCenter(startPoint);

        btnStart.setOnClickListener(v -> checkAndStartSimulation());
        btnStop.setOnClickListener(v -> stopSimulation());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(errorReceiver, new IntentFilter(MockLocationService.ACTION_ERROR), Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(errorReceiver, new IntentFilter(MockLocationService.ACTION_ERROR));
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
        try {
            unregisterReceiver(errorReceiver);
        } catch (Exception e) {
            // Ignore
        }
    }

    private void checkAndStartSimulation() {
        if (!hasPermissions()) {
            requestPermissions();
            return;
        }

        if (!isMockLocationEnabled()) {
            Toast.makeText(this, R.string.error_mock_app, Toast.LENGTH_LONG).show();
            startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
            return;
        }

        startSimulation();
    }

    private void startSimulation() {
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

        isRunning = true;
        updateUI();
    }

    private void stopSimulation() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_STOP);
        startService(serviceIntent);

        isRunning = false;
        updateUI();
    }

    private void updateUI() {
        if (isRunning) {
            statusText.setText(R.string.status_running);
            btnStart.setEnabled(false);
            btnStop.setEnabled(true);
        } else {
            statusText.setText(R.string.status_not_running);
            btnStart.setEnabled(true);
            btnStop.setEnabled(false);
        }
    }

    private boolean isMockLocationEnabled() {
        AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
        boolean isMockLocation = false;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                isMockLocation = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
            }
        } catch (Exception e) {
            return false;
        }
        return isMockLocation;
    }

    private boolean hasPermissions() {
        List<String> requiredPermissions = new ArrayList<>();
        requiredPermissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        requiredPermissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requiredPermissions.add(Manifest.permission.POST_NOTIFICATIONS);
        }

        for (String p : requiredPermissions) {
            if (ContextCompat.checkSelfPermission(this, p) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    private void requestPermissions() {
        List<String> requiredPermissions = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requiredPermissions.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requiredPermissions.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requiredPermissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!requiredPermissions.isEmpty()) {
            ActivityCompat.requestPermissions(this, requiredPermissions.toArray(new String[0]), PERMISSIONS_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSIONS_REQUEST_CODE) {
            if (hasPermissions()) {
                if (isMockLocationEnabled()) {
                    startSimulation();
                } else {
                    Toast.makeText(this, R.string.error_mock_app, Toast.LENGTH_LONG).show();
                    startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
                }
            } else {
                Toast.makeText(this, R.string.error_permissions, Toast.LENGTH_SHORT).show();
            }
        }
    }
}
