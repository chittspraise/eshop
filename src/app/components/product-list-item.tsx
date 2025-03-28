  import React from 'react';
  import { StyleSheet,Pressable, Text, View, Image, } from 'react-native'
  
  import { Link } from 'expo-router';
import { Tables } from '../../types/database.types';

 

  export const ProductListItem = ({
    product,
  }: {
    product: Tables<'product'>;
  }) => {
    return (
      <Link asChild href={`/product/${product.slug}`}>
        <Pressable style={styles.item}>
          <View style={styles.itemImageContainer}>
            <Image source={{uri: product.heroImage as string}} style={styles.itemImage} />
          </View>
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemTitle}>{product.title}</Text>
            <Text style={styles.itemPrice}>R{product.price.toFixed(2)}</Text>
          </View>
        </Pressable>
      </Link>
    
    );
  };
  
  
  
  const styles = StyleSheet.create({
    item:{width:'50%',
        backgroundColor:'white',
        marginVertical:8,
        borderRadius:10,
        overflow:'hidden',
    },
    itemImageContainer:{    
        height:150,
        width:'90%',
       borderRadius:10,
     },  
      itemImage:{
        height:'100%',
        width:'100%',
        resizeMode:'cover',
       },
       itemTextContainer:{
        padding:8,
        alignItems:'flex-start',
        gap: 4,
     },
    itemTitle:{
        fontSize:16,
        color:'black',
    },
    itemPrice:{
        fontSize:16,
        fontWeight:'bold',
    },  
  });
