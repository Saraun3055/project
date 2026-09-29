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
  Switch,
  Modal,
  Alert
} from 'react-native';
import { BackIcon } from '../components/Icons';
import {
  validateFullName,
  validateMobile,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
  validateTerms,
} from '../utils/validators';

interface RegisterScreenProps {
  onRegisterSuccess: (data: { fullName: string; mobileNumber: string; email: string; password: string; address: string; dob: string }) => void;
  onBack: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegisterSuccess, onBack }) => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState('1');
  const [selectedMonth, setSelectedMonth] = useState('Jan');
  const [selectedYear, setSelectedYear] = useState('2000');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const years = Array.from({ length: 100 }, (_, i) => (2026 - i).toString());

  const handleConfirmDate = () => {
    setDob(`${selectedDay} ${selectedMonth} ${selectedYear}`);
    setShowDatePicker(false);
  };

  // Experiment 6: full validation is applied before submission. Each invalid field
  // gets an error message below it, and submission is blocked until all errors clear.
  const handleRegister = () => {
    const newErrors: Record<string, string> = {};

    const fullNameErr = validateFullName(fullName);
    if (fullNameErr) newErrors.fullName = fullNameErr;

    const mobileErr = validateMobile(mobileNumber);
    if (mobileErr) newErrors.mobileNumber = mobileErr;

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const passwordErr = validatePassword(password);
    if (passwordErr) newErrors.password = passwordErr;

    const confirmErr = validateConfirmPassword(password, confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    const dobErr = validateRequired(dob, 'Date of Birth');
    if (dobErr) newErrors.dob = dobErr;

    const cityErr = validateRequired(city, 'City');
    if (cityErr) newErrors.city = cityErr;

    const addressErr = validateRequired(address, 'Address');
    if (addressErr) newErrors.address = addressErr;

    const termsErr = validateTerms(acceptTerms);
    if (termsErr) newErrors.acceptTerms = termsErr;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    Alert.alert('Registration Successful ✅', 'Your account has been created successfully!');
    onRegisterSuccess({ fullName, mobileNumber, email, password, address, dob });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <BackIcon size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionTitle}>Personal Details</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName ? styles.inputError : null]}
              placeholder="John Doe"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                setErrors((prev) => ({ ...prev, fullName: '' }));
              }}
            />
            {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={[styles.input, errors.mobileNumber ? styles.inputError : null]}
              placeholder="+91 9876543210"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={(t) => {
                setMobileNumber(t);
                setErrors((prev) => ({ ...prev, mobileNumber: '' }));
              }}
            />
            {errors.mobileNumber ? <Text style={styles.errorText}>{errors.mobileNumber}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="johndoe@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderChip, gender === g && styles.genderChipActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderChipText, gender === g && styles.genderChipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={[styles.input, errors.dob ? styles.inputError : null]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={{ color: dob ? '#111' : '#999', fontSize: 15 }}>
                {dob || 'Select Date'}
              </Text>
            </TouchableOpacity>
            {errors.dob ? <Text style={styles.errorText}>{errors.dob}</Text> : null}
          </View>

          <Text style={styles.sectionTitle}>Account Security</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
            />
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={[styles.input, errors.city ? styles.inputError : null]}
              placeholder="Bengaluru"
              placeholderTextColor="#999"
              value={city}
              onChangeText={(t) => {
                setCity(t);
                setErrors((prev) => ({ ...prev, city: '' }));
              }}
            />
            {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.address ? styles.inputError : null]}
              placeholder="Full Address"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={address}
              onChangeText={(t) => {
                setAddress(t);
                setErrors((prev) => ({ ...prev, address: '' }));
              }}
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          </View>

          <View style={styles.termsContainer}>
            <Switch
              value={acceptTerms}
              onValueChange={(v) => {
                setAcceptTerms(v);
                setErrors((prev) => ({ ...prev, acceptTerms: '' }));
              }}
              trackColor={{ false: '#767577', true: '#FF9E71' }}
              thumbColor={acceptTerms ? '#FF5200' : '#f4f3f4'}
            />
            <Text style={styles.termsText}>I accept the Terms and Conditions</Text>
          </View>
          {errors.acceptTerms ? <Text style={styles.errorText}>{errors.acceptTerms}</Text> : null}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerTitle}>Select Date of Birth</Text>

            <View style={styles.pickersWrapper}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView showsVerticalScrollIndicator={false} snapToInterval={40} decelerationRate="fast">
                  {days.map(d => (
                    <TouchableOpacity key={d} style={styles.pickerItem} onPress={() => setSelectedDay(d)}>
                      <Text style={[styles.pickerItemText, selectedDay === d && styles.pickerItemTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView showsVerticalScrollIndicator={false} snapToInterval={40} decelerationRate="fast">
                  {months.map(m => (
                    <TouchableOpacity key={m} style={styles.pickerItem} onPress={() => setSelectedMonth(m)}>
                      <Text style={[styles.pickerItemText, selectedMonth === m && styles.pickerItemTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView showsVerticalScrollIndicator={false} snapToInterval={40} decelerationRate="fast">
                  {years.map(y => (
                    <TouchableOpacity key={y} style={styles.pickerItem} onPress={() => setSelectedYear(y)}>
                      <Text style={[styles.pickerItemText, selectedYear === y && styles.pickerItemTextActive]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmDateBtn} onPress={handleConfirmDate}>
              <Text style={styles.confirmDateBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  placeholder: {
    width: 36,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF5200',
    marginBottom: 16,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#C62828',
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    backgroundColor: '#FFF',
  },
  genderChipActive: {
    borderColor: '#FF5200',
    backgroundColor: '#FFF0E6',
  },
  genderChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  genderChipTextActive: {
    color: '#FF5200',
    fontWeight: '800',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  termsText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#FF5200',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: 400,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickersWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  pickerItemTextActive: {
    fontSize: 20,
    color: '#FF5200',
    fontWeight: '900',
  },
  confirmDateBtn: {
    backgroundColor: '#FF5200',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmDateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
