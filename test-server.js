const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Heartlink Dating App - Test Server Running');
});

const port = 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
});