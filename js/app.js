// Fail: js/app.js
// Versi: V4.0

// ==========================================
// 1. PEMBOLEH UBAH DOM
// ==========================================
const skrinLogin = document.getElementById('skrin-login');
const skrinDashboard = document.getElementById('skrin-dashboard');
const borangLogin = document.getElementById('borang-login');
const borangDaftar = document.getElementById('borang-daftar');
const borangLupaPassword = document.getElementById('borang-lupa-password');
const sidebar = document.getElementById('sidebar');
const senaraiModul = document.querySelectorAll('main > section');
const menuItems = document.querySelectorAll('.menu-item');
const paparanNama = document.getElementById('paparan-nama');
const paparanRole = document.getElementById('paparan-role');
const badgeNotifikasi = document.getElementById('badge-notifikasi');
let grafDashboard = null;
let resetEmail = "";

// ==========================================
// 2. JAM REAL-TIME & AWALAN
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
    tambahBarisPkt(false);
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
// 3. TEMA & MATA PASSWORD
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

// ==========================================
// 4. PASSWORD POLICY VALIDATION [V4.0]
// ==========================================
function validatePasswordPolicy(password) {
    if (!password || password.length < 6) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;
    return true;
}

function kemaskiniHintPassword(password) {
    const checks = {
        'hint-daftar-panjang': password.length >= 6,
        'hint-daftar-besar': /[A-Z]/.test(password),
        'hint-daftar-kecil': /[a-z]/.test(password),
        'hint-daftar-nombor': /[0-9]/.test(password),
        'hint-daftar-simbol': /[^A-Za-z0-9]/.test(password)
    };
    Object.entries(checks).forEach(([id, lulus]) => {
        const el = document.getElementById(id);
        if (el) el.style.color = lulus ? 'var(--success)' : 'var(--text-pudar)';
    });
}

const inputDaftarPassword = document.getElementById('daftar-password');
if (inputDaftarPassword) {
    inputDaftarPassword.addEventListener('input', () => kemaskiniHintPassword(inputDaftarPassword.value));
}

const inputProfilPassword = document.getElementById('profil-password');
if (inputProfilPassword) {
    inputProfilPassword.addEventListener('input', () => {
        const hint = document.getElementById('hint-profil-password');
        if (hint) hint.classList.toggle('skrin-sembunyi', inputProfilPassword.value.trim() === '');
    });
}

// ==========================================
// 5. NAVIGASI BORANG LOGIN
// ==========================================
function tunjukBorangLogin() {
    borangLogin.classList.remove('skrin-sembunyi');
    borangDaftar.classList.add('skrin-sembunyi');
    borangLupaPassword.classList.add('skrin-sembunyi');
    document.getElementById('teks-tukar-daftar').classList.remove('skrin-sembunyi');
}
function tunjukBorangDaftar() {
    borangLogin.classList.add('skrin-sembunyi');
    borangDaftar.classList.remove('skrin-sembunyi');
    borangLupaPassword.classList.add('skrin-sembunyi');
    document.getElementById('teks-tukar-daftar').classList.add('skrin-sembunyi');
}
function tunjukBorangLupaPassword() {
    borangLogin.classList.add('skrin-sembunyi');
    borangDaftar.classList.add('skrin-sembunyi');
    borangLupaPassword.classList.remove('skrin-sembunyi');
    document.getElementById('teks-tukar-daftar').classList.add('skrin-sembunyi');
    document.getElementById('lupa-step-1').classList.remove('skrin-sembunyi');
    document.getElementById('lupa-step-2').classList.add('skrin-sembunyi');
    document.getElementById('mesej-lupa').textContent = '';
    resetEmail = "";
}

const linkDaftar = document.getElementById('link-daftar');
const linkLogin = document.getElementById('link-login');
const linkLupaPassword = document.getElementById('link-lupa-password');
const linkKembaliLogin = document.getElementById('link-kembali-login');

if (linkDaftar) linkDaftar.addEventListener('click', (e) => { e.preventDefault(); tunjukBorangDaftar(); });
if (linkLogin) linkLogin.addEventListener('click', (e) => { e.preventDefault(); tunjukBorangLogin(); });
if (linkLupaPassword) linkLupaPassword.addEventListener('click', (e) => { e.preventDefault(); tunjukBorangLupaPassword(); });
if (linkKembaliLogin) linkKembaliLogin.addEventListener('click', (e) => { e.preventDefault(); tunjukBorangLogin(); });

// ==========================================
// 6. AUTENTIKASI
// ==========================================

// --- Borang Daftar [V4.0: +password fields + validation] ---
if (borangDaftar) {
    borangDaftar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('daftar-password').value;
        const passwordSahkan = document.getElementById('daftar-password-sahkan').value;

        if (!validatePasswordPolicy(password)) {
            return Swal.fire('Kata Laluan Tidak Sah', 'Kata laluan mesti sekurang-kurangnya 6 aksara dan mengandungi huruf besar, huruf kecil, nombor, dan simbol.', 'warning');
        }
        if (password !== passwordSahkan) {
            return Swal.fire('Kata Laluan Tidak Sepadan', 'Kata laluan dan pengesahan kata laluan tidak sama.', 'warning');
        }

        const btn = document.getElementById('btn-daftar');
        btn.textContent = "Sila Tunggu..."; btn.disabled = true;
        const respons = await panggilAPI('register', {
            username: document.getElementById('daftar-username').value,
            email: document.getElementById('daftar-email').value,
            role: document.getElementById('daftar-role').value,
            password: password
        });
        btn.textContent = "Daftar Akaun"; btn.disabled = false;
        if (respons && respons.status) {
            Swal.fire({ title: 'Berjaya!', text: respons.message, icon: 'success', confirmButtonColor: '#10b981' })
            .then(() => { borangDaftar.reset(); tunjukBorangLogin(); });
        } else {
            Swal.fire('Ralat', respons ? respons.message : "Gagal berhubung.", 'error');
        }
    });
}

// --- Borang Log Masuk ---
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
            if (document.getElementById('ingat-saya').checked) {
                localStorage.setItem('spk_saved_username', uname);
            } else {
                localStorage.removeItem('spk_saved_username');
            }
            borangLogin.reset();
            binaDashboard(respons.data);
        } else {
            Swal.fire('Gagal', respons ? respons.message : "Ralat pelayan.", 'error');
        }
    });
}

// --- 2FA Lupa Kata Laluan [V4.0] ---
const btnHantarPin = document.getElementById('btn-hantar-pin');
if (btnHantarPin) {
    btnHantarPin.addEventListener('click', async () => {
        const email = document.getElementById('lupa-email').value.trim();
        const mesejEl = document.getElementById('mesej-lupa');
        if (!email) { mesejEl.textContent = "Sila masukkan alamat e-mel."; return; }

        btnHantarPin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghantar...'; btnHantarPin.disabled = true;
        mesejEl.textContent = "";

        const respons = await panggilAPI('requestResetPin', { email: email });
        btnHantarPin.innerHTML = '<i class="fas fa-paper-plane"></i> Hantar PIN'; btnHantarPin.disabled = false;

        if (respons && respons.status) {
            resetEmail = email;
            document.getElementById('lupa-step-1').classList.add('skrin-sembunyi');
            document.getElementById('lupa-step-2').classList.remove('skrin-sembunyi');
            document.getElementById('lupa-step2-hint').textContent = `PIN telah dihantar ke ${email}. Sah selama 15 minit.`;
            document.getElementById('lupa-pin').value = '';
            document.getElementById('lupa-password-baru').value = '';
            document.getElementById('lupa-password-sahkan').value = '';
            document.getElementById('mesej-step2').textContent = '';
        } else {
            mesejEl.textContent = respons ? respons.message : "Gagal berhubung dengan pelayan.";
        }
    });
}

