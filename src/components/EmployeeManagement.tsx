import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  Search, 
  Phone, 
  Mail, 
  Briefcase, 
  Clock, 
  Shield, 
  UserCheck, 
  X,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Employee } from '../types';

export const EmployeeManagement: React.FC = () => {
  const { 
    employees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    toggleEmployeeStatus,
    setRole,
    setCurrentEmployee 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formPin, setFormPin] = useState('1234');
  const [formShiftStart, setFormShiftStart] = useState('08:00');
  const [formShiftEnd, setFormShiftEnd] = useState('17:00');

  const openAddModal = () => {
    setEditingEmployee(null);
    const nextNipNum = employees.length + 1;
    const generatedNip = `EMP-2026-${String(nextNipNum).padStart(3, '0')}`;
    
    setFormName('');
    setFormNip(generatedNip);
    setFormEmail('');
    setFormPhone('');
    setFormPosition('Staf Operasional Toko');
    setFormPin('1234');
    setFormShiftStart('08:00');
    setFormShiftEnd('17:00');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormNip(emp.nip);
    setFormEmail(emp.email);
    setFormPhone(emp.phone);
    setFormPosition(emp.position);
    setFormPin(emp.pin);
    setFormShiftStart(emp.shiftStart);
    setFormShiftEnd(emp.shiftEnd);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNip.trim()) return;

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        name: formName,
        nip: formNip,
        email: formEmail,
        phone: formPhone,
        position: formPosition,
        pin: formPin,
        shiftStart: formShiftStart,
        shiftEnd: formShiftEnd,
      });
    } else {
      addEmployee({
        name: formName,
        nip: formNip,
        email: formEmail || `${formNip.toLowerCase()}@tokoberkah.com`,
        phone: formPhone || '08123456789',
        position: formPosition,
        pin: formPin || '1234',
        shiftStart: formShiftStart,
        shiftEnd: formShiftEnd,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  const handleQuickLoginAs = (emp: Employee) => {
    setCurrentEmployee(emp);
    setRole('EMPLOYEE');
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.nip.toLowerCase().includes(q) ||
      emp.position.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      {/* Header & Add Button Bento Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Staff Management
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {employees.length} Karyawan Aktif
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">
            Manajemen Akun Karyawan
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data staf toko, shift kerja masuk & pulang, serta PIN akses mobile absensi.
          </p>
        </div>

        <button
          id="add-employee-btn"
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Karyawan Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="employee-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NIP, atau jabatan staf..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold hidden sm:block">
          Menampilkan <span className="text-slate-900 font-bold">{filteredEmployees.length}</span> Karyawan
        </div>
      </div>

      {/* Employee Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className={`bg-white rounded-3xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
              emp.isActive
                ? 'border-slate-200 hover:border-indigo-300'
                : 'border-slate-200/60 opacity-60 bg-slate-50/50'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-base">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {emp.name}
                    </h3>
                    <span className="inline-block mt-0.5 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                      {emp.nip}
                    </span>
                  </div>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={() => toggleEmployeeStatus(emp.id)}
                  title={emp.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                  className={`p-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    emp.isActive
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-rose-500 hover:bg-rose-50'
                  }`}
                >
                  {emp.isActive ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Card Details */}
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="font-medium text-slate-800">{emp.position}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span>Shift: <strong className="text-slate-800">{emp.shiftStart} - {emp.shiftEnd}</strong></span>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{emp.phone || '-'}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>PIN Absen: <strong className="font-mono text-slate-800">{emp.pin}</strong></span>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleQuickLoginAs(emp)}
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
                title="Beralih ke tampilan karyawan ini untuk mencoba scan absensi"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Tes Scan HP</span>
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => openEditModal(emp)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Edit Data Karyawan"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus karyawan ${emp.name}?`)) {
                      deleteEmployee(emp.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Hapus Karyawan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Form Karyawan</span>
                <h3 className="font-bold text-lg text-slate-900 leading-tight">
                  {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Karyawan *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP / Kode Karyawan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="EMP-2026-006"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Login / Absen *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan / Posisi Toko *
                </label>
                <input
                  type="text"
                  required
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  placeholder="Contoh: Kasir Utama, Staf Gudang, Pramuniaga"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Masuk Shift
                  </label>
                  <input
                    type="time"
                    value={formShiftStart}
                    onChange={(e) => setFormShiftStart(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Pulang Shift
                  </label>
                  <input
                    type="time"
                    value={formShiftEnd}
                    onChange={(e) => setFormShiftEnd(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Karyawan
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@toko.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  {editingEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
