// Fail: js/app.js
// Mengawal logik antaramuka (UI), SweetAlert, navigasi menu, dan pengurusan sesi

// ==========================================
// 1. PEMBOLEH UBAH DOM (Elemen HTML)
// ==========================================
const skrinLogin = document.getElementById('skrin-login');
const skrinDashboard = document.getElementById('skrin-dashboard');

const borangLogin = document.getElementById('borang-login');
const btnMasuk = document.getElementById('btn-masuk');
const checkboxIngat = document.getElementById('ingat-saya');

const borangDaftar = document.getElementById('borang-daftar');
const btnDaftar = document.getElementById('btn-daftar');
const linkDaftar = document.getElementById('link-daftar');
const linkLogin = document.getElementById('link-login');
const teksTukarDaftar = document.getElementById('teks-tukar-daftar');

const sidebar = document.getElementById('sidebar');
const btnMenu = document.getElementById('btn-menu');
const btnLogout = document.getElementById('btn-logout');
const btnProfil = document.getElementById('btn-profil');
const kandunganUtama = document.getElementById('kandungan-utama');

const paparanNama = document.getElementById('paparan-nama');
const paparanRole = document.getElementById('paparan-role');
const badgeNotifikasi = document.getElementById('badge-notifikasi');

const menuItems = document.querySelectorAll('.menu-item');
const senaraiModul = document.querySelectorAll('main > section');

// ==========================================
// 2. AWALAN (INITIALIZATION) PADA WAKTU LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const sesiUser = sessionStorage.getItem('spk_user');
    
    if (sesiUser) {
        const user = JSON.parse(sesiUser);
        binaDashboard(user);
    } else {
        skrinLogin.classList.replace('skrin-sembunyi', 'skrin-aktif');
        skrinDashboard.classList.replace('skrin-aktif', 'skrin-sembunyi');
        
        const savedUsername = localStorage.getItem('spk_saved_username');
        if (savedUsername) {
            document.getElementById('login-username').value = savedUsername;
            if (checkboxIngat) checkboxIngat.checked = true;
        }
    }
});

// ==========================================
// 3. LOGIK TOGGLE BORANG (LOG MASUK <-> DAFTAR)
// ==========================================
if(linkDaftar && linkLogin) {
    linkDaftar.addEventListener('click', (e) => {
        e.preventDefault();
        borangLogin.classList.add('skrin-sembunyi');
        teksTukarDaftar.classList.add('skrin-sembunyi');
        borangDaftar.classList.remove('skrin-sembunyi');
    });

    linkLogin.addEventListener('click', (e) => {
        e.preventDefault();
        borangDaftar.classList.add('skrin-sembunyi');
        borangLogin.classList.remove('skrin-sembunyi');
        teksTukarDaftar.classList.remove('skrin-sembunyi');
    });
}

// ==========================================
// 4. LOGIK DAFTAR AKAUN (REGISTER)
// ==========================================
if(borangDaftar) {
    borangDaftar.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        btnDaftar.textContent = "Sedang Mendaftar...";
        btnDaftar.disabled = true;

        const payload = {
            username: document.getElementById('daftar-username').value,
            email: document.getElementById('daftar-email').value,
            role: document.getElementById('daftar-role').value
        };

        const respons = await panggilAPI('register', payload);

        btnDaftar.textContent = "Daftar Akaun";
        btnDaftar.disabled = false;

        if (respons && respons.status) {
            Swal.fire({
                title: 'Pendaftaran Berjaya!',
                text: respons.message + ' Sila semak e-mel anda untuk mendapatkan kata laluan sementara.',
                icon: 'success',
                confirmButtonColor: '#1155cc'
            }).then(() => {
                borangDaftar.reset();
                linkLogin.click(); 
            });
        } else {
            Swal.fire('Ralat Pendaftaran', respons ? respons.message : "Ralat sambungan pelayan.", 'error');
        }
    });
}

