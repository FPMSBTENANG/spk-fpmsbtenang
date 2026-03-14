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

let grafDashboard = null; 

function kemaskiniJam() {
    const elJam = document.getElementById('paparan-jam');
    if (elJam) {
        const masa = new Date();
        const tetapan = { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        };
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

const linkDaftar = document.getElementById('link-daftar');
const linkLogin = document.getElementById('link-login');
const teksTukarDaftar = document.getElementById('teks-tukar-daftar');

if(linkDaftar) {
    linkDaftar.addEventListener('click', (e) => {
        e.preventDefault(); 
        borangLogin.classList.add('skrin-sembunyi'); 
        borangDaftar.classList.remove('skrin-sembunyi');
        teksTukarDaftar.classList.add('skrin-sembunyi');
    });
}

if(linkLogin) {
    linkLogin.addEventListener('click', (e) => {
        e.preventDefault(); 
        borangDaftar.classList.add('skrin-sembunyi'); 
        borangLogin.classList.remove('skrin-sembunyi');
        teksTukarDaftar.classList.remove('skrin-sembunyi');
    });
}

if (borangDaftar) {
    borangDaftar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-daftar'); 
        btn.textContent = "Sila Tunggu..."; btn.disabled = true;
        
        const respons = await panggilAPI('register', {
            username: document.getElementById('daftar-username').value,
            email: document.getElementById('daftar-email').value,
            role: document.getElementById('daftar-role').value
        });
        
        btn.textContent = "Daftar Akaun"; btn.disabled = false;
        
        if (respons && respons.status) {
            Swal.fire({ title: 'Berjaya!', text: respons.message, icon: 'success' }).then(() => { 
                borangDaftar.reset(); document.getElementById('link-login').click(); 
            });
        } else { 
            Swal.fire('Ralat', respons ? respons.message : "Gagal berhubung.", 'error'); 
        }
    });
}

if (borangLogin) {
    borangLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-masuk'); 
        btn.textContent = "Log Masuk..."; btn.disabled = true;
        
        const uname = document.getElementById('login-username').value;
        const respons = await panggilAPI('login', { username: uname, password: inputPassword.value });
        
        btn.textContent = "Log Masuk"; btn.disabled = false;

        if (respons && respons.status) {
            sessionStorage.setItem('spk_user', JSON.stringify(respons.data));
            document.getElementById('ingat-saya').checked ? localStorage.setItem('spk_saved_username', uname) : localStorage.removeItem('spk_saved_username');
            
            borangLogin.reset();
            binaDashboard(respons.data);
            
            if (respons.data.requirePasswordChange) {
                Swal.fire({ title: 'Perhatian!', text: 'Sila tukar kata laluan sementara anda.', icon: 'warning' }).then(() => bukaModul('profil'));
            }
        } else { 
            Swal.fire('Gagal', respons ? respons.message : "Ralat pelayan.", 'error'); 
        }
    });
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        Swal.fire({ title: 'Log Keluar?', icon: 'question', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya' })
        .then((r) => { if (r.isConfirmed) { sessionStorage.removeItem('spk_user'); window.location.reload(); } });
    });
}

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
        
        if (target === 'kelulusan-vo' || target === 'kelulusan-tamat') {
            semakNotifikasi(JSON.parse(sessionStorage.getItem('spk_user')));
        }
    });
});

function bukaModul(idModul) {
    senaraiModul.forEach(m => m.classList.replace('modul-aktif', 'modul-sembunyi'));
    document.getElementById(`modul-${idModul}`)?.classList.replace('modul-sembunyi', 'modul-aktif');
    if(idModul === 'utama') tarikDataDashboard(); 
}

document.getElementById('btn-profil')?.addEventListener('click', () => { menuItems.forEach(m => m.classList.remove('aktif')); bukaModul('profil'); });
document.getElementById('btn-menu')?.addEventListener('click', () => { window.innerWidth <= 768 ? sidebar.classList.toggle('buka-mobile') : (sidebar.classList.toggle('sembunyi-desktop'), document.getElementById('kandungan-utama').classList.toggle('kembang-desktop')); });

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

