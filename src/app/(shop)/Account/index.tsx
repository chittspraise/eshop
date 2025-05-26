import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../Providers/auth-provider";
import { getMyProfile, useUpsertMyProfile } from "../../api/api";
import Icon from "react-native-vector-icons/MaterialIcons";
import FeatherIcon from "react-native-vector-icons/Feather";
import IoniconsIcon from "react-native-vector-icons/Ionicons";
import { useNavigation ,Link} from "expo-router";
import { supabase } from "../../lib/supabase";

export default function AccountScreen() {
  const { session, user } = useAuth();
  const { data: profile, isLoading, error } = getMyProfile();
  const { mutate: upsertMyProfile } = useUpsertMyProfile();

  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [email, setEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "No First Name");
      setPhoneNumber(profile.phone_number || "No Phone Number");
      setAddress(profile.address || "No Address");
      setDeliveryNote(profile.delivery_note || "No Note");
      setEmail(user?.email || "");
    }
  }, [profile, user]);
  useEffect(() => {
  const channel = supabase.channel('public:profile')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profile' }, (payload) => {
      if (payload.new.user_id === user?.id) {
        setAddress(payload.new.address || 'No Address');
       setDeliveryNote(payload.new.delivery_note || 'No Note');  // <-- separate setter

      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);

  const handleSave = () => {
    upsertMyProfile(
      {
        first_name: firstName,
        phone_number: phoneNumber,
        address,
        delivery_note: deliveryNote,
        email,
      },
      {
        onSuccess: () => {
          setModalVisible(false);
          Alert.alert("Profile successfully updated ");
        },
        onError: (err) => {
          console.error("Profile update error:", err);
          Alert.alert("Error updating profile");
        },
      }
    );
  };

  if (isLoading) return <ActivityIndicator/>;
  if (error) return <Text>Error loading profile</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>My account</Text>
          <Text style={styles.name}>{firstName}</Text>
          <Text style={styles.headerLabel}>{email}</Text>
          <Text style={styles.headerLabel}>{phoneNumber}</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.editIconContainer}
          >
            <FeatherIcon name="edit-2" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Wallet */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Wallet Balance</Text>
          <View style={styles.row}>
            <IoniconsIcon name="wallet-outline" size={30} color="#1BC464" />
            <Text style={styles.walletBalance}>
              R{profile?.wallet_balance ?? 0}
            </Text>
          </View>
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Deliveryaddress" as never)}>
          <Option icon="location-on" label="Delivery address" value={address} />
          <Option icon="note" label="Delivery note" value={deliveryNote} />
        </TouchableOpacity>
         <Link href="/passwordreset">
        <Option icon="lock" label="Reset-Password" />
         </Link>

        <Text style={styles.sectionTitle}>Shopping Assistant</Text>
       
         <Link href="/Account/contact">
        <Option icon="phone" label="Contact us" />
         </Link>
         
        <Text style={styles.sectionTitle}>Support Links</Text>
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://eshopadmin-zeta.vercel.app/Policy")}
          >
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://eshopadmin-zeta.vercel.app/TermsAndCondition")
            }
          >
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
           <TouchableOpacity onPress={()=>(Linking.openURL('https://eshopadmin-zeta.vercel.app/TermsAndCondition'))}>
          <Text style={styles.footerLink}>FAQ</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Contact Info</Text>

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#1BC464" }]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#aaa" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

type OptionProps = {
  icon: string;
  label: string;
  value?: string;
};

function Option({ icon, label, value }: OptionProps) {
  return (
    <View style={styles.option}>
      <Icon name={icon} size={22} color="green" style={styles.optionIcon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.optionText}>{label}</Text>
        {value && <Text style={styles.optionValue}>{value}</Text>}
      </View>
      <Icon name="chevron-right" size={22} color="#888" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: "green",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    position: "relative",
  },
  editIconContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#1BC464",
    padding: 8,
    borderRadius: 20,
  },
  headerLabel: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 5,
  },
  name: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "green",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 15,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  optionValue: {
    fontSize: 13,
    color: "#666",
  },
  whatsappIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletBalance: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  footer: {
    marginTop: 30,
    marginBottom: 40,
    alignItems: "center",
  },
  footerLink: {
    color: "green",
    fontSize: 14,
    marginVertical: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