// ==========================================
// 5. LOGIK LOG MASUK (LOGIN)
// ==========================================
borangLogin.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const usernameInput = document.getElementById('login-username').value;
    const passwordInput = document.getElementById('login-password').value;
    
    btnMasuk.textContent = "Sila Tunggu...";
    btnMasuk.disabled = true;

    const respons = await panggilAPI('login', {
        username: usernameInput,
        password: passwordInput
    });

    btnMasuk.textContent = "Log Masuk";
    btnMasuk.disabled = false;

    if (respons && respons.status) {
        const userData = respons.data;
        
        sessionStorage.setItem('spk_user', JSON.stringify(userData));
        
        if (checkboxIngat && checkboxIngat.checked) {
            localStorage.setItem('spk_saved_username', usernameInput);
        } else {
            localStorage.removeItem('spk_saved_username');
        }
        
        borangLogin.reset();
        binaDashboard(userData);
        
        if (userData.requirePasswordChange) {
            Swal.fire({
                title: 'Perhatian!',
                text: 'Sila kemas kini kata laluan sementara anda di menu Profil dengan segera untuk tujuan keselamatan.',
                icon: 'warning',
                confirmButtonColor: '#f39c12'
            }).then(() => {
                bukaModul('profil');
            });
        }
    } else {
        Swal.fire('Log Masuk Gagal', respons ? respons.message : "Ralat sambungan pelayan.", 'error');
    }
});

// ==========================================
// 6. BINA DASHBOARD BERDASARKAN PERANAN
// ==========================================
function binaDashboard(user) {
    skrinLogin.classList.replace('skrin-aktif', 'skrin-sembunyi');
    skrinDashboard.classList.replace('skrin-sembunyi', 'skrin-aktif');
    
    paparanNama.textContent = user.username;
    paparanRole.textContent = user.role;
    
    document.getElementById('profil-nama').value = user.username;
    document.getElementById('profil-emel').value = user.email;

    document.querySelectorAll('.menu-kerani, .menu-fs, .menu-afc-fc').forEach(el => {
        el.classList.add('skrin-sembunyi');
    });

    const peranan = user.role.toUpperCase();
    if (peranan === 'KERANI' || peranan === 'ADMIN') {
        document.querySelectorAll('.menu-kerani').forEach(el => el.classList.remove('skrin-sembunyi'));
    }
    if (peranan === 'FS' || peranan === 'ADMIN') {
        document.querySelectorAll('.menu-fs').forEach(el => el.classList.remove('skrin-sembunyi'));
    }
    if (peranan === 'AFC' || peranan === 'FC' || peranan === 'ADMIN') {
        document.querySelectorAll('.menu-afc-fc').forEach(el => el.classList.remove('skrin-sembunyi'));
    }

    bukaModul('utama');
    semakNotifikasi(user);
}

// ==========================================
// 7. NAVIGASI MENU (TUKAR MODUL TANPA REFRESH)
// ==========================================
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetModul = item.getAttribute('data-target');
        
        menuItems.forEach(m => m.classList.remove('aktif'));
        item.classList.add('aktif');
        
        bukaModul(targetModul);
        
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('buka-mobile');
        }

        if(targetModul === 'kelulusan-vo') {
            const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
            semakNotifikasi(userSesi);
        }
    });
});

function bukaModul(idModul) {
    senaraiModul.forEach(modul => {
        modul.classList.replace('modul-aktif', 'modul-sembunyi');
    });
    
    const modulPilihan = document.getElementById(`modul-${idModul}`);
    if (modulPilihan) {
        modulPilihan.classList.replace('modul-sembunyi', 'modul-aktif');
    }
}

btnProfil.addEventListener('click', () => {
    menuItems.forEach(m => m.classList.remove('aktif'));
    bukaModul('profil');
});

// ==========================================
// 8. LOGIK MENU TOGGLE (AUTO-HIDE) & LOGOUT
// ==========================================
btnMenu.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('buka-mobile');
    } else {
        sidebar.classList.toggle('sembunyi-desktop');
        kandunganUtama.classList.toggle('kembang-desktop');
    }
});

btnLogout.addEventListener('click', () => {
    Swal.fire({
        title: 'Log Keluar?',
        text: "Anda pasti untuk log keluar dari sistem?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Log Keluar',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem('spk_user');
            window.location.reload(); 
        }
    });
});

