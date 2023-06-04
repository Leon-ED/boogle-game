package fr.uge.boogle;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

public class Messenger extends Fragment {

    public static Messenger newInstance() {
        return new Messenger();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.activity_messenger, container, false);

        // Obtenir la référence du layout qui contiendra les conversations
        LinearLayout conversationLayout = view.findViewById(R.id.conversationLayout);

        // Ajouter des conversations de démonstration
        addConversation(conversationLayout, R.drawable.default_icon, "John Doe", "Hello! How are you?");
        addConversation(conversationLayout, R.drawable.default_icon, "Jane Smith", "Hey, what's up?");
        addConversation(conversationLayout, R.drawable.default_icon, "Mike Johnson", "Long time no see!");

        // Vous pouvez ajouter d'autres conversations en appelant la méthode addConversation

        return view;
    }

    private void addConversation(ViewGroup parentLayout, int imageResId, String name, String lastMessage) {
        // Créer un nouvel élément de conversation en inflatant le layout conversation_item.xml
        View conversationItem = LayoutInflater.from(requireContext()).inflate(R.layout.conversation_item, parentLayout, false);

        // Obtenir les références des vues dans l'élément de conversation
        ImageView profileImage = conversationItem.findViewById(R.id.profileImage);
        TextView nameText = conversationItem.findViewById(R.id.nameText);
        TextView lastMessageText = conversationItem.findViewById(R.id.lastMessageText);

        // Définir les valeurs des vues avec les données de la conversation
        profileImage.setImageResource(imageResId);
        nameText.setText(name);
        lastMessageText.setText(lastMessage);

        // Ajouter l'élément de conversation au layout parent
        parentLayout.addView(conversationItem);
    }
}
