import React from 'react';
import { Wallet, ExternalLink } from 'lucide-react';

interface WalletConnectorProps {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletConnector({ 
  address, 
  balance, 
  isConnected, 
  isConnecting, 
  onConnect, 
  onDisconnect 
}: WalletConnectorProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{formatAddress(address)}</p>
              <p className="text-gray-400 text-sm">{parseFloat(balance).toFixed(4)} STT</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={`https://shannon-explorer.somnia.network/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onDisconnect}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <Wallet className="w-5 h-5" />
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
      <p className="text-gray-400 text-sm mt-2 text-center">
        Connect your wallet to start playing
      </p>
    </div>
  );
}