// ==========================================
// 9. MODUL KEMAS KINI PROFIL
// ==========================================
const borangProfil = document.getElementById('borang-profil');
if (borangProfil) {
    borangProfil.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSimpan = borangProfil.querySelector('button[type="submit"]');
        const teksAsal = btnSimpan.textContent;
        
        btnSimpan.textContent = "Menyimpan...";
        btnSimpan.disabled = true;

        const newNama = document.getElementById('profil-nama').value;
        const newEmel = document.getElementById('profil-emel').value;
        const newPass = document.getElementById('profil-password').value; 

        const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));

        const respons = await panggilAPI('updateProfile', {
            id_user: userSesi.id_user,
            new_username: newNama,
            new_email: newEmel,
            new_password: newPass
        });

        btnSimpan.textContent = teksAsal;
        btnSimpan.disabled = false;

        if (respons && respons.status) {
            Swal.fire('Berjaya!', 'Profil anda telah dikemas kini.', 'success');
            userSesi.username = respons.data.username;
            userSesi.email = respons.data.email;
            userSesi.requirePasswordChange = false; 
            
            sessionStorage.setItem('spk_user', JSON.stringify(userSesi));
            
            paparanNama.textContent = respons.data.username;
            document.getElementById('profil-password').value = ""; 
        } else {
            Swal.fire('Ralat', respons ? respons.message : "Gagal menghubungi pelayan.", 'error');
        }
    });
}

// ==========================================
// 10. MODUL DAFTAR SPK INDUK (FUNGSI BARU DINAMIK)
// ==========================================
const borangDaftarSPK = document.getElementById('borang-daftar-spk');
const spkJenisPkt = document.getElementById('spk-jenis-pkt');
const btnTambahPkt = document.getElementById('btn-tambah-pkt');
const containerBarisPkt = document.getElementById('container-baris-pkt');
const spkKuantitiTotal = document.getElementById('spk-kuantiti-total');
const spkNilaiTotal = document.getElementById('spk-nilai-total');

// A. Logik Buka/Tutup Kotak Wang Amanah & Cara Bayaran
const spkAmanah = document.getElementById('spk-amanah');
const kotakAmanah = document.getElementById('kotak-nilai-amanah');
const kotakCaraBayaran = document.getElementById('kotak-cara-bayaran'); 

if(spkAmanah) {
    spkAmanah.addEventListener('change', (e) => {
        if(e.target.value === 'YA') {
            kotakAmanah.classList.remove('skrin-sembunyi');
            if(kotakCaraBayaran) kotakCaraBayaran.classList.remove('skrin-sembunyi');
            document.getElementById('spk-nilai-amanah').required = true;
            if(document.getElementById('spk-cara-bayaran')) document.getElementById('spk-cara-bayaran').required = true;
        } else {
            kotakAmanah.classList.add('skrin-sembunyi');
            if(kotakCaraBayaran) kotakCaraBayaran.classList.add('skrin-sembunyi');
            document.getElementById('spk-nilai-amanah').required = false;
            document.getElementById('spk-nilai-amanah').value = '';
            if(document.getElementById('spk-cara-bayaran')) {
                document.getElementById('spk-cara-bayaran').required = false;
                document.getElementById('spk-cara-bayaran').value = '';
            }
        }
    });
}

// B. Logik Pilih Jenis PKT (Satu vs Pelbagai)
if(spkJenisPkt) {
    spkJenisPkt.addEventListener('change', (e) => {
        if(e.target.value === 'PELBAGAI') {
            btnTambahPkt.classList.remove('skrin-sembunyi');
        } else {
            btnTambahPkt.classList.add('skrin-sembunyi');
            // Reset ke 1 baris
            containerBarisPkt.innerHTML = '';
            tambahBarisPkt(false);
        }
        kiraTotalSPK();
    });
}

