 <!doctype html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Verifikasi Naskah - SRIKANDI</title>
<style>
  :root{
    --accent:#ff4d6d;
    --muted:#6b7280;
    --card-bg:#ffffff;
    --page-bg:#f6f9ff;
    --shadow: 0 10px 30px rgba(15,23,42,0.07);
    --maxw:480px;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  }
  html,body{height:100%;}
  body{
    margin:0;
    background: linear-gradient(180deg,#0b63ff 0%, #2f7dff 6%, var(--page-bg) 6%);
    display:flex;
    justify-content:center;
    align-items:center;
    padding:28px 12px;
    box-sizing:border-box;
  }
  .wrap{
    width:100%;
    max-width:var(--maxw);
    background:var(--card-bg);
    border-radius:18px;
    box-shadow:var(--shadow);
    overflow:hidden;
    position:relative;
  }
  header{
    background:linear-gradient(90deg, #2b7cff, #6aa8ff);
    padding:18px;
    color:white;
    text-align:center;
  }
  .coat{
    width:62px;height:62px;
    background:linear-gradient(#ffd27a,#ffb34d);
    border-radius:10px;
    display:flex;align-items:center;justify-content:center;
    font-weight:700;color:#7a4200;
    margin:auto;margin-bottom:6px;
  }
  h1{margin:0;font-size:18px;letter-spacing:1px;}
  p.subtitle{margin:4px 0 0;font-size:11px;}
  .content{padding:22px;}
  .search-area{display:flex;gap:8px;margin-bottom:16px;}
  input[type="text"]{
    flex:1;padding:12px 14px;border-radius:8px;
    border:1px solid #e6e9f0;font-size:14px;
  }
  button.verify{
    background:var(--accent);color:white;border:none;
    padding:0 14px;border-radius:8px;min-width:120px;
    font-weight:600;cursor:pointer;
  }
  .muted{color:var(--muted); font-size:13px}
  .center-screen{
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    height:100%;
    padding:20px;
    text-align:center;
    animation:popup 0.6s ease forwards;
  }
  .hash{font-family:monospace;color:#b91c1c;word-break:break-all}
  .btn-download{
    margin-top:20px;
    padding:10px 14px;
    border-radius:10px;
    background:#ff6b6b;
    color:white;font-weight:700;
    border:none;cursor:pointer;
  }
  @keyframes popup{
    0%{opacity:0;transform:scale(0.8) translateY(20px);}
    100%{opacity:1;transform:scale(1) translateY(0);}
  }
</style>
</head>
<body>
<div class="wrap" role="main">
  <div id="initialView">
    <header>
      <div class="coat">GARUDA</div>
      <h1>SRIKANDI</h1>
      <p class="subtitle">Sistem Informasi Kearsipan Dinamis Terintegrasi</p>
    </header>
    <main class="content">
      <p class="muted">Masukkan <strong>Nomor Surat</strong> untuk memverifikasi naskah dinas.</p>
      <div class="search-area">
        <input id="nomorInput" type="text" placeholder="Contoh: SRT-2025-001/PANG">
        <button class="verify" id="verifyBtn">VERIFIKASI</button>
      </div>
    </main>
  </div>
  <div id="resultView" style="display:none;"></div>
</div>

<script>
const records = {
  "SRT-2025-001/PANG": {
    hash: "58620ffe3b6ff08c0f57d337fda6b635",
    nama: "Dr. H. KUSDJANA, MM.",
    jabatan: "Sekretaris Daerah Kabupaten Pangandaran",
    unit: "SEKRETARIAT DAERAH KABUPATEN PANGANDARAN",
    instansi: "Pemerintah Kabupaten Pangandaran",
    tanggal: "Jumat, 8 Agustus 2025 pukul 11:54"
  }
};
function normalize(s){return s ? s.trim().toUpperCase() : "";}
const btn = document.getElementById('verifyBtn');
const input = document.getElementById('nomorInput');
const initialView = document.getElementById('initialView');
const resultView = document.getElementById('resultView');

btn.addEventListener('click', ()=>{
  const key = normalize(input.value);
  if(!key){alert("Masukkan nomor surat.");return;}
  initialView.style.display = 'none';
  resultView.style.display = 'flex';
  const rec = records[key];
  if(rec){
    resultView.innerHTML = `
      <div class="center-screen">
        <h2 style="color:green">✅ TERVERIFIKASI</h2>
        <p>Nilai Hash : <span class="hash">${rec.hash}</span></p>
        <p><strong>Nama:</strong> ${rec.nama}</p>
        <p><strong>Jabatan:</strong> ${rec.jabatan}</p>
        <p><strong>Unit Kerja:</strong> ${rec.unit}</p>
        <p><strong>Instansi:</strong> ${rec.instansi}</p>
        <p><strong>Ditandatangani pada:</strong> ${rec.tanggal}</p>
        <button class="btn-download">📄 TUTUP FILE DIGITAL (PDF)</button>
      </div>
    `;
  } else {
    resultView.innerHTML = `
      <div class="center-screen">
        <h2 style="color:red">❌ TIDAK DITEMUKAN</h2>
        <p>Nomor surat tidak ditemukan atau tidak valid.</p>
      </div>
    `;
  }
});
</script>
</body>
</html>
