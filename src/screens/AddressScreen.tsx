import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addAddress, removeAddress, setSelectedAddress, SavedAddress } from '../store/userSlice';
import { BackIcon } from '../components/Icons';
import { validateRequired, validatePincode } from '../utils/validators';

interface AddressScreenProps {
  onBack: () => void;
}

const ADDRESS_TYPES = ['Home', 'Work', 'Other'];
const TYPE_ICONS: Record<string, string> = { Home: '🏠', Work: '💼', Other: '📍' };

export const AddressScreen: React.FC<AddressScreenProps> = ({ onBack }) => {
  const dispatch = useDispatch();
  const { addresses, selectedAddressId } = useSelector((state: RootState) => state.user);

  const [showForm, setShowForm] = useState(false);
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setHouseNumber('');
    setStreet('');
    setCity('');
    setStateVal('');
    setPincode('');
    setAddressType('Home');
    setErrors({});
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    const houseErr = validateRequired(houseNumber, 'House/Flat Number');
    if (houseErr) { newErrors.houseNumber = houseErr; }
    const streetErr = validateRequired(street, 'Street / Landmark');
    if (streetErr) { newErrors.street = streetErr; }
    const cityErr = validateRequired(city, 'City');
    if (cityErr) { newErrors.city = cityErr; }
    const stateErr = validateRequired(stateVal, 'State');
    if (stateErr) { newErrors.state = stateErr; }
    const pincodeErr = validatePincode(pincode);
    if (pincodeErr) { newErrors.pincode = pincodeErr; }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) { return; }

    const fullAddress = `${houseNumber}, ${street}, ${city}, ${stateVal} - ${pincode}`;
    dispatch(addAddress({ label: addressType, fullAddress }));
    Alert.alert('Address Added ✅', `${addressType} address saved!`);
    resetForm();
    setShowForm(false);
  };

  const handleDelete = (addr: SavedAddress) => {
    Alert.alert(
      'Delete Address',
      `Remove "${addr.label}" address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(removeAddress(addr.id)),
        },
      ]
    );
  };

  const handleSelect = (id: string) => {
    dispatch(setSelectedAddress(id));
    Alert.alert('Address Selected ✅', 'This address will be used for delivery.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <BackIcon size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { setShowForm(v => !v); resetForm(); }}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>{showForm ? '✕' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Existing addresses list */}
          {addresses.length === 0 && !showForm && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📍</Text>
              <Text style={styles.emptyText}>No saved addresses yet</Text>
              <Text style={styles.emptySub}>Tap "+ Add" to add your first address</Text>
            </View>
          )}

          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;
            return (
              <View key={addr.id} style={[styles.addrCard, isSelected && styles.addrCardSelected]}>
                <View style={styles.addrCardTop}>
                  <View style={styles.addrLabelRow}>
                    <Text style={styles.addrIcon}>{TYPE_ICONS[addr.label] ?? '📍'}</Text>
                    <Text style={[styles.addrLabel, isSelected && styles.addrLabelSelected]}>{addr.label}</Text>
                    {isSelected && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(addr)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.addrText}>{addr.fullAddress}</Text>
                {!isSelected && (
                  <TouchableOpacity style={styles.selectBtn} onPress={() => handleSelect(addr.id)} activeOpacity={0.8}>
                    <Text style={styles.selectBtnText}>Use this address</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* Add new address form */}
          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>New Address</Text>

              {/* Address Type Picker */}
              <Text style={styles.label}>Address Type</Text>
              <View style={styles.typeContainer}>
                {ADDRESS_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, addressType === type && styles.typeChipActive]}
                    onPress={() => setAddressType(type)}
                  >
                    <Text style={[styles.typeChipText, addressType === type && styles.typeChipTextActive]}>
                      {TYPE_ICONS[type]} {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>House / Flat Number</Text>
                <TextInput
                  style={[styles.input, errors.houseNumber ? styles.inputError : null]}
                  placeholder="e.g. Flat 402, Block A"
                  placeholderTextColor="#999"
                  value={houseNumber}
                  onChangeText={(t) => { setHouseNumber(t); setErrors(p => ({ ...p, houseNumber: '' })); }}
                />
                {errors.houseNumber ? <Text style={styles.errorText}>{errors.houseNumber}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Street / Landmark</Text>
                <TextInput
                  style={[styles.input, errors.street ? styles.inputError : null]}
                  placeholder="e.g. Springdale Apartments, 12th Main"
                  placeholderTextColor="#999"
                  value={street}
                  onChangeText={(t) => { setStreet(t); setErrors(p => ({ ...p, street: '' })); }}
                />
                {errors.street ? <Text style={styles.errorText}>{errors.street}</Text> : null}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={[styles.input, errors.city ? styles.inputError : null]}
                    placeholder="Bengaluru"
                    placeholderTextColor="#999"
                    value={city}
                    onChangeText={(t) => { setCity(t); setErrors(p => ({ ...p, city: '' })); }}
                  />
                  {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    style={[styles.input, errors.state ? styles.inputError : null]}
                    placeholder="Karnataka"
                    placeholderTextColor="#999"
                    value={stateVal}
                    onChangeText={(t) => { setStateVal(t); setErrors(p => ({ ...p, state: '' })); }}
                  />
                  {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Pincode</Text>
                <TextInput
                  style={[styles.input, errors.pincode ? styles.inputError : null]}
                  placeholder="560038"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={pincode}
                  onChangeText={(t) => { setPincode(t); setErrors(p => ({ ...p, pincode: '' })); }}
                />
                {errors.pincode ? <Text style={styles.errorText}>{errors.pincode}</Text> : null}
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111', flex: 1, textAlign: 'center' },
  addBtn: { backgroundColor: '#FF5200', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  emptySub: { fontSize: 13, color: '#888' },

  // Address Card
  addrCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: '#EFEFEF',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  addrCardSelected: {
    borderColor: '#FF5200', backgroundColor: '#FFF9F7',
  },
  addrCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addrLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addrIcon: { fontSize: 18 },
  addrLabel: { fontSize: 15, fontWeight: '800', color: '#333' },
  addrLabelSelected: { color: '#FF5200' },
  activeBadge: { backgroundColor: '#FF5200', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  activeBadgeText: { fontSize: 9, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  deleteIcon: { fontSize: 18 },
  addrText: { fontSize: 13, color: '#555', lineHeight: 19, fontWeight: '500', marginBottom: 10 },
  selectBtn: {
    alignSelf: 'flex-start', backgroundColor: '#FFF0E6', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#FFD5C0',
  },
  selectBtnText: { color: '#FF5200', fontSize: 12, fontWeight: '800' },

  // Form Card
  formCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginTop: 8,
    borderWidth: 1, borderColor: '#EFEFEF',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  formTitle: { fontSize: 16, fontWeight: '900', color: '#111', marginBottom: 16 },
  typeContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#E2E2E2', backgroundColor: '#FFF' },
  typeChipActive: { borderColor: '#FF5200', backgroundColor: '#FFF0E6' },
  typeChipText: { fontSize: 13, color: '#666', fontWeight: '600' },
  typeChipTextActive: { color: '#FF5200', fontWeight: '800' },
  inputContainer: { marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { borderWidth: 1.5, borderColor: '#E2E2E2', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111', backgroundColor: '#FAF9F6' },
  inputError: { borderColor: '#C62828' },
  errorText: { color: '#C62828', fontSize: 11, fontWeight: '600', marginTop: 4 },
  saveBtn: {
    backgroundColor: '#FF5200', paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    marginTop: 8, elevation: 3, shadowColor: '#FF5200', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
