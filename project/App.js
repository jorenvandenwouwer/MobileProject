import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer} from '@react-navigation/native';
import { Button,StyleSheet, Text, View , Modal} from 'react-native';
import MapView, { Circle, Marker, Overlay } from 'react-native-maps';
import fetch from 'node-fetch';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';

import { createStackNavigator} from '@react-navigation/stack'

import OverlayExample from './components/overlayers'
import DetailOverlay from './components/DetailOverlay'
import TestMap from './components/MapTest'

const Tab = createBottomTabNavigator();
export default () => {
  
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Map" component={MapScreen}/>
        <Tab.Screen name="List" component={ListScreenStack}/>
        <Tab.Screen name="Favorites" component={FavoriteScreen}/>
        <Tab.Screen name="TestMap" component={TestMap}/>

      </Tab.Navigator>
    </NavigationContainer>
  )
}


const MapScreen = ({navigation}) => {
  const loadLocationData = async() => {
    try {
      let respone = await fetch("https://api.jsonbin.io/b/5fbb8b2b522f1f0550cc78f9");
      let json = await respone.json();
      setLocaties(json.features);
    } catch(error){
      console.log(error)
    }
  }
  const detailPage = (locatie) => {
    return  (
      <View style={styles.overlay}>
        <Text> testing </Text>
    <Text>{locatie}</Text>
      </View>
    )
  }
  
    const [locaties,setLocaties] = useState([]); 
    useEffect(() => {
      loadLocationData();
    }, [])
    const mapMarkers = () => {
      return locaties.map((locatie) => 
      <Marker
          key={locatie.attributes.OBJECTID}
          coordinate={{latitude: locatie.attributes.Latitude,longitude:locatie.attributes.Longitude}}
          title={locatie.attributes.Naam}
          />
        )
    }
  const region = {
    latitude: 51.231107,
    longitude: 4.415127,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  }

  const [showModel, setShowModel] = useState(false);
  return (
    <View style={styles.container}>
      
      <MapView style={styles.mapStyle} region={region}> 
      {mapMarkers()}
      
      </MapView>
      <StatusBar style="auto" />
    </View>
  )
}


const Stack = createStackNavigator();

export const ListScreenStack = () => {
  return(
    <Stack.Navigator>
      <Stack.Screen name="ListViewScreen" component={ListScreen} />
      <Stack.Screen name="locatieDetail" component={locatieDetail} />
    </Stack.Navigator>


  );
}


const ListScreen = ({navigation}) => {

const loadLocationData = async() => {
  try {
    let respone = await fetch("https://api.jsonbin.io/b/5fbb8b2b522f1f0550cc78f9");
    let json = await respone.json();
    setLocaties(json.features);
  } catch(error){
    console.log(error)
  }
}

  const [locaties,setLocaties] = useState([]); 
  useEffect(() => {
    loadLocationData();
  }, [])
  const renderItem = ({item}) => {
    return(
      <TouchableOpacity onPress={() => navigation.navigate('locatieDetail', {item:item})}>
        <View style={{backgroundColor:"#4287f5", height:70, margin:1}}><Text>{item.attributes.Naam} {"\n"}{item.attributes.Gemeente} </Text></View>
      </TouchableOpacity>
    )
  }
  const keyExtractor = (item) => item.attributes.GISID;
  return (
    <View>
      <FlatList
        data={locaties}
        keyExtractor= {keyExtractor}
        renderItem= {renderItem}
        />
    </View>
  )
}

export const locatieDetail = ({route, navigation}) => {
  //route om toegang te krijgen van de data en navigation om terug te gaan naar onze listview
  return(
  <View>
  <Text>{route.params.item.attributes.Naam}</Text>
  <Text>{route.params.item.attributes.Gemeente}</Text>
  <Text>{route.params.item.attributes.District}</Text>
  <Text>{route.params.item.attributes.Postcode}</Text>
</View>);
}
const FavoriteScreen = () => {
  return (
    <View>
      <Text>
        Joren is raar
      </Text>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
    justifyContent: "center"


  },
  mapStyle: {
    flex: 1,
    zIndex: -1
  },
  overlay: {
    position: 'absolute',
    width: 20,
    height: 20,
    top: 10,
    left: 10,
    zIndex: 10
  },

});
