// Fail: js/app.js
// Otak Sistem PWA (Kawal UI, Sesi, API Fetch, Carian, dan Graf)

// ==========================================
// 1. PEMBOLEH UBAH DOM
// ==========================================
const skrinLogin = document.getElementById('skrin-login');
const skrinDashboard = document.getElementById('skrin-dashboard');
const borangLogin = document.getElementById('borang-login');
const borangDaftar = document.getElementById('borang-daftar');
const sidebar = document.getElementById('sidebar');
const senaraiModul = document.querySelectorAll('main > section');
const menuItems = document.querySelectorAll('.menu-item');
const paparanNama = document.getElementById('paparan-nama');
const paparanRole = document.getElementById('paparan-role');
const badgeNotifikasi = document.getElementById('badge-notifikasi');
let grafDashboard = null; // Menyimpan instance Chart.js

// ==========================================
// 2. JAM REAL-TIME & AWALAN (INIT)
// ==========================================
function kemaskiniJam() {
    const elJam = document.getElementById('paparan-jam');
    if (elJam) {
        const masa = new Date();
        const tetapan = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        elJam.textContent = masa.toLocaleDateString('ms-MY', tetapan);
    }
}
setInterval(kemaskiniJam, 1000);
kemaskiniJam();

document.addEventListener('DOMContentLoaded', () => {
    const sesiUser = sessionStorage.getItem('spk_user');
    if (sesiUser) {
        binaDashboard(JSON.parse(sesiUser));
    } else {
        skrinLogin.classList.replace('skrin-sembunyi', 'skrin-aktif');
        skrinDashboard.classList.replace('skrin-aktif', 'skrin-sembunyi');
        const savedUser = localStorage.getItem('spk_saved_username');
        if (savedUser) {
            document.getElementById('login-username').value = savedUser;
            document.getElementById('ingat-saya').checked = true;
        }
    }
});

// ==========================================
// 3. LOGIK TEMA & MATA PASSWORD
// ==========================================
const btnTema = document.getElementById('btn-tema');
const ikonTema = btnTema ? btnTema.querySelector('i') : null;
if (localStorage.getItem('spk_tema') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (ikonTema) ikonTema.classList.replace('fa-moon', 'fa-sun');
}
if (btnTema) {
    btnTema.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('spk_tema', 'light');
            ikonTema.classList.replace('fa-sun', 'fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('spk_tema', 'dark');
            ikonTema.classList.replace('fa-moon', 'fa-sun');
        }
    });
}

const togglePassword = document.getElementById('toggle-password');
const inputPassword = document.getElementById('login-password');
if (togglePassword && inputPassword) {
    togglePassword.addEventListener('click', () => {
        const type = inputPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        inputPassword.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye-slash');
    });
}

document.getElementById('link-daftar')?.addEventListener('click', (e) => {
    e.preventDefault(); borangLogin.classList.add('skrin-sembunyi'); borangDaftar.classList.remove('skrin-sembunyi');
    document.getElementById('teks-tukar-daftar').classList.add('skrin-sembunyi');
});
document.getElementById('link-login')?.addEventListener('click', (e) => {
    e.preventDefault(); borangDaftar.classList.add('skrin-sembunyi'); borangLogin.classList.remove('skrin-sembunyi');
    document.getElementById('teks-tukar-daftar').classList.remove('skrin-sembunyi');
});

// ==========================================
// 4. AUTENTIKASI (LOGIN / DAFTAR / LOGOUT)
// ==========================================
borangLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-masuk'); btn.textContent = "Sila Tunggu..."; btn.disabled = true;
    const uname = document.getElementById('login-username').value;
    const respons = await panggilAPI('login', { username: uname, password: inputPassword.value });
    btn.textContent = "Log Masuk"; btn.disabled = false;

    if (respons && respons.status) {
        sessionStorage.setItem('spk_user', JSON.stringify(respons.data));
        document.getElementById('ingat-saya').checked ? localStorage.setItem('spk_saved_username', uname) : localStorage.removeItem('spk_saved_username');
        borangLogin.reset();
        binaDashboard(respons.data);
        if (respons.data.requirePasswordChange) {
            Swal.fire('Perhatian!', 'Sila kemas kini kata laluan sementara anda di menu Profil.', 'warning').then(() => bukaModul('profil'));
        }
    } else { Swal.fire('Gagal', respons ? respons.message : "Ralat pelayan.", 'error'); }
});

