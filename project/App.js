import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer} from '@react-navigation/native';
import { ActivityIndicator,Button,StyleSheet, Text, View , Modal} from 'react-native';
import MapView, { Circle, Marker, Overlay } from 'react-native-maps';
import fetch from 'node-fetch';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import * as Location from 'expo-location';

import { createStackNavigator} from '@react-navigation/stack'

import OverlayExample from './components/overlayers'
import DetailOverlay from './components/DetailOverlay'
import TestMap from './components/MapTest'

const Tab = createBottomTabNavigator();
var Favorieten = [];
var locaties = [];
export default () => {
  const [data, setData] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      })();
    loadLocationData();
    getData();
  }, [])
  const loadLocationData = async() => {
    try {
      let respone = await fetch("https://api.jsonbin.io/b/5fc8dddc045eb86f1f8a8e88");
      let json = await respone.json();
      setData(json.features);
    } catch(error){
      console.log(error)
    }
  }
  console.log("data:" + data)
  return (
    <NavigationContainer>
    <StatusBar hidden={true} /> 
      <Tab.Navigator>
        <Tab.Screen name="Map" >{props => <MapScreen {...props} data={data}/>}</Tab.Screen>
        <Tab.Screen name="List" >{props => <ListScreenStack {...props} data={data}/>}</Tab.Screen>
        <Tab.Screen name="Favorites" component={FavoriteScreen}></Tab.Screen>
        <Tab.Screen name="TestMap" component={TestMap}></Tab.Screen>

      </Tab.Navigator>
    </NavigationContainer>
  )
  
}


const MapScreen = ({navigation, data}) => {
  
  const [location,setLocation] = useState('loading');
  useEffect(()=>{
      (async() => {
        let position = await Location.getCurrentPositionAsync();
        setLocation(JSON.stringify(position));
        })();
    
  },[]);
  if(location === 'loading'){
    return <View style={styles.container, styles.center}>
        <Text style={{ fontSize: 40 }}>Getting location</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    
  } else {
    const jsonLocatie = JSON.parse(location)
    const mapMarkers = () => {
      return data.map((locatie) => 
      <Marker
          key={locatie.attributes.OBJECTID}
          coordinate={{latitude: locatie.attributes.Latitude,longitude:locatie.attributes.Longitude}}
          title={locatie.attributes.Naam}
          />)
        
    };
  const region = {
    latitude: jsonLocatie.coords.latitude,
    longitude: jsonLocatie.coords.longitude,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  }
  return (
    <View style={styles.container}>
      
      <MapView style={styles.mapStyle} region={region} showsUserLocation={true}> 
      {mapMarkers()}
      
      </MapView>
      <StatusBar style="auto" />
    </View>
    )
  }
}


const Stack = createStackNavigator();

export const ListScreenStack = ({data}) => {
  return(
    <Stack.Navigator>
      <Stack.Screen name="ListViewScreen" >{props => <ListScreen {...props} data={data}/>}</Stack.Screen>
      <Stack.Screen name="locatieDetail" component={LocatieDetail}></Stack.Screen>
    </Stack.Navigator>


  );
}


const ListScreen = ({navigation,data}) => {
  const renderItem = ({item}) => {
    return(
      <TouchableOpacity key={item.attributes.GISID} onPress={() => navigation.navigate('locatieDetail', {item:item.attributes})}>
        <View style={{backgroundColor:"#4287f5", height:70, margin:1}}><Text>{item.attributes.Naam} {"\n"}{item.attributes.Gemeente} </Text></View>
      </TouchableOpacity>
    )
  }
  const keyExtractor = (item) => item.attributes.GISID;
  return (
    <View>
      <FlatList
        data={data}
        keyExtractor= {keyExtractor}
        renderItem= {renderItem}
        />
    </View>
  )
}

const LocatieDetail = ({route, navigation}) => {
  const item  = route.params.item;
  const [isFavoriet,setIsFavoriet] = useState();
  useEffect(() => {
     if(Favorieten.map(e => e.OBJECTID).indexOf(item.OBJECTID) > -1){
      setIsFavoriet(true);
     } else {
       setIsFavoriet(false);
     }
  });
  //route om toegang te krijgen van de data en navigation om terug te gaan naar onze listview
  return(
  <View>
  <Text>{item.Naam}</Text>
  <Text>{item.Gemeente}</Text>
  <Text>{item.District}</Text>
  <Text>{item.Postcode}</Text>
  <Button onPress={() =>{
    const index = Favorieten.map(e => e.OBJECTID).indexOf(item.OBJECTID);

     if(index <0){
       Favorieten.push(item);
       storeData(Favorieten);
       setIsFavoriet(true);
     } else{
       Favorieten.splice(index,1);
       storeData(Favorieten);
       setIsFavoriet(false);
     }
  }} title={isFavoriet ? "Verwijder Favoriet" : "Voeg Favoriet toe"}/>
  
</View>);
}
const FavoriteScreen = ({navigation}) => {
  const renderItem = ({item}) => {
    return <TouchableOpacity  onPress={() => navigation.navigate('locatieDetail', {item:item})}>
        <View style={{backgroundColor:"#4287f5", height:70, margin:1}}><Text>{item.Naam} {"\n"}{item.Gemeente} </Text></View>
      </TouchableOpacity>
    
  }
  const keyExtractor = (item) => item.GISID;
  return (
    <View>
      <FlatList
        data={Favorieten}
        renderItem= {renderItem}
        keyExtractor={keyExtractor}
        />
    </View>
  )
}
const storeData = async(locatie) => {
  try {
    const jsonValue = JSON.stringify(locatie);
    await AsyncStorage.setItem("favorieten", jsonValue);
  } catch (error) {
    
  }
}
const getData = async() => {
  try {
    const value = await AsyncStorage.getItem('favorieten');
    if(value !== undefined){
      Favorieten = JSON.parse(value);
    }
  } catch (error) {
    
  }
  
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
  loader: {
    flex: 1,
    zIndex: -2,
    position: 'absolute'
  },
  overlay: {
    position: 'absolute',
    width: 20,
    height: 20,
    top: 10,
    left: 10,
    zIndex: 10
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  }

});
