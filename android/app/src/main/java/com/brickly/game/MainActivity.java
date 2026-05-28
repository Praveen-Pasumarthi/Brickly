package com.brickly.game;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Must be set BEFORE super.onCreate so Capacitor's WebView respects it
        Window window = getWindow();

        // Allow content to draw behind system bars (edge-to-edge)
        WindowCompat.setDecorFitsSystemWindows(window, false);

        // Transparent bars — content will draw underneath them
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        // Extend layout into display cutout areas (notch/punch-hole cameras)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attrs = window.getAttributes();
            attrs.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(attrs);
        }

        super.onCreate(savedInstanceState);

        // Hide system bars fully after Capacitor initialises
        configureSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            configureSystemBars();
        }
    }

    private void configureSystemBars() {
        Window window = getWindow();

        // Keep edge-to-edge active
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        View decorView = window.getDecorView();
        // Dark background for any momentary flash before WebView loads
        decorView.setBackgroundColor(Color.rgb(5, 5, 8));

        WindowInsetsControllerCompat controller =
            new WindowInsetsControllerCompat(window, decorView);

        // Hide status bar + navigation bar (immersive/swipe-to-reveal)
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );

        // White icons on dark backgrounds
        controller.setAppearanceLightStatusBars(false);
        controller.setAppearanceLightNavigationBars(false);
    }
}
