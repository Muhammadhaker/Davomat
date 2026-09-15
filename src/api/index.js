const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Xatolik yuz berdi');
  return data;
}

// --- STUDENTS ---
export const getStudents = () => request('/students');

export const addStudent = (body) =>
  request('/students', { method: 'POST', body: JSON.stringify(body) });

export const updateStudent = (id, body) =>
  request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteStudent = (id) =>
  request(`/students/${id}`, { method: 'DELETE' });

// --- ATTENDANCE ---
export const getAttendance = (date) =>
  request(`/attendance?date=${date}`);

export const saveAttendance = (body) =>
  request('/attendance/save', { method: 'POST', body: JSON.stringify(body) });

export const getHistory = () => request('/attendance/history');

export const getExportData = (date) =>
  request(`/attendance/export?date=${date}`);
