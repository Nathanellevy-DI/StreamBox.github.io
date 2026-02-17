package com.streambox.app;

import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Custom WebViewClient that strips X-Frame-Options and CSP headers from
 * external website responses, allowing them to load inside iframes in the
 * Capacitor WebView. This is the Android equivalent of Electron's
 * session.webRequest.onHeadersReceived "Nuclear Option".
 */
public class HeaderStrippingWebViewClient extends BridgeWebViewClient {

    private static final Set<String> BLOCKED_HEADERS = new HashSet<>(Arrays.asList(
        "x-frame-options",
        "content-security-policy",
        "frame-options"
    ));

    public HeaderStrippingWebViewClient(Bridge bridge) {
        super(bridge);
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();

        // Only process external HTTP(S) requests
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return super.shouldInterceptRequest(view, request);
        }

        // Skip Capacitor's own local content
        if (url.contains("localhost") || url.startsWith("capacitor://")) {
            return super.shouldInterceptRequest(view, request);
        }

        // Only intercept HTML document requests (affected by X-Frame-Options)
        // Sub-resources (images, CSS, JS) don't need header stripping
        String accept = request.getRequestHeaders().get("Accept");
        if (accept == null || !accept.contains("text/html")) {
            return super.shouldInterceptRequest(view, request);
        }

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod(request.getMethod());
            conn.setInstanceFollowRedirects(true);
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(15000);

            // Forward all request headers from the WebView
            for (Map.Entry<String, String> header : request.getRequestHeaders().entrySet()) {
                conn.setRequestProperty(header.getKey(), header.getValue());
            }

            // Sync cookies from WebView → HttpURLConnection
            CookieManager cookieManager = CookieManager.getInstance();
            String cookies = cookieManager.getCookie(url);
            if (cookies != null) {
                conn.setRequestProperty("Cookie", cookies);
            }

            conn.connect();

            // Sync cookies from response → WebView
            Map<String, List<String>> headerFields = conn.getHeaderFields();
            List<String> setCookies = headerFields.get("Set-Cookie");
            if (setCookies != null) {
                for (String cookie : setCookies) {
                    cookieManager.setCookie(url, cookie);
                }
            }

            // Build clean response headers (strip blocking ones)
            Map<String, String> cleanHeaders = new HashMap<>();
            for (Map.Entry<String, List<String>> entry : headerFields.entrySet()) {
                String key = entry.getKey();
                if (key == null) continue;
                if (BLOCKED_HEADERS.contains(key.toLowerCase())) continue;
                cleanHeaders.put(key, entry.getValue().get(0));
            }

            // Parse content type
            String contentType = conn.getContentType();
            String mimeType = "text/html";
            String charset = "UTF-8";
            if (contentType != null) {
                String[] parts = contentType.split(";");
                mimeType = parts[0].trim();
                for (String part : parts) {
                    String trimmed = part.trim().toLowerCase();
                    if (trimmed.startsWith("charset=")) {
                        charset = part.trim().substring(8);
                    }
                }
            }

            int responseCode = conn.getResponseCode();
            String responseMessage = conn.getResponseMessage();

            InputStream stream = (responseCode >= 400)
                ? conn.getErrorStream()
                : conn.getInputStream();

            if (stream == null) {
                return super.shouldInterceptRequest(view, request);
            }

            return new WebResourceResponse(
                mimeType,
                charset,
                responseCode,
                responseMessage != null ? responseMessage : "OK",
                cleanHeaders,
                stream
            );

        } catch (Exception e) {
            // If anything goes wrong, fall back to default WebView handling
            e.printStackTrace();
            return super.shouldInterceptRequest(view, request);
        }
    }
}
