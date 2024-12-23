
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import{ ListHeader } from '../components/list-header';
import { ProductListItem } from '../components/product-list-item';
import { getProductsAndCategories } from '../api/api';


const Home = () => {
  const {data, isLoading,  error} = getProductsAndCategories();
  if(isLoading) return <ActivityIndicator />;

  if(error || !data) 
    return <Text>{error?.message || 'An error occurred'}</Text>;

 
  return (  
     
    <View>
      <FlatList 
        data={data.products}
        renderItem={({item}) => <ProductListItem product={item} />}
        keyExtractor={item => item.id.toString()}
        numColumns={2}  
        ListHeaderComponent={<ListHeader categories={data.categories} />}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.flatListColumn}
        style={{paddingHorizontal: 10, paddingVertical: 5}}
      />
    
    </View> 
    );
    
  };

export default Home;

const styles = StyleSheet.create({
  flatListContent: {
    paddingBottom: 20,
  },
  flatListColumn: {
    justifyContent: 'space-between',
  },
});

