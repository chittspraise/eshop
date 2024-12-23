
import React from 'react';
import{Stack} from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function ProductLayout(){   
return (
   <Stack>
      <Stack.Screen 
        name='[slug]'  
        options={({navigation}) => ({
        headerShown: true,
        headerLeft: () =>(
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="black" />
              <Text>back</Text>
             
            </TouchableOpacity> ),
        headerTitleAlign: 'center' })} 
        />
    </Stack>
 );
}