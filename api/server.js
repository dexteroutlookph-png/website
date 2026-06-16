const express = require('express');
const app = express();

const register = require('./register');

app.use(express.json());

// ROOT TEST
app.get('/', (req, res) => {
  res.send('Server is working');
});

// REGISTER ROUTE (POST ONLY)
app.post('/register', (req, res) => register(req, res));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});