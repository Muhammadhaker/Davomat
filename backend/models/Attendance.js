const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
          required: true,
        },
        status: {
          type: String,
          enum: ['keldi', 'kelmadi', 'sababli', null],
          default: null,
        },
        // Sababli bo'lganda sabab matni
        sabab: {
          type: String,
          default: '',
          trim: true,
        },
      },
    ],
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attendanceSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