const btnCarian = document.getElementById('btn-carian');
if (btnCarian) {
    btnCarian.addEventListener('click', async () => {
        const inputCari = document.getElementById('input-carian').value;
        if (!inputCari) return Swal.fire('Perhatian', 'Sila masukkan No SPK atau PO', 'warning');

        const oriText = btnCarian.innerHTML;
        btnCarian.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...'; btnCarian.disabled = true;
        const respons = await panggilAPI('carianUniversal', { carian: inputCari });
        btnCarian.innerHTML = oriText; btnCarian.disabled = false;

        if (respons && respons.status) {
            document.getElementById('paparan-hasil-carian').classList.remove('skrin-sembunyi');
            const d = respons.data;
            
            const tarikhMula = new Date(d.info_spk.tarikh_mula).toLocaleDateString('ms-MY');
            const tarikhTamat = new Date(d.info_spk.tarikh_tamat).toLocaleDateString('ms-MY');
            
            document.getElementById('hasil-info-spk').innerHTML = `
                <p><strong>No SPK:</strong> ${d.info_spk.no_spk}</p>
                <p><strong>No PO:</strong> ${d.info_spk.no_po}</p>
                <p class="span-2"><strong>Kontraktor:</strong> ${d.info_spk.nama_kontrak} (${d.info_spk.vendor})</p>
                <p><strong>PKT Utama:</strong> ${d.info_spk.pkt_utama}</p>
                <p><strong>Nilai Kontrak:</strong> RM ${parseFloat(d.info_spk.nilai_kontrak).toLocaleString('ms-MY', {minimumFractionDigits: 2})}</p>
                <p><strong>Tarikh:</strong> ${tarikhMula} hingga ${tarikhTamat}</p>
                <p><strong>Wang Amanah:</strong> RM ${d.info_spk.nilai_amanah || 0} (${d.info_spk.cara_bayaran || "Tiada"})</p>
                <p><strong>Status:</strong> <span class="badge-status ${d.info_spk.status === 'ACTIVE' ? 'badge-lulus' : (d.info_spk.status === 'TAMAT' ? 'badge-tamat' : 'badge-batal')}">${d.info_spk.status}</span></p>
            `;

            const btnBukaAmanah = document.getElementById('btn-buka-amanah');
            if (d.info_spk.status === 'ACTIVE') {
                btnBukaAmanah.classList.remove('skrin-sembunyi');
                btnBukaAmanah.onclick = () => {
                    document.getElementById('amanah-spk-no').value = d.info_spk.no_spk;
                    document.getElementById('amanah-nilai-baru').value = d.info_spk.nilai_amanah || "";
                    document.getElementById('amanah-cara-baru').value = d.info_spk.cara_bayaran === "Potong Sijil Bayaran" ? "Bank Draf" : (d.info_spk.cara_bayaran || "Bank Draf");
                    document.getElementById('modal-amanah').classList.remove('skrin-sembunyi');
                };
            } else {
                btnBukaAmanah.classList.add('skrin-sembunyi');
            }

            const gaugeWrapper = document.getElementById('paparan-gauge');
            if (d.info_spk.kuantiti_asal > 0) {
                gaugeWrapper.classList.remove('skrin-sembunyi');
                const peratus = parseFloat(d.info_spk.peratus_penggunaan);
                
                document.getElementById('gauge-peratus-teks').textContent = peratus + '%';
                document.getElementById('gauge-baki-teks').textContent = `Baki Kuantiti: ${d.info_spk.baki_kuantiti} / Asal: ${d.info_spk.kuantiti_asal}`;
                
                const gaugeBar = document.getElementById('gauge-bar');
                gaugeBar.style.width = (peratus > 100 ? 100 : peratus) + '%';
                gaugeBar.className = 'gauge-fill';
                
                if (peratus >= 90) gaugeBar.classList.add('fill-merah');
                else if (peratus >= 70) gaugeBar.classList.add('fill-kuning');
                else gaugeBar.classList.add('fill-hijau');
            } else {
                gaugeWrapper.classList.add('skrin-sembunyi');
            }

            const seksyenDetailPkt = document.getElementById('seksyen-detail-pkt');
            if (d.detail_pkt && d.detail_pkt.length > 0) {
                seksyenDetailPkt.classList.remove('skrin-sembunyi');
                document.getElementById('hasil-jadual-pkt').innerHTML = d.detail_pkt.map(p => `<tr><td>${p.kod_pkt}</td><td>${p.kuantiti}</td><td>RM ${parseFloat(p.harga_seunit).toLocaleString('ms-MY', {minimumFractionDigits: 2})}</td><td>RM ${parseFloat(p.jumlah_rm).toLocaleString('ms-MY', {minimumFractionDigits: 2})}</td></tr>`).join('');
            } else {
                seksyenDetailPkt.classList.add('skrin-sembunyi');
            }

            document.getElementById('hasil-jadual-bayaran').innerHTML = d.bayaran.map(b => `<tr><td>${new Date(b.tarikh).toLocaleDateString('ms-MY')}</td><td>${b.kuantiti}</td><td>RM ${parseFloat(b.nilai).toLocaleString('ms-MY', {minimumFractionDigits: 2})}</td><td>${b.baki_kuantiti}</td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center;">Tiada sejarah bayaran</td></tr>`;
            document.getElementById('hasil-jadual-vo').innerHTML = d.vo.map(v => `<tr><td>${new Date(v.tarikh).toLocaleDateString('ms-MY')}</td><td>${v.jenis_vo}</td><td>${v.kuantiti_dipohon}</td><td>${v.status_afc}</td><td>${v.status_fc}</td></tr>`).join('') || `<tr><td colspan="5" style="text-align:center;">Tiada sejarah VO</td></tr>`;
            
        } else {
            Swal.fire('Tidak Dijumpai', respons.message, 'error');
            document.getElementById('paparan-hasil-carian').classList.add('skrin-sembunyi');
        }
    });
}

document.getElementById('btn-batal-amanah')?.addEventListener('click', () => {
    document.getElementById('modal-amanah').classList.add('skrin-sembunyi');
});

const borangAmanah = document.getElementById('borang-kemaskini-amanah');
if (borangAmanah) {
    borangAmanah.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-sahkan-amanah');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...'; btn.disabled = true;

        const respons = await panggilAPI('updateAmanah', {
            no_spk: document.getElementById('amanah-spk-no').value,
            nilai_amanah: document.getElementById('amanah-nilai-baru').value,
            cara_bayaran: document.getElementById('amanah-cara-baru').value
        });

        btn.innerHTML = 'Simpan Rekod'; btn.disabled = false;

        if (respons && respons.status) {
            Swal.fire('Berjaya', respons.message, 'success').then(() => {
                document.getElementById('modal-amanah').classList.add('skrin-sembunyi');
                document.getElementById('btn-carian').click();
            });
        } else {
            Swal.fire('Ralat', respons.message, 'error');
        }
    });
}

