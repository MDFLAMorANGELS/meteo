import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity, BackHandler, TextInput, Image, FlatList, Pressable } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

const API_CITY_LIST_OWP = (city) => `http://api.openweathermap.org/data/2.5/find?q=${city}&sort=population&cnt=8&appid=4c23849d9f311f8ef2779dfdda390ed2`;
const API_CITY_LIST_GOUV = (city) => `https://geo.api.gouv.fr/communes?nom=${city}&departement=fields&boost=population&limit=4`;

export default function ModalScreen({ isVisible, toggleModal, onSelectCity }) {
  const [searchValue, setSearchValue] = useState('');
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);


  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  const getCityList = async () => {
    try {
      if (!searchValue.trim()) {
        return;
      }

      const response1 = await axios.get(API_CITY_LIST_GOUV(searchValue));
      console.log(response1.data);
      setData1(response1.data);
  
      const response2 = await axios.get(API_CITY_LIST_OWP(searchValue).replaceAll(" ", "-"));
      console.log(response2.data.list);
      const modifiedCities = response2.data.list.map((city) => ({
        ...city,
        nom: city.name,
        name: undefined,
      }));
  
      const filteredCities = modifiedCities.filter((city) => city.sys.country !== "FR");
  
      const uniqueCities = removeDuplicateCities(filteredCities);
      setData2(uniqueCities);
    } catch (error) {
      console.error("Error get city list", error);
    }
  };

  const removeDuplicateCities = (cities) => {
    const uniqueCities = {};
    cities.forEach((city) => {
      uniqueCities[city.name] = city;
    });
    return Object.values(uniqueCities);
  };

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      getCityList(searchValue);
    }, 500);
  }, [searchValue]);

  const clearInput = () => {
    setSearchValue('');
    setData1([]);
    setData2([]);
  };

  const renderCityItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCitySelect(item)}>
      <Text style={styles.cityItem}>{item.nom}, {item.codesPostaux[0]}</Text>
    </TouchableOpacity>
  );
  const renderCityItem2 = ({ item }) => (
    <TouchableOpacity onPress={() => handleCitySelect(item)}>
      <Text style={styles.cityItem}>{item.nom}, {item.sys.country}</Text>
    </TouchableOpacity>
  );

  const handleCitySelect = (city) => {
    onSelectCity(city.nom);
    setData1([]);
    setData2([]);
    setSearchValue('')
    toggleModal();
  };

  useEffect(() => {
    getCityList();
  }, [searchValue])

  useEffect(() => {
    const handleBackPress = () => {
      if (isVisible) {
        toggleModal();
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [isVisible, toggleModal]);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        toggleModal();
      }}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.TouchableOpacity} onPress={toggleModal}>
          <Icon name="bars" size={30} style={styles.menuIcon} />
        </TouchableOpacity>
        <View style={styles.modalContent}>
          <Text>Choisissez une ville </Text>
          <TouchableOpacity style={styles.InputBox} onPress={focusInput}>
            <Image
              source={{
                uri:
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Searchtool.svg/2048px-Searchtool.svg.png',
              }}
              style={{ width: 25, height: 25 }}
            />
            <TextInput
              ref={inputRef}
              style={styles.Input}
              placeholder="Ex : Paris"
              maxLength={40}
              cursorColor="blue"
              inputMode="text"
              value={searchValue}
              onChangeText={(text) => setSearchValue(text)}
            />
            <Pressable style={{ position: "absolute", right: 15 }} onPress={clearInput}>
              <Icon
                name="close"
                size={15}
                color={"#982B2B"}
              />
            </Pressable>
          </TouchableOpacity>
          {data1.length > 0 ? (
            <>
              <Text style={{ marginTop: 50, fontSize: 18 }}>Ville de France</Text>
              <FlatList
                data={data1}
                renderItem={renderCityItem}
                style={styles.cityList}
                keyExtractor={(item) => item.code}
              />
            </>
          ) : null}
          {data2.length > 0 ? (
            <>
              <Text style={{ marginTop: 50, fontSize: 18 }}>Ville du monde</Text>
              <FlatList
                data={data2}
                renderItem={renderCityItem2}
                style={styles.cityList}
                keyExtractor={(item) => item.nom}
              />
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'start',
    alignItems: 'center',
    backgroundColor: 'rgba(236,236,236,0.9)',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
  },
  TouchableOpacity: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 2,
    elevation: 10,
    padding: 3,
  },
  menuIcon: {
    color: 'black',
  },
  modalContent: {
    width: "100%",
    marginTop: 50,
  },
  InputBox: {
    flexDirection: 'row',
    alignItems: "center",
    backgroundColor: "#E2E2E2",
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    marginVertical: 5,
    padding: 10,
    borderColor: "#c2c2c2"
  },
  Input: {
    color: "black",
    paddingHorizontal: 10,
  },
  cityList: {
    marginTop: 10,
  },

  cityItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
});