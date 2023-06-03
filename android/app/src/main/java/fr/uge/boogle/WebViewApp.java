package fr.uge.boogle;

import androidx.appcompat.app.AppCompatActivity;
import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.WindowManager;


public class WebViewApp extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web_view_app);

        // Set up the WebView
        WebView myWebView = findViewById(R.id.webView);
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        myWebView.setWebViewClient(new WebViewClient() {
            public boolean shouldOverrideUrlLoading(WebView view, String url){
                // do your handling codes here, which url is the requested url
                // probably you need to open that url rather than redirect:
                view.loadUrl(url);
                return false; // then it is not handled by default action
            }
        });

        // Check and request permissions if needed
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.INTERNET) != PackageManager.PERMISSION_GRANTED ||
                    (checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED &&
                            checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED)) {

                // Permissions are not granted, request them
                requestPermissions(new String[]{
                        Manifest.permission.INTERNET,
                        Manifest.permission.READ_EXTERNAL_STORAGE,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE
                }, PERMISSION_REQUEST_CODE);
            } else {
                // Permissions are already granted, load the website
                loadWebsite(myWebView);
            }
        } else {
            // For devices running on lower versions than Marshmallow, load the website
            loadWebsite(myWebView);
        }

        myWebView.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                // Retourne true pour indiquer que l'événement est géré et qu'aucune action supplémentaire ne doit être effectuée
                return true;
            }
        });

        // Add the following code to handle keyboard visibility
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
    }

    private void loadWebsite(WebView webView) {
        WebSettings webSettings = webView.getSettings ();
        webSettings.setJavaScriptEnabled (true);
        webSettings.setUseWideViewPort (true);
        webSettings.setLoadWithOverviewMode (true);
        webSettings.setCacheMode (WebSettings.LOAD_NO_CACHE);
        webSettings.setDomStorageEnabled(true);
        // Load the website
        webView.loadUrl(Constants_values.WEBVIEW_URL);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch (requestCode) {
            case PERMISSION_REQUEST_CODE:
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED &&
                        grantResults[1] == PackageManager.PERMISSION_GRANTED &&
                        grantResults[2] == PackageManager.PERMISSION_GRANTED) {

                    // Permissions are granted, load the website
                    WebView myWebView = findViewById(R.id.webView);

                    loadWebsite(myWebView);
                } else {
                    // Permissions are denied, handle the situation or show an error message
                    Log.e("Permissions", "Some or all permissions are denied");
                }
                break;
        }
    }
}
