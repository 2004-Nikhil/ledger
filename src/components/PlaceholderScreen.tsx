import { View, Text, StyleSheet } from "react-native";

type Props = {
    title: string;
    description: string;
};

/*For the tabs not built */

export function PlaceholderScreen({title, description}: Props) {
    return (
        <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.desc}>{description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex:1, padding: 24, gap:8},
    title: { fontSize: 22, fontWeight: "600" },
    desc: { fontSize: 13, color: "#6b7280", lineHeight: 18 },
})