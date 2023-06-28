package fr.uge.boogle;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

public class WebViewApp extends Fragment {

    private static final int PERMISSION_REQUEST_CODE = 1;
    private static final int FILE_CHOOSER_REQUEST_CODE = 2;

    private WebView myWebView;
    private SharedPreferences sharedPref;

    private ValueCallback<Uri[]> filePathCallback;
    private Uri fileUri;

    public static Intent newIntent(Context context) {
        return new Intent(context, WebViewApp.class);
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.activity_web_view_app, container, false);

        myWebView = view.findViewById(R.id.webView);
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);

        myWebView.setWebViewClient(new WebViewClient() {
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return false;
            }
        });

        sharedPref = requireActivity().getPreferences(Context.MODE_PRIVATE);

        // Check and request permissions if needed
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.INTERNET) != PackageManager.PERMISSION_GRANTED ||
                    (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED &&
                            ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED)) {

                // Permissions are not granted, request them
                requestPermissions(new String[]{
                        Manifest.permission.INTERNET,
                        Manifest.permission.READ_EXTERNAL_STORAGE,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE
                }, PERMISSION_REQUEST_CODE);
            } else {
                // Permissions are already granted, load the website
                loadWebsite();
            }
        } else {
            // For devices running on lower versions than Marshmallow, load the website
            loadWebsite();
        }

        myWebView.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                return true;
            }
        });

        // Add the following code to handle keyboard visibility
        requireActivity().getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        return view;
    }

    private void loadWebsite() {
        // Load the website
        myWebView.loadUrl(Constants_values.getWebViewUrl());

        String token = sharedPref.getString("token", "");
        // String user = sharedPref.getString("user", "");

        String mimeType = "text/html";
        String encoding = "utf-8";
        String injectStorage = "localStorage.setItem('token','" + token + "');";
        String injection = "<script type='text/javascript'>"+ injectStorage +"window.location.replace('"+ Constants_values.getWebViewUrl() +"');</script>";
        myWebView.loadDataWithBaseURL(Constants_values.getWebViewUrl(), injection, mimeType, encoding, null);

        // Set up WebView for file upload
        myWebView.setWebChromeClient(new WebChromeClient() {
            @SuppressLint("ObsoleteSdkInt")
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                // Check and request permission for file upload if needed
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED &&
                            ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                        requestPermissions(new String[]{
                                Manifest.permission.READ_EXTERNAL_STORAGE,
                                Manifest.permission.WRITE_EXTERNAL_STORAGE
                        }, PERMISSION_REQUEST_CODE);
                        return false;
                    }
                }

                // Set the file upload callback
                WebViewApp.this.filePathCallback = filePathCallback;

                // Create and start a file chooser intent
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                startActivityForResult(Intent.createChooser(intent, "Select File"), FILE_CHOOSER_REQUEST_CODE);
                return true;
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED &&
                    grantResults[1] == PackageManager.PERMISSION_GRANTED) {

                // Permissions are granted, load the website
                loadWebsite();
            } else {
                // Permissions are denied, handle the situation or show an error message
                // Log.e("Permissions", "Some or all permissions are denied");
                //close the app and tell the user why you need this permission
                Toast.makeText(requireContext(), "Please allow permission to access the internet", Toast.LENGTH_LONG).show();
                requireActivity().finish();
            }
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST_CODE && filePathCallback != null) {
            Uri[] results = null;

            // Check if the response is a positive result
            if (resultCode == AppCompatActivity.RESULT_OK) {
                if (data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                } else {
                    // For Android 5.0+ devices, extract the Uri from the returned intent
                    if (fileUri != null) {
                        results = new Uri[]{fileUri};
                    }
                }
            }

            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }
}
