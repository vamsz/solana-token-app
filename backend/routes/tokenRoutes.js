// backend/routes/tokenRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const tokenService = require('../services/tokenServices');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Route to create a new token
router.post('/create-token', upload.single('logo'), async (req, res) => {
  try {
    // Extract parameters from request
    const {
      tokenName,
      tokenSymbol,
      tokenSupply,
      tokenDecimals,
      mintAuthority,
      freezeAuthority,
      userPublicKey,
      network,
      setupLiquidity,
      solAmount,
      tokenAmount,
      exchange,
      website,
      twitter,
      telegram
    } = req.body;

    // Validate required fields
    if (!tokenName || !tokenSymbol || !tokenSupply || !tokenDecimals || !userPublicKey || !network) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Prepare parameters for token creation
    const params = {
      tokenName,
      tokenSymbol,
      tokenSupply: parseFloat(tokenSupply),
      tokenDecimals: parseInt(tokenDecimals),
      mintAuthority: mintAuthority === 'true',
      freezeAuthority: freezeAuthority === 'true',
      userPublicKey,
      network,
      logoBuffer: req.file ? req.file.buffer : null,
      website,
      twitter,
      telegram
    };

    // Add liquidity parameters if setup is requested
    if (setupLiquidity === 'true') {
      params.setupLiquidity = true;
      params.solAmount = parseFloat(solAmount);
      params.tokenAmount = parseFloat(tokenAmount);
      params.exchange = exchange;
    }

    // Create the token
    const result = await tokenService.createToken(params);

    // Send response back to client
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in create-token route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    });
  }
});

// Route to setup liquidity pool
router.post('/setup-liquidity', async (req, res) => {
  try {
    // Extract parameters from request
    const {
      tokenMint,
      userPublicKey,
      solAmount,
      tokenAmount,
      exchange,
      network
    } = req.body;

    // Validate required fields
    if (!tokenMint || !userPublicKey || !solAmount || !tokenAmount || !exchange || !network) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Setup liquidity pool
    const result = await tokenService.setupLiquidityPool({
      tokenMint,
      userPublicKey,
      solAmount: parseFloat(solAmount),
      tokenAmount: parseFloat(tokenAmount),
      exchange,
      network
    });

    // Send response back to client
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in setup-liquidity route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    });
  }
});
// backend/routes/tokenRoutes.js
module.exports = router; // ← This must be the last line