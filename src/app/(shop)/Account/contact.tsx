import { StyleSheet, Text, View, Image, TouchableOpacity, Linking, Alert } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'

const Contact = () => {
  const handleWhatsAppPress = () => {
    const phoneNumber = '+27789857143' // international format, no spaces/dashes
    const url = `whatsapp://send?phone=${phoneNumber}`

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('WhatsApp not installed', 'Please install WhatsApp to contact support.')
        } else {
          return Linking.openURL(url)
        }
      })
      .catch((err) => console.error('An error occurred', err))
  }

  const handlePhonePress = () => {
    Linking.openURL('tel:+2789857143')
  }

  const handleEmailPress = () => {
    Linking.openURL('mailto:eshop@gmail.com')
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleWhatsAppPress} style={styles.option}>
        <View style={styles.leftGroup}>
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png',
            }}
            style={styles.whatsappIcon}
          />
          <Text style={styles.optionText}>WhatsApp Support</Text>
        </View>
        <Icon name="chevron-right" size={22} color="#888" />
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePhonePress} style={styles.option}>
        <View style={styles.leftGroup}>
          <Icon name="phone" size={24} color="green" style={styles.iconStyle} />
          <Text style={styles.optionText}>+27 789 857 143</Text>
        </View>
        <Icon name="chevron-right" size={22} color="#888" />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleEmailPress} style={styles.option}>
        <View style={styles.leftGroup}>
          <Icon name="email" size={24} color="green" style={styles.iconStyle} />
          <Text style={styles.optionText}>eshop@gmail.com</Text>
        </View>
        <Icon name="chevron-right" size={22} color="#888" />
      </TouchableOpacity>
    </View>
  )
}

export default Contact

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  // push chevron right
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // take all space except chevron
  },
  whatsappIcon: {
    width: 24,
    height: 24,
    marginRight: 15,
    borderRadius: 5,
  },
  iconStyle: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
})
