import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord, StoreSettings } from '../types';

export function exportAttendanceToExcel(
  records: AttendanceRecord[],
  store: StoreSettings,
  filterDescription = 'Semua Data'
) {
  const data = records.map((rec, index) => {
    let statusIndo = 'Tepat Waktu';
    if (rec.clockInStatus === 'LATE') statusIndo = 'Terlambat';
    if (rec.clockInStatus === 'OUTSIDE_RADIUS') statusIndo = 'Di Luar Radius Toko';

    const durasiStr = rec.workDurationMinutes 
      ? `${Math.floor(rec.workDurationMinutes / 60)}j ${rec.workDurationMinutes % 60}m` 
      : (rec.clockOutTime ? '-' : 'Sedang Bekerja');

    return {
      'No': index + 1,
      'Tanggal': rec.date,
      'NIP': rec.employeeNip,
      'Nama Karyawan': rec.employeeName,
      'Jabatan': rec.position,
      'Jam Masuk (Clock-In)': rec.clockInTime,
      'Status Masuk': statusIndo,
      'Jarak Masuk (m)': rec.clockInDistanceMeters !== undefined ? `${rec.clockInDistanceMeters} m` : '-',
      'Jam Pulang (Clock-Out)': rec.clockOutTime || 'Belum Pulang',
      'Jarak Pulang (m)': rec.clockOutDistanceMeters !== undefined ? `${rec.clockOutDistanceMeters} m` : '-',
      'Durasi Kerja': durasiStr,
      'Validasi GPS': rec.isVerifiedGps ? 'Terverifikasi' : 'Simulasi/Di Luar',
      'Catatan': rec.clockInNotes || rec.clockOutNotes || '-',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 5 },  // No
    { wch: 12 }, // Tanggal
    { wch: 12 }, // NIP
    { wch: 22 }, // Nama
    { wch: 16 }, // Jabatan
    { wch: 15 }, // Jam Masuk
    { wch: 18 }, // Status
    { wch: 14 }, // Jarak Masuk
    { wch: 15 }, // Jam Pulang
    { wch: 14 }, // Jarak Pulang
    { wch: 14 }, // Durasi
    { wch: 16 }, // Validasi GPS
    { wch: 25 }, // Catatan
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Absensi');

  const todayStr = new Date().toISOString().split('T')[0];
  const cleanStoreName = store.name.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(workbook, `Laporan_Absensi_${cleanStoreName}_${todayStr}.xlsx`);
}

export function exportAttendanceToPdf(
  records: AttendanceRecord[],
  store: StoreSettings,
  filterDescription = 'Semua Periode'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  // Calculate summary stats
  const total = records.length;
  const onTimeCount = records.filter(r => r.clockInStatus === 'ON_TIME').length;
  const lateCount = records.filter(r => r.clockInStatus === 'LATE').length;
  const completedCount = records.filter(r => !!r.clockOutTime).length;
  const onTimeRate = total > 0 ? Math.round((onTimeCount / total) * 100) : 0;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 842, 65, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`LAPORAN REKAPITULASI ABSENSI KARYAWAN`, 30, 30);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Toko: ${store.name} (${store.code}) | Alamat: ${store.address}`, 30, 48);

  // Print Date & Filter
  const now = new Date();
  const printDateStr = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`;
  doc.text(`Dicetak: ${printDateStr}`, 680, 30);
  doc.text(`Filter: ${filterDescription}`, 680, 48);

  // Summary Metrics Badges
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);

  // Metric Cards
  const yStats = 80;
  
  // Total Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(30, yStats, 170, 45, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Kehadiran: ${total}`, 42, yStats + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${completedCount} Karyawan Selesai Clock-Out`, 42, yStats + 34);

  // On Time Card
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(215, yStats, 170, 45, 4, 4, 'F');
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Tepat Waktu: ${onTimeCount} (${onTimeRate}%)`, 227, yStats + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Sesuai jam shift & toleransi`, 227, yStats + 34);

  // Late Card
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(400, yStats, 170, 45, 4, 4, 'F');
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Terlambat: ${lateCount}`, 412, yStats + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Melewati batas jam masuk`, 412, yStats + 34);

  // Geofence Card
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(585, yStats, 227, 45, 4, 4, 'F');
  doc.setTextColor(29, 78, 216);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Radius Toko: ${store.geofenceRadiusMeters} Meter`, 597, yStats + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Validasi GPS Barcode Dinamis`, 597, yStats + 34);

  // Table Body
  const tableData = records.map((rec, i) => {
    let statusText = 'Tepat Waktu';
    if (rec.clockInStatus === 'LATE') statusText = 'Terlambat';
    if (rec.clockInStatus === 'OUTSIDE_RADIUS') statusText = 'Luar Radius';

    const durasi = rec.workDurationMinutes 
      ? `${Math.floor(rec.workDurationMinutes / 60)}j ${rec.workDurationMinutes % 60}m` 
      : (rec.clockOutTime ? '-' : 'Sedang Bekerja');

    return [
      String(i + 1),
      rec.date,
      rec.employeeNip,
      rec.employeeName,
      rec.position,
      rec.clockInTime,
      statusText,
      rec.clockInDistanceMeters !== undefined ? `${rec.clockInDistanceMeters}m` : '-',
      rec.clockOutTime || 'Aktif',
      rec.clockOutDistanceMeters !== undefined ? `${rec.clockOutDistanceMeters}m` : '-',
      durasi,
    ];
  });

  autoTable(doc, {
    startY: 140,
    head: [[
      'No',
      'Tanggal',
      'NIP',
      'Nama Karyawan',
      'Jabatan',
      'Masuk',
      'Status',
      'Jarak In',
      'Pulang',
      'Jarak Out',
      'Durasi',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 60, halign: 'center' },
      2: { cellWidth: 55, halign: 'center' },
      3: { cellWidth: 120 },
      4: { cellWidth: 85 },
      5: { cellWidth: 55, halign: 'center' },
      6: { cellWidth: 70, halign: 'center' },
      7: { cellWidth: 50, halign: 'center' },
      8: { cellWidth: 55, halign: 'center' },
      9: { cellWidth: 50, halign: 'center' },
      10: { cellWidth: 65, halign: 'center' },
    },
    didParseCell: (data) => {
      // Color-code Status column
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw;
        if (val === 'Tepat Waktu') {
          data.cell.styles.textColor = [5, 150, 105]; // green
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'Terlambat') {
          data.cell.styles.textColor = [220, 38, 38]; // red
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'Luar Radius') {
          data.cell.styles.textColor = [217, 119, 6]; // amber
        }
      }
    },
    margin: { left: 30, right: 30 },
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const cleanStoreName = store.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Laporan_Absensi_${cleanStoreName}_${todayStr}.pdf`);
}
