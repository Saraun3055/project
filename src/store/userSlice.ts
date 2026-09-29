import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SavedAddress {
  id: string;
  label: string; // Home, Work, Other
  fullAddress: string;
}

interface UserState {
  email: string;
  name: string;
  phone: string;
  addresses: SavedAddress[];
  selectedAddressId: string | null;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  email: '',
  name: '',
  phone: '+91 98765 43210',
  addresses: [
    {
      id: 'default',
      label: 'Home',
      fullAddress: 'Flat 402, Springdale Apartments, Indiranagar, Bengaluru - 560038',
    },
  ],
  selectedAddressId: 'default',
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserLogin: (state, action: PayloadAction<string>) => {
      const nextEmail = action.payload.trim().toLowerCase();
      const isDifferentAccount = state.email !== nextEmail;
      state.email = nextEmail;
      if (isDifferentAccount || !state.name) {
        state.name = nextEmail.split('@')[0];
      }
      if (isDifferentAccount) {
        state.phone = initialState.phone;
        state.addresses = initialState.addresses.map(address => ({ ...address }));
        state.selectedAddressId = initialState.selectedAddressId;
      }
      state.isLoggedIn = true;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<Omit<UserState, 'addresses' | 'selectedAddressId'>>>) => {
      if (action.payload.name !== undefined) { state.name = action.payload.name; }
      if (action.payload.email !== undefined) { state.email = action.payload.email; }
      if (action.payload.phone !== undefined) { state.phone = action.payload.phone; }
    },
    addAddress: (state, action: PayloadAction<Omit<SavedAddress, 'id'>>) => {
      const newId = `addr_${Date.now()}`;
      state.addresses.push({ id: newId, ...action.payload });
      if (!state.selectedAddressId) {
        state.selectedAddressId = newId;
      }
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(a => a.id !== action.payload);
      if (state.selectedAddressId === action.payload) {
        state.selectedAddressId = state.addresses[0]?.id ?? null;
      }
    },
    setSelectedAddress: (state, action: PayloadAction<string>) => {
      state.selectedAddressId = action.payload;
    },
    restoreAddresses: (state, action: PayloadAction<{ addresses: SavedAddress[]; selectedAddressId: string | null }>) => {
      if (action.payload.addresses.length > 0) {
        state.addresses = action.payload.addresses;
        state.selectedAddressId = action.payload.selectedAddressId;
      }
    },
    clearUserLogin: (state) => {
      state.email = '';
      state.name = '';
      state.phone = '';
      state.addresses = initialState.addresses.map(address => ({ ...address }));
      state.selectedAddressId = initialState.selectedAddressId;
      state.isLoggedIn = false;
    },
  },
});

export const {
  setUserLogin,
  updateUserProfile,
  addAddress,
  removeAddress,
  setSelectedAddress,
  restoreAddresses,
  clearUserLogin,
} = userSlice.actions;
export default userSlice.reducer;