borangDaftar?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-daftar'); btn.textContent = "Mendaftar..."; btn.disabled = true;
    const respons = await panggilAPI('register', {
        username: document.getElementById('daftar-username').value,
        email: document.getElementById('daftar-email').value,
        role: document.getElementById('daftar-role').value
    });
    btn.textContent = "Daftar Akaun"; btn.disabled = false;
    if (respons && respons.status) {
        Swal.fire('Berjaya!', respons.message, 'success').then(() => { borangDaftar.reset(); document.getElementById('link-login').click(); });
    } else { Swal.fire('Ralat', respons ? respons.message : "Gagal berhubung.", 'error'); }
});

document.getElementById('btn-logout')?.addEventListener('click', () => {
    Swal.fire({ title: 'Log Keluar?', icon: 'question', showCancelButton: true, confirmButtonColor: '#dc3545', confirmButtonText: 'Ya' })
    .then((result) => { if (result.isConfirmed) { sessionStorage.removeItem('spk_user'); window.location.reload(); } });
});

// ==========================================
// 5. NAVIGASI MENU & DASHBOARD
// ==========================================
function binaDashboard(user) {
    skrinLogin.classList.replace('skrin-aktif', 'skrin-sembunyi');
    skrinDashboard.classList.replace('skrin-sembunyi', 'skrin-aktif');
    paparanNama.textContent = user.username; paparanRole.textContent = user.role;
    document.getElementById('profil-nama').value = user.username;
    document.getElementById('profil-emel').value = user.email;

    document.querySelectorAll('.menu-kerani, .menu-fs, .menu-afc-fc').forEach(el => el.classList.add('skrin-sembunyi'));
    const role = user.role.toUpperCase();
    if (['KERANI', 'ADMIN'].includes(role)) document.querySelectorAll('.menu-kerani').forEach(el => el.classList.remove('skrin-sembunyi'));
    if (['FS', 'ADMIN'].includes(role)) document.querySelectorAll('.menu-fs').forEach(el => el.classList.remove('skrin-sembunyi'));
    if (['AFC', 'FC', 'ADMIN'].includes(role)) document.querySelectorAll('.menu-afc-fc').forEach(el => el.classList.remove('skrin-sembunyi'));

    bukaModul('utama');
    semakNotifikasi(user);
}

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        menuItems.forEach(m => m.classList.remove('aktif')); item.classList.add('aktif');
        const target = item.getAttribute('data-target');
        bukaModul(target);
        if (window.innerWidth <= 768) sidebar.classList.remove('buka-mobile');
        if (target === 'kelulusan-vo') semakNotifikasi(JSON.parse(sessionStorage.getItem('spk_user')));
    });
});

function bukaModul(idModul) {
    senaraiModul.forEach(m => m.classList.replace('modul-aktif', 'modul-sembunyi'));
    document.getElementById(`modul-${idModul}`)?.classList.replace('modul-sembunyi', 'modul-aktif');
    if(idModul === 'utama') tarikDataDashboard(); // Panggil data graf bila buka Utama
}

document.getElementById('btn-profil')?.addEventListener('click', () => { menuItems.forEach(m => m.classList.remove('aktif')); bukaModul('profil'); });
document.getElementById('btn-menu')?.addEventListener('click', () => {
    window.innerWidth <= 768 ? sidebar.classList.toggle('buka-mobile') : (sidebar.classList.toggle('sembunyi-desktop'), document.getElementById('kandungan-utama').classList.toggle('kembang-desktop'));
});

