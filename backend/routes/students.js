const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /api/students — Barcha o'quvchilar
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ order: 1, createdAt: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/students — Yangi o'quvchi qo'shish
router.post('/', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Ism-familiya kiritilishi shart' });
    }
    // Tartib raqami uchun oxirgi o'quvchini topamiz
    const last = await Student.findOne().sort({ order: -1 });
    const order = last ? last.order + 1 : 1;

    const student = new Student({ name: name.trim(), phone: phone?.trim() || '', order });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/students/:id — O'quvchini tahrirlash
router.put('/:id', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Ism-familiya kiritilishi shart' });
    }
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), phone: phone?.trim() || '' },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'O\'quvchi topilmadi' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/students/:id — O'quvchini o'chirish
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'O\'quvchi topilmadi' });
    // Attendance recordlardan ham olib tashlaymiz
    const Attendance = require('../models/Attendance');
    await Attendance.updateMany(
      {},
      { $pull: { records: { student: req.params.id } } }
    );
    res.json({ message: 'O\'quvchi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
