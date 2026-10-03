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
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.preference.PreferenceManager;

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

    private MapView mapView;
    private TextView tvLocation;
    private Button btnMock;
    private Button btnSettings;

    private Marker selectedMarker;
    private GeoPoint selectedLocation;

    private boolean isServiceRunning = false;

    private static final int PERMISSIONS_REQUEST_CODE = 100;

    private BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (MockLocationService.ACTION_MOCK_ERROR.equals(intent.getAction())) {
                stopMocking();
                Toast.makeText(MainActivity.this, R.string.mock_app_required, Toast.LENGTH_LONG).show();
                btnSettings.setVisibility(View.VISIBLE);
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Configuration.getInstance().load(getApplicationContext(), PreferenceManager.getDefaultSharedPreferences(getApplicationContext()));

        setContentView(R.layout.activity_main);

        mapView = findViewById(R.id.mapView);
        tvLocation = findViewById(R.id.tvLocation);
        btnMock = findViewById(R.id.btnMock);
        btnSettings = findViewById(R.id.btnSettings);

        mapView.setMultiTouchControls(true);
        IMapController mapController = mapView.getController();
        mapController.setZoom(15.0);
        GeoPoint startPoint = new GeoPoint(40.4168, -3.7038); // Madrid
        mapController.setCenter(startPoint);
        updateSelectedLocation(startPoint);

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                updateSelectedLocation(p);
                if (isServiceRunning) {
                    startMocking(); // Update service with new location
                }
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                return false;
            }
        };
        mapView.getOverlays().add(new MapEventsOverlay(mReceive));

        btnMock.setOnClickListener(v -> {
            if (isServiceRunning) {
                stopMocking();
            } else {
                if (checkPermissions()) {
                    if (isMockLocationEnabled()) {
                        startMocking();
                    } else {
                        Toast.makeText(this, R.string.mock_app_required, Toast.LENGTH_LONG).show();
                        btnSettings.setVisibility(View.VISIBLE);
                    }
                }
            }
        });

        btnSettings.setOnClickListener(v -> {
            startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
        });

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            IntentFilter filter = new IntentFilter(MockLocationService.ACTION_MOCK_ERROR);
            registerReceiver(errorReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            IntentFilter filter = new IntentFilter(MockLocationService.ACTION_MOCK_ERROR);
            registerReceiver(errorReceiver, filter);
        }
    }

    private void updateSelectedLocation(GeoPoint p) {
        selectedLocation = p;
        if (selectedMarker == null) {
            selectedMarker = new Marker(mapView);
            mapView.getOverlays().add(selectedMarker);
        }
        selectedMarker.setPosition(p);
        mapView.invalidate();
        tvLocation.setText(getString(R.string.location_selected, String.format("%.4f", p.getLatitude()), String.format("%.4f", p.getLongitude())));
    }

    private boolean checkPermissions() {
        List<String> permissionsNeeded = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACCESS_FINE_LOCATION);
            permissionsNeeded.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }
        if (!permissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsNeeded.toArray(new String[0]), PERMISSIONS_REQUEST_CODE);
            return false;
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSIONS_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (isMockLocationEnabled()) {
                    startMocking();
                } else {
                    Toast.makeText(this, R.string.mock_app_required, Toast.LENGTH_LONG).show();
                    btnSettings.setVisibility(View.VISIBLE);
                }
            } else {
                Toast.makeText(this, R.string.permission_required, Toast.LENGTH_SHORT).show();
            }
        }
    }

    private boolean isMockLocationEnabled() {
        boolean isMockLocation = false;
        try {
            AppOpsManager opsManager = (AppOpsManager) getSystemService(Context.APP_OPS_SERVICE);
            if (opsManager != null) {
                isMockLocation = (opsManager.checkOp(AppOpsManager.OPSTR_MOCK_LOCATION, android.os.Process.myUid(), getPackageName()) == AppOpsManager.MODE_ALLOWED);
            }
        } catch (Exception e) {
            return false;
        }
        return isMockLocation;
    }

    private void startMocking() {
        if (selectedLocation == null) return;

        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_START_MOCK);
        serviceIntent.putExtra(MockLocationService.EXTRA_LAT, selectedLocation.getLatitude());
        serviceIntent.putExtra(MockLocationService.EXTRA_LNG, selectedLocation.getLongitude());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        isServiceRunning = true;
        btnMock.setText(R.string.stop_mocking);
        btnSettings.setVisibility(View.GONE);
    }

    private void stopMocking() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_STOP_MOCK);
        startService(serviceIntent);

        isServiceRunning = false;
        btnMock.setText(R.string.start_mocking);
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
        try {
            unregisterReceiver(errorReceiver);
        } catch (IllegalArgumentException e) {
            // ignore
        }
    }
}
