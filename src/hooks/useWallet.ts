import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types/game';

const SOMNIA_NETWORK = {
  chainId: '0xC458', // 50312 in hex
  chainName: 'Somnia Testnet',
  rpcUrls: ['https://rpc.ankr.com/somnia_testnet/6e3fd81558cf77b928b06b38e9409b4677b637118114e83364486294d5ff4811'],
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18,
  },
  blockExplorerUrls: ['https://shannon-explorer.somnia.network'],
};

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: '0',
    isConnected: false,
    isConnecting: false,
    provider: null,
    signer: null,
  });

  const updateBalance = async (provider: ethers.BrowserProvider, address: string) => {
    try {
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);
      setWallet(prev => ({ ...prev, balance: balanceInEth }));
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to play this game!');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Check if we're on the correct network
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(50312)) {
        try {
          // Try to switch to Somnia network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SOMNIA_NETWORK.chainId }],
          });
        } catch (switchError: any) {
          // If the network hasn't been added to MetaMask, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [SOMNIA_NETWORK],
            });
          } else {
            throw switchError;
          }
        }
      }

      setWallet({
        address,
        balance: '0',
        isConnected: true,
        isConnecting: false,
        provider,
        signer,
      });

      await updateBalance(provider, address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      balance: '0',
      isConnected: false,
      isConnecting: false,
      provider: null,
      signer: null,
    });
  };

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setWallet({
              address,
              balance: '0',
              isConnected: true,
              isConnecting: false,
              provider,
              signer,
            });

            await updateBalance(provider, address);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Refresh balance periodically
  useEffect(() => {
    if (wallet.isConnected && wallet.provider && wallet.address) {
      const interval = setInterval(() => {
        updateBalance(wallet.provider, wallet.address!);
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [wallet.isConnected, wallet.provider, wallet.address]);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    updateBalance: () => wallet.provider && wallet.address && updateBalance(wallet.provider, wallet.address),
  };
}