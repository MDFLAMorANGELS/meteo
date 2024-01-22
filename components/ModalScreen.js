import React, { useEffect, useState, useRef, useCallback } from 'react';
import {View, Modal, Text, StyleSheet, TouchableOpacity, BackHandler, TextInput, Image, FlatList } from 'react-native';
import axios from 'axios';

import Icon from 'react-native-vector-icons/FontAwesome';

const API_CITY_LIST = (city) => `https://geo.api.gouv.fr/communes?nom=${city}&fields=departement&boost=population&limit=8`;

export default function ModalScreen({ isVisible, toggleModal, onSelectCity }) {
  const [searchValue, setSearchValue] = useState('');
  const [data, setData] = useState([]);

  const inputRef = useRef(null);

  const getCityList = async () => {
    try {
      const response = await axios.get(API_CITY_LIST(searchValue))
      setData(response.data)
    } catch (error) {
      console.error("Error get city list", error);
      setData([]);
    }
  }
  

  const renderCityItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleCitySelect(item)}>
      <Text style={styles.cityItem}>{item.nom}</Text>
    </TouchableOpacity>
  );

  const handleCitySelect = (city) => {
    onSelectCity(city.nom);
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
          </TouchableOpacity>

          <FlatList
            data={data}
            renderItem={renderCityItem}
            keyExtractor={(item) => item.code}
            style={styles.cityList}
          />
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
