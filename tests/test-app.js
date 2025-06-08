const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('../src/routes/user.routes');
const errorHandler = require('../src/middleware/error.middleware');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api/v1/user', userRoutes);
app.use(errorHandler);

module.exports = app; 