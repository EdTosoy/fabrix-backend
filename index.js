require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');

const errorHandler = require('./middlewares/errorHandler');

const tenantRoutes = require('./routes/tenantRoutes');
const userRoutes = require('./routes/userRoutes');
const branchRoutes = require('./routes/branchRoutes');

app.use(express.json());

app.use('/api/tenants', tenantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);

// Global error handler must be after all routes.
app.use(errorHandler);

const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
.then(() => {
    console.log(`MongoDB connected successfully`)
    app.listen(PORT, () => console.log(`Server is running on server 5000`));
})
.catch((err) => console.log(`Connection error: ${err}`));