// C. Fungsi Tambah Baris Dinamik & Auto-Kira Baris
function tambahBarisPkt(bolehBuang = true) {
    const div = document.createElement('div');
    div.className = 'baris-pkt-item';
    div.style.cssText = 'display:grid; grid-template-columns: 2fr 2fr 2fr 2fr auto; gap:10px; align-items:end; margin-bottom:10px;';
    
    div.innerHTML = `
        <div class="form-group" style="margin:0;"><label>No. PKT</label><input type="text" class="input-pkt-no" required></div>
        <div class="form-group" style="margin:0;"><label>Kuantiti</label><input type="number" step="0.01" class="input-pkt-kuantiti" required></div>
        <div class="form-group" style="margin:0;"><label>RM/Unit</label><input type="number" step="0.01" class="input-pkt-harga" required></div>
        <div class="form-group" style="margin:0;"><label>Jumlah (RM)</label><input type="number" step="0.01" class="input-pkt-jumlah" readonly style="background:#e9ecef; font-weight:bold; color:var(--primary-color);"></div>
        <button type="button" class="btn-buang-pkt btn-danger" style="padding:12px; height:max-content; border-radius:8px; ${bolehBuang ? '' : 'display:none;'}"><i class="fas fa-trash"></i></button>
    `;
    
    const inKuantiti = div.querySelector('.input-pkt-kuantiti');
    const inHarga = div.querySelector('.input-pkt-harga');
    const btnBuang = div.querySelector('.btn-buang-pkt');

    const kiraRow = () => {
        const k = parseFloat(inKuantiti.value) || 0;
        const h = parseFloat(inHarga.value) || 0;
        div.querySelector('.input-pkt-jumlah').value = (k * h).toFixed(2);
        kiraTotalSPK(); // Kemaskini Total Utama
    };

    inKuantiti.addEventListener('input', kiraRow);
    inHarga.addEventListener('input', kiraRow);

    if(bolehBuang) {
        btnBuang.addEventListener('click', () => {
            div.remove();
            kiraTotalSPK(); // Kemaskini Total Utama bila dibuang
        });
    }
    
    containerBarisPkt.appendChild(div);
}

if(btnTambahPkt) {
    btnTambahPkt.addEventListener('click', () => {
        tambahBarisPkt(true);
    });
}

// Ikat event auto-kira pada baris pertama (yang dah ada dlm HTML)
function initDefaultRow() {
    const firstRow = containerBarisPkt.querySelector('.baris-pkt-item');
    if(firstRow) {
        const inKuantiti = firstRow.querySelector('.input-pkt-kuantiti');
        const inHarga = firstRow.querySelector('.input-pkt-harga');
        const kiraRow = () => {
            const k = parseFloat(inKuantiti.value) || 0;
            const h = parseFloat(inHarga.value) || 0;
            firstRow.querySelector('.input-pkt-jumlah').value = (k * h).toFixed(2);
            kiraTotalSPK();
        };
        inKuantiti.addEventListener('input', kiraRow);
        inHarga.addEventListener('input', kiraRow);
    }
}
// Jalankan bila load
setTimeout(initDefaultRow, 500); 

// D. Fungsi Kira Keseluruhan (Auto-Kira Total Utama)
function kiraTotalSPK() {
    let totalKuantiti = 0;
    let totalNilai = 0;
    document.querySelectorAll('.baris-pkt-item').forEach(row => {
        const k = parseFloat(row.querySelector('.input-pkt-kuantiti').value) || 0;
        const j = parseFloat(row.querySelector('.input-pkt-jumlah').value) || 0;
        totalKuantiti += k;
        totalNilai += j;
    });
    if(spkKuantitiTotal) spkKuantitiTotal.value = totalKuantiti.toFixed(2);
    if(spkNilaiTotal) spkNilaiTotal.value = totalNilai.toFixed(2);
}

