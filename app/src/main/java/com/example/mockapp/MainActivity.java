package com.example.mockapp;

import android.Manifest;
import android.app.AlertDialog;
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
import org.osmdroid.events.MapEventsReceiver;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.MapEventsOverlay;
import org.osmdroid.views.overlay.Marker;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 100;
    private MapView map;
    private TextView locationText;
    private Button btnToggleMock;
    private Marker selectedMarker;

    private double selectedLat = 0.0;
    private double selectedLng = 0.0;
    private boolean isMocking = false;

    private BroadcastReceiver errorReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (MockLocationService.MOCK_LOCATION_ERROR.equals(intent.getAction())) {
                stopMockingService();
                showMockPermissionDialog();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Setup osmdroid configuration
        Context ctx = getApplicationContext();
        Configuration.getInstance().load(ctx, androidx.preference.PreferenceManager.getDefaultSharedPreferences(ctx));

        setContentView(R.layout.activity_main);

        map = findViewById(R.id.map);
        locationText = findViewById(R.id.location_text);
        btnToggleMock = findViewById(R.id.btn_toggle_mock);

        setupMap();

        btnToggleMock.setOnClickListener(v -> {
            if (isMocking) {
                stopMockingService();
            } else {
                if (selectedMarker != null) {
                    startMockingService();
                } else {
                    Toast.makeText(this, "Por favor selecciona una ubicación en el mapa primero", Toast.LENGTH_SHORT).show();
                }
            }
        });

        checkPermissions();
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
        unregisterReceiver(errorReceiver);
    }

    private void setupMap() {
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);
        map.getController().setZoom(4.0);
        map.getController().setCenter(new GeoPoint(0.0, 0.0));

        MapEventsReceiver mReceive = new MapEventsReceiver() {
            @Override
            public boolean singleTapConfirmedHelper(GeoPoint p) {
                updateSelectedLocation(p);
                return true;
            }

            @Override
            public boolean longPressHelper(GeoPoint p) {
                updateSelectedLocation(p);
                return true;
            }
        };
        map.getOverlays().add(new MapEventsOverlay(mReceive));
    }

    private void updateSelectedLocation(GeoPoint p) {
        selectedLat = p.getLatitude();
        selectedLng = p.getLongitude();

        if (selectedMarker == null) {
            selectedMarker = new Marker(map);
            map.getOverlays().add(selectedMarker);
        }
        selectedMarker.setPosition(p);
        map.invalidate();

        locationText.setText(String.format(Locale.getDefault(), getString(R.string.location_selected),
                String.format(Locale.getDefault(), "%.5f", selectedLat),
                String.format(Locale.getDefault(), "%.5f", selectedLng)));

        if (isMocking) {
            // Update immediately if already running
            startMockingService();
        }
    }

    private void startMockingService() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_START);
        serviceIntent.putExtra(MockLocationService.EXTRA_LAT, selectedLat);
        serviceIntent.putExtra(MockLocationService.EXTRA_LNG, selectedLng);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        isMocking = true;
        btnToggleMock.setText(R.string.stop_mocking);
    }

    private void stopMockingService() {
        Intent serviceIntent = new Intent(this, MockLocationService.class);
        serviceIntent.setAction(MockLocationService.ACTION_STOP);
        startService(serviceIntent);

        isMocking = false;
        btnToggleMock.setText(R.string.start_mocking);
    }

    private void showMockPermissionDialog() {
        new AlertDialog.Builder(this)
            .setTitle(R.string.mock_location_error_title)
            .setMessage(R.string.mock_location_error_message)
            .setPositiveButton(R.string.open_settings, (dialog, which) -> {
                startActivity(new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS));
            })
            .setNegativeButton(R.string.cancel, null)
            .show();
    }

    private void checkPermissions() {
        List<String> permissionsNeeded = new ArrayList<>();

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACCESS_FINE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!permissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsNeeded.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            if (!allGranted) {
                Toast.makeText(this, R.string.permissions_required, Toast.LENGTH_LONG).show();
            }
        }
    }
}
