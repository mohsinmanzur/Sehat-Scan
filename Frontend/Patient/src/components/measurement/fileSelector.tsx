import { useTheme } from "@context/ThemeContext";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { ScalePressable } from "src/components/ScalePressable";

type Document = {
    id: string;
    name: string;
    date: string;
}

export default function FileSelector({ doc, selectedDoc, setSelectedDoc }: { doc: Document, selectedDoc: string | null, setSelectedDoc: (id: string | null) => void }) {
    const isSelected = selectedDoc === doc.id;
    const { theme } = useTheme();
    const s = styles(theme);
    return (
        <ScalePressable
            style={[s.docCard, isSelected && { borderColor: theme.primary, borderWidth: 1.5 }]}
            onPress={() => setSelectedDoc(isSelected ? null : doc.id)}
        >
            <View style={[s.docIconBox, { backgroundColor: theme.primarySoft }]}>
                <FontAwesome5 name="file-medical" size={18} color={theme.primary} />
            </View>
            <View style={s.docTextCol}>
                <Text style={[s.docName, { color: theme.text }]}>{doc.name}</Text>
                <Text style={[s.docDate, { color: theme.textLight }]}>{doc.date}</Text>
            </View>
            <View style={[
                s.docCheck,
                { backgroundColor: isSelected ? theme.primary : theme.backgroundDark, borderColor: isSelected ? theme.primary : theme.textVeryLight }
            ]}>
                {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
        </ScalePressable>
    );
}

const styles = (theme: any) => StyleSheet.create({
    docCheck: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docTextCol: {
        flex: 1,
    },
    docIconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card,
        borderRadius: 16,
        padding: 14,
        gap: 14,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    docName: {
        fontSize: 14,
        fontFamily: 'Lexend_700Bold',
        marginBottom: 2,
    },
    docDate: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
    },
});