import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.send('Heartlink Dating App - Test Server Running');
});

const port = 3000; // Using different port to avoid conflicts
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
});