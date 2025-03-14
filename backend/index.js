import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Transaction } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';

// Default styles from Solana Wallet Adapter
// START OF CORRECTED LINES 20-57
import '@solana/wallet-adapter-react-ui/styles.css';

// Main App Component
const TokenCreator = dynamic(
  () => import('../components/TokenCreator'),
  { 
    ssr: false,
    loading: () => <div className="loading">Loading Token Creator...</div>
  }
);

const App = () => {
  // Network configuration
  const network = "devnet";
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Wallet adapters setup
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [] // Empty dependency array means this only runs once
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* Only this TokenCreator reference remains */}
          <TokenCreator network={network} endpoint={endpoint} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );

// END OF CORRECTED LINES
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);
  
  // Token Details (Step 2)
  const [tokenDetails, setTokenDetails] = useState({
    name: '',
    symbol: '',
    supply: '',
    decimals: 6,
    logo: null,
    website: '',
    twitter: '',
    telegram: ''
  });

  // Token Configuration (Step 3)
  const [tokenConfig, setTokenConfig] = useState({
    mintAuthority: true,
    freezeAuthority: true
  });

  // Liquidity Setup (Step 5)
  const [liquiditySetup, setLiquiditySetup] = useState({
    enabled: false,
    solAmount: '',
    tokenAmount: '',
    exchange: 'raydium'
  });

  // Fetch wallet balance when connected
  useEffect(() => {
    const getBalance = async () => {
      if (publicKey) {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / 1000000000); // Convert lamports to SOL
      } else {
        setBalance(null);
      }
    };

    getBalance();
  }, [connection, publicKey]);

  // Handle token details form changes
  const handleTokenDetailsChange = (e) => {
    const { name, value } = e.target;
    setTokenDetails(prev => ({ ...prev, [name]: value }));
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      setTokenDetails(prev => ({ ...prev, logo: file }));
    }
  };

  // Handle token configuration changes
  const handleTokenConfigChange = (e) => {
    const { name, checked } = e.target;
    setTokenConfig(prev => ({ ...prev, [name]: checked }));
  };

  // Handle liquidity setup changes
  const handleLiquiditySetupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLiquiditySetup(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Calculate token amount for liquidity based on SOL input
  useEffect(() => {
    if (liquiditySetup.solAmount && tokenDetails.supply) {
      // Simple calculation - can be improved with more complex pricing models
      const tokenAmount = parseFloat(liquiditySetup.solAmount) * 
                          (parseFloat(tokenDetails.supply) / 100);
      setLiquiditySetup(prev => ({ 
        ...prev, 
        tokenAmount: tokenAmount.toString() 
      }));
    }
  }, [liquiditySetup.solAmount, tokenDetails.supply]);

  // Deploy token function
  const deployToken = async () => {
    setIsDeploying(true);
    
    try {
      // Format data for the backend
      const formData = new FormData();
      formData.append('tokenName', tokenDetails.name);
      formData.append('tokenSymbol', tokenDetails.symbol);
      formData.append('tokenSupply', tokenDetails.supply);
      formData.append('tokenDecimals', tokenDetails.decimals);
      formData.append('mintAuthority', tokenConfig.mintAuthority);
      formData.append('freezeAuthority', tokenConfig.freezeAuthority);
      formData.append('userPublicKey', publicKey.toString());
      formData.append('network', network);
      
      if (tokenDetails.logo) {
        formData.append('logo', tokenDetails.logo);
      }
      
      if (tokenDetails.website) {
        formData.append('website', tokenDetails.website);
      }
      
      if (tokenDetails.twitter) {
        formData.append('twitter', tokenDetails.twitter);
      }
      
      if (tokenDetails.telegram) {
        formData.append('telegram', tokenDetails.telegram);
      }
      
      // Setup liquidity if enabled
      if (liquiditySetup.enabled) {
        formData.append('setupLiquidity', true);
        formData.append('solAmount', liquiditySetup.solAmount);
        formData.append('tokenAmount', liquiditySetup.tokenAmount);
        formData.append('exchange', liquiditySetup.exchange);
      }
      
      // In a real app, send this to your backend
      // const response = await fetch('https://your-api.com/create-token', {
      //   method: 'POST',
      //   body: formData
      // });
      
      // const data = await response.json();
      
      // Mock response for demonstration
      const mockResponse = {
        success: true,
        tokenMint: '7XSvs4SfuJMJEjrR9WrWwVLNMly5XVC8GW12ZpcBCsRJ',
        transaction: '...base64 encoded transaction...'
      };
      
      if (mockResponse.success) {
        // In a real app, deserialize the transaction
        // const transaction = Transaction.from(
        //   Buffer.from(mockResponse.transaction, 'base64')
        // );
        
        // For demo purposes, create a mock transaction
        const transaction = new Transaction();
        
        // Sign the transaction
        // In a real app, this would be:
        // const signedTx = await signTransaction(transaction);
        
        // Send the signed transaction
        // const signature = await connection.sendRawTransaction(signedTx.serialize());
        
        setDeploymentResult({
          success: true,
          tokenMint: mockResponse.tokenMint,
          signature: '5UwjJxZykMB7KV6re9e7xNHeQZV8nwmHwnHWVLihCKLFQcqm9PUZ52kCvCNpvj9PCnRnVNcGm1joS7PZAzWCbGug'
        });
        
        // If liquidity was set up, go to final step
        if (liquiditySetup.enabled) {
          setCurrentStep(5);
        } else {
          setCurrentStep(5);
        }
      } else {
        setDeploymentResult({
          success: false,
          error: 'Failed to deploy token'
        });
      }
    } catch (error) {
      console.error('Error deploying token:', error);
      setDeploymentResult({
        success: false,
        error: error.message || 'Failed to deploy token'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1: 
        return renderWalletConnection();
      case 2: 
        return renderTokenDetailsForm();
      case 3: 
        return renderTokenConfiguration();
      case 4: 
        return renderTokenDeployment();
      case 5: 
        return liquiditySetup.enabled ? renderLiquiditySetup() : renderResults();
      default: 
        return renderWalletConnection();
    }
  };

  // Step 1: Wallet Connection
  const renderWalletConnection = () => (
    <div className="step-container">
      <h2>Step 1: Connect Your Wallet</h2>
      <p>Connect your Phantom or Solflare wallet to continue:</p>
      
      <div className="wallet-section">
        <WalletMultiButton />
        
        {connected ? (
          <div className="wallet-info">
            <p>✓ Wallet Connected: {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}</p>
            <p>Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
            
            {balance !== null && balance < 0.05 && (
              <div className="warning">
                <p>⚠️ Your balance is low. You'll need SOL to pay for transaction fees and token creation.</p>
              </div>
            )}
            
            {balance !== null && balance >= 0.05 && (
              <button 
                className="next-button"
                onClick={() => setCurrentStep(2)}
              >
                Next: Token Details
              </button>
            )}
          </div>
        ) : (
          <p>Please connect your wallet to continue.</p>
        )}
      </div>
    </div>
  );

  // Step 2: Token Details Form
  const renderTokenDetailsForm = () => (
    <div className="step-container">
      <h2>Step 2: Token Details</h2>
      <p>Enter the details for your new token:</p>
      
      <form className="token-form">
        <div className="form-group">
          <label htmlFor="name">Token Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={tokenDetails.name}
            onChange={handleTokenDetailsChange}
            placeholder="e.g., My Awesome Token"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="symbol">Token Symbol:</label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            value={tokenDetails.symbol}
            onChange={handleTokenDetailsChange}
            placeholder="e.g., MAT"
            maxLength={10}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="supply">Token Supply:</label>
          <input
            type="text"
            id="supply"
            name="supply"
            value={tokenDetails.supply}
            onChange={handleTokenDetailsChange}
            placeholder="e.g., 1000000000"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="decimals">Decimals:</label>
          <select
            id="decimals"
            name="decimals"
            value={tokenDetails.decimals}
            onChange={handleTokenDetailsChange}
          >
            <option value={0}>0</option>
            <option value={2}>2</option>
            <option value={6}>6 (standard)</option>
            <option value={9}>9</option>
          </select>
        </div>
        
        <h3>Meme Assets (Optional)</h3>
        
        <div className="form-group">
          <label htmlFor="logo">Token Logo:</label>
          <input
            type="file"
            id="logo"
            name="logo"
            accept="image/*"
            onChange={handleLogoUpload}
          />
          {tokenDetails.logo && (
            <div className="logo-preview">
              <p>Logo selected: {tokenDetails.logo.name}</p>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="website">Website:</label>
          <input
            type="url"
            id="website"
            name="website"
            value={tokenDetails.website}
            onChange={handleTokenDetailsChange}
            placeholder="https://your-website.com"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="twitter">Twitter:</label>
          <input
            type="text"
            id="twitter"
            name="twitter"
            value={tokenDetails.twitter}
            onChange={handleTokenDetailsChange}
            placeholder="@yourtwitter"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="telegram">Telegram:</label>
          <input
            type="text"
            id="telegram"
            name="telegram"
            value={tokenDetails.telegram}
            onChange={handleTokenDetailsChange}
            placeholder="t.me/yourtelegram"
          />
        </div>
        
        <div className="form-buttons">
          <button 
            type="button" 
            className="back-button"
            onClick={() => setCurrentStep(1)}
          >
            Back
          </button>
          <button 
            type="button" 
            className="next-button"
            onClick={() => setCurrentStep(3)}
            disabled={!tokenDetails.name || !tokenDetails.symbol || !tokenDetails.supply}
          >
            Next: Configuration
          </button>
        </div>
      </form>
    </div>
  );

  // Step 3: Token Configuration
  const renderTokenConfiguration = () => (
    <div className="step-container">
      <h2>Step 3: Token Configuration</h2>
      <p>Configure advanced options for your token:</p>
      
      <form className="token-form">
        <div className="config-section">
          <h3>Authority Settings</h3>
          <p>These settings determine who can control certain aspects of your token:</p>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="mintAuthority"
              name="mintAuthority"
              checked={tokenConfig.mintAuthority}
              onChange={handleTokenConfigChange}
            />
            <label htmlFor="mintAuthority">
              <strong>Mint Authority:</strong> Allow future minting of tokens
              <p className="help-text">If enabled, you'll be able to create more tokens in the future. For a fixed supply, disable this option.</p>
            </label>
          </div>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="freezeAuthority"
              name="freezeAuthority"
              checked={tokenConfig.freezeAuthority}
              onChange={handleTokenConfigChange}
            />
            <label htmlFor="freezeAuthority">
              <strong>Freeze Authority:</strong> Allow freezing token accounts
              <p className="help-text">If enabled, you'll have the ability to freeze token accounts. For full decentralization, disable this option.</p>
            </label>
          </div>
        </div>
        
        <div className="form-buttons">
          <button 
            type="button" 
            className="back-button"
            onClick={() => setCurrentStep(2)}
          >
            Back
          </button>
          <button 
            type="button" 
            className="next-button"
            onClick={() => setCurrentStep(4)}
          >
            Next: Deployment
          </button>
        </div>
      </form>
    </div>
  );

  // Step 4: Token Deployment
  const renderTokenDeployment = () => (
    <div className="step-container">
      <h2>Step 4: Deploy Token</h2>
      
      <div className="deployment-summary">
        <h3>Summary</h3>
        <p>You're about to create the following token on {network}:</p>
        
        <div className="summary-details">
          <div className="summary-row">
            <span>Name:</span>
            <span>{tokenDetails.name}</span>
          </div>
          <div className="summary-row">
            <span>Symbol:</span>
            <span>{tokenDetails.symbol}</span>
          </div>
          <div className="summary-row">
            <span>Supply:</span>
            <span>{tokenDetails.supply} tokens</span>
          </div>
          <div className="summary-row">
            <span>Decimals:</span>
            <span>{tokenDetails.decimals}</span>
          </div>
          <div className="summary-row">
            <span>Mint Authority:</span>
            <span>{tokenConfig.mintAuthority ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="summary-row">
            <span>Freeze Authority:</span>
            <span>{tokenConfig.freezeAuthority ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
        
        <div className="liquidity-option">
          <h3>Liquidity Setup (Optional)</h3>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="setupLiquidity"
              name="enabled"
              checked={liquiditySetup.enabled}
              onChange={handleLiquiditySetupChange}
            />
            <label htmlFor="setupLiquidity">
              Set up a liquidity pool after token creation
            </label>
          </div>
          
          {liquiditySetup.enabled && (
            <div className="liquidity-form">
              <div className="form-group">
                <label htmlFor="exchange">Exchange:</label>
                <select
                  id="exchange"
                  name="exchange"
                  value={liquiditySetup.exchange}
                  onChange={handleLiquiditySetupChange}
                >
                  <option value="raydium">Raydium</option>
                  <option value="orca">Orca</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="solAmount">SOL to deposit:</label>
                <input
                  type="number"
                  id="solAmount"
                  name="solAmount"
                  value={liquiditySetup.solAmount}
                  onChange={handleLiquiditySetupChange}
                  placeholder="e.g., 1.0"
                  min="0.1"
                  step="0.1"
                />
                <p className="help-text">
                  Maximum: {Math.max(0, (balance || 0) - 0.02).toFixed(2)} SOL
                </p>
              </div>
              
              <div className="form-group">
                <label htmlFor="tokenAmount">Tokens to deposit:</label>
                <input
                  type="text"
                  id="tokenAmount"
                  name="tokenAmount"
                  value={liquiditySetup.tokenAmount}
                  readOnly
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="deployment-action">
          <p className="fee-note">
            Note: Token creation requires a small amount of SOL to cover network fees.
          </p>
          
          <div className="form-buttons">
            <button 
              type="button" 
              className="back-button"
              onClick={() => setCurrentStep(3)}
              disabled={isDeploying}
            >
              Back
            </button>
            <button 
              type="button" 
              className="deploy-button"
              onClick={deployToken}
              disabled={isDeploying}
            >
              {isDeploying ? 'Deploying...' : 'Create Token'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 5: Liquidity Setup (if enabled)
  const renderLiquiditySetup = () => (
    <div className="step-container">
      <h2>Step 5: Liquidity Setup</h2>
      
      {deploymentResult && deploymentResult.success ? (
        <div className="success-message">
          <h3>Token Created Successfully!</h3>
          <p>Your token has been created on the Solana {network}.</p>
          <p>Token Address: <a href={`https://explorer.solana.com/address/${deploymentResult.tokenMint}?cluster=${network}`} target="_blank" rel="noopener noreferrer">{deploymentResult.tokenMint}</a></p>
          
          <h3>Liquidity Pool Setup</h3>
          <p>Setting up a liquidity pool with:</p>
          <ul>
            <li>{liquiditySetup.solAmount} SOL</li>
            <li>{liquiditySetup.tokenAmount} {tokenDetails.symbol} tokens</li>
            <li>Exchange: {liquiditySetup.exchange}</li>
          </ul>
          
          <p>This process requires signing additional transactions.</p>
          
          <button 
            className="setup-liquidity-button"
            onClick={() => {
              // In a real app, this would start the liquidity setup process
              setCurrentStep(6);
            }}
          >
            Setup Liquidity Pool
          </button>
        </div>
      ) : (
        <div className="error-message">
          <h3>Error Creating Token</h3>
          <p>{deploymentResult?.error || 'An unknown error occurred'}</p>
          <button 
            className="retry-button"
            onClick={() => setCurrentStep(4)}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );

  // Final Results
  const renderResults = () => (
    <div className="step-container">
      <h2>Token Creation Complete</h2>
      
      {deploymentResult && deploymentResult.success ? (
        <div className="success-message">
          <h3>Congratulations!</h3>
          <p>Your token has been created on the Solana {network}.</p>
          
          <div className="token-details">
            <div className="detail-row">
              <span>Token Name:</span>
              <span>{tokenDetails.name}</span>
            </div>
            <div className="detail-row">
              <span>Token Symbol:</span>
              <span>{tokenDetails.symbol}</span>
            </div>
            <div className="detail-row">
              <span>Token Address:</span>
              <a 
                href={`https://explorer.solana.com/address/${deploymentResult.tokenMint}?cluster=${network}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {deploymentResult.tokenMint}
              </a>
            </div>
            <div className="detail-row">
              <span>Transaction:</span>
              <a 
                href={`https://explorer.solana.com/tx/${deploymentResult.signature}?cluster=${network}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on Explorer
              </a>
            </div>
          </div>
          
          <div className="next-steps">
            <h3>Next Steps</h3>
            <ul>
              <li>Add your token to wallets using the token address</li>
              <li>Create a website and community for your token</li>
              <li>Consider setting up liquidity pools for trading</li>
            </ul>
          </div>
          
          <button 
            className="new-token-button"
            onClick={() => {
              // Reset all form values and go back to step 1
              setTokenDetails({
                name: '',
                symbol: '',
                supply: '',
                decimals: 6,
                logo: null,
                website: '',
                twitter: '',
                telegram: ''
              });
              setTokenConfig({
                mintAuthority: true,
                freezeAuthority: true
              });
              setLiquiditySetup({
                enabled: false,
                solAmount: '',
                tokenAmount: '',
                exchange: 'raydium'
              });
              setDeploymentResult(null);
              setCurrentStep(1);
            }}
          >
            Create Another Token
          </button>
        </div>
      ) : (
        <div className="error-message">
          <h3>Error Creating Token</h3>
          <p>{deploymentResult?.error || 'An unknown error occurred'}</p>
          <button 
            className="retry-button"
            onClick={() => setCurrentStep(4)}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="token-creator-container">
      <header>
        <h1>Solana Token Creator</h1>
        <div className="wallet-button">
          <WalletMultiButton />
        </div>
      </header>
      
      <div className="progress-bar">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-name">Wallet</div>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-name">Details</div>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-name">Config</div>
        </div>
        <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-name">Deploy</div>
        </div>
        <div className={`progress-step ${currentStep >= 5 ? 'active' : ''}`}>
          <div className="step-number">5</div>
          <div className="step-name">{liquiditySetup.enabled ? 'Liquidity' : 'Complete'}</div>
        </div>
      </div>
      
      <main>
        {renderStep()}
      </main>
      
      <footer>
        <p>Current Network: {network}</p>
      </footer>
      
      {/* CSS styles for the application */}
      <style jsx>{`
        .token-creator-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        h1 {
          font-size: 24px;
          color: #222;
          margin: 0;
        }
        
        .progress-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          position: relative;
        }
        
        .progress-bar::before {
          content: '';
          position: absolute;
          top: 15px;
          left: 0;
          right: 0;
          height: 2px;
          background: #e0e0e0;
          z-index: 1;
        }
        
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }
        
        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .progress-step.active .step-number {
          background: #9945FF;
          color: white;
        }
        
        .step-name {
          font-size: 12px;
          color: #666;
        }
        
        .progress-step.active .step-name {
          color: #9945FF;
          font-weight: bold;
        }
        
        .step-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .wallet-section {
          margin-top: 20px;
        }
        
        .wallet-info {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .warning {
          padding: 10px;
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
          margin: 15px 0;
        }
        
        .token-form {
          margin-top: 20px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .form-group.checkbox {
          display: flex;
          align-items: flex-start;
        }
        
        .form-group.checkbox input {
          width: auto;
          margin-right: 10px;
          margin-top: 3px;
        }
        
        .form-group.checkbox label {
          flex: 1;
        }
        
        .help-text {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        
        .form-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
        }
        
        button {
          padding: 10px 20px;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .next-button {
          background: #9945FF;
          color: white;
          border: none;
        }
        
        .next-button:hover {
          background: #8a35f0;
        }
        
        .next-button:disabled {
          background: #d3aeff;
          cursor: not-allowed;
        }
        
        .back-button {
          background: white;
          color: #666;
          border: 1px solid #ddd;
        }
        
        .back-button:hover {
          background: #f5f5f5;
        }
        
        .back-button:disabled {
          color: #ccc;
          border-color: #eee;
          cursor: not-allowed;
        }
        
        .deploy-button {
          background: #14F195;
          color: #000;
          border: none;
        }
        
        .deploy-button:hover {
          background: #0ad680;
        }
        
        .deploy-button:disabled {
          background: #a5f5d3;
          cursor: not-allowed;
        }
        
        .deployment-summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
        }
        
        .summary-details {
          margin: 20px 0;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        
        .summary-row:last-child {
          border-bottom: none;
        }
        
        .liquidity-option {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .liquidity-form {
          margin-top: 15px;
          padding: 15px;
          background: white;
          border-radius: 6px;
          border: 1px solid #eee;
        }
        
        .fee-note {
          margin: 20px 0;
          padding: 10px;
          background: #e8f4fd;
          border-left: 4px solid #0d6efd;
          border-radius: 4px;
        }
        
        .success-message {
          text-align: center;
          padding: 20px;
        }
        
        .token-details {
          margin: 30px auto;
          max-width: 500px;
          text-align: left;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .next-steps {
          margin: 30px auto;
          max-width: 500px;
          text-align: left;
        }
        
        .next-steps ul {
          padding-left: 20px;
        }
        
        .next-steps li {
          margin-bottom: 10px;
        }
        
        .new-token-button,
        .setup-liquidity-button {
          background: #9945FF;
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 16px;
          border-radius: 4px;
          margin-top: 20px;
        }
        
        .new-token-button:hover,
        .setup-liquidity-button:hover {
          background: #8a35f0;
        }
        
        .retry-button {
          background: #dc3545;
          color: white;
          border: none;
          margin-top: 20px;
        }
        
        .retry-button:hover {
          background: #c82333;
        }
        
        .error-message {
          text-align: center;
          color: #721c24;
          background-color: #f8d7da;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        
        footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default App;