const btnTetapkanPassword = document.getElementById('btn-tetapkan-password');
if (btnTetapkanPassword) {
    btnTetapkanPassword.addEventListener('click', async () => {
        const pin = document.getElementById('lupa-pin').value.trim();
        const passwordBaru = document.getElementById('lupa-password-baru').value;
        const passwordSahkan = document.getElementById('lupa-password-sahkan').value;
        const mesejEl = document.getElementById('mesej-step2');
        mesejEl.textContent = "";

        if (!pin || pin.length !== 4) { mesejEl.textContent = "Sila masukkan PIN 4 digit."; return; }
        if (!validatePasswordPolicy(passwordBaru)) {
            mesejEl.textContent = "Kata laluan mesti sekurang-kurangnya 6 aksara dan mengandungi huruf besar, huruf kecil, nombor, dan simbol."; return;
        }
        if (passwordBaru !== passwordSahkan) { mesejEl.textContent = "Kata laluan tidak sepadan."; return; }

        btnTetapkanPassword.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengesahkan...'; btnTetapkanPassword.disabled = true;

        const respons = await panggilAPI('verifyResetPin', { email: resetEmail, pin: pin, new_password: passwordBaru });
        btnTetapkanPassword.innerHTML = '<i class="fas fa-check-circle"></i> Tetapkan Kata Laluan'; btnTetapkanPassword.disabled = false;

        if (respons && respons.status) {
            Swal.fire({ title: 'Berjaya!', text: respons.message, icon: 'success', confirmButtonColor: '#10b981' })
            .then(() => { borangLupaPassword.reset(); tunjukBorangLogin(); resetEmail = ""; });
        } else {
            mesejEl.textContent = respons ? respons.message : "Gagal berhubung dengan pelayan.";
        }
    });
}

const linkHantarSemula = document.getElementById('link-hantar-semula');
if (linkHantarSemula) {
    linkHantarSemula.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('lupa-step-2').classList.add('skrin-sembunyi');
        document.getElementById('lupa-step-1').classList.remove('skrin-sembunyi');
        document.getElementById('mesej-lupa').textContent = '';
        resetEmail = "";
    });
}

// --- Logout ---
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        Swal.fire({ title: 'Log Keluar?', icon: 'question', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya' })
        .then(async (r) => {
            if (r.isConfirmed) {
                try { await panggilAPI('logout', {}); } catch (err) { console.warn("Gagal hubungi server semasa logout.", err); }
                sessionStorage.removeItem('spk_user');
                window.location.reload();
            }
        });
    });
}

// ==========================================
// 7. NAVIGASI MENU & BINA DASHBOARD
// ==========================================
function binaDashboard(user) {
    skrinLogin.classList.replace('skrin-aktif', 'skrin-sembunyi');
    skrinDashboard.classList.replace('skrin-sembunyi', 'skrin-aktif');
    paparanNama.textContent = user.username;
    paparanRole.textContent = user.role;
    document.getElementById('profil-nama').value = user.username;
    document.getElementById('profil-emel').value = user.email;

    document.querySelectorAll('.menu-kerani, .menu-fs, .menu-afc-fc, .menu-admin').forEach(el => el.classList.add('skrin-sembunyi'));

    const role = user.role.toUpperCase();
    if (['KERANI', 'ADMIN'].includes(role)) document.querySelectorAll('.menu-kerani').forEach(el => el.classList.remove('skrin-sembunyi'));
    if (['FS', 'ADMIN'].includes(role)) document.querySelectorAll('.menu-fs').forEach(el => el.classList.remove('skrin-sembunyi'));
    if (['AFC', 'FC', 'ADMIN'].includes(role)) document.querySelectorAll('.menu-afc-fc').forEach(el => el.classList.remove('skrin-sembunyi'));
    if (role === 'ADMIN') {
        document.querySelectorAll('.menu-admin').forEach(el => el.classList.remove('skrin-sembunyi'));
        semakBadgePendingAkaun(user);
    }

    bukaModul('utama');
    semakNotifikasi(user);
}

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        menuItems.forEach(m => m.classList.remove('aktif'));
        item.classList.add('aktif');
        const target = item.getAttribute('data-target');
        bukaModul(target);
        if (window.innerWidth <= 768) sidebar.classList.remove('buka-mobile');
        if (target === 'kelulusan-vo' || target === 'kelulusan-tamat') semakNotifikasi(JSON.parse(sessionStorage.getItem('spk_user')));
        if (target === 'pengurusan-akaun') muatSenaraiPendingAkaun();
    });
});

function bukaModul(idModul) {
    senaraiModul.forEach(m => m.classList.replace('modul-aktif', 'modul-sembunyi'));
    const targetEl = document.getElementById(`modul-${idModul}`);
    if (targetEl) targetEl.classList.replace('modul-sembunyi', 'modul-aktif');
    if (idModul === 'utama') tarikDataDashboard();
}

const btnProfil = document.getElementById('btn-profil');
if (btnProfil) btnProfil.addEventListener('click', () => { menuItems.forEach(m => m.classList.remove('aktif')); bukaModul('profil'); });

const btnMenu = document.getElementById('btn-menu');
if (btnMenu) {
    btnMenu.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('buka-mobile');
        } else {
            sidebar.classList.toggle('sembunyi-desktop');
            document.getElementById('kandungan-utama').classList.toggle('kembang-desktop');
        }
    });
}

// ==========================================
// 8. DASHBOARD GRAF [V4.0: +total_tamat]
// ==========================================
async function tarikDataDashboard() {
    const respons = await panggilAPI('getDashboardData', {});
    if (respons && respons.status) {
        document.getElementById('stat-spk').textContent = respons.data.total_spk;
        document.getElementById('stat-tamat').textContent = respons.data.total_tamat || 0;
        document.getElementById('stat-bayaran').textContent = `RM ${respons.data.jumlah_bayaran.toLocaleString('ms-MY', {minimumFractionDigits: 2})}`;
        document.getElementById('stat-vo-lulus').textContent = respons.data.vo_lulus;
        document.getElementById('stat-vo-pending').textContent = respons.data.vo_pending;

        const ctx = document.getElementById('grafSpkBayaran').getContext('2d');
        if (grafDashboard) grafDashboard.destroy();
        grafDashboard = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['SPK Aktif', 'SPK Selesai', 'VO Lulus', 'VO Tertunggak'],
                datasets: [{
                    label: 'Statistik Data',
                    data: [respons.data.total_spk, respons.data.total_tamat || 0, respons.data.vo_lulus, respons.data.vo_pending],
                    backgroundColor: ['#3b82f6', '#475569', '#10b981', '#f59e0b'],
                    borderRadius: 8
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
}

// ==========================================
// 9. CARIAN UNIVERSAL SPK
// ==========================================
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
                document.getElementById('hasil-jadual-pkt').innerHTML = d.detail_pkt.map(p => `
                    <tr><td>${p.kod_pkt}</td><td>${p.kuantiti}</td>
                    <td>RM ${parseFloat(p.harga_seunit).toLocaleString('ms-MY', {minimumFractionDigits: 2})}</td>
                    <td>RM ${parseFloat(p.jumlah_rm).toLocaleString('ms-MY', {minimumFractionDigits: 2})}</td></tr>`).join('');
            } else {
                seksyenDetailPkt.classList.add('skrin-sembunyi');
            }

            const htmlBayar = d.bayaran.map(b => {
                const potongTerkumpul = (parseFloat(b.wang_amanah)||0) + (parseFloat(b.wang_tahanan)||0) + (parseFloat(b.denda)||0);
                let titleDenda = b.catatan_denda ? `title="Denda: ${b.catatan_denda}"` : "";
                return `<tr ${titleDenda}>
                    <td>${new Date(b.tarikh).toLocaleDateString('ms-MY')}</td>
                    <td>${b.pkt || '-'}</td><td>${b.kuantiti}</td><td>${b.peratus || 100}%</td>
                    <td>RM ${parseFloat(b.nilai_kasar || 0).toLocaleString('ms-MY', {minimumFractionDigits: 2})}</td>
                    <td style="color:var(--danger);">- RM ${potongTerkumpul.toLocaleString('ms-MY', {minimumFractionDigits: 2})}</td>
                    <td style="font-weight:bold; color:var(--success);">RM ${parseFloat(b.nilai_bersih || 0).toLocaleString('ms-MY', {minimumFractionDigits: 2})}</td>
                </tr>`;
            }).join('');
            document.getElementById('hasil-jadual-bayaran').innerHTML = htmlBayar || `<tr><td colspan="7" style="text-align:center;">Tiada sejarah bayaran</td></tr>`;

            const htmlVo = d.vo.map(v => `
                <tr><td>${new Date(v.tarikh).toLocaleDateString('ms-MY')}</td>
                <td>${v.jenis_vo}</td><td>${v.kuantiti_dipohon}</td>
                <td>${v.status_afc}</td><td>${v.status_fc}</td></tr>`).join('');
            document.getElementById('hasil-jadual-vo').innerHTML = htmlVo || `<tr><td colspan="5" style="text-align:center;">Tiada sejarah VO</td></tr>`;

        } else {
            document.getElementById('paparan-hasil-carian').classList.add('skrin-sembunyi');
            Swal.fire('Tidak Dijumpai', respons.message, 'error');
        }
    });
}

