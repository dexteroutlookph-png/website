const express = require('express');
const app = express();

const register = require('./register');

app.use(express.json());

// THIS is your route
app.post('/register', register);

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});