import React, { useEffect } from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity, Animated, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ModalScreen({ isVisible, toggleModal }) {

  useEffect(() => {
    const handleBackPress = () => {
      if (isVisible) {
        toggleModal();
        return true; // Prevent default behavior (exit the app)
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [isVisible, toggleModal]);

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
          <Icon
            name="bars"
            size={30}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
        <View style={styles.modalContent}>
          <Text>Your modal content goes here.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
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
});
