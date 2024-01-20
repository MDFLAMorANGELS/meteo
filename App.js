import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, ActivityIndicator, StatusBar, RefreshControl, SafeAreaView, ScrollView } from 'react-native';
import * as Location from "expo-location";
import axios from 'axios';
import CurrentWeather from './components/CurrentWeather';
import Forecasts from './components/Forecasts';
import { API_KEY } from '@env';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import ModalScreen from './components/ModalScreen';


const API_URL = (lat, lon) => `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=fr&units=metric`;

export default function App() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("transparent,transparent");
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    const timeoutId = setTimeout(() => {
      console.error("Timeout: Le rafraîchissement a pris trop de temps.");
      setError("Le rafraîchissement a pris trop de temps.");
      setRefreshing(false);
    }, 5000);

    // Appel de la fonction pour obtenir la localisation et mettre à jour la météo
    handleGetLocation()
      .then(() => {
        // Annuler le timeout et l erreur car la mise à jour a réussi
        clearTimeout(timeoutId);
        setRefreshing(false);
        setError(null);
        setLoading(false);
      })
      .catch((error) => {
        // Annuler le timeout en cas d'erreur
        clearTimeout(timeoutId);
        console.error("Error refreshing data", error);
        setError("Erreur lors du rafraîchissement des données");
        setRefreshing(false);
        setLoading(true)
      });
  }, []);


  const setAppBackgroundColor = (color) => {
    setBackgroundColor(color);
  };

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
      setError("Impossible de récupérer la localisation veuillez vérifier à activé la localisation");
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetLocation();
  }, [])

  useEffect(() => {
    let timeoutId;
    // Si le chargement persiste pendant 5 secondes, déclencher le rafraîchissement
    timeoutId = setTimeout(() => {
      if (loading) {
        onRefresh();
      }
    }, 6000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loading, onRefresh]);


  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };


  if (loading) {

    return (
      <SafeAreaView style={styles.containerLoading}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <StatusBar
            translucent
            backgroundColor="rgba(0, 0, 0, 0)"
            barStyle="dark-content"
          />
          <ActivityIndicator size="large" color="#00ff00" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <StatusBar
          translucent
          backgroundColor="rgba(0, 0, 0, 0)"
          barStyle="light-content"
        />
        <LinearGradient
          colors={[
            backgroundColor ? backgroundColor.split(",")[0] : "",
            backgroundColor ? backgroundColor.split(",")[1] : ""
          ]}
          style={styles.backgroundGradient}
        />
        {error ? (
          <Text role="alert" style={styles.errorText}>
            {error}
          </Text>
        ) : (
          <>
            <Icon
              name="bars"
              size={30}
              style={styles.menuIcon}
              onPress={toggleModal}
            />
            <ModalScreen isVisible={modalVisible} toggleModal={toggleModal} />
            <CurrentWeather data={data} setAppBackgroundColor={setAppBackgroundColor} />
            <Forecasts data={data} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  containerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  menuIcon: {
    position: 'absolute',
    top: 34,
    left: 20,
    zIndex: 1,
    elevation: 10,
    color: 'white',
    padding: 3,
  },
});