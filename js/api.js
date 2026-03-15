// Fail: js/api.js
// Jambatan Komunikasi PWA ↔ Google Apps Script
// Versi: V3.6 Patch (Fix: resetPassword dikecualikan dari semakan token)

const API_URL = "https://script.google.com/macros/s/AKfycbw1K4sl5xD75hCBEUEUmFuV2gBO4b4XbcvzmI1P_QuxtpexMR3tPAZmr-DFleoLS9C4/exec"; 

async function panggilAPI(action, data = {}) {
    
    const sesiUser = JSON.parse(sessionStorage.getItem('spk_user'));

    // Senarai action yang TIDAK perlukan token (user belum/tidak login)
    // [V3.6 FIX] - Tambah 'resetPassword' supaya borang lupa kata laluan
    //              tidak kena "Akses Ditolak" semasa user belum login
    const publicActions = ['login', 'register', 'resetPassword'];

    if (!publicActions.includes(action)) {
        
        if (sesiUser && sesiUser.token_sesi && sesiUser.email) {
            data.token_sesi = sesiUser.token_sesi;
            data.email_sesi = sesiUser.email;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Akses Ditolak',
                text: 'Sesi anda tidak sah atau telah tamat. Sila log masuk semula.'
            }).then(() => {
                sessionStorage.removeItem('spk_user');
                window.location.reload();
            });
            return null;
        }
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ 
                action: action, 
                payload: data 
            })
        });
        return await response.json();
        
    } catch (error) {
        console.error("Ralat Rangkaian API:", error);
        return { 
            status: false, 
            message: "Gagal berhubung dengan pelayan. Sila semak sambungan internet anda." 
        };
    }
}