const btnBatalAmanah = document.getElementById('btn-batal-amanah');
if (btnBatalAmanah) btnBatalAmanah.addEventListener('click', () => document.getElementById('modal-amanah').classList.add('skrin-sembunyi'));

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

// ==========================================
// 10. DAFTAR SPK [V4.0: +validate PKT + validate tarikh]
// ==========================================
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
        containerBarisPkt.innerHTML = '';
        tambahBarisPkt(false);
        if (e.target.value === 'PELBAGAI') {
            btnTambahPkt.classList.remove('skrin-sembunyi');
        } else {
            btnTambahPkt.classList.add('skrin-sembunyi');
        }
        kiraTotalSPK();
    });
}

function tambahBarisPkt(bolehBuang = true) {
    const div = document.createElement('div');
    div.className = 'baris-pkt-item';
    div.style.cssText = 'display:grid; grid-template-columns: 2fr 2fr 2fr 2fr auto; gap:10px; align-items:end; margin-bottom:10px;';
    div.innerHTML = `
        <div class="form-group" style="margin:0;"><label>No. PKT / Kerja</label><input type="text" class="input-pkt-no" required></div>
        <div class="form-group" style="margin:0;"><label>Kuantiti</label><input type="number" step="0.01" class="input-pkt-kuantiti" required></div>
        <div class="form-group" style="margin:0;"><label>RM/Unit</label><input type="number" step="0.01" class="input-pkt-harga" required></div>
        <div class="form-group" style="margin:0;"><label>Jumlah (RM)</label><input type="number" step="0.01" class="input-pkt-jumlah" readonly style="background:#e9ecef;"></div>
        <button type="button" class="btn-buang-pkt btn-danger" style="padding:12px; height:max-content; ${bolehBuang ? '' : 'display:none;'}"><i class="fas fa-trash"></i></button>
    `;
    const inputK = div.querySelector('.input-pkt-kuantiti');
    const inputH = div.querySelector('.input-pkt-harga');
    const inputJ = div.querySelector('.input-pkt-jumlah');
    const kiraRow = () => {
        inputJ.value = ((parseFloat(inputK.value) || 0) * (parseFloat(inputH.value) || 0)).toFixed(2);
        kiraTotalSPK();
    };
    inputK.addEventListener('input', kiraRow);
    inputH.addEventListener('input', kiraRow);
    if (bolehBuang) {
        div.querySelector('.btn-buang-pkt').addEventListener('click', () => { div.remove(); kiraTotalSPK(); });
    }
    containerBarisPkt.appendChild(div);
}

if (btnTambahPkt) btnTambahPkt.addEventListener('click', () => tambahBarisPkt(true));

function kiraTotalSPK() {
    let totalK = 0, totalN = 0;
    document.querySelectorAll('.baris-pkt-item').forEach(r => {
        totalK += parseFloat(r.querySelector('.input-pkt-kuantiti').value) || 0;
        totalN += parseFloat(r.querySelector('.input-pkt-jumlah').value) || 0;
    });
    document.getElementById('spk-kuantiti-total').value = totalK.toFixed(2);
    document.getElementById('spk-nilai-total').value = totalN.toFixed(2);
}

const borangDaftarSPK = document.getElementById('borang-daftar-spk');
if (borangDaftarSPK) {
    borangDaftarSPK.addEventListener('submit', async (e) => {
        e.preventDefault();

        // [V4.0 C3] Validate PKT tidak kosong
        let pktArr = [];
        let adaPktKosong = false;
        document.querySelectorAll('.baris-pkt-item').forEach(r => {
            const noPkt = r.querySelector('.input-pkt-no').value.trim();
            if (!noPkt) adaPktKosong = true;
            pktArr.push({
                no_pkt: noPkt,
                kuantiti: r.querySelector('.input-pkt-kuantiti').value,
                harga_seunit: r.querySelector('.input-pkt-harga').value,
                jumlah_rm: r.querySelector('.input-pkt-jumlah').value
            });
        });
        if (adaPktKosong) {
            return Swal.fire('Maklumat Tidak Lengkap', 'Sila lengkapkan No. PKT / Kerja untuk semua baris.', 'warning');
        }

        // [V4.0 C4] Validate tarikh
        const tarikhMula = document.getElementById('spk-mula').value;
        const tarikhTamat = document.getElementById('spk-tamat').value;
        if (tarikhMula && tarikhTamat && new Date(tarikhTamat) <= new Date(tarikhMula)) {
            return Swal.fire('Tarikh Tidak Sah', 'Tarikh Tamat mestilah selepas Tarikh Mula.', 'warning');
        }

        const btn = e.target.querySelector('button');
        btn.textContent = "Menyimpan..."; btn.disabled = true;

        const respons = await panggilAPI('createSPK', {
            no_spk: document.getElementById('spk-no').value,
            no_po: document.getElementById('spk-po').value,
            nama_kontrak: document.getElementById('spk-nama').value,
            alamat_kontrak: document.getElementById('spk-alamat').value,
            no_vendor: document.getElementById('spk-vendor').value,
            blok: document.getElementById('spk-blok').value,
            jenis_kerja: document.getElementById('spk-jenis').value,
            mode: document.getElementById('spk-mode').value,
            unit: document.getElementById('spk-unit').value,
            senarai_pkt_data: pktArr,
            kuantiti_total: document.getElementById('spk-kuantiti-total').value,
            nilai_total: document.getElementById('spk-nilai-total').value,
            ada_tahanan: document.getElementById('spk-tahanan').value,
            ada_amanah: document.getElementById('spk-amanah').value,
            nilai_amanah: document.getElementById('spk-nilai-amanah').value || 0,
            cara_bayaran: document.getElementById('spk-cara-bayaran')?.value || "",
            insuran: document.getElementById('spk-insuran').value,
            frequency_month: document.getElementById('spk-freq').value,
            tarikh_mula: tarikhMula,
            tarikh_tamat: tarikhTamat,
            created_by: JSON.parse(sessionStorage.getItem('spk_user')).email
        });
        btn.textContent = "Daftar SPK Induk"; btn.disabled = false;
        if (respons && respons.status) {
            Swal.fire('Pendaftaran SPK Berjaya', respons.message, 'success').then(() => {
                borangDaftarSPK.reset();
                containerBarisPkt.innerHTML = '';
                tambahBarisPkt(false);
                bukaModul('utama');
            });
        } else {
            Swal.fire('Ralat', respons.message, 'error');
        }
    });
}