// ==========================================
// 6. DASHBOARD GRAF (CHART.JS)
// ==========================================
async function tarikDataDashboard() {
    const respons = await panggilAPI('getDashboardData', {});
    if (respons && respons.status) {
        document.getElementById('stat-spk').textContent = respons.data.total_spk;
        document.getElementById('stat-bayaran').textContent = `RM ${respons.data.jumlah_bayaran.toLocaleString('ms-MY', {minimumFractionDigits: 2})}`;
        document.getElementById('stat-vo-lulus').textContent = respons.data.vo_lulus;
        document.getElementById('stat-vo-pending').textContent = respons.data.vo_pending;

        const ctx = document.getElementById('grafSpkBayaran').getContext('2d');
        if (grafDashboard) grafDashboard.destroy();
        
        grafDashboard = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['SPK Aktif', 'VO Lulus', 'VO Tertunggak'],
                datasets: [{
                    label: 'Statistik Data',
                    data: [respons.data.spk_aktif, respons.data.vo_lulus, respons.data.vo_pending],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                    borderRadius: 8
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
}

// ==========================================
// 7. CARIAN UNIVERSAL SPK
// ==========================================
document.getElementById('btn-carian')?.addEventListener('click', async () => {
    const inputCari = document.getElementById('input-carian').value;
    if (!inputCari) return Swal.fire('Perhatian', 'Sila masukkan No SPK atau PO', 'warning');

    const btn = document.getElementById('btn-carian');
    const oriText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...'; btn.disabled = true;

    const respons = await panggilAPI('carianUniversal', { carian: inputCari });
    btn.innerHTML = oriText; btn.disabled = false;

    if (respons && respons.status) {
        document.getElementById('paparan-hasil-carian').classList.remove('skrin-sembunyi');
        const d = respons.data;
        
        // Render Info Induk
        document.getElementById('hasil-info-spk').innerHTML = `
            <p><strong>No SPK:</strong> ${d.info_spk.no_spk}</p>
            <p><strong>No PO:</strong> ${d.info_spk.no_po}</p>
            <p class="span-2"><strong>Kontraktor:</strong> ${d.info_spk.nama_kontrak} (${d.info_spk.vendor})</p>
            <p><strong>PKT Utama:</strong> ${d.info_spk.pkt_utama}</p>
            <p><strong>Kuantiti Asal:</strong> ${d.info_spk.kuantiti_asal}</p>
            <p><strong>Nilai Kontrak:</strong> RM ${parseFloat(d.info_spk.nilai_kontrak).toLocaleString('ms-MY', {minimumFractionDigits: 2})}</p>
            <p><strong>Status:</strong> <span class="badge-status ${d.info_spk.status === 'ACTIVE' ? 'badge-lulus' : 'badge-batal'}">${d.info_spk.status}</span></p>
        `;

        // Render Jadual Bayaran
        let htmlBayar = d.bayaran.map(b => `<tr><td>${new Date(b.tarikh).toLocaleDateString('ms-MY')}</td><td>${b.kuantiti}</td><td>RM ${b.nilai}</td><td>${b.baki_kuantiti}</td></tr>`).join('');
        document.getElementById('hasil-jadual-bayaran').innerHTML = htmlBayar || `<tr><td colspan="4" style="text-align:center;">Tiada sejarah bayaran</td></tr>`;

        // Render Jadual VO
        let htmlVo = d.vo.map(v => `<tr><td>${new Date(v.tarikh).toLocaleDateString('ms-MY')}</td><td>${v.jenis_vo}</td><td>${v.kuantiti_dipohon}</td><td>${v.status_afc}</td><td>${v.status_fc}</td></tr>`).join('');
        document.getElementById('hasil-jadual-vo').innerHTML = htmlVo || `<tr><td colspan="5" style="text-align:center;">Tiada sejarah VO</td></tr>`;
    } else {
        Swal.fire('Tidak Dijumpai', respons.message, 'error');
        document.getElementById('paparan-hasil-carian').classList.add('skrin-sembunyi');
    }
});

// ==========================================
// 8. LOGIK SPK INDUK & BAYARAN (KEKAL)
// ==========================================
const spkJenisPkt = document.getElementById('spk-jenis-pkt');
const btnTambahPkt = document.getElementById('btn-tambah-pkt');
const containerBarisPkt = document.getElementById('container-baris-pkt');

document.getElementById('spk-amanah')?.addEventListener('change', (e) => {
    const show = e.target.value === 'YA';
    document.getElementById('kotak-nilai-amanah').classList.toggle('skrin-sembunyi', !show);
    document.getElementById('kotak-cara-bayaran').classList.toggle('skrin-sembunyi', !show);
});

spkJenisPkt?.addEventListener('change', (e) => {
    if (e.target.value === 'PELBAGAI') { btnTambahPkt.classList.remove('skrin-sembunyi'); } 
    else { btnTambahPkt.classList.add('skrin-sembunyi'); containerBarisPkt.innerHTML = ''; tambahBarisPkt(false); }
    kiraTotalSPK();
});

function tambahBarisPkt(bolehBuang = true) {
    const div = document.createElement('div'); div.className = 'baris-pkt-item';
    div.style.cssText = 'display:grid; grid-template-columns: 2fr 2fr 2fr 2fr auto; gap:10px; align-items:end; margin-bottom:10px;';
    div.innerHTML = `<div class="form-group" style="margin:0;"><label>No. PKT</label><input type="text" class="input-pkt-no" required></div><div class="form-group" style="margin:0;"><label>Kuantiti</label><input type="number" step="0.01" class="input-pkt-kuantiti" required></div><div class="form-group" style="margin:0;"><label>RM/Unit</label><input type="number" step="0.01" class="input-pkt-harga" required></div><div class="form-group" style="margin:0;"><label>Jumlah (RM)</label><input type="number" step="0.01" class="input-pkt-jumlah" readonly></div><button type="button" class="btn-buang-pkt btn-danger" style="padding:12px; height:max-content; ${bolehBuang ? '' : 'display:none;'}"><i class="fas fa-trash"></i></button>`;
    
    const kiraRow = () => {
        const k = parseFloat(div.querySelector('.input-pkt-kuantiti').value) || 0;
        const h = parseFloat(div.querySelector('.input-pkt-harga').value) || 0;
        div.querySelector('.input-pkt-jumlah').value = (k * h).toFixed(2);
        kiraTotalSPK();
    };
    div.querySelector('.input-pkt-kuantiti').addEventListener('input', kiraRow);
    div.querySelector('.input-pkt-harga').addEventListener('input', kiraRow);
    if(bolehBuang) div.querySelector('.btn-buang-pkt').addEventListener('click', () => { div.remove(); kiraTotalSPK(); });
    containerBarisPkt.appendChild(div);
}

btnTambahPkt?.addEventListener('click', () => tambahBarisPkt(true));
setTimeout(() => {
    const r = containerBarisPkt?.querySelector('.baris-pkt-item');
    if(r) {
        const k = r.querySelector('.input-pkt-kuantiti'), h = r.querySelector('.input-pkt-harga');
        const c = () => { r.querySelector('.input-pkt-jumlah').value = ((parseFloat(k.value)||0) * (parseFloat(h.value)||0)).toFixed(2); kiraTotalSPK(); };
        k.addEventListener('input', c); h.addEventListener('input', c);
    }
}, 500);

function kiraTotalSPK() {
    let tk = 0, tn = 0;
    document.querySelectorAll('.baris-pkt-item').forEach(r => { tk += parseFloat(r.querySelector('.input-pkt-kuantiti').value)||0; tn += parseFloat(r.querySelector('.input-pkt-jumlah').value)||0; });
    document.getElementById('spk-kuantiti-total').value = tk.toFixed(2); document.getElementById('spk-nilai-total').value = tn.toFixed(2);
}

document.getElementById('borang-daftar-spk')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.textContent = "Menyimpan..."; btn.disabled = true;
    let pktArr = [];
    document.querySelectorAll('.baris-pkt-item').forEach(r => {
        pktArr.push({ no_pkt: r.querySelector('.input-pkt-no').value, kuantiti: r.querySelector('.input-pkt-kuantiti').value, harga_seunit: r.querySelector('.input-pkt-harga').value, jumlah_rm: r.querySelector('.input-pkt-jumlah').value });
    });
    
    const respons = await panggilAPI('createSPK', {
        no_spk: document.getElementById('spk-no').value, no_po: document.getElementById('spk-po').value, nama_kontrak: document.getElementById('spk-nama').value, alamat_kontrak: document.getElementById('spk-alamat').value, no_vendor: document.getElementById('spk-vendor').value, blok: document.getElementById('spk-blok').value, jenis_kerja: document.getElementById('spk-jenis').value, mode: document.getElementById('spk-mode').value, unit: document.getElementById('spk-unit').value, senarai_pkt_data: pktArr, kuantiti_total: document.getElementById('spk-kuantiti-total').value, nilai_total: document.getElementById('spk-nilai-total').value, ada_tahanan: document.getElementById('spk-tahanan').value, ada_amanah: document.getElementById('spk-amanah').value, nilai_amanah: document.getElementById('spk-nilai-amanah').value || 0, cara_bayaran: document.getElementById('spk-cara-bayaran')?.value || "", insuran: document.getElementById('spk-insuran').value, frequency_month: document.getElementById('spk-freq').value, tarikh_mula: document.getElementById('spk-mula').value, tarikh_tamat: document.getElementById('spk-tamat').value, created_by: JSON.parse(sessionStorage.getItem('spk_user')).email
    });
    
    btn.textContent = "Daftar SPK Induk"; btn.disabled = false;
    if (respons && respons.status) { Swal.fire('Berjaya', respons.message, 'success').then(() => { document.getElementById('borang-daftar-spk').reset(); containerBarisPkt.innerHTML=''; tambahBarisPkt(false); bukaModul('utama'); }); } 
    else { Swal.fire('Ralat', respons.message, 'error'); }
});

document.getElementById('borang-bayaran')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.textContent = "Merekod..."; btn.disabled = true;
    const respons = await panggilAPI('addPayment', {
        no_spk: document.getElementById('bayaran-no-spk').value, no_po: document.getElementById('bayaran-no-po').value, pkt: document.getElementById('bayaran-pkt').value, kuantiti_bulan_semasa: document.getElementById('bayaran-kuantiti').value, nilai_bulan_semasa: document.getElementById('bayaran-nilai').value, wang_amanah_potongan: document.getElementById('bayaran-amanah').value, dikunci_oleh: JSON.parse(sessionStorage.getItem('spk_user')).email
    });
    btn.textContent = "Rekod Bayaran"; btn.disabled = false;
    if (respons && respons.status) { Swal.fire('Berjaya', `Baki Terkini: ${respons.data.baki_terkini}`, respons.data.amaran_dihantar ? 'warning' : 'success').then(() => document.getElementById('borang-bayaran').reset()); }
    else { Swal.fire('Ralat', respons.message, 'error'); }
});

