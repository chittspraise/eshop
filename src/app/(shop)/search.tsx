import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'expo-router';

// Supabase setup
const supabaseUrl = 'https://nlwtuqszbnuvrmhjcbcp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd3R1cXN6Ym51dnJtaGpjYmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyMjg1MzcsImV4cCI6MjA0NzgwNDUzN30.EVnrm6YinT_uhTHuF5CAOmhVN9t6doWw6bYPxax6WzI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
type Category = {
  id: number;
  created_at: string;
  name: string;
  imageUrl: string;
  slug: string;
  product: any;
};

type Product = {
  id: number;
  created_at: string;
  title: string;
  slug: string;
  imagesUrl: string[];
  price: number;
  heroImage: string;
  category: number;
  maxQuantity: number;
};

const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    const { data, error } = await supabase.from('product').select('*');

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products: ' + error.message);
    }


    return data;
  };

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    const { data, error } = await supabase.from('category').select('*');

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories: ' + error.message);
    }

    return data;
  };

  // UseEffect to fetch data on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        const fetchedCategories = await fetchCategories();
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch products or categories:', error);
      }
    };

    fetchData();
  }, []);

  // Handle search functionality
  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filteredProducts = products.filter(product =>
      product.title.toLowerCase().includes(query)
    );
    const filteredCategories = categories.filter(category =>
      category.name.toLowerCase().includes(query)
    );
    setFilteredProducts(filteredProducts);
    setFilteredCategories(filteredCategories);
  };

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredProducts([]);
      setFilteredCategories([]);
    } else {
      handleSearch();
    }
  }, [searchQuery, products, categories]);

  // Get category name for a product
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {searchQuery !== '' && (
          <>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Link asChild href={`/categories/${item.slug}`}>
                  <TouchableOpacity style={styles.card}>
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                    <Text style={styles.cardTitle}>{item.name}</Text>
                  </TouchableOpacity>
                </Link>
              )}
            />

            <Text style={styles.sectionTitle}>Products</Text>
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Link asChild href={`/product/${item.slug}`}>
                  <TouchableOpacity style={styles.card}>
                    <Image source={{ uri: item.heroImage }} style={styles.cardImage} />
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text>Category: {getCategoryName(item.category)}</Text>
                    <Text>${item.price}</Text>
                  </TouchableOpacity>
                </Link>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  card: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default SearchScreen;
