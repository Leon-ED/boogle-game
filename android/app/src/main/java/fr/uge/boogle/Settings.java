package fr.uge.boogle;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

public class Settings extends Fragment {

    private String webViewUrl;

    public static Settings newInstance() {
        return new Settings();
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webViewUrl = Constants_values.getWebViewUrl();
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.activity_settings, container, false);

        EditText urlEditText = view.findViewById(R.id.urlEditText);
        urlEditText.setText(webViewUrl);

        Button saveButton = view.findViewById(R.id.saveButton);
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Boolean changed = false;
                if (!webViewUrl.equals(urlEditText.getText().toString())) {
                    changed = true;
                }
                String newUrl = urlEditText.getText().toString();
                webViewUrl = newUrl;
                Constants_values.setWebViewUrl(newUrl);

                if (changed) {
                    // Return to the connection page
                    requireActivity().onBackPressed();
                }

            }
        });


        return view;
    }
}
