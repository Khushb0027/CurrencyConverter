import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Form from "./Form";

export default function App() {
	return (
		<View style={styles.container}>
			<Text style={styles.heading}>Currency</Text>
			<Text style={styles.heading}>Converter</Text>
			<ScrollView showsVerticalScrollIndicator={false}>
				<StatusBar style="auto" />
				<Form />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 30,
		marginTop: 60,
		flex: 1,
		backgroundColor: "#fff",
	},
	heading: {
		fontSize: 30,
		fontWeight: "bold",
		color: "blue",
	},
});