// E. Proses Hantar Borang SPK
if (borangDaftarSPK) {
    borangDaftarSPK.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSubmit = borangDaftarSPK.querySelector('button[type="submit"]');
        const teksAsal = btnSubmit.textContent;
        btnSubmit.textContent = "Sedang Menyimpan...";
        btnSubmit.disabled = true;

        const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));

        // Bina Array Data PKT dari setiap baris
        let dataPktArray = [];
        document.querySelectorAll('.baris-pkt-item').forEach(row => {
            dataPktArray.push({
                no_pkt: row.querySelector('.input-pkt-no').value,
                kuantiti: row.querySelector('.input-pkt-kuantiti').value,
                harga_seunit: row.querySelector('.input-pkt-harga').value,
                jumlah_rm: row.querySelector('.input-pkt-jumlah').value
            });
        });

        const payloadSPK = {
            no_spk: document.getElementById('spk-no').value,
            no_po: document.getElementById('spk-po').value,
            nama_kontrak: document.getElementById('spk-nama').value,
            alamat_kontrak: document.getElementById('spk-alamat').value,
            no_vendor: document.getElementById('spk-vendor').value,
            
            blok: document.getElementById('spk-blok').value,
            jenis_kerja: document.getElementById('spk-jenis').value,
            mode: document.getElementById('spk-mode').value,
            unit: document.getElementById('spk-unit').value,
            
            // Hantar Array PKT & Total Utama
            senarai_pkt_data: dataPktArray, 
            kuantiti_total: spkKuantitiTotal.value,
            nilai_total: spkNilaiTotal.value,
            
            ada_tahanan: document.getElementById('spk-tahanan').value,
            ada_amanah: document.getElementById('spk-amanah').value,
            nilai_amanah: document.getElementById('spk-nilai-amanah').value || 0,
            cara_bayaran: document.getElementById('spk-cara-bayaran') ? document.getElementById('spk-cara-bayaran').value : "", // TAMBAHAN PENTING
            insuran: document.getElementById('spk-insuran').value,
            frequency_month: document.getElementById('spk-freq').value,
            tarikh_mula: document.getElementById('spk-mula').value,
            tarikh_tamat: document.getElementById('spk-tamat').value,
            created_by: userSesi.email
        };

        const respons = await panggilAPI('createSPK', payloadSPK);

        btnSubmit.textContent = teksAsal;
        btnSubmit.disabled = false;

        if (respons && respons.status) {
            Swal.fire('Pendaftaran SPK Berjaya', `Sistem telah merekodkan <b>${dataPktArray.length} PKT</b> untuk SPK ini.`, 'success')
            .then(() => {
                borangDaftarSPK.reset(); 
                // Reset balik ke form asal (1 row)
                if(spkJenisPkt) spkJenisPkt.value = "TUNGGAL";
                containerBarisPkt.innerHTML = '';
                tambahBarisPkt(false);
                btnTambahPkt.classList.add('skrin-sembunyi');
                if(kotakCaraBayaran) kotakCaraBayaran.classList.add('skrin-sembunyi');
                if(kotakAmanah) kotakAmanah.classList.add('skrin-sembunyi');
                kiraTotalSPK();
                
                bukaModul('utama'); 
            });
        } else {
            Swal.fire('Ralat', respons ? respons.message : "Gagal berhubung dengan pangkalan data.", 'error');
        }
    });
}

// ==========================================
// 11. MODUL REKOD BAYARAN BULANAN (KERANI)
// ==========================================
const borangBayaran = document.getElementById('borang-bayaran');
if (borangBayaran) {
    borangBayaran.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnBayar = borangBayaran.querySelector('button[type="submit"]');
        const teksAsal = btnBayar.textContent;

        btnBayar.textContent = "Sedang Merekod...";
        btnBayar.disabled = true;

        const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));

        const payloadBayaran = {
            no_spk: document.getElementById('bayaran-no-spk').value,
            no_po: document.getElementById('bayaran-no-po').value,
            pkt: document.getElementById('bayaran-pkt').value,
            kuantiti_bulan_semasa: document.getElementById('bayaran-kuantiti').value,
            nilai_bulan_semasa: document.getElementById('bayaran-nilai').value,
            wang_amanah_potongan: document.getElementById('bayaran-amanah').value,
            dikunci_oleh: userSesi.email
        };

        const respons = await panggilAPI('addPayment', payloadBayaran);

        btnBayar.textContent = teksAsal;
        btnBayar.disabled = false;

        if (respons && respons.status) {
            let mesejHtml = `<b>Bayaran berjaya direkodkan!</b><br><br>Baki Kuantiti Terkini: <b style="color:#1155cc;">${respons.data.baki_terkini}</b>`;
            let iconPopup = 'success';

            if (respons.data.amaran_dihantar) {
                mesejHtml += `<br><br><span style="color:#dc3545;">⚠️ NOTIS: Amaran limit kuantiti telah dihantar secara automatik ke e-mel pengurusan (FC/AFC/FS).</span>`;
                iconPopup = 'warning';
            }

            Swal.fire({
                title: 'Status Bayaran',
                html: mesejHtml,
                icon: iconPopup,
                confirmButtonColor: '#1155cc'
            }).then(() => {
                borangBayaran.reset(); 
            });
        } else {
            Swal.fire('Ralat Rekod', respons ? respons.message : "Gagal berhubung dengan pangkalan data.", 'error');
        }
    });
}