const spkJenisPkt = document.getElementById('spk-jenis-pkt');
const btnTambahPkt = document.getElementById('btn-tambah-pkt');
const containerBarisPkt = document.getElementById('container-baris-pkt');
const spkAmanah = document.getElementById('spk-amanah');

if (spkAmanah) {
    spkAmanah.addEventListener('change', (e) => {
        const show = e.target.value === 'YA';
        document.getElementById('kotak-nilai-amanah').classList.toggle('skrin-sembunyi', !show);
        document.getElementById('kotak-cara-bayaran').classList.toggle('skrin-sembunyi', !show);
    });
}

if (spkJenisPkt) {
    spkJenisPkt.addEventListener('change', (e) => {
        if (e.target.value === 'PELBAGAI') btnTambahPkt.classList.remove('skrin-sembunyi'); 
        else { btnTambahPkt.classList.add('skrin-sembunyi'); containerBarisPkt.innerHTML = ''; tambahBarisPkt(false); }
        kiraTotalSPK();
    });
}

function tambahBarisPkt(bolehBuang = true) {
    const div = document.createElement('div'); div.className = 'baris-pkt-item';
    div.style.cssText = 'display:grid; grid-template-columns: 2fr 2fr 2fr 2fr auto; gap:10px; align-items:end; margin-bottom:10px;';
    div.innerHTML = `<div class="form-group" style="margin:0;"><label>No. PKT</label><input type="text" class="input-pkt-no" required></div><div class="form-group" style="margin:0;"><label>Kuantiti</label><input type="number" step="0.01" class="input-pkt-kuantiti" required></div><div class="form-group" style="margin:0;"><label>RM/Unit</label><input type="number" step="0.01" class="input-pkt-harga" required></div><div class="form-group" style="margin:0;"><label>Jumlah (RM)</label><input type="number" step="0.01" class="input-pkt-jumlah" readonly style="background:#e9ecef;"></div><button type="button" class="btn-buang-pkt btn-danger" style="padding:12px; height:max-content; ${bolehBuang ? '' : 'display:none;'}"><i class="fas fa-trash"></i></button>`;
    
    const inputK = div.querySelector('.input-pkt-kuantiti'), inputH = div.querySelector('.input-pkt-harga'), inputJ = div.querySelector('.input-pkt-jumlah');
    const kiraRow = () => { inputJ.value = ((parseFloat(inputK.value) || 0) * (parseFloat(inputH.value) || 0)).toFixed(2); kiraTotalSPK(); };
    inputK.addEventListener('input', kiraRow); inputH.addEventListener('input', kiraRow);
    if(bolehBuang) div.querySelector('.btn-buang-pkt').addEventListener('click', () => { div.remove(); kiraTotalSPK(); });
    containerBarisPkt.appendChild(div);
}
if (btnTambahPkt) btnTambahPkt.addEventListener('click', () => tambahBarisPkt(true));