// ==========================================
// 11. REKOD BAYARAN
// ==========================================
function kiraNetPayable() {
    let totalKasar = 0;
    document.querySelectorAll('.baris-kerja-bayaran').forEach(tr => {
        const harga = parseFloat(tr.querySelector('.bayaran-row-harga').value) || 0;
        const kuantiti = parseFloat(tr.querySelector('.bayaran-row-kuantiti').value) || 0;
        const peratus = parseFloat(tr.querySelector('.bayaran-row-peratus').value) || 0;
        const kasar = harga * kuantiti * (peratus / 100);
        tr.querySelector('.bayaran-row-kasar').value = kasar.toFixed(2);
        totalKasar += kasar;
    });
    const wa = parseFloat(document.getElementById('bayaran-wa').value) || 0;
    const wt = parseFloat(document.getElementById('bayaran-wt').value) || 0;
    const denda = parseFloat(document.getElementById('bayaran-denda').value) || 0;
    document.getElementById('paparan-net-payable').textContent = `RM ${(totalKasar - wa - wt - denda).toLocaleString('ms-MY', {minimumFractionDigits: 2})}`;
}

['bayaran-wa', 'bayaran-wt', 'bayaran-denda'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', kiraNetPayable);
});

const btnTarikBayaran = document.getElementById('btn-tarik-bayaran');
if (btnTarikBayaran) {
    btnTarikBayaran.addEventListener('click', async () => {
        const inputSpk = document.getElementById('bayaran-carian-spk').value;
        if (!inputSpk) return Swal.fire('Perhatian', 'Sila masukkan No SPK/PO', 'warning');
        btnTarikBayaran.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; btnTarikBayaran.disabled = true;
        const respons = await panggilAPI('getSpkDetail', { no_spk: inputSpk });
        btnTarikBayaran.innerHTML = '<i class="fas fa-download"></i> Tarik'; btnTarikBayaran.disabled = false;

        if (respons && respons.status) {
            const d = respons.data;
            if (d.spk_status !== 'ACTIVE') {
                document.getElementById('kawasan-kerja-bayaran').classList.add('skrin-sembunyi');
                return Swal.fire({
                    title: 'SPK Tidak Aktif',
                    html: `SPK <strong>${d.no_spk}</strong> berstatus <strong>"${d.spk_status}"</strong>.<br><br>Sijil Bayaran hanya boleh direkodkan untuk SPK yang masih <strong>AKTIF</strong>.`,
                    icon: 'error', confirmButtonColor: '#ef4444'
                });
            }

            document.getElementById('bayaran-no-spk').value = d.no_spk;
            document.getElementById('bayaran-no-po').value = d.no_po;
            document.getElementById('bayaran-cara-db').value = d.cara_bayaran || "Tiada";
            document.getElementById('kawasan-kerja-bayaran').classList.remove('skrin-sembunyi');

            const tbody = document.getElementById('tbody-kerja-bayaran');
            tbody.innerHTML = '';
            if (d.senarai_pkt && d.senarai_pkt.length > 0) {
                d.senarai_pkt.forEach(pkt => {
                    const tr = document.createElement('tr');
                    tr.className = 'baris-kerja-bayaran';
                    tr.innerHTML = `
                        <td><input type="text" class="bayaran-row-pkt" value="${pkt.kod_pkt}" readonly style="background:#e9ecef; border:none; font-weight:bold; width:100%;"></td>
                        <td><input type="number" step="0.01" class="bayaran-row-harga" value="${pkt.harga_seunit}" readonly style="background:#e9ecef; border:none; width:100%;"></td>
                        <td><input type="number" step="0.01" class="bayaran-row-kuantiti" value="0" required min="0" style="width:100%;"></td>
                        <td><input type="number" step="0.01" class="bayaran-row-peratus" value="100" required min="0" style="width:100%;"></td>
                        <td><input type="number" step="0.01" class="bayaran-row-kasar" value="0.00" readonly style="background:#e9ecef; border:none; font-weight:bold; color:var(--primary-color); width:100%;"></td>
                    `;
                    tbody.appendChild(tr);
                    tr.querySelector('.bayaran-row-kuantiti').addEventListener('input', kiraNetPayable);
                    tr.querySelector('.bayaran-row-peratus').addEventListener('input', kiraNetPayable);
                });
            }

            const hintWa = document.getElementById('hint-wa');
            document.getElementById('bayaran-wa').value = 0;
            document.getElementById('bayaran-wt').value = 0;
            document.getElementById('bayaran-denda').value = 0;
            document.getElementById('bayaran-catatan-denda').value = "";

            if (d.cara_bayaran === "Potong Sijil Bayaran") {
                hintWa.textContent = "(SPK ini didaftarkan untuk pemotongan WA)";
                hintWa.style.color = "var(--success)";
            } else {
                hintWa.textContent = `(SPK ini menggunakan ${d.cara_bayaran || 'Tiada'}, abaikan jika tiada potongan)`;
                hintWa.style.color = "var(--warning)";
            }
            kiraNetPayable();
            Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'Data SPK ditarik!', showConfirmButton: false, timer: 1500});
        } else {
            Swal.fire('Gagal', respons.message, 'error');
            document.getElementById('kawasan-kerja-bayaran').classList.add('skrin-sembunyi');
        }
    });
}

const borangBayaran = document.getElementById('borang-bayaran');
if (borangBayaran) {
    borangBayaran.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!document.getElementById('bayaran-no-spk').value) return Swal.fire('Ralat', 'Sila tarik data SPK dahulu.', 'error');
        let senaraiKerja = [], totalKuantitiDiisi = 0;
        document.querySelectorAll('.baris-kerja-bayaran').forEach(tr => {
            const k = parseFloat(tr.querySelector('.bayaran-row-kuantiti').value) || 0;
            totalKuantitiDiisi += k;
            senaraiKerja.push({
                pkt: tr.querySelector('.bayaran-row-pkt').value,
                harga: tr.querySelector('.bayaran-row-harga').value,
                kuantiti: k,
                peratus: tr.querySelector('.bayaran-row-peratus').value,
                nilai_kasar: tr.querySelector('.bayaran-row-kasar').value
            });
        });
        if (totalKuantitiDiisi <= 0) return Swal.fire('Perhatian', 'Sila masukkan kuantiti disiapkan sekurang-kurangnya untuk satu PKT/Kerja.', 'warning');
        const btn = e.target.querySelector('button'); btn.textContent = "Sedang Menyimpan..."; btn.disabled = true;
        const respons = await panggilAPI('addPayment', {
            no_spk: document.getElementById('bayaran-no-spk').value,
            no_po: document.getElementById('bayaran-no-po').value,
            senarai_bayaran: senaraiKerja,
            potongan_wa: document.getElementById('bayaran-wa').value || 0,
            potongan_wt: document.getElementById('bayaran-wt').value || 0,
            potongan_denda: document.getElementById('bayaran-denda').value || 0,
            catatan_denda: document.getElementById('bayaran-catatan-denda').value || "",
            dikunci_oleh: JSON.parse(sessionStorage.getItem('spk_user')).email
        });
        btn.textContent = "Simpan Sijil Bayaran"; btn.disabled = false;
        if (respons && respons.status) {
            Swal.fire('Berjaya', respons.message + `\nBaki Kuantiti Terkini: ${respons.data.baki_terkini}`, respons.data.amaran_dihantar ? 'warning' : 'success')
            .then(() => { borangBayaran.reset(); document.getElementById('kawasan-kerja-bayaran').classList.add('skrin-sembunyi'); document.getElementById('paparan-net-payable').textContent = "RM 0.00"; });
        } else {
            Swal.fire('Ralat', respons.message, 'error');
        }
    });
}