// ==========================================
// 12. MODUL MOHON VO (FS)
// ==========================================
const borangMohonVO = document.getElementById('borang-mohon-vo');
if (borangMohonVO) {
    borangMohonVO.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnMohon = borangMohonVO.querySelector('button[type="submit"]');
        const teksAsal = btnMohon.textContent;

        btnMohon.textContent = "Sedang Menghantar...";
        btnMohon.disabled = true;

        const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));

        const payloadVO = {
            no_spk: document.getElementById('vo-no-spk').value,
            no_po: document.getElementById('vo-no-po').value,
            pkt: document.getElementById('vo-pkt').value,
            nilai_kontrak_semasa: document.getElementById('vo-nilai-semasa').value,
            kuantiti_dipohon: document.getElementById('vo-kuantiti-mohon').value,
            nilai_kuantiti_dipohon: document.getElementById('vo-nilai-mohon').value,
            dikunci_oleh: userSesi.username 
        };

        const respons = await panggilAPI('mohonVO', payloadVO);

        btnMohon.textContent = teksAsal;
        btnMohon.disabled = false;

        if (respons && respons.status) {
            Swal.fire('Permohonan Dihantar', respons.message, 'success').then(() => {
                borangMohonVO.reset();
                bukaModul('utama'); 
            });
        } else {
            Swal.fire('Ralat VO', respons ? respons.message : "Gagal berhubung dengan pangkalan data.", 'error');
        }
    });
}

// ==========================================
// 13. MODUL KELULUSAN VO & NOTIFIKASI
// ==========================================
async function semakNotifikasi(user) {
    if (!user) return;
    
    const respons = await panggilAPI('getSenaraiVO', {
        role: user.role.toUpperCase(),
        username: user.username
    });
    
    if (respons && respons.status && respons.data) {
        const senarai = respons.data;
        const container = document.getElementById('senarai-vo-container');
        
        let jumlahTugasan = 0;
        const role = user.role.toUpperCase();
        
        senarai.forEach(item => {
            if(role === 'AFC' && item.status_afc === 'PENDING') jumlahTugasan++;
            if(role === 'FC' && item.status_afc === 'LULUS' && item.status_fc === 'PENDING') jumlahTugasan++;
        });

        if(jumlahTugasan > 0) {
            badgeNotifikasi.textContent = jumlahTugasan;
            badgeNotifikasi.classList.remove('sembunyi');
        } else {
            badgeNotifikasi.classList.add('sembunyi');
        }

        if (container) {
            container.innerHTML = ""; 
            
            if (senarai.length === 0) {
                container.innerHTML = "<p style='text-align:center; margin-top:20px; color:#666;'>Tiada permohonan VO buat masa ini.</p>";
                return;
            }

            senarai.forEach(item => {
                let bolehTindakan = false;
                if(role === 'AFC' && item.status_afc === 'PENDING') bolehTindakan = true;
                if(role === 'FC' && item.status_afc === 'LULUS' && item.status_fc === 'PENDING') bolehTindakan = true;

                let badgeClass = '';
                if(item.status_afc === 'PENDING' || item.status_fc === 'PENDING') badgeClass = 'badge-pending';
                if(item.status_afc === 'LULUS' && item.status_fc === 'LULUS') badgeClass = 'badge-lulus';
                if(item.status_afc === 'BATAL' || item.status_fc === 'BATAL') badgeClass = 'badge-batal';

                const tarikhDaftar = new Date(item.tarikh).toLocaleDateString('ms-MY');

                const kad = document.createElement('div');
                kad.className = 'kad-vo';
                
                let htmlKad = `
                    <div class="kad-header">
                        <span class="kad-spk">${item.no_spk}</span>
                        <span class="badge-status ${badgeClass}">AFC: ${item.status_afc} | FC: ${item.status_fc}</span>
                    </div>
                    <div class="kad-body">
                        <p><strong>PKT:</strong> ${item.pkt}</p>
                        <p><strong>Pemohon:</strong> ${item.pemohon}</p>
                        <p><strong>Tarikh:</strong> ${tarikhDaftar}</p>
                        <p><strong>Kuantiti Dipohon:</strong> ${item.kuantiti_dipohon}</p>
                        <p><strong>Nilai (RM):</strong> ${item.nilai_dipohon}</p>
                        ${item.catatan_tolak ? `<p style="color:red; margin-top:8px;"><strong>Sebab Batal:</strong> ${item.catatan_tolak}</p>` : ''}
                    </div>
                `;

                if (bolehTindakan) {
                    htmlKad += `
                    <div class="kad-actions">
                        <button class="btn-hijau" onclick="window.prosesVO('${item.no_spk}', 'LULUS')"><i class="fas fa-check"></i> LULUS</button>
                        <button class="btn-merah" onclick="window.bukaModalTolak('${item.no_spk}')"><i class="fas fa-times"></i> TOLAK</button>
                    </div>
                    `;
                }
                kad.innerHTML = htmlKad;
                container.appendChild(kad);
            });
        }
    }
}