function kiraTotalSPK() {
    let totalK = 0, totalN = 0;
    document.querySelectorAll('.baris-pkt-item').forEach(r => { totalK += parseFloat(r.querySelector('.input-pkt-kuantiti').value) || 0; totalN += parseFloat(r.querySelector('.input-pkt-jumlah').value) || 0; });
    document.getElementById('spk-kuantiti-total').value = totalK.toFixed(2); document.getElementById('spk-nilai-total').value = totalN.toFixed(2);
}

const borangDaftarSPK = document.getElementById('borang-daftar-spk');
if (borangDaftarSPK) {
    borangDaftarSPK.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button'); btn.textContent = "Menyimpan..."; btn.disabled = true;
        let pktArr = [];
        document.querySelectorAll('.baris-pkt-item').forEach(r => { pktArr.push({ no_pkt: r.querySelector('.input-pkt-no').value, kuantiti: r.querySelector('.input-pkt-kuantiti').value, harga_seunit: r.querySelector('.input-pkt-harga').value, jumlah_rm: r.querySelector('.input-pkt-jumlah').value }); });
        
        const respons = await panggilAPI('createSPK', {
            no_spk: document.getElementById('spk-no').value, no_po: document.getElementById('spk-po').value, nama_kontrak: document.getElementById('spk-nama').value, alamat_kontrak: document.getElementById('spk-alamat').value, no_vendor: document.getElementById('spk-vendor').value, blok: document.getElementById('spk-blok').value, jenis_kerja: document.getElementById('spk-jenis').value, mode: document.getElementById('spk-mode').value, unit: document.getElementById('spk-unit').value, senarai_pkt_data: pktArr, kuantiti_total: document.getElementById('spk-kuantiti-total').value, nilai_total: document.getElementById('spk-nilai-total').value, ada_tahanan: document.getElementById('spk-tahanan').value, ada_amanah: document.getElementById('spk-amanah').value, nilai_amanah: document.getElementById('spk-nilai-amanah').value || 0, cara_bayaran: document.getElementById('spk-cara-bayaran')?.value || "", insuran: document.getElementById('spk-insuran').value, frequency_month: document.getElementById('spk-freq').value, tarikh_mula: document.getElementById('spk-mula').value, tarikh_tamat: document.getElementById('spk-tamat').value, created_by: JSON.parse(sessionStorage.getItem('spk_user')).email
        });
        btn.textContent = "Daftar SPK Induk"; btn.disabled = false;
        
        if (respons && respons.status) { Swal.fire('Pendaftaran SPK Berjaya', respons.message, 'success').then(() => { borangDaftarSPK.reset(); containerBarisPkt.innerHTML=''; tambahBarisPkt(false); bukaModul('utama'); }); } 
        else Swal.fire('Ralat', respons.message, 'error');
    });
}

const btnTarikBayaran = document.getElementById('btn-tarik-bayaran');
if (btnTarikBayaran) {
    btnTarikBayaran.addEventListener('click', async () => {
        const inputSpk = document.getElementById('bayaran-carian-spk').value;
        if(!inputSpk) return Swal.fire('Perhatian', 'Sila masukkan No SPK/PO', 'warning');
        
        btnTarikBayaran.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; btnTarikBayaran.disabled = true;
        const respons = await panggilAPI('getSpkDetail', { no_spk: inputSpk });
        btnTarikBayaran.innerHTML = '<i class="fas fa-download"></i> Tarik'; btnTarikBayaran.disabled = false;

        if(respons && respons.status) {
            document.getElementById('bayaran-no-spk').value = respons.data.no_spk;
            document.getElementById('bayaran-no-po').value = respons.data.no_po;
            document.getElementById('bayaran-pkt').value = respons.data.pkt;
            const caraDb = respons.data.cara_bayaran;
            document.getElementById('bayaran-cara-db').value = caraDb || "Tiada";
            
            if (caraDb === "Potong Sijil Bayaran") document.getElementById('kotak-bayaran-amanah').classList.remove('skrin-sembunyi');
            else { document.getElementById('kotak-bayaran-amanah').classList.add('skrin-sembunyi'); document.getElementById('bayaran-amanah').value = ""; }
            Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'Data SPK ditarik!', showConfirmButton: false, timer: 1500});
        } else Swal.fire('Gagal', respons.message, 'error');
    });
}

