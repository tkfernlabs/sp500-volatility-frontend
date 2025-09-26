const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Check if build directory exists
const buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
  console.error('Build directory does not exist. Please run npm run build first.');
  process.exit(1);
}

// Log all requests
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React build
app.use(express.static(buildPath));

// Handle React routing - must be after static files
app.use((req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server is running on http://0.0.0.0:${PORT}`);
  console.log(`Serving files from: ${buildPath}`);
});
