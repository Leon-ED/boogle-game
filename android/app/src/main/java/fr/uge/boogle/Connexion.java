package fr.uge.boogle;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Response;
import com.android.volley.VolleyError;

import org.json.JSONException;
import org.json.JSONObject;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

public class Connexion extends AppCompatActivity {
    public SharedPreferences sharedPref;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_connexion);
        sharedPref = Connexion.this.getPreferences(Context.MODE_PRIVATE);

        TextView username_edittext = findViewById(R.id.username_edittext);
        TextView password_edittext = findViewById(R.id.password_edittext);
        Button button = findViewById(R.id.login_button);

        // if the user is already logged in, redirect him to the webview
        if (sharedPref.contains("token")) {
            //sendLoginRequest();
        }

        button.setOnClickListener(v -> {
            String username = username_edittext.getText().toString();
            String password = password_edittext.getText().toString();
            if (username.isEmpty() || password.isEmpty()) {
                username_edittext.setError("Please fill the username");
                password_edittext.setError("Please fill the password");
            } else {
                // send a request to the server

                sendLoginRequest(username, password, Constants_values.BACKEND_URL+"api/auth/login");




            }

        });

    }

    private void sendLoginRequest(String username, String password, String url) {
        RequestQueue queue = Volley.newRequestQueue(this);

        JSONObject requestData = new JSONObject();
        try {
            requestData.put("login", username);
            requestData.put("password", password);
        } catch (JSONException e) {
            e.printStackTrace();
            Toast.makeText(Connexion.this, "Login failed", Toast.LENGTH_SHORT).show();
            return;
        }

        JsonObjectRequest request = new JsonObjectRequest(Request.Method.POST, url, requestData,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            Log.e("response", response.toString());
                            if (response.getString("status").equals("success")) {
                                // login success
                                Toast.makeText(Connexion.this, "Login success", Toast.LENGTH_SHORT).show();
                                // save the token
                                String token = response.getString("token");
                                //save the token in shared preferences
                                sharedPref.edit().putString("token", token).apply();
                                //go to the webview activity
                                //startActivity(WebViewApp.newIntent(Connexion.this));
                                finish();
                            } else {
                                // login failed
                                Toast.makeText(Connexion.this, "Login failed", Toast.LENGTH_SHORT).show();
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                            Toast.makeText(Connexion.this, "Login failed", Toast.LENGTH_SHORT).show();
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        error.getCause();
                        Toast.makeText(Connexion.this, "Login failed", Toast.LENGTH_SHORT).show();
                    }
                });

        queue.add(request);
    }

}