const borangBayaran = document.getElementById('borang-bayaran');
if (borangBayaran) {
    borangBayaran.addEventListener('submit', async (e) => {
        e.preventDefault();
        if(!document.getElementById('bayaran-no-spk').value) return Swal.fire('Ralat', 'Sila tarik data SPK dahulu.', 'error');
        const btn = e.target.querySelector('button'); btn.textContent = "Sedang Merekod..."; btn.disabled = true;
        
        const respons = await panggilAPI('addPayment', {
            no_spk: document.getElementById('bayaran-no-spk').value, no_po: document.getElementById('bayaran-no-po').value, pkt: document.getElementById('bayaran-pkt').value, kuantiti_bulan_semasa: document.getElementById('bayaran-kuantiti').value, nilai_bulan_semasa: document.getElementById('bayaran-nilai').value, wang_amanah_potongan: document.getElementById('bayaran-amanah').value, dikunci_oleh: JSON.parse(sessionStorage.getItem('spk_user')).email
        });
        btn.textContent = "Rekod Bayaran"; btn.disabled = false;
        if (respons && respons.status) { Swal.fire('Berjaya', `Baki Kuantiti Terkini: ${respons.data.baki_terkini}`, respons.data.amaran_dihantar ? 'warning' : 'success').then(() => { borangBayaran.reset(); document.getElementById('kotak-bayaran-amanah').classList.add('skrin-sembunyi'); document.getElementById('bayaran-cara-db').value = ""; }); } 
        else Swal.fire('Ralat', respons.message, 'error');
    });
}

const btnTarikVo = document.getElementById('btn-tarik-vo');
if (btnTarikVo) {
    btnTarikVo.addEventListener('click', async () => {
        const inputSpk = document.getElementById('vo-carian-spk').value;
        if(!inputSpk) return Swal.fire('Perhatian', 'Masukkan No SPK/PO', 'warning');
        btnTarikVo.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; btnTarikVo.disabled = true;
        const respons = await panggilAPI('getSpkDetail', { no_spk: inputSpk });
        btnTarikVo.innerHTML = '<i class="fas fa-download"></i> Tarik'; btnTarikVo.disabled = false;

        if(respons && respons.status) {
            document.getElementById('vo-no-spk').value = respons.data.no_spk; document.getElementById('vo-no-po').value = respons.data.no_po; document.getElementById('vo-pkt').value = respons.data.pkt; document.getElementById('vo-nilai-semasa').value = respons.data.nilai_semasa;
            Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'Data ditarik!', showConfirmButton: false, timer: 1500});
        } else Swal.fire('Gagal', respons.message, 'error');
    });
}

const voJenis = document.getElementById('vo-jenis');
if (voJenis) {
    voJenis.addEventListener('change', (e) => {
        const val = e.target.value;
        const kKuantiti = document.getElementById('kotak-vo-kuantiti'), kNilai = document.getElementById('kotak-vo-nilai'), kMula = document.getElementById('kotak-vo-mula'), kTamat = document.getElementById('kotak-vo-tamat');
        if(val === 'Tambahan Kuantiti') { kKuantiti.classList.remove('skrin-sembunyi'); kNilai.classList.remove('skrin-sembunyi'); kMula.classList.add('skrin-sembunyi'); kTamat.classList.add('skrin-sembunyi'); } 
        else if (val === 'Sambung Masa (EOT)') { kKuantiti.classList.add('skrin-sembunyi'); kNilai.classList.add('skrin-sembunyi'); kMula.classList.remove('skrin-sembunyi'); kTamat.classList.remove('skrin-sembunyi'); } 
        else { kKuantiti.classList.remove('skrin-sembunyi'); kNilai.classList.remove('skrin-sembunyi'); kMula.classList.remove('skrin-sembunyi'); kTamat.classList.remove('skrin-sembunyi'); }
    });
}

