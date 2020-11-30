import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer} from '@react-navigation/native';
import { Button,StyleSheet, Text, View, Modal} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import fetch from 'node-fetch';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';

import { createStackNavigator} from '@react-navigation/stack'


export default DetailOverlay = (props) => {
    const [showModel, setShowModel] = useState(false);
    return(
        <View style={styles.container}>
            <Text style={{fontSize: 80}}>Hello, to the Modal</Text>
            <Button title="Show Model" onPress={() => setShowModel(!showModel)} />
            <Modal
             transparent={true}
             visible={showModel}
            >
                <View style={{backgroundColor:"#000000aa", flex: 1, flexDirection:"column-reverse"}}>
                    <View style={{backgroundColor:"#ffffff", margin:50, padding:40, borderRadius:10}}>
                        <Text style={{fontSize: 40}}>This is the Modal</Text>
                        <Button title="Exit Model" onPress={() => setShowModel(!showModel)} />
                    </View>
                    
                </View>
            </Modal>
        </View>


    );
}

const styles = StyleSheet.create({
        container: {
          flex: 1, 
          backgroundColor: '#fff',
          justifyContent: "center"
      
      
        },
});