import axios, { all } from "axios";
import { useCallback, useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import {
	Keyboard,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
	Dimensions,
} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
function getDateFormatted(date) {
	const dateFormat =
		date.getFullYear() +
		"-" +
		("0" + (date.getMonth() + 1)).slice(-2) +
		"-" +
		("0" + date.getDate()).slice(-2);
	return dateFormat;
}
const Form = () => {
	const [convData, SetConvData] = useState();
	const [currencies, SetCurrencies] = useState([]);
	const [fromCurr, SetFromCurr] = useState("");
	const [toCurr, SetToCurr] = useState("");
	const [result, SetResult] = useState(0);
	const [amount, SetAmount] = useState(0);
	const [historicalData, SetHistoricalData] = useState();
	const [chartData, SetChartData] = useState();
	/*
{
		labels: ["12/12", "12/12", "12/12", "88/88", "12/12", "12/12"],
		data: [20, 45, 28, 80, 99, 43],
	}
*/
	useEffect(() => {
		async function FetchChartData() {
			const endDateObj = new Date();
			const startDateMilisec = endDateObj.valueOf() - 604800000;
			const startDateObj = new Date(startDateMilisec);
			const startDate = getDateFormatted(startDateObj);
			const endDate = getDateFormatted(endDateObj);

			const timeseriesUrl = `https://api.exchangerate.host/timeseries?start_date=${startDate}&end_date=${endDate}`;
			console.log("URL " + timeseriesUrl);
			const response = await axios.get(timeseriesUrl);
			SetHistoricalData(response.data);
			console.log("Chart data fetched: " + response.data.success);
		}
		FetchChartData();
		async function CurrencyRates() {
			const response = await axios.get(
				"https://api.exchangerate.host/latest"
			);
			if (response.data.success) {
				SetConvData(response.data);
				SetCurrencies(Object.keys(response.data.rates));
			}
			console.log("Response " + response.data.success);
		}
		CurrencyRates();
	}, []);

	useEffect(() => {
		CheckCurrencyPairChanged();
	}, [fromCurr, toCurr]);

	const CheckCurrencyPairChanged = useCallback(() => {
		console.log("Checking..." + fromCurr + toCurr);
		if (fromCurr != "" && toCurr != "") {
			// filter and set chart data
			let rates = [];
			let labels = [];

			const allDates = Object.keys(historicalData.rates);
			console.log("alldates: " + JSON.stringify(allDates));
			for (let x = 0; x < allDates.length; x++) {
				let date = allDates[x];
				const singleDayData = historicalData.rates[date];
				if (Object.keys(singleDayData).length == 0) {
					continue;
				}
				console.log("Date: " + date);
				console.log("singleDayData: " + JSON.stringify(singleDayData));
				let rate = ConversionHist(fromCurr, toCurr, 1, singleDayData);
				let dateObj = new Date(date);
				let label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
				labels.push(label);
				rates.push(rate);
			}

			SetChartData({
				labels: labels,
				data: rates,
			});
		}
	}, [fromCurr, toCurr, historicalData]);

	function Conversion(from, to, amount) {
		const baseVal = amount / convData.rates[from];
		const result = baseVal * convData.rates[to];
		console.log("Result " + from + to + result);
		return result;
	}

	function ConversionHist(from, to, amount, conversionData) {
		const baseVal = amount / conversionData[from];
		const result = baseVal * conversionData[to];
		console.log(`ConversionHist ${from} ${to} ${result} `);
		return result;
	}

	const charBG = "#ffff";
	const chartConfig = {
		backgroundGradientFrom: charBG,
		backgroundGradientFromOpacity: 1,
		backgroundGradientTo: charBG,
		backgroundGradientToOpacity: 1,
		color: (opacity = 1) => "grey",
		strokeWidth: 5, // optional, default 3
		barPercentage: 1,
		useShadowColorFromDataset: false, // optional
		propsForBackgroundLines: {
			stroke: "#0003",
			strokeDasharray: "", // solid background lines with no dashes
		},
	};
	let data;
	if (chartData) {
		data = {
			labels: chartData.labels,
			datasets: [
				{
					data: chartData.data,
					color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // optional
					strokeWidth: 2, // optional
				},
			],
		};
	}
	return (
		<View style={styles.container}>
			<View style={styles.resultContainer}>
				<Text
					style={{
						fontSize: 15,
						textAlignVertical: "center",
					}}
				>
					=
				</Text>
				<Text
					style={{
						marginLeft: 10,
						fontSize: 20,
						textAlignVertical: "center",
						flex: 1,
					}}
				>
					{result}
				</Text>
				<Text
					style={{
						fontSize: 10,
						textAlignVertical: "center",
					}}
				>
					{toCurr}
				</Text>
			</View>
			<Text style={styles.title}>From</Text>
			<SelectDropdown
				data={currencies}
				search={true}
				searchPlaceHolder={"Search"}
				searchInputStyle={{
					borderBottomColor: "black",
					borderBottomWidth: 1.5,
				}}
				buttonStyle={styles.dropdownbutton}
				dropdownStyle={styles.dropdownmenu}
				onSelect={(selectedItem) => {
					SetFromCurr(selectedItem);
				}}
			/>

			<Text style={styles.title}>To</Text>
			<SelectDropdown
				data={currencies}
				search={true}
				searchPlaceHolder={"Search"}
				searchInputStyle={{
					borderBottomColor: "black",
					borderBottomWidth: 1.5,
				}}
				buttonStyle={styles.dropdownbutton}
				dropdownStyle={styles.dropdownmenu}
				onSelect={(selectedItem) => {
					SetToCurr(selectedItem);
				}}
			/>
			<TextInput
				style={styles.textinput}
				onChangeText={(val) => {
					SetAmount(parseFloat(val));

					if (fromCurr !== "" && toCurr !== "") {
						const answer =
							val == ""
								? 0
								: Conversion(fromCurr, toCurr, parseFloat(val));
						SetResult(answer);
					}
				}}
				placeholder={"Amount"}
				keyboardType={"number-pad"}
			/>
			{/* <Pressable
				style={styles.button}
				onPress={() => {
					if (fromCurr !== "" && toCurr !== "") {
						SetResult(Conversion(fromCurr, toCurr, amount));
						Keyboard.dismiss();
					}
				}}
			>
				<Text style={styles.buttonText}>Convert</Text>
			</Pressable> */}
			{/* <Text style={[styles.title, { marginTop: 20 }]}>Result</Text> */}

			{chartData && (
				<LineChart
					style={{
						padding: 8,
						marginTop: 40,
						borderWidth: 1,
						borderRadius: 5,
						borderColor: "black",
					}}
					withVerticalLines={false}
					data={data}
					width={Dimensions.get("screen").width - 80}
					height={180}
					chartConfig={chartConfig}
				/>
			)}
		</View>
	);
};

export default Form;
const styles = StyleSheet.create({
	container: {
		marginTop: 0,
		flex: 1,
		justifyContent: "flex-start",
	},
	title: {
		marginTop: 20,
		fontSize: 20,
		fontWeight: "bold",
		color: "black",
	},
	textinput: {
		paddingLeft: 10,
		height: 40,
		marginTop: 20,
		backgroundColor: "white",
		borderRadius: 5,
		borderWidth: 2,
		borderColor: "white",
		borderBottomColor: "blue",
		fontSize: 20,
	},
	button: {
		backgroundColor: "blue",
		marginTop: 40,
		borderRadius: 5,
	},
	buttonText: {
		padding: 10,
		textAlign: "center",
		fontSize: 20,
		color: "white",
	},
	resultContainer: {
		flexDirection: "row",
		marginTop: 25,
		backgroundColor: "white",
		height: 40,
		paddingHorizontal: 10,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "black",
	},
	dropdownbutton: {
		borderWidth: 1,
		borderColor: "black",
		backgroundColor: "white",
		marginTop: 5,
		borderRadius: 5,
		width: 300,
		height: 40,
	},
	dropdownmenu: {
		borderRadius: 5,
		width: 300,
		backgroundColor: "white",
	},
});