const borangMohonVO = document.getElementById('borang-mohon-vo');
if (borangMohonVO) {
    borangMohonVO.addEventListener('submit', async (e) => {
        e.preventDefault();
        if(!document.getElementById('vo-no-spk').value) return Swal.fire('Ralat', 'Sila tarik data SPK dahulu.', 'error');
        const btn = e.target.querySelector('button'); btn.textContent = "Sedang Menghantar..."; btn.disabled = true;
        const respons = await panggilAPI('mohonVO', {
            no_spk: document.getElementById('vo-no-spk').value, no_po: document.getElementById('vo-no-po').value, pkt: document.getElementById('vo-pkt').value, nilai_kontrak_semasa: document.getElementById('vo-nilai-semasa').value, kuantiti_dipohon: document.getElementById('vo-kuantiti-mohon').value || 0, nilai_kuantiti_dipohon: document.getElementById('vo-nilai-mohon').value || 0, jenis_vo: document.getElementById('vo-jenis').value, tarikh_mula_baru: document.getElementById('vo-mula-baru').value, tarikh_tamat_baru: document.getElementById('vo-tamat-baru').value, dikunci_oleh: JSON.parse(sessionStorage.getItem('spk_user')).username 
        });
        btn.textContent = "Hantar Permohonan VO"; btn.disabled = false;
        if (respons && respons.status) { Swal.fire('Permohonan Dihantar', respons.message, 'success').then(() => { borangMohonVO.reset(); bukaModul('utama'); }); } 
        else Swal.fire('Ralat VO', respons.message, 'error');
    });
}

const btnTarikTamat = document.getElementById('btn-tarik-tamat');
if (btnTarikTamat) {
    btnTarikTamat.addEventListener('click', async () => {
        const inputSpk = document.getElementById('tamat-carian-spk').value;
        if(!inputSpk) return Swal.fire('Perhatian', 'Masukkan No SPK/PO', 'warning');
        
        btnTarikTamat.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; btnTarikTamat.disabled = true;
        
        const respons = await panggilAPI('carianUniversal', { carian: inputSpk });
        btnTarikTamat.innerHTML = '<i class="fas fa-download"></i> Tarik'; btnTarikTamat.disabled = false;

        if(respons && respons.status) {
            const d = respons.data;
            document.getElementById('tamat-no-spk').value = d.info_spk.no_spk;
            document.getElementById('tamat-no-po').value = d.info_spk.no_po;
            
            let totalAmanahPotong = 0;
            if (d.info_spk.cara_bayaran === "Potong Sijil Bayaran") {
                d.bayaran.forEach(b => totalAmanahPotong += (parseFloat(b.wang_amanah_potongan) || 0));
            } else {
                totalAmanahPotong = parseFloat(d.info_spk.nilai_amanah) || 0;
            }
            
            document.getElementById('tamat-wang-tahanan').value = d.info_spk.ada_tahanan === "YA" ? "Sila rujuk Kewangan" : "0.00";
            document.getElementById('tamat-wang-amanah').value = totalAmanahPotong.toFixed(2);
            
            Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'Data Penamatan ditarik!', showConfirmButton: false, timer: 1500});
        } else {
            Swal.fire('Gagal', respons.message, 'error');
        }
    });
}

const borangMohonTamat = document.getElementById('borang-mohon-tamat');
if (borangMohonTamat) {
    borangMohonTamat.addEventListener('submit', async (e) => {
        e.preventDefault();
        if(!document.getElementById('tamat-no-spk').value) return Swal.fire('Ralat', 'Sila tarik data SPK dahulu.', 'error');
        
        const btn = e.target.querySelector('button'); btn.textContent = "Sedang Memohon..."; btn.disabled = true;
        const respons = await panggilAPI('mohonTamat', {
            no_spk: document.getElementById('tamat-no-spk').value,
            no_po: document.getElementById('tamat-no-po').value,
            wang_tahanan: document.getElementById('tamat-wang-tahanan').value,
            wang_amanah: document.getElementById('tamat-wang-amanah').value,
            dikunci_oleh: JSON.parse(sessionStorage.getItem('spk_user')).username,
            role: JSON.parse(sessionStorage.getItem('spk_user')).role.toUpperCase()
        });
        btn.textContent = "Mohon Penamatan & Pemulangan Deposit"; btn.disabled = false;
        
        if (respons && respons.status) { Swal.fire('Permohonan Berjaya', respons.message, 'success').then(() => { borangMohonTamat.reset(); bukaModul('utama'); }); } 
        else Swal.fire('Ralat', respons.message, 'error');
    });
}

