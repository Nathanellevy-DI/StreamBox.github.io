package com.streambox.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Get the Capacitor WebView
        WebView webView = this.bridge.getWebView();

        // Configure WebView for streaming sites on Android TV
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setUserAgentString(
            "Mozilla/5.0 (Linux; Android 13; SmartTV) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        );

        // Enable cookies (needed for login sessions across tiles)
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        // CRITICAL: WebChromeClient is required for iframes to work properly.
        // Without it, JavaScript alerts/confirms and iframe content may not render.
        webView.setWebChromeClient(new WebChromeClient());

        // Install our custom WebViewClient that strips X-Frame-Options
        // and CSP headers from external sites (Electron's "Nuclear Option" equivalent)
        webView.setWebViewClient(new HeaderStrippingWebViewClient(this.bridge));
    }
}
