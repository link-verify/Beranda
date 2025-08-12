<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Verifikasi Naskah - SRIKANDI (Nomor Surat)</title>
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
    html,body{height:100%}
    body{
      margin:0;
      background: linear-gradient(180deg,#0b63ff 0%, #2f7dff 6%, var(--page-bg) 6%);
      display:flex;
      justify-content:center;
      padding:28px 12px;
      box-sizing:border-box;
      -webkit-font-smoothing:antialiased;
      -moz-osx-font-smoothing:grayscale;
    }

    .wrap{
      width:100%;
      max-width:var(--maxw);
      background:var(--card-bg);
      border-radius:18px;
      box-shadow:var(--shadow);
      overflow:hidden;
      margin-top:8px;
    }

    header{
      background:linear-gradient(90deg, #2b7cff, #6aa8ff);
      padding:18px;
      color:white;
      text-align:center;
      border-bottom-left-radius:18px;
      border-bottom-right-radius:18px;
    }
    .logo{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:12px;
      margin-bottom:6px;
    }
    .coat{
      width:62px;
      height:62px;
      background:linear-gradient(#ffd27a,#ffb34d);
      border-radius:10px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:700;
      color:#7a4200;
      box-shadow:0 6px 12px rgba(0,0,0,0.08) inset;
    }
    h1.title{
      margin:0;
      font-size:18px;
      letter-spacing:1px;
      font-weight:700;
    }
    p.subtitle{
      margin:4px 0 0;
      font-size:11px;
      opacity:0.95;
    }

    .content{
      padding:22px;
    }

    .search-area{
      display:flex;
      gap:8px;
      margin-bottom:16px;
    }
    input[type="text"]{
      flex:1;
      padding:12px 14px;
      border-radius:8px;
      border:1px solid #e6e9f0;
      font-size:14px;
      outline:none;
      box-shadow:none;
    }
    button.verify{
      background:var(--accent);
      color:white;
      border:none;
      padding:0 14px;
      border-radius:8px;
      min-width:120px;
      font-weight:600;
      cursor:pointer;
      box-shadow: 0 6px 14px rgba(255,77,109,0.16);
    }
    .result{
      margin-top:6px;
      border-top:1px dashed #eee;
      padding-top:14px;
    }

    .line{
      margin:8px 0;
      font-size:14px;
      color:#0f172a;
    }
    .muted{color:var(--muted); font-size:13px}
    .hash{font-family:monospace; color:#b91c1c; word-break:break-all}

    .card{
      background:#fbfcff;
      border-radius:12px;
      padding:12px;
      box-shadow:0 6px 18px rgba(10,20,50,0.04);
      margin-top:12px;
    }

    .btn-download{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:10px 14px;
      border-radius:10px;
      border:none;
      background:#ff6b6b;
      color:white;
      font-weight:700;
      cursor:pointer;
      margin-top:12px;
    }

    .not-found{
      color:#b91c1c;
      font-weight:700;
    }

    footer{
      margin-top:18px;
      padding:12px 22px;
      border-top:1px solid #f1f5f9;
      font-size:13px;
      color:#475569;
      display:flex;
      justify-content:space-between;
      align-items:center;
    }

    @media (max-width:420px){
      .coat{width:52px;height:52px}
      header{padding:14px}
      .content{padding:16px}
    }
  </style>
</head>
<body>
  <div class="wrap" role="main" aria-labelledby="pageTitle">
    <header>
      <div class="logo" aria-hidden="true">
        <div class="coat">GARUDA</div>
      </div>
      <h1 id="pageTitle" class="title">SRIKANDI</h1>
      <p class="subtitle">Sistem Informasi Kearsipan Dinamis Terintegrasi</p>
    </header>

    <main class="content">
      <p class="muted">Masukkan <strong>Nomor Surat</strong> untuk memverifikasi naskah dinas.</p>

      <div class="search-area" role="search">
        <input id="nomorInput" type="text" placeholder="Contoh: SRT-2025-001/PANG" aria-label="Nomor surat">
        <button class="verify" id="verifyBtn">VERIFIKASI</button>
      </div>

      <div id="resultArea" class="card" aria-live="polite">
        <p class="muted">Hasil verifikasi akan tampil di sini.</p>
      </div>

      <div class="result" id="details" style="display:none;">
        <p class="line"><strong>Naskah Dinas ini dikelola dengan aplikasi</strong></p>
        <p class="line muted">SISTEM INFORMASI KEARSIPAN DINAMIS TERINTEGRASI</p>

        <div style="height:10px"></div>

        <div id="verifiedBox" style="display:none">
          <p class="line">Nilai Hash : <span id="hashText" class="hash"></span></p>
          <p class="line muted">Naskah ini telah ditandatangani oleh :</p>

          <div id="signedDetails" style="margin-top:12px;">
            <p class="line"><strong>Nama :</strong> <span id="nama"></span></p>
            <p class="line"><strong>Jabatan :</strong> <span id="jabatan"></span></p>
            <p class="line"><strong>Unit Kerja :</strong> <span id="unit"></span></p>
            <p class="line"><strong>Instansi :</strong> <span id="instansi"></span></p>
            <p class="line"><strong>Ditandatangani pada :</strong> <span id="tanggal"></span></p>
          </div>

          <button class="btn-download" id="downloadBtn">📄 TUTUP FILE DIGITAL (PDF)</button>
        </div>

        <div id="notFoundBox" style="display:none;">
          <p class="not-found">Nomor surat tidak ditemukan / tidak valid.</p>
          <p class="muted">Periksa kembali nomor surat atau hubungi admin.</p>
        </div>
      </div>
    </main>

    <footer>
      <div>© <span id="year"></span> Arsip Nasional Republik Indonesia</div>
      <div class="muted">Verifikasi Nomor Surat</div>
    </footer>
  </div>

  <script>
    // ======= Mock database: ganti/extend sesuai kebutuhan ========
    const records = {
      "SRT-2025-001/PANG": {
        hash: "58620ffe3b6ff08c0f57d337fda6b635",
        nama: "Dr. H. KUSDJANA, MM.",
        jabatan: "Sekretaris Daerah Kabupaten Pangandaran",
        unit: "SEKRETARIAT DAERAH KABUPATEN PANGANDARAN",
        instansi: "Pemerintah Kabupaten Pangandaran",
        tanggal: "Jumat, 8 Agustus 2025 pukul 11:54"
      },
      "SRT-2025-002/PANG": {
        hash: "2d7c89a1b8c33a1234f6b9d801aa7c2f",
        nama: "Drs. Ahmad Subekti",
        jabatan: "Kepala Dinas Pendidikan",
        unit: "DINAS PENDIDIKAN KAB. PANGANDARAN",
        instansi: "Pemerintah Kabupaten Pangandaran",
        tanggal: "Senin, 11 Agustus 2025 pukul 09:10"
      }
      // tambahkan data lain di sini bila perlu
    };

    // util: sanitize input
    function normalize(s){
      return s ? s.trim().toUpperCase() : "";
    }

    // DOM
    const input = document.getElementById('nomorInput');
    const btn = document.getElementById('verifyBtn');
    const resultArea = document.getElementById('resultArea');
    const details = document.getElementById('details');
    const verifiedBox = document.getElementById('verifiedBox');
    const notFoundBox = document.getElementById('notFoundBox');
    const hashText = document.getElementById('hashText');
    const nama = document.getElementById('nama');
    const jabatan = document.getElementById('jabatan');
    const unit = document.getElementById('unit');
    const instansi = document.getElementById('instansi');
    const tanggal = document.getElementById('tanggal');
    const year = document.getElementById('year');
    const downloadBtn = document.getElementById('downloadBtn');

    year.textContent = new Date().getFullYear();

    function showResult(found, rec){
      details.style.display = 'block';
      if(found){
        verifiedBox.style.display = 'block';
        notFoundBox.style.display = 'none';
        hashText.textContent = rec.hash;
        nama.textContent = rec.nama;
        jabatan.textContent = rec.jabatan;
        unit.textContent = rec.unit;
        instansi.textContent = rec.instansi;
        tanggal.textContent = rec.tanggal;
      } else {
        verifiedBox.style.display = 'none';
        notFoundBox.style.display = 'block';
      }
      // scroll into view for smaller screens
      details.scrollIntoView({behavior:'smooth', block:'center'});
    }

    // verify action
    btn.addEventListener('click', function(){
      const key = normalize(input.value);
      if(!key){
        resultArea.innerHTML = '<p class="muted">Masukkan nomor surat terlebih dahulu.</p>';
        details.style.display='none';
        return;
      }
      resultArea.innerHTML = '<p class="muted">Memeriksa nomor surat…</p>';
      setTimeout(()=>{
        if(records.hasOwnProperty(key)){
          showResult(true, records[key]);
          resultArea.innerHTML = '<p class="muted">Status: <strong style="color:green">TERVERIFIKASI</strong></p>';
        } else {
          showResult(false, null);
          resultArea.innerHTML = '<p class="muted">Status: <strong style="color:#b91c1c">TIDAK DITEMUKAN</strong></p>';
        }
      }, 400);
    });

    // allow Enter key
    input.addEventListener('keypress', function(e){
      if(e.key === 'Enter') btn.click();
    });

    // example: generate a simple PDF-like file (client-side)
    downloadBtn.addEventListener('click', function(){
      const key = normalize(input.value);
      if(!records[key]) {
        alert('Tidak ada file digital untuk nomor yang dimasukkan.');
        return;
      }
      // buat konten PDF sederhana via window.print() - open new window berisi versi cetak
      const rec = records[key];
      const printWin = window.open('', '_blank', 'width=800,height=900');
      const html = `
        <html><head><title>File Digital - ${key}</title>
        <style>body{font-family:Arial,Helvetica,sans-serif;padding:36px;color:#111} h1{color:#b91c1c} .meta{margin-top:18px}</style>
        </head><body>
        <h1>SRIKANDI - File Digital</h1>
        <p><strong>Nomor Surat:</strong> ${key}</p>
        <div class="meta">
          <p><strong>Nama:</strong> ${rec.nama}</p>
          <p><strong>Jabatan:</strong> ${rec.jabatan}</p>
          <p><strong>Unit Kerja:</strong> ${rec.unit}</p>
          <p><strong>Instansi:</strong> ${rec.instansi}</p>
          <p><strong>Ditandatangani pada:</strong> ${rec.tanggal}</p>
          <p><strong>Hash:</strong> ${rec.hash}</p>
        </div>
        <hr/>
        <p>Halaman ini adalah versi digital sederhana untuk keperluan cetak.</p>
        </body></html>
      `;
      printWin.document.write(html);
      printWin.document.close();
      // user dapat menggunakan print->save as PDF
    });

    // OPTIONAL: prefill with example number for demo
    // input.value = "SRT-2025-001/PANG";
  </script>
</body>
</html>