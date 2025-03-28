import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useWallet } from '../Providers/Wallet-provider';
import { useNavigation } from 'expo-router';

const AccountScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState<string | null>('No First Name');
  const [phoneNumber, setPhoneNumber] = useState<string | null>('No Phone Number');
  const [address,setAddress]= useState<string | null>('No Address')
  // Get wallet balance from the WalletProvider context
  const { walletBalance } = useWallet();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data?.user || null);
      }
    };

    fetchUserData();
  }, []);
  useEffect(() => {
    const channel = supabase.channel('public:profile')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profile' }, (payload: { new: { user_id: string; address: string } }) => {
        if (payload.new.user_id === user?.id) {
          setAddress(payload.new.address || 'No Address');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  useEffect(() => {
    if (user) {
      const fetchUserMetadata = async () => {
        const { data: userMetadata, error: metadataError } = await supabase
          .from('profile')
          .select('first_name, phone_number,address') // Removed wallet_balance since it's provided by context
          .eq('user_id', user.id)
          .single();

        if (metadataError) {
          console.error("Error fetching user metadata:", metadataError);
        } else {
          setFirstName(userMetadata?.first_name || 'No First Name');
          setPhoneNumber(userMetadata?.phone_number || 'No Phone Number');
          setAddress(userMetadata?.address || 'no Address')
        }
      };

      fetchUserMetadata();
    }
  }, [user]);

  const [modalVisible, setModalVisible] = useState(false);

  const handleSavePhoneNumber = async () => {
    if (user) {
      const { error } = await supabase
        .from('profile')
        .update({ phone_number: newPhoneNumber })
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating phone number:", error);
      } else {
        setPhoneNumber(newPhoneNumber);
        setModalVisible(false);
      }
    }
  };

  const [newPhoneNumber, setNewPhoneNumber] = useState(phoneNumber);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
            style={styles.profilePic}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{firstName}</Text>
            <Text style={styles.email}>{user?.email || 'No Email Provided'}</Text>
          </View>
        </View>
      </Card>

      {/* Wallet Balance */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <Icon name="credit-card" size={20} color="#1BC464" />
            <Text style={styles.sectionTitle}> Wallet Balance</Text>
          </View>
          <Text style={styles.balance}>
            R{walletBalance !== null ? walletBalance.toFixed(2) : '0.00'}
          </Text>
          <Button
            mode="contained"
            onPress={() => alert('Navigate to Add Funds')}
            style={styles.payOutButton}
            icon="bank"
          >
            Pay Out
          </Button>
        </Card.Content>
      </Card>
   {/* Delivery Address */}
  <TouchableOpacity onPress={() => navigation.navigate('Deliveryaddress' as never)}>
    <Card style={styles.card}>
      <Card.Content>
      <View style={styles.row}>
        <Icon name="home" size={20} color="#1BC464" />
        <Text style={styles.sectionTitle}> Delivery Address</Text>
        <Icon name="edit" size={20} color="#1BC464" style={styles.editIcon} />
      </View>
      <Text style={styles.detailValue}>{address}</Text>
      </Card.Content>
    </Card>
  </TouchableOpacity>

      <Card style={styles.card}>
        <Card.Content>
            <View style={styles.row}>
            <Icon name="phone" size={20} color="#1BC464" />
            <Text style={styles.sectionTitle}> Phone Number</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editIcon}>
              <Icon name="edit" size={20} color="#1BC464" />
            </TouchableOpacity>
            </View>
            <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
            >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Phone Number</Text>
                <TextInput
                style={[styles.input, { width: '300%' }]}
                value={newPhoneNumber || ''}
                onChangeText={setNewPhoneNumber}
                keyboardType="phone-pad"
                maxLength={15} // Set a maximum length for the phone number
                />
              <Button mode="contained" onPress={handleSavePhoneNumber} style={styles.saveButton}>
                Save
              </Button>
              <Button mode="text" onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                Cancel
              </Button>
              </View>
            </View>
            </Modal>
          <Text style={styles.detailValue}>{phoneNumber}</Text>
        </Card.Content>
      </Card>
    
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
        <Icon name="shopping-bag" size={20} color="#1BC464" />
        <Text style={styles.sectionTitle}> Shopping Assistant</Text>
          </View>
         
        <TouchableOpacity onPress={() => alert('Navigate to WhatsApp Support')}>
          <View style={styles.row}>
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png' }}
              style={{ width: 24, height: 24, marginRight: 20 }}
            />
            <Text style={[styles.sectionTitle, { marginLeft: 0, fontSize: 16 }]}> WhatsApp Support</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert('Navigate to FAQs')}>
          <Text style={styles.link}>FAQs</Text>
        </TouchableOpacity>
        </Card.Content>
      </Card>
      {/* Footer Links */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => alert('Navigate to Privacy Policy')}>
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert('Navigate to Terms of Service')}>
          <Text style={styles.footerLink}>Terms of Service</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  profileCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#888',
  },
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginLeft: 20,
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1BC464',
    marginVertical: 10,
  },
  payOutButton: {
    backgroundColor: '#1BC464',
    marginTop: 10,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
    textAlign: "left",  // Ensures all text aligns horizontally
    height: 24,  // Set a consistent height for all text elements
    lineHeight: 24,  // Aligns text vertically within the fixed height
  },
  
  link: {
    color: '#1BC464',
    textDecorationLine: 'underline',
    marginVertical: 5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  divider: {
    height: 15, 
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3, // Adds a shadow effect on Android
    shadowColor: '#000', // Adds a shadow effect on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerLink: {
    color: '#1BC464',
    textDecorationLine: 'underline',
    marginVertical: 5,
  },
  editIcon: {
    marginLeft: 'auto',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#1BC464',
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 10,
  },
});

export default AccountScreen;
