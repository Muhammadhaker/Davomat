const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// GET /api/attendance?date=2025-01-15
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date parametri kerak' });
    const att = await Attendance.findOne({ date }).populate('records.student');
    res.json(att || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/history
router.get('/history', async (req, res) => {
  try {
    const history = await Attendance.find({}, { date: 1, savedAt: 1, records: 1 })
      .sort({ date: -1 }).limit(30);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/attendance/save — sabab ham saqlanadi
router.post('/save', async (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date) return res.status(400).json({ message: 'date kiritilishi shart' });

    const formatted = (records || []).map((r) => ({
      student: r.studentId,
      status:  r.status,
      sabab:   r.sabab || '',
    }));

    const att = await Attendance.findOneAndUpdate(
      { date },
      { records: formatted, savedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(att);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/export?date=2025-01-15
// Rangli Excel qaytaradi (ExcelJS orqali .xlsx buffer)
router.get('/export', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date parametri kerak' });

    const ExcelJS = require('exceljs');
    const att      = await Attendance.findOne({ date }).populate('records.student');
    const students = await Student.find().sort({ order: 1, createdAt: 1 });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Davomat';
    const ws = wb.addWorksheet('Davomat');

    // ----- SARLAVHA QATORI -----
    // Sana va guruh nomi
    const dateObj = new Date(date + 'T00:00:00');
    const months  = ['Yanvar','Fevral','Mart','Aprel','May','Iyun',
                     'Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
    const dateLabel = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    ws.mergeCells('A1:E1');
    const titleCell = ws.getCell('A1');
    titleCell.value = `DAVOMAT — ${dateLabel}`;
    titleCell.font  = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E4F7' } };
    ws.getRow(1).height = 30;

    // ----- USTUN SARLAVHALARI -----
    ws.addRow([]); // bo'sh qator
    const headerRow = ws.addRow(['#', 'Ism-familiya', 'Telefon', 'Davomat', 'Sabab']);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.font      = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B5BDB' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border    = {
        top:    { style: 'thin', color: { argb: 'FF2F4BB5' } },
        bottom: { style: 'thin', color: { argb: 'FF2F4BB5' } },
        left:   { style: 'thin', color: { argb: 'FF2F4BB5' } },
        right:  { style: 'thin', color: { argb: 'FF2F4BB5' } },
      };
    });

    // ----- STATUS RANG KONFIGURATSIYASI -----
    const statusConfig = {
      keldi:          { label: '✅ Keldi',          bg: 'FFD3F9D8', font: 'FF2F9E44' },
      kelmadi:        { label: '❌ Kelmadi',        bg: 'FFFFE3E3', font: 'FFC92A2A' },
      sababli:        { label: '🟡 Sababli',        bg: 'FFFFF3BF', font: 'FFE67700' },
      belgilanmagan:  { label: '— Belgilanmagan',   bg: 'FFF1F3F5', font: 'FF868E96' },
    };

    // ----- MA'LUMOT QATORLARI -----
    students.forEach((s, i) => {
      const rec = att?.records.find(
        (r) => r.student?._id?.toString() === s._id.toString()
      );
      const statusKey = rec?.status || 'belgilanmagan';
      const cfg       = statusConfig[statusKey];
      const phone     = s.phone ? `+998 ${s.phone}` : '';
      const sabab     = statusKey === 'sababli' ? (rec?.sabab || '') : '';

      const row = ws.addRow([i + 1, s.name, phone, cfg.label, sabab]);
      row.height = 20;

      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        // Davomat ustuniga rang
        if (colNum === 4) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cfg.bg } };
          cell.font = { bold: true, color: { argb: cfg.font }, size: 10 };
        } else {
          // Juft qatorlarga yengil kulrang fon
          if (i % 2 === 1) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
          }
          cell.font = { size: 10, color: { argb: 'FF1A1D2E' } };
        }
        cell.alignment = { vertical: 'middle', horizontal: colNum === 2 ? 'left' : 'center' };
        cell.border = {
          top:    { style: 'hair', color: { argb: 'FFDDE3F0' } },
          bottom: { style: 'hair', color: { argb: 'FFDDE3F0' } },
          left:   { style: 'hair', color: { argb: 'FFDDE3F0' } },
          right:  { style: 'hair', color: { argb: 'FFDDE3F0' } },
        };
      });
    });

    // ----- JAMI QATORI -----
    ws.addRow([]);
    const total     = students.length;
    const keldiSon  = att?.records.filter(r => r.status === 'keldi').length    || 0;
    const kelmSon   = att?.records.filter(r => r.status === 'kelmadi').length  || 0;
    const sababSon  = att?.records.filter(r => r.status === 'sababli').length  || 0;

    const sumRow = ws.addRow([
      '', 'JAMI:', '',
      `✅ ${keldiSon}  ❌ ${kelmSon}  🟡 ${sababSon}  / ${total}`,
      ''
    ]);
    sumRow.height = 22;
    sumRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { bold: true, size: 10, color: { argb: 'FF1E3A5F' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD6E4F7' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // ----- USTUN KENGLIKLARI -----
    ws.columns = [
      { key: 'num',    width: 5  },
      { key: 'name',   width: 30 },
      { key: 'phone',  width: 18 },
      { key: 'status', width: 16 },
      { key: 'sabab',  width: 28 },
    ];

    // ----- JAVOB -----
    res.setHeader('Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition',
      `attachment; filename="davomat_${date}.xlsx"`);

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
