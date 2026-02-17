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

    // Headers to strip from responses:
    // - x-frame-options, content-security-policy, frame-options: block iframe embedding
    // - content-encoding: HttpURLConnection auto-decompresses gzip, so this must be
    //   removed to prevent WebView from double-decompressing
    // - content-length: wrong after auto-decompression
    // - transfer-encoding: chunked encoding is handled by HttpURLConnection
    private static final Set<String> STRIPPED_HEADERS = new HashSet<>(Arrays.asList(
        "x-frame-options",
        "content-security-policy",
        "frame-options",
        "content-encoding",
        "content-length",
        "transfer-encoding"
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

        // Skip Capacitor's own local content — never intercept these
        if (url.contains("localhost") || url.contains("127.0.0.1") || url.startsWith("capacitor://")) {
            return super.shouldInterceptRequest(view, request);
        }

        // Only intercept HTML document requests (these are the ones affected by
        // X-Frame-Options). Sub-resources like images, CSS, JS go through normally.
        Map<String, String> reqHeaders = request.getRequestHeaders();
        String accept = reqHeaders != null ? reqHeaders.get("Accept") : null;
        boolean isDocumentRequest = (accept != null && accept.contains("text/html"));

        if (!isDocumentRequest) {
            return super.shouldInterceptRequest(view, request);
        }

        try {
            URL targetUrl = new URL(url);
            HttpURLConnection conn = (HttpURLConnection) targetUrl.openConnection();
            conn.setRequestMethod(request.getMethod());
            conn.setInstanceFollowRedirects(true);
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(30000);

            // Don't request compressed content — avoids the double-decompression issue
            // entirely. HttpURLConnection auto-adds Accept-Encoding: gzip, which we
            // need to override.
            conn.setRequestProperty("Accept-Encoding", "identity");

            // Forward request headers from the WebView
            if (reqHeaders != null) {
                for (Map.Entry<String, String> header : reqHeaders.entrySet()) {
                    String key = header.getKey();
                    // Don't overwrite our Accept-Encoding override
                    if (!"Accept-Encoding".equalsIgnoreCase(key)) {
                        conn.setRequestProperty(key, header.getValue());
                    }
                }
            }

            // Sync cookies from WebView → HttpURLConnection
            CookieManager cookieManager = CookieManager.getInstance();
            String cookies = cookieManager.getCookie(url);
            if (cookies != null) {
                conn.setRequestProperty("Cookie", cookies);
            }

            conn.connect();
            int responseCode = conn.getResponseCode();

            // Sync cookies from response → WebView
            Map<String, List<String>> headerFields = conn.getHeaderFields();
            if (headerFields != null) {
                List<String> setCookies = headerFields.get("Set-Cookie");
                if (setCookies != null) {
                    for (String cookie : setCookies) {
                        cookieManager.setCookie(url, cookie);
                    }
                }
            }

            // Build clean response headers, stripping blocking & encoding headers
            Map<String, String> cleanHeaders = new HashMap<>();
            if (headerFields != null) {
                for (Map.Entry<String, List<String>> entry : headerFields.entrySet()) {
                    String key = entry.getKey();
                    if (key == null) continue;
                    if (STRIPPED_HEADERS.contains(key.toLowerCase())) continue;
                    List<String> values = entry.getValue();
                    if (values != null && !values.isEmpty()) {
                        cleanHeaders.put(key, values.get(0));
                    }
                }
            }

            // Parse content type and charset
            String contentType = conn.getContentType();
            String mimeType = "text/html";
            String charset = "UTF-8";
            if (contentType != null) {
                String[] parts = contentType.split(";");
                mimeType = parts[0].trim();
                for (int i = 1; i < parts.length; i++) {
                    String part = parts[i].trim().toLowerCase();
                    if (part.startsWith("charset=")) {
                        charset = parts[i].trim().substring(8).replace("\"", "").trim();
                    }
                }
            }

            String responseMessage = conn.getResponseMessage();
            InputStream stream;

            if (responseCode >= 400) {
                stream = conn.getErrorStream();
            } else {
                stream = conn.getInputStream();
            }

            // If we couldn't get a stream, fall back to default
            if (stream == null) {
                return super.shouldInterceptRequest(view, request);
            }

            return new WebResourceResponse(
                mimeType,
                charset,
                responseCode,
                (responseMessage != null && !responseMessage.isEmpty()) ? responseMessage : "OK",
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