// ==========================================
// 9. LOGIK VO (AUTO-ISI & 3 JENIS VO)
// ==========================================
document.getElementById('btn-tarik-vo')?.addEventListener('click', async () => {
    const inputSpk = document.getElementById('vo-carian-spk').value;
    if(!inputSpk) return Swal.fire('Perhatian', 'Masukkan No SPK/PO', 'warning');
    
    const btn = document.getElementById('btn-tarik-vo'); btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; btn.disabled = true;
    const respons = await panggilAPI('getSpkDetail', { no_spk: inputSpk });
    btn.innerHTML = '<i class="fas fa-download"></i> Tarik'; btn.disabled = false;

    if(respons && respons.status) {
        document.getElementById('vo-no-spk').value = respons.data.no_spk;
        document.getElementById('vo-no-po').value = respons.data.no_po;
        document.getElementById('vo-pkt').value = respons.data.pkt;
        document.getElementById('vo-nilai-semasa').value = respons.data.nilai_semasa;
        Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'Data SPK ditarik!', showConfirmButton: false, timer: 1500});
    } else {
        Swal.fire('Gagal', respons.message, 'error');
    }
});

document.getElementById('vo-jenis')?.addEventListener('change', (e) => {
    const val = e.target.value;
    const kKuantiti = document.getElementById('kotak-vo-kuantiti'), kNilai = document.getElementById('kotak-vo-nilai');
    const kMula = document.getElementById('kotak-vo-mula'), kTamat = document.getElementById('kotak-vo-tamat');

    // Reset visibility
    kKuantiti.classList.remove('skrin-sembunyi'); kNilai.classList.remove('skrin-sembunyi');
    kMula.classList.add('skrin-sembunyi'); kTamat.classList.add('skrin-sembunyi');

    if(val.includes('Masa')) { 
        kKuantiti.classList.add('skrin-sembunyi'); kNilai.classList.add('skrin-sembunyi'); 
        kMula.classList.remove('skrin-sembunyi'); kTamat.classList.remove('skrin-sembunyi');
    } else if(val.includes('Kontrak')) {
        kMula.classList.remove('skrin-sembunyi'); kTamat.classList.remove('skrin-sembunyi');
    }
});

