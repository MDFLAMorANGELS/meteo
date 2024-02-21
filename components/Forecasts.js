import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Weather from './Weather';

export default function Forecasts({ data }) {
    const [forecasts, setForecasts] = useState([]);

    useEffect(() => {
        if (data && data.list && data.list.length > 0) {
        const forecastData = data.list.map(f => {
            const dt = new Date(f.dt * 1000);
            return {
                data: dt,
                hour: dt.getHours(),
                temp: Math.round(f.main.temp),
                icon: f.weather[0].icon,
                name: format(dt, "EEEE", { locale: fr })
            };
        });

        let newForecastsData = forecastData
            .map(forecast => forecast.name)
            .filter((day, index, self) => self.indexOf(day) === index)
            .map(day => ({
                day,
                data: forecastData.filter(forecast => forecast.name === day)
            }));
        setForecasts(newForecastsData);
}}, [data]);

    

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scroll}
        >
            {forecasts.map((f, index) => (
                <View key={index}>
                    <Text style={styles.day}>{f?.day.toUpperCase()}</Text>
                    <View style={styles.container}>
                        {f.data.map((w, wIndex) => (
                            <Weather key={wIndex} forecast={w} />
                        ))}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        width: "100%",
        height: "35%",
    },
    day: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        marginLeft: 5,
        color: "#fff"
    },
    container: {
        flexDirection: "row",
        marginLeft: 5,
        marginRight: 15,
    },
});