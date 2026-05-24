// backend/src/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const generateRouter = require('./routes/generate');
const historyRouter = require('./routes/history');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/generate', generateRouter);
app.use('/api/history', historyRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
