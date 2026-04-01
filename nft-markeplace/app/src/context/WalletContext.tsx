import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  chainId: number | null;
  connect: (silent?: boolean) => Promise<void>;
  disconnect: () => void;
  getSigner: () => any;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [, setIsReconnecting] = useState(true);

  // Check if wallet was previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connect(true);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
      setIsReconnecting(false);
    };
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setAddress(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (newChainId: string) => {
        setChainId(parseInt(newChainId, 16));
        window.location.reload();
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connect = async (silent: boolean = false) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('Please install MetaMask to connect your wallet');
      return;
    }

    setIsConnecting(true);
    try {
      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();

        setAddress(address);
        setBalance(ethers.formatEther(balance));
        setChainId(Number(network.chainId));
        setProvider(provider);
        setIsConnected(true);
        
        if (!silent) {
          toast.success('Wallet connected successfully!');
        }
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
        console.error('Wallet connection error:', error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance('0');
    setChainId(null);
    setProvider(null);
    setIsConnected(false);
    toast.info('Wallet disconnected');
  };

  const getSigner = async () => {
    if (!provider) return null;
    return await provider.getSigner();
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        balance,
        chainId,
        connect,
        disconnect,
        getSigner,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