document.getElementById('borang-mohon-vo')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!document.getElementById('vo-no-spk').value) return Swal.fire('Ralat', 'Sila tarik data SPK dahulu.', 'error');
    
    const btn = e.target.querySelector('button'); btn.textContent = "Menghantar..."; btn.disabled = true;
    const respons = await panggilAPI('mohonVO', {
        no_spk: document.getElementById('vo-no-spk').value, no_po: document.getElementById('vo-no-po').value, pkt: document.getElementById('vo-pkt').value, nilai_kontrak_semasa: document.getElementById('vo-nilai-semasa').value, kuantiti_dipohon: document.getElementById('vo-kuantiti-mohon').value || 0, nilai_kuantiti_dipohon: document.getElementById('vo-nilai-mohon').value || 0, jenis_vo: document.getElementById('vo-jenis').value, tarikh_mula_baru: document.getElementById('vo-mula-baru').value, tarikh_tamat_baru: document.getElementById('vo-tamat-baru').value, dikunci_oleh: JSON.parse(sessionStorage.getItem('spk_user')).username 
    });
    btn.textContent = "Hantar Permohonan VO"; btn.disabled = false;
    
    if (respons && respons.status) { Swal.fire('Berjaya', respons.message, 'success').then(() => { document.getElementById('borang-mohon-vo').reset(); bukaModul('utama'); }); } 
    else { Swal.fire('Ralat', respons.message, 'error'); }
});