// ==========================================
// 12. MOHON VO
// ==========================================
function kiraJumlahVO() {
    let totalNilai = 0;
    document.querySelectorAll('.baris-pkt-vo').forEach(tr => {
        const harga = parseFloat(tr.querySelector('.vo-pkt-harga').value) || 0;
        const kuantiti = parseFloat(tr.querySelector('.vo-pkt-kuantiti').value) || 0;
        const nilai = harga * kuantiti;
        tr.querySelector('.vo-pkt-nilai').value = nilai.toFixed(2);
        totalNilai += nilai;
    });
    const el = document.getElementById('paparan-jumlah-vo');
    if (el) el.textContent = `RM ${totalNilai.toLocaleString('ms-MY', {minimumFractionDigits: 2})}`;
}

const btnTarikVo = document.getElementById('btn-tarik-vo');
if (btnTarikVo) {
    btnTarikVo.addEventListener('click', async () => {
        const inputSpk = document.getElementById('vo-carian-spk').value;
        if (!inputSpk) return Swal.fire('Perhatian', 'Masukkan No SPK/PO', 'warning');
        btnTarikVo.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; btnTarikVo.disabled = true;
        const respons = await panggilAPI('getSpkDetail', { no_spk: inputSpk });
        btnTarikVo.innerHTML = '<i class="fas fa-download"></i> Tarik'; btnTarikVo.disabled = false;

        if (respons && respons.status) {
            const d = respons.data;
            document.getElementById('vo-no-spk').value = d.no_spk;
            document.getElementById('vo-no-po').value = d.no_po;
            document.getElementById('vo-pkt').value = d.pkt;
            document.getElementById('vo-nilai-semasa').value = d.nilai_semasa;

            const kawasanPktVO = document.getElementById('kawasan-pkt-vo');
            const kotakVoKuantiti = document.getElementById('kotak-vo-kuantiti');
            const kotakVoNilai = document.getElementById('kotak-vo-nilai');

            if (d.senarai_pkt && d.senarai_pkt.length > 0) {
                kawasanPktVO.classList.remove('skrin-sembunyi');
                kotakVoKuantiti.classList.add('skrin-sembunyi');
                kotakVoNilai.classList.add('skrin-sembunyi');

                const tbody = document.getElementById('tbody-pkt-vo');
                tbody.innerHTML = '';
                d.senarai_pkt.forEach(pkt => {
                    const tr = document.createElement('tr');
                    tr.className = 'baris-pkt-vo';
                    tr.innerHTML = `
                        <td><input type="text" class="vo-pkt-kod" value="${pkt.kod_pkt}" readonly style="background:#e9ecef; border:none; font-weight:bold; width:100%;"></td>
                        <td><input type="number" step="0.01" class="vo-pkt-harga" value="${pkt.harga_seunit}" style="width:100%;"></td>
                        <td><input type="number" step="0.01" class="vo-pkt-kuantiti" value="0" min="0" style="width:100%;"></td>
                        <td><input type="number" step="0.01" class="vo-pkt-nilai" value="0.00" readonly style="background:#e9ecef; border:none; font-weight:bold; color:var(--primary-color); width:100%;"></td>
                    `;
                    tbody.appendChild(tr);
                    tr.querySelector('.vo-pkt-harga').addEventListener('input', kiraJumlahVO);
                    tr.querySelector('.vo-pkt-kuantiti').addEventListener('input', kiraJumlahVO);
                });
                kiraJumlahVO();
            } else {
                kawasanPktVO.classList.add('skrin-sembunyi');
                kotakVoKuantiti.classList.remove('skrin-sembunyi');
                kotakVoNilai.classList.remove('skrin-sembunyi');
                document.getElementById('vo-kuantiti-mohon').value = 0;
                document.getElementById('vo-nilai-mohon').value = 0;
            }

            Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'Data ditarik!', showConfirmButton: false, timer: 1500});
        } else {
            Swal.fire('Gagal', respons.message, 'error');
        }
    });
}

const voJenis = document.getElementById('vo-jenis');
if (voJenis) {
    voJenis.addEventListener('change', (e) => {
        const val = e.target.value;
        const kMula = document.getElementById('kotak-vo-mula');
        const kTamat = document.getElementById('kotak-vo-tamat');
        if (val === 'Tambahan Kuantiti') {
            kMula.classList.add('skrin-sembunyi'); kTamat.classList.add('skrin-sembunyi');
        } else {
            kMula.classList.remove('skrin-sembunyi'); kTamat.classList.remove('skrin-sembunyi');
        }
    });
}

const borangMohonVO = document.getElementById('borang-mohon-vo');
if (borangMohonVO) {
    borangMohonVO.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!document.getElementById('vo-no-spk').value) return Swal.fire('Ralat', 'Sila tarik data SPK dahulu.', 'error');
        const btn = e.target.querySelector('button'); btn.textContent = "Sedang Menghantar..."; btn.disabled = true;

        let kuantitiHantar = 0, nilaiHantar = 0;
        document.querySelectorAll('.baris-pkt-vo').forEach(tr => {
            kuantitiHantar += parseFloat(tr.querySelector('.vo-pkt-kuantiti').value) || 0;
            nilaiHantar += parseFloat(tr.querySelector('.vo-pkt-nilai').value) || 0;
        });

        const jenisVO = document.getElementById('vo-jenis').value;
        if (jenisVO !== 'Sambung Masa (EOT)' && kuantitiHantar <= 0) {
            btn.textContent = "Hantar Permohonan VO"; btn.disabled = false;
            return Swal.fire('Perhatian', 'Sila masukkan kuantiti tambahan sekurang-kurangnya untuk satu PKT/Kerja.', 'warning');
        }

        const respons = await panggilAPI('mohonVO', {
            no_spk: document.getElementById('vo-no-spk').value,
            no_po: document.getElementById('vo-no-po').value,
            pkt: document.getElementById('vo-pkt').value,
            nilai_kontrak_semasa: document.getElementById('vo-nilai-semasa').value,
            kuantiti_dipohon: kuantitiHantar,
            nilai_kuantiti_dipohon: nilaiHantar,
            jenis_vo: jenisVO,
            tarikh_mula_baru: document.getElementById('vo-mula-baru').value,
            tarikh_tamat_baru: document.getElementById('vo-tamat-baru').value,
            dikunci_oleh: JSON.parse(sessionStorage.getItem('spk_user')).username
        });
        btn.textContent = "Hantar Permohonan VO"; btn.disabled = false;

        if (respons && respons.status) {
            Swal.fire('Permohonan Dihantar', respons.message, 'success').then(() => {
                borangMohonVO.reset();
                document.getElementById('kawasan-pkt-vo').classList.add('skrin-sembunyi');
                document.getElementById('kotak-vo-kuantiti').classList.remove('skrin-sembunyi');
                document.getElementById('kotak-vo-nilai').classList.remove('skrin-sembunyi');
                document.getElementById('kotak-vo-mula').classList.add('skrin-sembunyi');
                document.getElementById('kotak-vo-tamat').classList.add('skrin-sembunyi');
                const el = document.getElementById('paparan-jumlah-vo');
                if (el) el.textContent = 'RM 0.00';
                bukaModul('utama');
            });
        } else {
            Swal.fire('Ralat VO', respons.message, 'error');
        }
    });
}

