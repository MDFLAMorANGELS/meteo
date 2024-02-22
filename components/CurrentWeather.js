import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { isSameDay } from 'date-fns';

const getIcon = (icon) => `https://openweathermap.org/img/wn/${icon}@4x.png`

export default function CurrentWeather({ data, setAppBackgroundColor }) {

    const [currentWeather, setCurrentWeather] = useState()


    useEffect(() => {
        if (data && data.list && data.list.length > 0) {
            const currentW = data.list.filter(forecast => {
                const today = new Date().getTime() + Math.abs(data.city.timezone * 1000)
                const forecastDate = new Date(forecast.dt * 1000)
                return isSameDay(today, forecastDate)
            })

            const currentCityTime = new Date().toLocaleTimeString('fr-FR', {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            //console.log(currentW);

            const [hour, minute] = currentCityTime.split(':').map(Number);
            const totalMinutes = hour * 60 + minute;

            let backgroundStyle;
            if (totalMinutes >= 0 && totalMinutes < 5 * 60) {
                // Night time (from 00:00:00 to 04:59:00)
                backgroundStyle = `#5124FF,#9198e5`;
            } else if (totalMinutes >= 5 * 60 - 59 && totalMinutes < 8 * 60) {
                // Day time (from 05:00:00 to 07:59:00)
                backgroundStyle = `#9198e5,#e66465`;
            } else if (totalMinutes >= 8 * 60 - 59 && totalMinutes < 13 * 60) {
                // Day time (from 08:00:00 to 12:59:00)
                backgroundStyle = `#e66465,#00BCFF`;
            } else if (totalMinutes >= 13 * 60 - 59 && totalMinutes < 17 * 60) {
                // Day time (from 13:00:00 to 16:59:00)
                backgroundStyle = `#00BCFF,#e66465`;
            } else if (totalMinutes >= 17 * 60 - 59 && totalMinutes < 21 * 60) {
                // Day time (from 17:00:00 to 20:59:00)
                backgroundStyle = `#e66465,#9198e5`;
            } else if (totalMinutes >= 21 * 60 - 59 && totalMinutes < 23 * 60 + 59) {
                // Day time (from 21:00:00 to 23:59:00)
                backgroundStyle = `#9198e5,#5124FF`;
            }

            setAppBackgroundColor(backgroundStyle);
            setCurrentWeather(currentW[0]);

        }
    }, [data]);

    return (
        <View style={styles.container}>
            <Text style={styles.city}>{data?.city?.name}</Text>
            <Text style={styles.today}>Aujourd'hui</Text>

            <Image source={{ uri: getIcon(currentWeather?.weather[0].icon) }} style={styles.image} />

            <Text style={styles.temp}>{Math.round(currentWeather?.main.temp)}°C</Text>
            <Text style={styles.description}>{currentWeather?.weather[0].description}</Text>
        </View>
    )
}


const COLOR = "#E2E2E2";

const styles = StyleSheet.create({
    container: {
        marginTop: 70,
        alignItems: "center",
        height: "65%"
    },
    city: {
        fontSize: 32,
        fontWeight: "500",
        color: COLOR,
        textAlign: "center"
    },
    today: {
        fontSize: 24,
        fontWeight: "300",
        color: COLOR
    },
    image: {
        height: 150,
        width: 150,
        marginVertical: 20
    },
    temp: {
        fontSize: 80,
        fontWeight: "bold",
        color: COLOR
    },
    description: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLOR
    }
})