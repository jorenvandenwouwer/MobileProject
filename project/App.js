import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer} from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';


const Tab = createBottomTabNavigator();
export default () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Map" component={MapScreen}/>
        <Tab.Screen name="List" component={ListScreen}/>
        <Tab.Screen name="Favorites" component={FavoriteScreen}/>
      </Tab.Navigator>
    </NavigationContainer>
  )
}
const MapScreen = () => {
  return (
    <View>
      <Text>mapview komt hier</Text>
    </View>
  )
}
const ListScreen = () => {
  return (
    <View>
      <Text>listview komt hier</Text>
    </View>
  )
}
const FavoriteScreen = () => {
  return (
    <View>
      <Text>

      </Text>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