async function semakNotifikasi(user) {
    if (!user) return;
    const role = user.role.toUpperCase();
    
    const resVO = await panggilAPI('getSenaraiVO', { role: role, username: user.username });
    const resTamat = await panggilAPI('getSenaraiTamat', { role: role, username: user.username });
    
    let kiraTugas = 0;

    if (resVO && resVO.status && resVO.data) {
        let tasksVO = resVO.data.filter(i => (role === 'AFC' && i.status_afc === 'PENDING') || (role === 'FC' && i.status_afc === 'LULUS' && i.status_fc === 'PENDING')).length;
        kiraTugas += tasksVO;
        
        const contVO = document.getElementById('senarai-vo-container');
        if (contVO) {
            contVO.innerHTML = resVO.data.length ? resVO.data.map(i => {
                const boleh = (role === 'AFC' && i.status_afc === 'PENDING') || (role === 'FC' && i.status_afc === 'LULUS' && i.status_fc === 'PENDING');
                const bdg = (i.status_afc==='BATAL' || i.status_fc==='BATAL') ? 'badge-batal' : ((i.status_afc==='LULUS' && i.status_fc==='LULUS') ? 'badge-lulus' : 'badge-pending');
                let htmlCard = `<div class="kad-vo"><div class="kad-header"><span class="kad-spk">${i.no_spk}</span><span class="badge-status ${bdg}">AFC: ${i.status_afc} | FC: ${i.status_fc}</span></div><div class="kad-body"><p><strong>Jenis:</strong> ${i.jenis_vo}</p><p><strong>Tarikh Mohon:</strong> ${new Date(i.tarikh).toLocaleDateString('ms-MY')}</p><p><strong>Pemohon:</strong> ${i.pemohon}</p>`;
                if (i.jenis_vo.includes('Masa')) htmlCard += `<p><strong>Tarikh Tamat Baharu:</strong> ${i.tarikh_tamat_baru}</p>`;
                else if (i.jenis_vo.includes('Kontrak')) htmlCard += `<p><strong>Kuantiti Dipohon:</strong> ${i.kuantiti_dipohon}</p><p><strong>Nilai (RM):</strong> ${i.nilai_dipohon}</p><p><strong>Tarikh Tamat Baharu:</strong> ${i.tarikh_tamat_baru}</p>`;
                else htmlCard += `<p><strong>Kuantiti Dipohon:</strong> ${i.kuantiti_dipohon}</p><p><strong>Nilai (RM):</strong> ${i.nilai_dipohon}</p>`;
                if (i.catatan_tolak) htmlCard += `<p style="color:var(--danger); margin-top:8px;"><strong>Sebab Tolak:</strong> ${i.catatan_tolak}</p>`;
                htmlCard += `</div>`; 
                if (boleh) htmlCard += `<div class="kad-actions"><button class="btn-hijau" onclick="window.prosesTindakan('${i.no_spk}', 'VO', 'LULUS')"><i class="fas fa-check"></i> LULUS</button><button class="btn-danger" onclick="window.bukaModalTolak('${i.no_spk}', 'VO')"><i class="fas fa-times"></i> TOLAK</button></div>`;
                htmlCard += `</div>`; return htmlCard;
            }).join('') : "<p style='text-align:center;'>Tiada permohonan VO.</p>";
        }
    }

    if (resTamat && resTamat.status && resTamat.data) {
        let tasksTamat = resTamat.data.filter(i => (role === 'AFC' && i.status_afc === 'PENDING') || (role === 'FC' && i.status_afc === 'LULUS' && i.status_fc === 'PENDING')).length;
        kiraTugas += tasksTamat;

        const contTamat = document.getElementById('senarai-tamat-container');
        if (contTamat) {
            contTamat.innerHTML = resTamat.data.length ? resTamat.data.map(i => {
                const boleh = (role === 'AFC' && i.status_afc === 'PENDING') || (role === 'FC' && i.status_afc === 'LULUS' && i.status_fc === 'PENDING');
                const bdg = (i.status_afc==='BATAL' || i.status_fc==='BATAL') ? 'badge-batal' : ((i.status_afc==='LULUS' && i.status_fc==='LULUS') ? 'badge-lulus' : 'badge-pending');
                let htmlCard = `<div class="kad-vo" style="border-left-color:#ef4444;"><div class="kad-header"><span class="kad-spk">${i.no_spk}</span><span class="badge-status ${bdg}">AFC: ${i.status_afc} | FC: ${i.status_fc}</span></div><div class="kad-body"><p><strong>Tarikh Mohon:</strong> ${new Date(i.tarikh_mohon).toLocaleDateString('ms-MY')}</p><p><strong>Pemohon:</strong> ${i.pemohon}</p><p><strong>Deposit Tahanan (RM):</strong> ${i.wang_tahanan}</p><p><strong>Deposit Amanah (RM):</strong> ${i.wang_amanah}</p>`;
                if (i.catatan) htmlCard += `<p style="color:var(--danger); margin-top:8px;"><strong>Sebab Tolak:</strong> ${i.catatan}</p>`;
                htmlCard += `</div>`; 
                if (boleh) htmlCard += `<div class="kad-actions"><button class="btn-hijau" onclick="window.prosesTindakan('${i.no_spk}', 'TAMAT', 'LULUS')"><i class="fas fa-check"></i> LULUS</button><button class="btn-danger" onclick="window.bukaModalTolak('${i.no_spk}', 'TAMAT')"><i class="fas fa-times"></i> TOLAK</button></div>`;
                htmlCard += `</div>`; return htmlCard;
            }).join('') : "<p style='text-align:center;'>Tiada permohonan Penamatan.</p>";
        }
    }

    badgeNotifikasi.textContent = kiraTugas; 
    badgeNotifikasi.classList.toggle('sembunyi', kiraTugas === 0);
}

