
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useCartStore } from './cart-store';
import { createOrder, createOrderItem } from './api/api';
import { openStripeCheckout, setupStripePaymentSheet } from './lib/stripe';
import { useWallet } from './Providers/Wallet-provider';
import { useNavigation } from 'expo-router';


type CartItemType = {
  id: number;
  title: string;
  heroImage: string;
  price: number;
  quantity: number;
  maxQuantity: number;
};

type CartItemProps = {
  item: CartItemType;
  onRemove: (id: number) => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
};

const CartItem = ({
  item,
  onDecrement,
  onIncrement,
  onRemove,
}: CartItemProps) => {
  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.heroImage }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => onDecrement(item.id)}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.itemQuantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onIncrement(item.id)}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onRemove(item.id)}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function Cart() {
  const {
    items,
    removeItem,
    incrementItem,
    decrementItem,
    getTotalPrice,
    resetCart,
  } = useCartStore();

  const navigation = useNavigation();
  const { mutateAsync: createSupabaseOrder } = createOrder();
  const { mutateAsync: createSupabaseOrderItem } = createOrderItem();

  const { walletBalance, updateWalletBalance } = useWallet(); // Assuming updateWalletBalance is available from your wallet context

  // Toggle the wallet status for full or partial payment.
  const [walletToggle, setWalletToggle] = useState(false);
  
  const handleCheckout = async () => {
    const totalPrice = parseFloat(getTotalPrice());
  
    if (walletToggle && (walletBalance ?? 0) >= totalPrice) {
      // Process order fully with wallet
      try {
        await createSupabaseOrder(
          { totalPrice },
          {
            onSuccess: async (data) => {
              // Deduct the full amount from wallet
              const newWalletBalance = (walletBalance ?? 0) - totalPrice;
              await updateWalletBalance(newWalletBalance); // Assuming this function updates wallet balance in your backend
  
              createSupabaseOrderItem(
                {
                  insertData: items.map(item => ({
                    orderId: data.id,
                    productId: item.id,
                    quantity: item.quantity,
                  })),
                },
                {
                  onSuccess: () => {
                    alert('Order created successfully with full wallet payment');
                    resetCart();
                  },
                }
              );
            },
          }
        );
      } catch (error) {
        console.error(error);
        alert('An error occurred while creating the order');
      }
      return;
    } else if (walletToggle && (walletBalance ?? 0) < totalPrice) {
      // Wallet balance is insufficient, process partial payment via Stripe
      const remainingAmount = totalPrice - (walletBalance ?? 0);
      try {
        await setupStripePaymentSheet(Math.floor(remainingAmount * 100));
        const result = await openStripeCheckout();
        if (!result) {
          Alert.alert('An error occurred while processing the payment');
          return;
        }
  
        // Deduct the wallet balance from the total price
        const newWalletBalance = (walletBalance ?? 0) - totalPrice; // Deduct the total price from the wallet balance
        await updateWalletBalance(newWalletBalance);
         // Assuming this function updates wallet balance in your backend
  
        await createSupabaseOrder(
          { totalPrice },
          {
            onSuccess: data => {
              createSupabaseOrderItem(
                {
                  insertData: items.map(item => ({
                    orderId: data.id,
                    productId: item.id,
                    quantity: item.quantity,
                  })),
                },
                {
                  onSuccess: () => {
                    alert('Order created successfully');
                    resetCart();
                  },
                }
              );
            },
          }
        );
        
      } catch (error) {
        console.error(error);
        alert('An error occurred while creating the order');
      }
      return;
    } else if (!walletToggle) {
      // Wallet toggle is off, use Stripe for full payment
      try {
        await setupStripePaymentSheet(Math.floor(totalPrice * 100));
        const result = await openStripeCheckout();
        if (!result) {
          Alert.alert('An error occurred while processing the payment');
          return;
        }
        await createSupabaseOrder(
          { totalPrice },
          {
            onSuccess: data => {
              createSupabaseOrderItem(
                {
                  insertData: items.map(item => ({
                    orderId: data.id,
                    productId: item.id,
                    quantity: item.quantity,
                  })),
                },
                {
                  onSuccess: () => {
                    alert('Order created successfully with Stripe payment');
                    resetCart();
                  },
                }
              );
            },
          }
        );
      } catch (error) {
        console.error(error);
        alert('An error occurred while creating the order');
      }
      return;
    }
  };
  

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onRemove={removeItem}
            onIncrement={incrementItem}
            onDecrement={decrementItem}
          />
        )}
        contentContainerStyle={styles.cartList}
      />
  <TouchableOpacity onPress={() => navigation.navigate('Deliveryaddress' as never)}>
        <Text style={{ color: 'red',  marginBottom: 10 }}>
          Please make sure your Address is correct or set it here
        </Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: ${getTotalPrice()}</Text>

        {/* Wallet Payment Toggle */}
        <View style={styles.walletToggleContainer}>
          <TouchableOpacity
            style={styles.walletToggleButton}
            onPress={() => setWalletToggle(!walletToggle)}
          >
            <Text
              style={[
                styles.walletToggleButtonText,
                walletToggle && styles.walletToggleButtonTextActive,
              ]}
            >
              Wallet Payment: {walletToggle ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleCheckout}
          style={styles.checkoutButton}
          
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  cartList: {
    paddingVertical: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#ff5252',
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  walletToggleContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  walletToggleButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  walletToggleButtonText: {
    fontSize: 16,
  },
  walletToggleButtonTextActive: {
    color: 'green',
  },
});
