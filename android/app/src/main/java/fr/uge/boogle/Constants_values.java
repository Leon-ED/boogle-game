package fr.uge.boogle;

public class Constants_values {
    private static String WEBVIEW_URL = "http://192.168.1.180:8080/";
    private static String BACKEND_URL = "http://192.168.1.180:4000/";

    public static String getWebViewUrl() {
        return WEBVIEW_URL;
    }

    public static String getBackendUrl() {
        return BACKEND_URL;
    }

    public static void setWebViewUrl(String url) {
        WEBVIEW_URL = url;
    }

    public static void setBackendUrl(String url) {
        BACKEND_URL = url;
    }
}
