// Fail: js/app.js
// Mengawal logik antaramuka (UI), SweetAlert, navigasi menu, dan pengurusan sesi

// ==========================================
// 1. PEMBOLEH UBAH DOM (Elemen HTML)
// ==========================================
const skrinLogin = document.getElementById('skrin-login');
const skrinDashboard = document.getElementById('skrin-dashboard');

const borangLogin = document.getElementById('borang-login');
const btnMasuk = document.getElementById('btn-masuk');

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
    const sesiUser = localStorage.getItem('spk_user');
    
    if (sesiUser) {
        const user = JSON.parse(sesiUser);
        binaDashboard(user);
    } else {
        skrinLogin.classList.replace('skrin-sembunyi', 'skrin-aktif');
        skrinDashboard.classList.replace('skrin-aktif', 'skrin-sembunyi');
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
        localStorage.setItem('spk_user', JSON.stringify(userData));
        
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
        
        // Tutup sidebar automatik untuk pengguna mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('buka-mobile');
        }

        if(targetModul === 'kelulusan-vo') {
            const userSesi = JSON.parse(localStorage.getItem('spk_user'));
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
        // Mode Telefon
        sidebar.classList.toggle('buka-mobile');
    } else {
        // Mode PC / Desktop
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
            localStorage.removeItem('spk_user');
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

        const userSesi = JSON.parse(localStorage.getItem('spk_user'));

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
            localStorage.setItem('spk_user', JSON.stringify(userSesi));
            
            paparanNama.textContent = respons.data.username;
            document.getElementById('profil-password').value = ""; 
        } else {
            Swal.fire('Ralat', respons ? respons.message : "Gagal menghubungi pelayan.", 'error');
        }
    });
}

// ==========================================
// 10. MODUL DAFTAR SPK INDUK
// ==========================================
const borangDaftarSPK = document.getElementById('borang-daftar-spk');
if (borangDaftarSPK) {
    borangDaftarSPK.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnDaftarSPK = borangDaftarSPK.querySelector('button[type="submit"]');
        const teksAsal = btnDaftarSPK.textContent;
        
        btnDaftarSPK.textContent = "Sedang Menyimpan...";
        btnDaftarSPK.disabled = true;

        const userSesi = JSON.parse(localStorage.getItem('spk_user'));

        const payloadSPK = {
            no_spk: document.getElementById('spk-no').value,
            no_po: document.getElementById('spk-po').value,
            nama_kontrak: document.getElementById('spk-nama').value,
            alamat_kontrak: document.getElementById('spk-alamat').value,
            no_vendor: document.getElementById('spk-vendor').value,
            pkt: document.getElementById('spk-pkt').value,
            blok: document.getElementById('spk-blok').value,
            jenis_kerja: document.getElementById('spk-jenis').value,
            mode: document.getElementById('spk-mode').value,
            unit: document.getElementById('spk-unit').value,
            kuantiti: document.getElementById('spk-kuantiti').value,
            harga_seunit: document.getElementById('spk-harga').value,
            nilai_kontrak: document.getElementById('spk-nilai').value,
            ada_tahanan: document.getElementById('spk-tahanan').value,
            ada_amanah: document.getElementById('spk-amanah').value,
            insuran: document.getElementById('spk-insuran').value,
            frequency_month: document.getElementById('spk-freq').value,
            tarikh_mula: document.getElementById('spk-mula').value,
            tarikh_tamat: document.getElementById('spk-tamat').value,
            created_by: userSesi.email, 
            senarai_pkt: [] 
        };

        const respons = await panggilAPI('createSPK', payloadSPK);

        btnDaftarSPK.textContent = teksAsal;
        btnDaftarSPK.disabled = false;

        if (respons && respons.status) {
            Swal.fire('Pendaftaran SPK Berjaya', 'SPK baharu telah direkodkan dalam pangkalan data.', 'success')
            .then(() => {
                borangDaftarSPK.reset(); 
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

        const userSesi = JSON.parse(localStorage.getItem('spk_user'));

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

        const userSesi = JSON.parse(localStorage.getItem('spk_user'));

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
    const userSesi = JSON.parse(localStorage.getItem('spk_user'));
    
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
        // Untuk tolak, terus jalankan sebab dah confirm kat modal
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