// ==========================================
// 13. PENAMATAN SPK
// ==========================================
const btnTarikTamat = document.getElementById('btn-tarik-tamat');
if (btnTarikTamat) {
    btnTarikTamat.addEventListener('click', async () => {
        const inputSpk = document.getElementById('tamat-carian-spk').value;
        if (!inputSpk) return Swal.fire('Perhatian', 'Masukkan No SPK/PO', 'warning');
        btnTarikTamat.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; btnTarikTamat.disabled = true;
        const respons = await panggilAPI('carianUniversal', { carian: inputSpk });
        btnTarikTamat.innerHTML = '<i class="fas fa-download"></i> Tarik'; btnTarikTamat.disabled = false;
        if (respons && respons.status) {
            const d = respons.data;
            document.getElementById('tamat-no-spk').value = d.info_spk.no_spk;
            document.getElementById('tamat-no-po').value = d.info_spk.no_po;
            let totalAmanahPotong = 0, totalTahananPotong = 0;
            if (d.info_spk.cara_bayaran === "Potong Sijil Bayaran") {
                d.bayaran.forEach(b => totalAmanahPotong += (parseFloat(b.wang_amanah) || 0));
            } else {
                totalAmanahPotong = parseFloat(d.info_spk.nilai_amanah) || 0;
            }
            d.bayaran.forEach(b => totalTahananPotong += (parseFloat(b.wang_tahanan) || 0));
            document.getElementById('tamat-wang-tahanan').value = totalTahananPotong.toFixed(2);
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
        if (!document.getElementById('tamat-no-spk').value) return Swal.fire('Ralat', 'Sila tarik data SPK dahulu.', 'error');
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
        if (respons && respons.status) {
            Swal.fire('Permohonan Berjaya', respons.message, 'success').then(() => { borangMohonTamat.reset(); bukaModul('utama'); });
        } else {
            Swal.fire('Ralat', respons.message, 'error');
        }
    });
}

// ==========================================
// 14. NOTIFIKASI & KELULUSAN
// ==========================================
async function semakNotifikasi(user) {
    if (!user) return;
    const role = user.role.toUpperCase();
    const resVO = await panggilAPI('getSenaraiVO', { role: role, username: user.username });
    const resTamat = await panggilAPI('getSenaraiTamat', { role: role, username: user.username });
    let kiraTugas = 0;

    if (resVO && resVO.status && resVO.data) {
        let tasksVO = resVO.data.filter(i =>
            (role === 'AFC' && i.status_afc === 'PENDING') ||
            (role === 'FC' && i.status_afc === 'LULUS' && i.status_fc === 'PENDING')
        ).length;
        kiraTugas += tasksVO;
        const contVO = document.getElementById('senarai-vo-container');
        if (contVO) {
            contVO.innerHTML = resVO.data.length ? resVO.data.map(i => {
                const boleh = (role === 'AFC' && i.status_afc === 'PENDING') ||
                              (role === 'FC' && i.status_afc === 'LULUS' && i.status_fc === 'PENDING');
                const bdg = (i.status_afc==='BATAL'||i.status_fc==='BATAL') ? 'badge-batal' :
                            ((i.status_afc==='LULUS'&&i.status_fc==='LULUS') ? 'badge-lulus' : 'badge-pending');
                let htmlCard = `<div class="kad-vo"><div class="kad-header"><span class="kad-spk">${i.no_spk}</span><span class="badge-status ${bdg}">AFC: ${i.status_afc} | FC: ${i.status_fc}</span></div><div class="kad-body"><p><strong>Jenis:</strong> ${i.jenis_vo}</p><p><strong>Tarikh Mohon:</strong> ${new Date(i.tarikh).toLocaleDateString('ms-MY')}</p><p><strong>Pemohon:</strong> ${i.pemohon}</p>`;
                if (i.jenis_vo.includes('Masa')) htmlCard += `<p><strong>Tarikh Tamat Baharu:</strong> ${i.tarikh_tamat_baru}</p>`;
                else if (i.jenis_vo.includes('Kontrak')) htmlCard += `<p><strong>Kuantiti Dipohon:</strong> ${i.kuantiti_dipohon}</p><p><strong>Nilai (RM):</strong> ${i.nilai_dipohon}</p><p><strong>Tarikh Tamat Baharu:</strong> ${i.tarikh_tamat_baru}</p>`;
                else htmlCard += `<p><strong>Kuantiti Dipohon:</strong> ${i.kuantiti_dipohon}</p><p><strong>Nilai (RM):</strong> ${i.nilai_dipohon}</p>`;
                if (i.catatan_tolak) htmlCard += `<p style="color:var(--danger); margin-top:8px;"><strong>Sebab Tolak:</strong> ${i.catatan_tolak}</p>`;
                htmlCard += `</div>`;
                if (boleh) htmlCard += `<div class="kad-actions"><button class="btn-hijau" onclick="window.prosesTindakan('${i.no_spk}', 'VO', 'LULUS')"><i class="fas fa-check"></i> LULUS</button><button class="btn-danger" onclick="window.bukaModalTolak('${i.no_spk}', 'VO')"><i class="fas fa-times"></i> TOLAK</button></div>`;
                htmlCard += `</div>`;
                return htmlCard;
            }).join('') : "<p style='text-align:center;'>Tiada permohonan VO.</p>";
        }
    }

    if (resTamat && resTamat.status && resTamat.data) {
        let tasksTamat = resTamat.data.filter(i =>
            (role === 'AFC' && i.status_afc === 'PENDING') ||
            (role === 'FC' && i.status_afc === 'LULUS' && i.status_fc === 'PENDING')
        ).length;
        kiraTugas += tasksTamat;
        const contTamat = document.getElementById('senarai-tamat-container');
        if (contTamat) {
            contTamat.innerHTML = resTamat.data.length ? resTamat.data.map(i => {
                const boleh = (role === 'AFC' && i.status_afc === 'PENDING') ||
                              (role === 'FC' && i.status_afc === 'LULUS' && i.status_fc === 'PENDING');
                const bdg = (i.status_afc==='BATAL'||i.status_fc==='BATAL') ? 'badge-batal' :
                            ((i.status_afc==='LULUS'&&i.status_fc==='LULUS') ? 'badge-lulus' : 'badge-pending');
                let htmlCard = `<div class="kad-vo" style="border-left-color:#ef4444;"><div class="kad-header"><span class="kad-spk">${i.no_spk}</span><span class="badge-status ${bdg}">AFC: ${i.status_afc} | FC: ${i.status_fc}</span></div><div class="kad-body"><p><strong>Tarikh Mohon:</strong> ${new Date(i.tarikh_mohon).toLocaleDateString('ms-MY')}</p><p><strong>Pemohon:</strong> ${i.pemohon}</p><p><strong>Deposit Tahanan (RM):</strong> ${i.wang_tahanan}</p><p><strong>Deposit Amanah (RM):</strong> ${i.wang_amanah}</p>`;
                if (i.catatan) htmlCard += `<p style="color:var(--danger); margin-top:8px;"><strong>Sebab Tolak:</strong> ${i.catatan}</p>`;
                htmlCard += `</div>`;
                if (boleh) htmlCard += `<div class="kad-actions"><button class="btn-hijau" onclick="window.prosesTindakan('${i.no_spk}', 'TAMAT', 'LULUS')"><i class="fas fa-check"></i> LULUS</button><button class="btn-danger" onclick="window.bukaModalTolak('${i.no_spk}', 'TAMAT')"><i class="fas fa-times"></i> TOLAK</button></div>`;
                htmlCard += `</div>`;
                return htmlCard;
            }).join('') : "<p style='text-align:center;'>Tiada permohonan Penamatan.</p>";
        }
    }

    badgeNotifikasi.textContent = kiraTugas;
    badgeNotifikasi.classList.toggle('sembunyi', kiraTugas === 0);
}

window.prosesTindakan = function(noSpk, jenisModul, tindakan, catatan = "") {
    if (tindakan === 'LULUS') {
        const teks = jenisModul === 'VO' ? `Luluskan VO untuk SPK ${noSpk}?` : `Luluskan PENAMATAN untuk SPK ${noSpk}?`;
        Swal.fire({ title: 'Sahkan Kelulusan', text: teks, icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'Ya, Luluskan' })
        .then(result => { if (result.isConfirmed) laksanakanTindakan(noSpk, jenisModul, tindakan, catatan); });
    } else {
        laksanakanTindakan(noSpk, jenisModul, tindakan, catatan);
    }
};

async function laksanakanTindakan(noSpk, jenisModul, tindakan, catatan) {
    const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    const apiName = jenisModul === 'VO' ? 'updateVO' : 'prosesTamat';
    const respons = await panggilAPI(apiName, { no_spk: noSpk, role: userSesi.role.toUpperCase(), tindakan: tindakan, catatan: catatan });
    if (respons && respons.status) {
        Swal.fire('Selesai', respons.message, 'success');
        document.getElementById('modal-tolak').classList.add('skrin-sembunyi');
        semakNotifikasi(userSesi);
    } else {
        Swal.fire('Ralat Kemas Kini', respons.message, 'error');
    }
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
    if (!catatan.trim()) return Swal.fire('Maklumat Tidak Lengkap', 'Sila masukkan sebab tolakan.', 'warning');
    window.prosesTindakan(document.getElementById('tolak-spk-no').value, jenis, 'TOLAK', catatan);
});

