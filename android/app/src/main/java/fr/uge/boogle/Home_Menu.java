package fr.uge.boogle;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

public class Home_Menu extends AppCompatActivity {

    private SharedPreferences sharedPref;
    private Button button1, button2, button3;
    private FrameLayout contentLayout;

    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home_menu);

        Intent intent = getIntent();
        token = intent.getStringExtra("token");
        Log.e("LE SAINT TOKEN", token);

        sharedPref = getPreferences(Context.MODE_PRIVATE);
        sharedPref.edit().putString("token", token).apply();

        button1 = findViewById(R.id.button1);
        button2 = findViewById(R.id.button2);
        button3 = findViewById(R.id.button3);
        contentLayout = findViewById(R.id.contentLayout);

        button1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(Home_Menu.this, "Activité 1", Toast.LENGTH_SHORT).show();
                launchFragment(new Messenger());
            }
        });

        button2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(Home_Menu.this, "Activité 2", Toast.LENGTH_SHORT).show();
                launchFragment(new WebViewApp());
            }
        });

        button3.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(Home_Menu.this, "Activité 3", Toast.LENGTH_SHORT).show();
                launchFragment(new Settings());
            }
        });

        // Appliquer le thème approprié en fonction de l'état du mode sombre
        boolean isDarkModeEnabled = sharedPref.getBoolean("darkMode", false);
        if (isDarkModeEnabled) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES); // Mode sombre activé
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO); // Mode sombre désactivé
        }
    }

    private void launchFragment(Fragment fragment) {
        FragmentManager fragmentManager = getSupportFragmentManager();
        FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
        fragmentTransaction.replace(R.id.contentLayout, fragment);
        fragmentTransaction.commit();
    }
}
