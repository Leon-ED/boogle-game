package fr.uge.boogle;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
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
import com.android.volley.toolbox.JsonObjectRequest;
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

        // if the user is already logged in, redirect him to the home page
        if (sharedPref.contains("token")) {
            // check if the token is still valid
            checkIfTokenIsValid(sharedPref.getString("token", ""));
        }

        button.setOnClickListener(v -> {
            String username = username_edittext.getText().toString();
            String password = password_edittext.getText().toString();
            if (username.isEmpty() || password.isEmpty()) {
                username_edittext.setError("Please fill the username");
                password_edittext.setError("Please fill the password");
            } else {
                // send a request to the serve
                sendLoginRequest(username, password, Constants_values.getBackendUrl()+"api/auth/login");




            }

        });

    }

    private void checkIfTokenIsValid(String token) {
        RequestQueue queue = Volley.newRequestQueue(this);

        JSONObject requestData = new JSONObject();
        try {
            requestData.put("token", sharedPref.getString("token", ""));
        } catch (JSONException e) {
            e.printStackTrace();
            Toast.makeText(Connexion.this, "Login failed 1", Toast.LENGTH_SHORT).show();
            return;
        }

        JsonObjectRequest request = new JsonObjectRequest(Request.Method.POST, Constants_values.getBackendUrl()+"api/auth/check", requestData,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            if (response.getString("status").equals("success")) {
                                loginSuccess(response, token);
                            } else {
                                // login failed
                                Toast.makeText(Connexion.this, "Login failed 2", Toast.LENGTH_SHORT).show();
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                            Toast.makeText(Connexion.this, "Login failed 3", Toast.LENGTH_SHORT).show();
                        }
                    }
                }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                Toast.makeText(Connexion.this, "Login failed 4", Toast.LENGTH_SHORT).show();
            }
        });

        queue.add(request);
    }

    private boolean sendLoginRequest(String username, String password, String url) {
        RequestQueue queue = Volley.newRequestQueue(this);

        JSONObject requestData = new JSONObject();
        try {
            requestData.put("login", username);
            requestData.put("password", password);
        } catch (JSONException e) {
            e.printStackTrace();
            Toast.makeText(Connexion.this, "Login failed 1", Toast.LENGTH_SHORT).show();
            return false;
        }

        JsonObjectRequest request = new JsonObjectRequest(Request.Method.POST, url, requestData,
                new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            if (response.getString("status").equals("success")) {
                                loginSuccess(response,"");
                            } else {
                                // login failed
                                Toast.makeText(Connexion.this, "Your token has expired", Toast.LENGTH_SHORT).show();
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                            Toast.makeText(Connexion.this, "Login failed 3", Toast.LENGTH_SHORT).show();
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        error.getCause();
                        Toast.makeText(Connexion.this, "Login failed 4", Toast.LENGTH_SHORT).show();
                    }
                });

        queue.add(request);
        return false;
    }

    private void loginSuccess(JSONObject response, String token) throws JSONException {
        Toast.makeText(Connexion.this, "Login success", Toast.LENGTH_SHORT).show();

        if (token == "") {
            sharedPref.edit().putString("token", response.getString("token")).apply();
        }
        else {
            sharedPref.edit().putString("token", token).apply();
        }
        // save the token
        String user = response.getString("user");
        sharedPref.edit().putString("user", user).apply();
        //go to the main activity
        Intent intent = new Intent(Connexion.this, Home_Menu.class);
        intent.putExtra("token", sharedPref.getString("token", ""));
        startActivity(intent);
        //startActivity(WebViewApp.newIntent(Connexion.this));
    }

}