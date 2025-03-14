// pages/_app.js
import React from 'react';
import Head from 'next/head';
import '../styles/globals.css'; // Make sure to create this file for global styles

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Solana Token Creator</title>
        <meta name="description" content="Create your own Solana token" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

// pages/index.js
import dynamic from 'next/dynamic';

// Use dynamic import with ssr: false to avoid hydration issues
const TokenCreatorApp = dynamic(
  () => import('../components/TokenCreator'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="container">
      <TokenCreatorApp />
    </div>
  );
}

// components/TokenCreator.js
// This would contain your main App component from before
import React from 'react';
// Import your modified App component
import App from '../components/App';

const TokenCreator = () => {
  return <App />;
};

export default TokenCreator;
