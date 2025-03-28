import { StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native'
import { Stack,Redirect} from 'expo-router'


import { useLocalSearchParams } from 'expo-router'
import { useToast } from 'react-native-toast-notifications'
import { getProduct } from '../api/api'
import { FlatList } from 'react-native'
import { useState } from 'react'
import { useCartStore } from '../cart-store'
import * as React from 'react'

const ProuductDetails = () => {
    const {slug} = useLocalSearchParams<{slug: string}>();
    const toast= useToast();


    const {data:product,error,isLoading} = getProduct(slug);

    const{items,addItem,incrementItem,decrementItem} = useCartStore();

    const cartItem= items.find(item => item.id === product?.id);

    const initialQuantity = cartItem? cartItem.quantity : 0;

    const [quantity, setQuantity] = useState(initialQuantity);

   
   
    if (isLoading) return <ActivityIndicator/>; 
    if(error) return <Text>Error:{error.message}</Text>
    if (!product)  return <Redirect href="/404" />;
    
    const increaseQuantity = () => {
    
        setQuantity(prev=> prev + 1);
        incrementItem(product.id);
       
    };

    const decreaseQuantity = () => {
      if (quantity > 1) {
        setQuantity(prev => prev - 1);
        decrementItem(product.id);
      } else {
        toast.show('Minimum quantity reached', 
          {type: 'warning',
          placement: 'top',
          duration: 1300
        });
      }       
    };

    const addToCart= () => {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity,
        heroImage: product.heroImage,
       
      });
      toast.show(' Added to cart', {
        type: 'success',
        placement: 'top',
        duration: 1300
      });
    };
    
    const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{title: product.title}}/>
      <Image source={{uri:product.heroImage}} style={styles.heroImage} />

       <View style={{padding: 16, flex:1}}>
         <Text style={styles.title}>{product.title}</Text>
            <View style={styles.priceContainer}>
            <Text style={styles.price}>
              Unit Price: R{product.price.toFixed(2)}
            </Text>
            <Text style={styles.price}>Total Price: R{totalPrice}</Text>
            </View>
            <Text style={styles.description}>{product.description}</Text>
      <FlatList
        horizontal
        data={product.imagesUrl}
        keyExtractor={(item, index) => index.toString() }
        renderItem={({item}) => (
          <Image source={{uri:item}} style={styles.image} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagesContainer}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={decreaseQuantity}
          disabled={quantity === 1}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.quantity}>{quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={increaseQuantity}
         
          
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{
            ...styles.addToCartButton,
            opacity: quantity === 0 ? 0.5 : 1,

          }}
          onPress={addToCart}
          disabled={quantity === 0}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
       </View>
       </View>   
    </View>
  );
};

export default ProuductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  slug: {
    fontSize: 18,
    color: '#555',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontWeight: 'bold',
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginVertical: 8,
  },
  

  imagesContainer: {
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  quantityButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: 'green',
    paddingVertical: 12,
    
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorMessage: {
    fontSize: 18,
    color: '#f00',
    textAlign: 'center',
    marginTop: 20,
  },
})