import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer} from '@react-navigation/native';
import { ActivityIndicator,Button,StyleSheet, Text, View , Modal, Image} from 'react-native';
import MapView, { Callout, Circle, Marker, Overlay } from 'react-native-maps';
import fetch from 'node-fetch';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system'

import { createStackNavigator} from '@react-navigation/stack'


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
        <Tab.Screen name="Map" >{props => <MapScreenStack {...props} data={data}/>}</Tab.Screen>
        <Tab.Screen name="List" >{props => <ListScreenStack {...props} data={data}/>}</Tab.Screen>
        <Tab.Screen name="Favorites" component={FavoriteScreen}></Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  )
  
}




const MapScreen = ({navigation, data}) => {
 

  const [showModel, setShowModel] = useState(false);
  const [location,setLocation] = useState('loading');
  const [current, setCurrent] = useState(null);
  const [storeData, setStoreData] = useState(null);
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
          
          onPress={() => {
            setShowModel(true)
            setCurrent(locatie)
            }}
          >
          </Marker>
          )
        
    };
    
    const region = {
      latitude: jsonLocatie.coords.latitude,
      longitude: jsonLocatie.coords.longitude,
      latitudeDelta: 0.3,
      longitudeDelta: 0.3,
    }
  return (
    <View style={styles.container}>
      
      <MapView style={styles.mapStyle} initialRegion={region} showsUserLocation={true} onPress={()=> setShowModel(false)}> 
      {mapMarkers()}
      </MapView> 
      {showModel && <View style={{ flex: 1, position: 'absolute', alignSelf: 'stretch'}}>
              <View style={{backgroundColor:"#ffffff", marginTop: '100%', padding:20,width:'100%'}}>
                  <Text style={{fontSize: 40}}>{current.attributes.Naam}</Text>
                  <Button style={styles.button} title="Detail Page" onPress={() => navigation.navigate('MapDetail', {item:current.attributes}, setShowModel(!showModel))}/>
              </View>
            </View>
         
      }
      <StatusBar style="auto" />
    </View>
    )
  }
}


const Stack = createStackNavigator();

export const ListScreenStack = ({data}) => {
  return(
    <Stack.Navigator
      Options={{
        headerShown:false
      }}>
      <Stack.Screen name="ListViewScreen" >{props => <ListScreen {...props} data={data}/>}</Stack.Screen>
      <Stack.Screen name="locatieDetail" component={LocatieDetail}></Stack.Screen>
    </Stack.Navigator>


  );
}



export const MapScreenStack = ({data}) => {
    return(
      <Stack.Navigator 
      screenOptions={{
        headerShown: false
  
      }}
      
      >
        <Stack.Screen name="MapViewScreen" >{props => <MapScreen {...props} data={data}/>}</Stack.Screen>
        <Stack.Screen name="MapDetail" component={MapDetailScreen}></Stack.Screen>
      </Stack.Navigator>
    );
  }

export const MapDetailScreen = ({route, navigation}) => {
  const {item} = route.params;
  return(
    <Stack.Navigator>
      <Stack.Screen name="Detail" >{props => <DetailPage {...props} item={item}/>}</Stack.Screen>
      <Stack.Screen name="Camera" component={CameraScreen} />
    </Stack.Navigator>

  );
}


export const DetailPage = ({item, navigation}) => {
  return(
  <View>
      
      <Text style={{fontWeight: "bold", fontSize: 20}}>{item.Naam}</Text>
      <Text style={{fontWeight: "bold", fontSize: 15}}>Informatie veld: </Text>
      <Text>{item.Gemeente} {item.Postcode}</Text>    
      <Button title="Neem een foto" onPress={() => navigation.navigate('Camera')}/>
 </View>
  );

}

export const CameraScreen = ({navigation}) => {
  const [hasPermission, setHasPermission] = useState();
  const camera = useRef();
  const [image, setImage] = useState();
  useEffect(() => {
      (async() => {
        const {status} = await Camera.requestPermissionsAsync();
        setHasPermission(status === 'granted')
      });
  },[]);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>Geen toegang tot camera</Text>
  }
  const takePicture = async() => {
    let picture = await camera.current.takePictureAsync();
    //camera.current heeft jouw echt de reference van de camera terug
    setImage(picture.uri);
  }

  useEffect(() => {
    const imageDir = FileSystem.cacheDirectory +'detail/';
    const imageFileUri = imageDir + image;

    const dirExist = async() => {
      const dirInfo = await FileSystem.getInfoAsync(imageDir);
      if(!dirInfo.exists){
        console.log("Image directory doesn't exist, creating...");
        await FileSystem.makeDirectoryAsync(imageDir, {intermediates: true});
      }
    }
   
    dirExist();

    if(image !== null){
      addingContent();
    }
  }, [image]);

  


  return (
    <View style={styles.cameraStyle}>
      <Camera style={{flex: 1}} type={Camera.Constants.Type.back} ref={camera} />
      {/* soms wil je een refrence naar object van die camera om een functie te kunnen uitvoeren*/}
      {/* soms wil je op het object zelf een functie aan roepen  */}
      {image && <Image source={{uri: image}} style={{ position: "absolute", top: 0, left: 0, width: 200, height: 200  }}/> }
      <Button title="Neem foto" onPress={takePicture} />
    </View>

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
  },
  cameraStyle:{
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  }


});