// ==========================================
// 15. PROFIL [V4.0: +password policy validation]
// ==========================================
const borangProfil = document.getElementById('borang-profil');
if (borangProfil) {
    borangProfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('profil-password').value;
        const oldPassword = document.getElementById('profil-password-lama').value;
        if (newPassword && newPassword.trim() !== "") {
            if (!oldPassword || oldPassword.trim() === "") {
                return Swal.fire('Maklumat Tidak Lengkap', 'Sila masukkan Kata Laluan Semasa (Lama) untuk menukar kata laluan.', 'warning');
            }
            if (!validatePasswordPolicy(newPassword)) {
                return Swal.fire('Kata Laluan Tidak Sah', 'Kata laluan mesti sekurang-kurangnya 6 aksara dan mengandungi huruf besar, huruf kecil, nombor, dan simbol.', 'warning');
            }
        }
        const btn = e.target.querySelector('button'); btn.textContent = "Menyimpan..."; btn.disabled = true;
        const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
        const respons = await panggilAPI('updateProfile', {
            id_user: userSesi.id_user,
            new_username: document.getElementById('profil-nama').value,
            new_email: document.getElementById('profil-emel').value,
            old_password: oldPassword,
            new_password: newPassword
        });
        btn.textContent = "Simpan Perubahan"; btn.disabled = false;
        if (respons && respons.status) {
            Swal.fire({ title: 'Profil Dikemas Kini', text: 'Maklumat berjaya disimpan.', icon: 'success' })
            .then(() => {
                userSesi.username = respons.data.username;
                userSesi.email = respons.data.email;
                userSesi.requirePasswordChange = false;
                sessionStorage.setItem('spk_user', JSON.stringify(userSesi));
                paparanNama.textContent = respons.data.username;
                document.getElementById('profil-password').value = "";
                document.getElementById('profil-password-lama').value = "";
                bukaModul('utama');
            });
        } else {
            Swal.fire('Ralat', respons ? respons.message : "Gagal berhubung", 'error');
        }
    });
}

// ==========================================
// 16. PENGURUSAN AKAUN ADMIN [V4.0: 3 Tab]
// ==========================================
window.tunjukTabAkaun = function(tab) {
    document.getElementById('seksyen-pending-akaun').classList.add('skrin-sembunyi');
    document.getElementById('seksyen-aktif-akaun').classList.add('skrin-sembunyi');
    document.getElementById('seksyen-disabled-akaun').classList.add('skrin-sembunyi');

    document.getElementById('tab-pending').className = 'btn-sekunder';
    document.getElementById('tab-aktif').className = 'btn-sekunder';
    document.getElementById('tab-disabled').className = 'btn-sekunder';

    document.getElementById(`seksyen-${tab}-akaun`).classList.remove('skrin-sembunyi');
    document.getElementById(`tab-${tab}`).className = 'btn-utama';

    if (tab === 'aktif' || tab === 'disabled') muatSenaraiPengguna();
};

document.getElementById('tab-pending').style.cssText = 'width:auto; padding:10px 20px;';
document.getElementById('tab-aktif').style.cssText = 'width:auto; padding:10px 20px;';
document.getElementById('tab-disabled').style.cssText = 'width:auto; padding:10px 20px;';

async function semakBadgePendingAkaun(user) {
    if (!user || user.role.toUpperCase() !== 'ADMIN') return;
    const respons = await panggilAPI('getSenaraiPending', { role: user.role.toUpperCase() });
    if (respons && respons.status) {
        const badge = document.getElementById('badge-pending-akaun');
        const badgeTab = document.getElementById('badge-pending-akaun-tab');
        if (badge) { badge.textContent = respons.jumlah; badge.classList.toggle('sembunyi', respons.jumlah === 0); }
        if (badgeTab) badgeTab.textContent = respons.jumlah;
    }
}

async function muatSenaraiPendingAkaun() {
    const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    if (!userSesi || userSesi.role.toUpperCase() !== 'ADMIN') return;
    const container = document.getElementById('senarai-pending-container');
    if (!container) return;
    container.innerHTML = `<p style="text-align:center; color:var(--text-pudar);"><i class="fas fa-spinner fa-spin"></i> Sedang memuat turun data...</p>`;
    const respons = await panggilAPI('getSenaraiPending', { role: userSesi.role.toUpperCase() });
    if (respons && respons.status) {
        const badge = document.getElementById('badge-pending-akaun');
        const badgeTab = document.getElementById('badge-pending-akaun-tab');
        if (badge) { badge.textContent = respons.jumlah; badge.classList.toggle('sembunyi', respons.jumlah === 0); }
        if (badgeTab) badgeTab.textContent = respons.jumlah;

        if (respons.data.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-pudar);"><i class="fas fa-check-circle" style="font-size:50px; color:var(--success); margin-bottom:15px;"></i><h3 style="margin-bottom:8px;">Tiada Permohonan Baharu</h3><p>Semua permohonan akaun telah diproses.</p></div>`;
        } else {
            container.innerHTML = respons.data.map(user => `
                <div class="kad-vo" style="border-left-color: #8b5cf6;">
                    <div class="kad-header">
                        <span class="kad-spk"><i class="fas fa-user"></i> ${user.username}</span>
                        <span class="badge-status badge-pending">${user.role}</span>
                    </div>
                    <div class="kad-body" style="margin-bottom:15px;">
                        <p><strong>E-mel:</strong> ${user.email}</p>
                        <p><strong>Tarikh Mohon:</strong> ${new Date(user.tarikh_daftar).toLocaleDateString('ms-MY', {day:'numeric', month:'long', year:'numeric'})}</p>
                    </div>
                    <div class="kad-actions">
                        <button class="btn-hijau" onclick="window.prosesAkaun('${user.id_user}', '${user.username}', 'AKTIF')"><i class="fas fa-check"></i> Aktifkan</button>
                        <button class="btn-danger" onclick="window.bukaTolakAkaun('${user.id_user}', '${user.username}')"><i class="fas fa-times"></i> Tolak</button>
                    </div>
                </div>`).join('');
        }
    } else {
        container.innerHTML = `<p style="text-align:center; color:var(--danger);">Gagal memuatkan data. Sila cuba lagi.</p>`;
    }
}