// ==========================================
// 10. KELULUSAN VO & KEMASKINI PROFIL
// ==========================================
async function semakNotifikasi(user) {
    if (!user) return;
    const respons = await panggilAPI('getSenaraiVO', { role: user.role.toUpperCase(), username: user.username });
    if (respons && respons.status && respons.data) {
        const role = user.role.toUpperCase();
        let kiraTugas = respons.data.filter(i => (role === 'AFC' && i.status_afc === 'PENDING') || (role === 'FC' && i.status_afc === 'LULUS' && i.status_fc === 'PENDING')).length;
        badgeNotifikasi.textContent = kiraTugas; badgeNotifikasi.classList.toggle('sembunyi', kiraTugas === 0);
        
        const ct = document.getElementById('senarai-vo-container');
        if (ct) {
            ct.innerHTML = respons.data.length ? respons.data.map(i => {
                const bolehTindakan = (role === 'AFC' && i.status_afc === 'PENDING') || (role === 'FC' && i.status_afc === 'LULUS' && i.status_fc === 'PENDING');
                const badgeClass = (i.status_afc==='BATAL' || i.status_fc==='BATAL') ? 'badge-batal' : ((i.status_afc==='LULUS' && i.status_fc==='LULUS') ? 'badge-lulus' : 'badge-pending');
                return `<div class="kad-vo"><div class="kad-header"><span class="kad-spk">${i.no_spk}</span><span class="badge-status ${badgeClass}">AFC: ${i.status_afc} | FC: ${i.status_fc}</span></div><div class="kad-body"><p><strong>Jenis:</strong> ${i.jenis_vo}</p><p><strong>Tarikh:</strong> ${new Date(i.tarikh).toLocaleDateString('ms-MY')}</p><p><strong>Pemohon:</strong> ${i.pemohon}</p>${i.jenis_vo.includes('Masa') ? `<p><strong>Tarikh Tamat Baharu:</strong> ${i.tarikh_tamat_baru}</p>` : `<p><strong>Kuantiti Dipohon:</strong> ${i.kuantiti_dipohon}</p><p><strong>Nilai (RM):</strong> ${i.nilai_dipohon}</p>`}${i.catatan_tolak ? `<p style="color:var(--danger);"><strong>Sebab Tolak:</strong> ${i.catatan_tolak}</p>` : ''}</div>${bolehTindakan ? `<div class="kad-actions"><button class="btn-hijau" onclick="window.prosesVO('${i.no_spk}', 'LULUS')"><i class="fas fa-check"></i> LULUS</button><button class="btn-danger" onclick="window.bukaModalTolak('${i.no_spk}')"><i class="fas fa-times"></i> TOLAK</button></div>` : ''}</div>`;
            }).join('') : "<p style='text-align:center;'>Tiada permohonan VO.</p>";
        }
    }
}

