const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// MongoDB ulanish
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB ga ulandi');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server ${process.env.PORT || 5000}-portda ishlamoqda`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB xatosi:', err.message);
    process.exit(1);
  });
