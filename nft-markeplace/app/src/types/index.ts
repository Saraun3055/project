// NFT Types
export interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  owner: User;
  creator: User;
  collection: Collection;
  likes: number;
  views: number;
  isListed: boolean;
  createdAt: string;
  traits: Trait[];
  chain: string;
}

export interface Trait {
  trait_type: string;
  value: string;
  display_type?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  banner: string;
  floorPrice: number;
  totalVolume: number;
  items: number;
  owners: number;
  creator: User;
  verified: boolean;
}

export interface User {
  id: string;
  address: string;
  username: string;
  email?: string;
  avatar: string;
  banner?: string;
  bio?: string;
  verified: boolean;
  followers: number;
  following: number;
  role?: 'user' | 'admin';
  walletAddress?: string;
  isBanned?: boolean;
}

export interface Activity {
  id: string;
  type: 'sale' | 'transfer' | 'mint' | 'listing' | 'offer';
  nft: NFT;
  from: User;
  to: User;
  price: number;
  currency: string;
  timestamp: string;
  txHash?: string;
}

export interface Offer {
  id: string;
  nft: NFT;
  buyer: User;
  price: number;
  currency: string;
  expiration: string;
  status: 'active' | 'accepted' | 'expired' | 'cancelled';
}

// Wallet Types
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  balance: string;
  provider: any;
  signer: any;
}

// Auth Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Filter Types
export interface NFTFilters {
  search?: string;
  sortBy?: 'recent' | 'price-low' | 'price-high' | 'popular';
  priceMin?: number;
  priceMax?: number;
  chain?: string;
  category?: string;
  status?: 'all' | 'buy-now' | 'auction';
}
