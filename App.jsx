import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import * as Location from "expo-location";
import axios from 'axios';
import CurrentWeather from './components/CurrentWeather';
import Forecasts from './components/Forecasts';
import { API_KEY } from '@env';

const API_URL = (lat, lon) => `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=fr&units=metric`;

export default function App() {

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null);


  const getWeather = async (location) => {
    try {
      const response = await axios.get(API_URL(location.coords.latitude, location.coords.longitude))
      setData(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching weather data", error);
      setError("Erreur lors de la récupération de la météo");
      setLoading(false);
    }
  }

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        setError("Permission denied");
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync();
      getWeather(userLocation);
    } catch (error) {
      console.error("Error getting location", error);
      setError("Impossible de récupéré la localisation veuillez vérifier à activé la localisation");
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, [])



  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <Text role="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : (
        <>
          <CurrentWeather data={data} />
          <Forecasts data={data} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E6E1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 20,
  },
});
