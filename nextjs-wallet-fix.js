import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  ConnectionProvider,
  WalletProvider 
} from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Import styles at the _app.js level or use a CSS import
// import '@solana/wallet-adapter-react-ui/styles.css';

// Dynamically import wallet components with ssr: false to avoid hydration issues
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const WalletModalProviderDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletModalProvider,
  { ssr: false }
);

// Main App Component
const App = () => {
  // You can use devnet, testnet, or mainnet-beta
  const network = "devnet"; 
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Use state to track if we're on the client side
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProviderDynamic>
          {/* Only render wallet content when mounted on client side */}
          {mounted && <TokenCreator network={network} endpoint={endpoint} />}
        </WalletModalProviderDynamic>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Token Creator Component
const TokenCreator = ({ network, endpoint }) => {
  // ... rest of your component code from before
  
  // Replace all instances of WalletMultiButton with WalletMultiButtonDynamic
  // For example:
  const renderWalletConnection = () => (
    <div className="step-container">
      <h2>Step 1: Connect Your Wallet</h2>
      <p>Connect your Phantom or Solflare wallet to continue:</p>
      
      <div className="wallet-section">
        <WalletMultiButtonDynamic />
        
        {/* Rest of your wallet connection code */}
      </div>
    </div>
  );
  
  return (
    <div className="token-creator-container">
      <header>
        <h1>Solana Token Creator</h1>
        <div className="wallet-button">
          <WalletMultiButtonDynamic />
        </div>
      </header>
      
      {/* Rest of your component */}
    </div>
  );
};

export default App;
