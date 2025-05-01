import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import { Card } from 'react-native-paper';
import { useNavigation } from 'expo-router';
import { getMyProfile, upsertMyProfile } from '../../api/api';
import { useAuth } from '../../Providers/auth-provider';
import { Toast } from 'react-native-toast-notifications';

const AccountScreen = () => {
  const navigation = useNavigation();
  const { data: profile, isLoading, error, refetch } = getMyProfile();
  const { user } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');

  if (isLoading) return <Text>Loading...</Text>;
  if (error || !profile) return <Text>Error: {error?.message}</Text>;

  const { mutateAsync: upsertProfile } = upsertMyProfile();

const openEditModal = () => {
  setEditedEmail(user?.email || '');
  setEditedPhone(profile.phone_number || '');
  setModalVisible(true);
};

const handleSave = async () => {
  try {
    await upsertProfile({
      first_name: profile.first_name ?? undefined,
      phone_number: editedPhone,
      email: editedEmail,
    });
    Toast.show('Profile updated successfully!', {
      type: 'success',
      placement: 'top',
      duration: 1300,
    });
    setModalVisible(false);
    refetch();
  } catch (err) {
    console.error('Failed to save profile', err);
   
  }
};


  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <Card style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://via.placeholder.com/80' }}
              style={styles.avatar}>
            </Image>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.first_name}</Text>
              <Text style={styles.subText}>{user.email}</Text>
              <Text style={styles.subText}>{profile.phone_number}</Text>
            </View>
            <TouchableOpacity onPress={openEditModal}>
              <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/pencil-tip.png' }}
                style={styles.iconSmall}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Wallet Section */}
        <Card style={styles.card}>
          <View style={styles.profileRow}>
            <Text style={styles.title}>Wallet Balance :</Text>
            <View style={styles.rowRight}>
              <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/wallet.png' }}
                style={styles.iconSmall}
              />
              <Text style={[styles.title, styles.balance]}>R{profile.wallet_balance}</Text>
            </View>
          </View>
        </Card>

        {/* Address Section */}
        <Card style={styles.card}>
          <Text style={styles.title}>My Address</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Deliveryaddress' as never)}>
            <Text style={styles.subText}>{profile.address}</Text>
          </TouchableOpacity>
        </Card>

        {/* Assistants & FAQ Section */}
        <Card style={styles.card}>
          <Text style={styles.title}>Shopping Assistant</Text>
          <View style={styles.subList}>
            <TouchableOpacity style={styles.subItem}>
              <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/whatsapp.png' }}
                style={styles.icon}
              />
              <Text style={styles.subText}>WhatsApp Assistant</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.subItem}>
              <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/faq.png' }}
                style={styles.icon}
              />
              <Text style={styles.subText}>FAQ</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Legal & Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.legalRow}>
            <TouchableOpacity
              style={styles.subItem}
              onPress={() => Linking.openURL('https://eshopadmin-zeta.vercel.app/Policy')}
            >
              <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/privacy.png' }}
                style={styles.icon}
              />
              <Text style={styles.subText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.subItem}
              onPress={() => Linking.openURL('https://eshopadmin-zeta.vercel.app/TermsAndCondition')}
            >
              <Image
                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/document.png' }}
                style={styles.icon}
              />
              <Text style={styles.subText}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <Text style={styles.footer}>© eShop Corporate 2025</Text>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text>Email</Text>
            <TextInput
              style={styles.input}
              value={editedEmail}
              onChangeText={setEditedEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={editedPhone}
              onChangeText={setEditedPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Save" onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#ccc',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balance: {
    marginLeft: 8,
    color: '#666',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  iconSmall: {
    width: 24,
    height: 24,
    tintColor: 'green',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: 'green',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subList: {
    marginTop: 12,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  footerContainer: {
    marginTop: 32,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 16,
  },
  button: {
    backgroundColor: 'green',
    color: '#fff',
    padding: 10,
    borderRadius: 4,
    textAlign: 'center',
  },
});