// ==========================================
// 14. LOGIK BUTANG LULUS & TOLAK (DALAM KAD VO)
// ==========================================
window.prosesVO = async function(noSpk, tindakan, catatan = "") {
    const userSesi = JSON.parse(sessionStorage.getItem('spk_user'));
    
    if(tindakan === 'LULUS') {
        Swal.fire({
            title: 'Sahkan Kelulusan',
            text: `Adakah anda pasti untuk LULUSKAN permohonan SPK ${noSpk}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Luluskan'
        }).then(async (result) => {
            if (result.isConfirmed) {
                laksanakanProsesVO(noSpk, tindakan, catatan, userSesi);
            }
        });
    } else {
        laksanakanProsesVO(noSpk, tindakan, catatan, userSesi);
    }
};

async function laksanakanProsesVO(noSpk, tindakan, catatan, userSesi) {
    const respons = await panggilAPI('updateVO', {
        no_spk: noSpk,
        role: userSesi.role.toUpperCase(),
        tindakan: tindakan,
        catatan: catatan
    });

    if(respons && respons.status) {
        Swal.fire('Selesai', respons.message, 'success');
        document.getElementById('modal-tolak').classList.add('skrin-sembunyi'); 
        semakNotifikasi(userSesi); 
    } else {
        Swal.fire('Ralat', respons ? respons.message : "Gagal mengemas kini pangkalan data.", 'error');
    }
}

// Fungsi Kawalan Modal Tolak
window.bukaModalTolak = function(noSpk) {
    document.getElementById('tolak-spk-no').value = noSpk;
    document.getElementById('tolak-catatan').value = ""; 
    document.getElementById('modal-tolak').classList.remove('skrin-sembunyi');
};

document.getElementById('btn-batal-tolak')?.addEventListener('click', () => {
    document.getElementById('modal-tolak').classList.add('skrin-sembunyi');
});

document.getElementById('btn-sahkan-tolak')?.addEventListener('click', () => {
    const noSpk = document.getElementById('tolak-spk-no').value;
    const catatan = document.getElementById('tolak-catatan').value;
    
    if(catatan.trim() === "") {
        Swal.fire('Maklumat Tidak Lengkap', 'Sila masukkan sebab tolakan terlebih dahulu!', 'warning');
        return;
    }
    window.prosesVO(noSpk, 'TOLAK', catatan);
});

// ==========================================
// 15. LOGIK SISTEM TEMA (DARK / LIGHT MODE)
// ==========================================
const btnTema = document.getElementById('btn-tema');
const ikonTema = btnTema ? btnTema.querySelector('i') : null;

// Semak tema yang disimpan sebelum ini (atau preferensi sistem)
const temaSimpanan = localStorage.getItem('spk_tema');
if (temaSimpanan === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if(ikonTema) {
        ikonTema.classList.replace('fa-moon', 'fa-sun');
    }
}

// Logik bila butang tema ditekan
if (btnTema) {
    btnTema.addEventListener('click', () => {
        const temaSemasa = document.documentElement.getAttribute('data-theme');
        
        if (temaSemasa === 'dark') {
            // Tukar ke Light Mode
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('spk_tema', 'light');
            ikonTema.classList.replace('fa-sun', 'fa-moon');
        } else {
            // Tukar ke Dark Mode
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('spk_tema', 'dark');
            ikonTema.classList.replace('fa-moon', 'fa-sun');
        }
    });
}
