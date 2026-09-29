import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { loginRestaurant } from '../utils/authService';

interface Props {
  onLoginSuccess: (restaurantId: string) => void | Promise<void>;
  onBack: () => void;
}

export const RestaurantLoginScreen: React.FC<Props> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Restaurant email and password are required.');
      return;
    }

    setError('');
    setIsLoading(true);
    const result = await loginRestaurant(email, password);
    if (!result.success || !result.session) {
      setError(result.error || 'Restaurant authentication failed.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    try {
      await onLoginSuccess(result.session.restaurantId);
    } catch {
      setError('Unable to open the restaurant dashboard.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Restaurant Partner Login</Text>
        <Text style={styles.subtitle}>Manage your orders, menu, and payouts</Text>

        <TextInput 
          style={styles.input} 
          placeholder="Restaurant Email" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginBtnText}>{isLoading ? 'Signing in...' : 'Login to Dashboard'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backBtn: { padding: 16 },
  backText: { fontSize: 16, color: '#FF5200', fontWeight: 'bold' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 32 },
  input: {
    borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16
  },
  loginBtn: {
    backgroundColor: '#FF5200', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: '#D32F2F', marginBottom: 8 }
});
