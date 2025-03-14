import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import '@solana/wallet-adapter-react-ui/styles.css';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { useEffect, useMemo, useState } from 'react';
import '../styles/globals.css'; // ← This line is correct now

const WalletModalProviderDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletModalProvider,
  { ssr: false }
);

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);
  const network = "devnet";
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  useEffect(() => setMounted(true), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProviderDynamic>
          <Head>
            <title>Solana Token Creator</title>
            <meta name="description" content="Create your own Solana token" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          {mounted && <Component {...pageProps} />}
        </WalletModalProviderDynamic>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;