import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer,useFocusEffect} from '@react-navigation/native';
import { ActivityIndicator,Button,StyleSheet, Text, View , Modal, Image} from 'react-native';
import MapView, { Callout, Circle, Marker, Overlay } from 'react-native-maps';
import fetch from 'node-fetch';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { Entypo } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons'; 



import { createStackNavigator} from '@react-navigation/stack'


let pictureDir;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
let Favorieten = [];
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
        <Tab.Screen name="Map" options={{tabBarIcon: ({focused}) => (<MaterialIcons name="location-on" size={24} color={focused ? "blue" : "black"} />)}}>
          {props => <MapScreenStack {...props} data={data}/>}
          </Tab.Screen>
        <Tab.Screen name="List" options={{tabBarIcon: ({focused}) => (<MaterialIcons name="list" size={24} color={focused ? "blue" : "black"} />)}}>
          {props => <ListScreenStack {...props} data={data}/>}</Tab.Screen>
        <Tab.Screen name="Favorites" component={FavoriteScreen} 
        options={{tabBarIcon: ({focused}) => (<MaterialIcons name="star" size={24} color={focused ? "blue" : "black"} />)}}>
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  )
  
}
export const ListScreenStack = ({data}) => {
  return(
    <Stack.Navigator>
      <Stack.Screen name="ListViewScreen" options={{headerShown:false}}>{props => <ListScreen {...props} data={data}/>}</Stack.Screen>
      <Stack.Screen name="Detail" component={Detail}></Stack.Screen>
      <Stack.Screen name="CameraScreen" component={CameraScreen}></Stack.Screen>
    </Stack.Navigator>


  );
}
export const MapScreenStack = ({data}) => {
    return(
      <Stack.Navigator>
        <Stack.Screen name="MapViewScreen" options={{headerShown:false}}>{props => <MapScreen {...props} data={data} />}</Stack.Screen>
        <Stack.Screen name="Detail" component={Detail}></Stack.Screen>
        <Stack.Screen name="CameraScreen" component={CameraScreen}></Stack.Screen>
      </Stack.Navigator>
    );
  }
const MapScreen = ({navigation, data}) => {
 

  const [showModel, setShowModel] = useState(false);
  const [location,setLocation] = useState('loading');
  const [current, setCurrent] = useState(null);
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
      {showModel && 
            <View style={{ flex: 1, position: 'absolute', flexDirection: 'column-reverse', height: 100, width:100, bottom: 20, left:100, }}>
              <View style={{backgroundColor:"#ffffff", marginTop: 200, padding:20, width: 230, height: 120}}>
                  <Text style={{fontSize: 17}}>Park And Ride </Text>
                  <Text style={{fontSize: 15}}>{current.attributes.Naam}</Text>
                  <Button style={styles.button} title="Detail Page" onPress={() => navigation.navigate('Detail', {item:current.attributes}, setShowModel(!showModel))}/>
              </View>
            </View>
         
      }
      <StatusBar style="auto" />
    </View>
    )
  }
}
const ListScreen = ({navigation,data}) => {
  const renderItem = ({item}) => {
    return(
      <TouchableOpacity key={item.attributes.GISID} onPress={() => navigation.navigate('Detail', {item:item.attributes})}>
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
const FavoriteScreen = ({navigation}) => {
  useFocusEffect(()=>{
    getData();
  })
  if(Favorieten.length ==0){
    return <View style={styles.container, styles.center}>
      <Text style={{fontSize: 20}}>Voeg eerst favorieten toe</Text>
    </View>
  } else {
  const renderItem = ({item}) => {
    return <TouchableOpacity  onPress={() => navigation.navigate('Detail', {item:item})}>
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
}

const Detail = ({route, navigation}) => {
  const [detailPic, setDetailPic] = useState();
  const item  = route.params.item;
  const [isFavoriet,setIsFavoriet] = useState(false);
  const detailDir = FileSystem.cacheDirectory + 'detail/';
  const path =`${FileSystem.cacheDirectory}/detail.jpg`;


  
  
  useFocusEffect(() => {
    try {
      const getPic = async() => {
        const value = await AsyncStorage.getItem("@detail_pic");
        if (value != null) {
          setDetailPic(value);
        }
      }
  
      getPic();
      
    } catch (error) {
      console.log("errror with control dir:" + error);
    }
   
  })

  

  useEffect(() => {
    getData();   
    if(Favorieten === null){
      setIsFavoriet(false);
    } else {
      if(Favorieten.map(e => e.OBJECTID).indexOf(item.OBJECTID) > -1){
      setIsFavoriet(true);
     } else {
       setIsFavoriet(false);
     }
    }
  },[]);
  //route om toegang te krijgen van de data en navigation om terug te gaan naar onze listview
  return(
  <View>
  {detailPic && <Image source={{uri: detailPic}} style={{width: 500, height: 500  }}/> }
  <Text style={{fontWeight : 'bold', fontSize: 24}}>{item.Naam}</Text>
  <Text>{item.Gemeente}</Text>
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
  }} title={isFavoriet ? "Verwijder Favoriet" : "Voeg Favoriet toe"} color={ isFavoriet ? "red" : ""}/>
  <Button title="Neem een foto" onPress={() => navigation.navigate('CameraScreen')}/>

  
</View>);
}

export const CameraScreen = ({navigation}) => {
  const [hasPermission, setHasPermission] = useState();
  const camera = useRef();


  const [detailPic, setDetailPic] = useState();
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
    try {
      //await DirExists();

      let {uri} = await camera.current.takePictureAsync();
      let date = new Date();
      let newPic = date.toString();
      let code = `${FileSystem.cacheDirectory}/new${newPic}.jpg`;
      await FileSystem.moveAsync({
        from: uri,
        to: code
      });
     // await storePic(picture.uri);
      const test = await FileSystem.getInfoAsync(code);
      setDetailPic(test.uri);
      await AsyncStorage.setItem("@detail_pic", code);

      console.log(getPic);

    } catch (error) {
      console.log("error bij takepicture method " + error);
    }
    
  }

  return (
    <View style={styles.cameraStyle}>
      <Camera style={{flex: 1}} type={Camera.Constants.Type.back} ref={camera} />
      {/* soms wil je een refrence naar object van die camera om een functie te kunnen uitvoeren*/}
      {/* soms wil je op het object zelf een functie aan roepen  */}
      {detailPic && <Image source={{uri: detailPic}} style={{ position: "absolute", top: 0, left: 0, width: 200, height: 200  }}/> }
      <Button title="Neem foto" onPress={takePicture} />
    </View>

  );
}







const storeData = async(locatie) => {
  try {
    const jsonValue = JSON.stringify(locatie);
    console.log(jsonValue)
    await AsyncStorage.setItem("favorieten", jsonValue);
  } catch (error) {
  }
}
const getData = async() => {
  try {
    const value = await AsyncStorage.getItem('favorieten');
    if(value !== null){
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