async function muatSenaraiPengguna() {
    const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    if (!userSesi || userSesi.role.toUpperCase() !== 'ADMIN') return;

    const cAktif = document.getElementById('senarai-aktif-container');
    const cDisabled = document.getElementById('senarai-disabled-container');
    if (cAktif) cAktif.innerHTML = `<p style="text-align:center; color:var(--text-pudar);"><i class="fas fa-spinner fa-spin"></i> Sedang memuat turun...</p>`;
    if (cDisabled) cDisabled.innerHTML = `<p style="text-align:center; color:var(--text-pudar);"><i class="fas fa-spinner fa-spin"></i> Sedang memuat turun...</p>`;

    const respons = await panggilAPI('getSenaraiPengguna', { role: userSesi.role.toUpperCase() });
    if (!respons || !respons.status) {
        if (cAktif) cAktif.innerHTML = `<p style="text-align:center; color:var(--danger);">Gagal memuatkan data.</p>`;
        if (cDisabled) cDisabled.innerHTML = `<p style="text-align:center; color:var(--danger);">Gagal memuatkan data.</p>`;
        return;
    }

    if (cAktif) {
        if (!respons.aktif || respons.aktif.length === 0) {
            cAktif.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-pudar);"><i class="fas fa-users" style="font-size:40px; margin-bottom:15px;"></i><p>Tiada akaun aktif.</p></div>`;
        } else {
            cAktif.innerHTML = respons.aktif.map(u => `
                <div class="kad-vo" style="border-left-color:#10b981;">
                    <div class="kad-header">
                        <span class="kad-spk"><i class="fas fa-user-check"></i> ${u.username}</span>
                        <span class="badge-status badge-lulus">${u.role}</span>
                    </div>
                    <div class="kad-body" style="margin-bottom:15px;">
                        <p><strong>E-mel:</strong> ${u.email}</p>
                        <p><strong>Status:</strong> ${u.status}</p>
                    </div>
                    <div class="kad-actions">
                        <button class="btn-danger" onclick="window.prosesDisable('${u.id_user}', '${u.username}')"><i class="fas fa-user-slash"></i> Nyahaktifkan</button>
                    </div>
                </div>`).join('');
        }
    }

    if (cDisabled) {
        if (!respons.disabled || respons.disabled.length === 0) {
            cDisabled.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-pudar);"><i class="fas fa-user-slash" style="font-size:40px; margin-bottom:15px;"></i><p>Tiada akaun dinyahaktifkan.</p></div>`;
        } else {
            cDisabled.innerHTML = respons.disabled.map(u => `
                <div class="kad-vo" style="border-left-color:#475569;">
                    <div class="kad-header">
                        <span class="kad-spk"><i class="fas fa-user-slash"></i> ${u.username}</span>
                        <span class="badge-status badge-tamat">${u.role}</span>
                    </div>
                    <div class="kad-body" style="margin-bottom:15px;">
                        <p><strong>E-mel:</strong> ${u.email}</p>
                        <p><strong>Status:</strong> DINYAHAKTIFKAN</p>
                    </div>
                    <div class="kad-actions">
                        <button class="btn-hijau" onclick="window.prosesEnable('${u.id_user}', '${u.username}')"><i class="fas fa-user-check"></i> Aktifkan Semula</button>
                    </div>
                </div>`).join('');
        }
    }
}

window.prosesAkaun = function(idUser, username, tindakan) {
    const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    Swal.fire({
        title: `Aktifkan akaun "${username}"?`,
        text: `Pengguna akan menerima notifikasi e-mel dan boleh log masuk selepas ini.`,
        icon: 'question', showCancelButton: true,
        confirmButtonColor: '#10b981', confirmButtonText: 'Ya, Aktifkan', cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const respons = await panggilAPI('aktifkanAkaun', { id_user: idUser, tindakan: 'AKTIF', role: userSesi.role.toUpperCase(), admin_username: userSesi.username, admin_email: userSesi.email });
            if (respons && respons.status) {
                Swal.fire('Berjaya!', respons.message, 'success').then(() => muatSenaraiPendingAkaun());
            } else {
                Swal.fire('Ralat', respons.message, 'error');
            }
        }
    });
};

window.prosesDisable = function(idUser, username) {
    const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    Swal.fire({
        title: `Nyahaktifkan akaun "${username}"?`,
        text: `Pengguna tidak akan dapat log masuk sehingga akaun diaktifkan semula.`,
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Nyahaktifkan', cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const respons = await panggilAPI('disableAkaun', { id_user: idUser, role: userSesi.role.toUpperCase(), admin_username: userSesi.username, admin_email: userSesi.email });
            if (respons && respons.status) {
                Swal.fire('Selesai', respons.message, 'success').then(() => muatSenaraiPengguna());
            } else {
                Swal.fire('Ralat', respons.message, 'error');
            }
        }
    });
};

window.prosesEnable = function(idUser, username) {
    const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    Swal.fire({
        title: `Aktifkan semula akaun "${username}"?`,
        icon: 'question', showCancelButton: true,
        confirmButtonColor: '#10b981', confirmButtonText: 'Ya, Aktifkan Semula', cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const respons = await panggilAPI('enableAkaun', { id_user: idUser, role: userSesi.role.toUpperCase(), admin_username: userSesi.username, admin_email: userSesi.email });
            if (respons && respons.status) {
                Swal.fire('Selesai', respons.message, 'success').then(() => muatSenaraiPengguna());
            } else {
                Swal.fire('Ralat', respons.message, 'error');
            }
        }
    });
};

window.bukaTolakAkaun = function(idUser, username) {
    document.getElementById('tolak-akaun-id').value = idUser;
    document.getElementById('tolak-akaun-username').value = username;
    document.getElementById('tolak-akaun-sebab').value = "";
    document.getElementById('modal-tolak-akaun').classList.remove('skrin-sembunyi');
};

document.getElementById('btn-batal-tolak-akaun')?.addEventListener('click', () => {
    document.getElementById('modal-tolak-akaun').classList.add('skrin-sembunyi');
});

document.getElementById('btn-sahkan-tolak-akaun')?.addEventListener('click', async () => {
    const idUser = document.getElementById('tolak-akaun-id').value;
    const sebab = document.getElementById('tolak-akaun-sebab').value.trim();
    const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    const respons = await panggilAPI('aktifkanAkaun', { id_user: idUser, tindakan: 'TOLAK', sebab: sebab, role: userSesi.role.toUpperCase(), admin_username: userSesi.username, admin_email: userSesi.email });
    document.getElementById('modal-tolak-akaun').classList.add('skrin-sembunyi');
    if (respons && respons.status) {
        Swal.fire('Selesai', respons.message, 'success').then(() => muatSenaraiPendingAkaun());
    } else {
        Swal.fire('Ralat', respons.message, 'error');
    }
});
