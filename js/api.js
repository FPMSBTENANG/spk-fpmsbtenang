const API_URL = "https://script.google.com/macros/s/AKfycbyIeQItm4KCt8QKCnGfuGLZjVw_ytXLo6SCkNTfsCWF3VQKykCT63b9WMHo8QD3pxxB/exec"; 

async function panggilAPI(action, data = {}) {
    
    // 1. PEMINTASAN KESELAMATAN (SECURITY INTERCEPTOR)
    // Dapatkan maklumat sesi pengguna yang sedang log masuk
    const sesiUser = JSON.parse(sessionStorage.getItem('spk_user'));

    // Jika aksi ini BUKAN login dan BUKAN register (maksudnya aksi sistem tertutup)
    // KITA WAJIB HANTAR TOKEN!
    if (action !== 'login' && action !== 'register') {
        
        // Semak jika pengguna mempunyai token yang sah di dalam storan peranti
        if (sesiUser && sesiUser.token_sesi && sesiUser.email) {
            
            // Suntik maklumat rahsia ini secara automatik ke dalam payload
            data.token_sesi = sesiUser.token_sesi;
            data.email_sesi = sesiUser.email;
            
        } else {
            // Jika cuba "bypass" (masuk tanpa login), tendang keluar serta-merta!
            Swal.fire({
                icon: 'error',
                title: 'Akses Ditolak',
                text: 'Sesi anda tidak sah atau telah tamat. Sila log masuk semula.'
            }).then(() => {
                sessionStorage.removeItem('spk_user');
                window.location.reload();
            });
            return null; // Hentikan API call
        }
    }

    // 2. LAKSANA PANGGILAN RANGKAIAN (NETWORK REQUEST)
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
