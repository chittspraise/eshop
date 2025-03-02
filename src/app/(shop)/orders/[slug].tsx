import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { format } from 'date-fns';
import { getMyOrder } from '../../api/api';
import React from 'react';


const OrderDetails = () => {
    const { slug } = useLocalSearchParams<{ slug: string }>();
  
    const { data: order, error, isLoading } = getMyOrder(slug);
  
    // Show loading indicator while fetching data
    if (isLoading) return <ActivityIndicator />;
  
    // Handle error or missing order data
    if (error || !order) return <Text style={styles.errorText}>Error: {error?.message || 'Order not found'}</Text>;
  
    // Prepare the order items, expanding based on quantity
    const orderItems = order.order_item.flatMap((orderItem: any) => {
      const individualItems = [];
      // Create individual items based on quantity
      for (let i = 0; i < orderItem.quantity; i++) {
        individualItems.push({
          id: `${orderItem.id}_${i}`,  // Unique ID for each item
          title: orderItem.products.title,
          heroImage: orderItem.products.heroImage,
          price: orderItem.products.price,
          status: orderItem.products.Status, // Can be modified individually
          refundedAmount: order.refunded_amount / orderItem.quantity, // Refund divided per item
        });
      }
      return individualItems;
    });
  
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: `${order.slug}` }} />
        
        <Text style={styles.item}>{order.slug}</Text>
        <Text style={styles.details}>{order.description}</Text>
        
        <View style={[styles.statusBadge, styles[`statusBadge_${order.status?.replace(' ', '')}`] || styles.statusBadge_Default]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
  
        <Text style={styles.date}>{format(new Date(order.created_at), 'MMM dd, yyyy')}</Text>
        <Text style={styles.itemsTitle}>Items Ordered:</Text>
        
        <FlatList
          data={orderItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderItem}>
              <Image source={{ uri: item.heroImage }} style={styles.heroImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.title}</Text>
                <Text style={styles.itemPrice}>Price: ${item.price}</Text>
                {order.status.trim() !== 'Pending' && (
  <Text
    style={[
      styles.itemStatus,
      { color: item.status.trim() === 'out of stock' ? 'red' : 'green' }
    ]}
  >
    Status: {item.status}
  </Text>
)}

               

               </View>
            </View>
              )}
               />
        
        <View style={styles.footer}>
          <View style={styles.horizontalLine} />
          <Text style={styles.refundText}>
         Refund: ${order.refunded_amount 
        ? (order.refunded_amount * order.order_item.reduce((total, item) => total + item.quantity, 0)).toFixed(2)
        : '0.00'}
         </Text>
        </View>
      </View>
    );
  };
  

export default OrderDetails;

const styles: { [key: string]: any } = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  item: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    marginBottom: 16,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadge_pending: {
    backgroundColor: 'orange',
  },
  statusBadge_completed: {
    backgroundColor: 'green',
  },
  statusBadge_Shipped: {
    backgroundColor: 'blue',
  },
  statusBadge_inTransit: {
    backgroundColor: 'purple',
  },
  statusBadge_Default: {
    backgroundColor: 'gray',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginTop: 16,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  heroImage: {
    width: '50%',
    height: 100,
    borderRadius: 10,
  },
  itemInfo: {},
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    marginTop: 4,
  },
  itemStatus: {
    fontSize: 14,
    marginTop: 4,
   
  },
  
    footer: {
      marginTop: 20,
      paddingVertical: 10,
      alignItems: 'center',
    },
    horizontalLine: {
      width: '100%',
      height: 1,
      backgroundColor: '#ccc',
      marginBottom: 10,
    },
    refundText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
//   },
