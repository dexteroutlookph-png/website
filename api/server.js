const express = require('express');
const app = express();

const register = require('./register');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is working');
});

app.post('/register', register);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});