window.prosesVO = function(noSpk, tindakan, catatan = "") {
    if(tindakan === 'LULUS') {
        Swal.fire({ title: 'Sahkan?', text: `Luluskan SPK ${noSpk}?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Ya' })
        .then(r => { if (r.isConfirmed) laksanakanProsesVO(noSpk, tindakan, catatan); });
    } else laksanakanProsesVO(noSpk, tindakan, catatan);
};

async function laksanakanProsesVO(noSpk, tindakan, catatan) {
    const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    const respons = await panggilAPI('updateVO', { no_spk: noSpk, role: userSesi.role.toUpperCase(), tindakan: tindakan, catatan: catatan });
    if(respons && respons.status) { Swal.fire('Selesai', respons.message, 'success'); document.getElementById('modal-tolak').classList.add('skrin-sembunyi'); semakNotifikasi(userSesi); } 
    else Swal.fire('Ralat', respons.message, 'error');
}

window.bukaModalTolak = function(noSpk) { document.getElementById('tolak-spk-no').value = noSpk; document.getElementById('tolak-catatan').value = ""; document.getElementById('modal-tolak').classList.remove('skrin-sembunyi'); };
document.getElementById('btn-batal-tolak')?.addEventListener('click', () => document.getElementById('modal-tolak').classList.add('skrin-sembunyi'));
document.getElementById('btn-sahkan-tolak')?.addEventListener('click', () => {
    const c = document.getElementById('tolak-catatan').value;
    if(!c.trim()) return Swal.fire('Ralat', 'Sila masukkan sebab.', 'warning');
    window.prosesVO(document.getElementById('tolak-spk-no').value, 'TOLAK', c);
});

document.getElementById('borang-profil')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.textContent = "Menyimpan..."; btn.disabled = true;
    const uSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    const respons = await panggilAPI('updateProfile', { id_user: uSesi.id_user, new_username: document.getElementById('profil-nama').value, new_email: document.getElementById('profil-emel').value, new_password: document.getElementById('profil-password').value });
    btn.textContent = "Simpan Perubahan"; btn.disabled = false;
    
    if (respons && respons.status) {
        Swal.fire('Berjaya', 'Profil dikemas kini.', 'success').then(() => {
            uSesi.username = respons.data.username; uSesi.email = respons.data.email; uSesi.requirePasswordChange = false;
            sessionStorage.setItem('spk_user', JSON.stringify(uSesi));
            paparanNama.textContent = respons.data.username; document.getElementById('profil-password').value = "";
            // FIX: Automatik Redirect ke Halaman Utama lepas Simpan Profil
            bukaModul('utama'); 
        });
    } else Swal.fire('Ralat', respons.message, 'error');
});