window.prosesTindakan = function(noSpk, jenisModul, tindakan, catatan = "") {
    if(tindakan === 'LULUS') {
        const teks = jenisModul === 'VO' ? `Luluskan VO untuk SPK ${noSpk}?` : `Luluskan PENAMATAN untuk SPK ${noSpk}?`;
        Swal.fire({ title: 'Sahkan Kelulusan', text: teks, icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'Ya, Luluskan' })
        .then(result => { if (result.isConfirmed) laksanakanTindakan(noSpk, jenisModul, tindakan, catatan); });
    } else laksanakanTindakan(noSpk, jenisModul, tindakan, catatan);
};

async function laksanakanTindakan(noSpk, jenisModul, tindakan, catatan) {
    const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    const apiName = jenisModul === 'VO' ? 'updateVO' : 'prosesTamat';
    
    const respons = await panggilAPI(apiName, { no_spk: noSpk, role: userSesi.role.toUpperCase(), tindakan: tindakan, catatan: catatan });
    
    if(respons && respons.status) { 
        Swal.fire('Selesai', respons.message, 'success'); 
        document.getElementById('modal-tolak').classList.add('skrin-sembunyi'); 
        semakNotifikasi(userSesi); 
    } else Swal.fire('Ralat Kemas Kini', respons.message, 'error');
}

window.bukaModalTolak = function(noSpk, jenisModul) { 
    document.getElementById('tolak-spk-no').value = noSpk; 
    document.getElementById('tolak-jenis-modul').value = jenisModul; 
    document.getElementById('tajuk-modal-tolak').innerHTML = `Sebab Tolakan (${jenisModul})`;
    document.getElementById('tolak-catatan').value = ""; 
    document.getElementById('modal-tolak').classList.remove('skrin-sembunyi'); 
};
document.getElementById('btn-batal-tolak')?.addEventListener('click', () => document.getElementById('modal-tolak').classList.add('skrin-sembunyi'));
document.getElementById('btn-sahkan-tolak')?.addEventListener('click', () => {
    const catatan = document.getElementById('tolak-catatan').value;
    const jenis = document.getElementById('tolak-jenis-modul').value;
    if(!catatan.trim()) return Swal.fire('Maklumat Tidak Lengkap', 'Sila masukkan sebab tolakan.', 'warning');
    window.prosesTindakan(document.getElementById('tolak-spk-no').value, jenis, 'TOLAK', catatan);
});

const borangProfil = document.getElementById('borang-profil');
if (borangProfil) {
    borangProfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button'); btn.textContent = "Menyimpan..."; btn.disabled = true;
        const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
        const respons = await panggilAPI('updateProfile', { id_user: userSesi.id_user, new_username: document.getElementById('profil-nama').value, new_email: document.getElementById('profil-emel').value, new_password: document.getElementById('profil-password').value });
        btn.textContent = "Simpan Perubahan"; btn.disabled = false;
        
        if (respons && respons.status) {
            Swal.fire({ title: 'Profil Dikemas Kini', text: 'Maklumat disimpan.', icon: 'success' }).then(() => {
                userSesi.username = respons.data.username; userSesi.email = respons.data.email; userSesi.requirePasswordChange = false;
                sessionStorage.setItem('spk_user', JSON.stringify(userSesi));
                paparanNama.textContent = respons.data.username; document.getElementById('profil-password').value = "";
                bukaModul('utama');
            });
        } else Swal.fire('Ralat', respons ? respons.message : "Gagal berhubung", 'error'); 
    });
}
