const express = require('express');
const cors = require('cors');
const app = express();
const tokenRoutes = require('./routes/tokenRoutes'); 

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (CORRECT USAGE)
app.use('/api', tokenRoutes); // ← No parentheses!

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});