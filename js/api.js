const API_URL = "https://script.google.com/macros/s/AKfycbwHNrL9BB8Pd6GVFDKHsD3DK59Q_taft4l24zaWDckdgeFuG1MkVHj2MpTWeHRb8Q22/exec"; 

async function panggilAPI(action, data = {}) {
    
    const sesiUser = JSON.parse(sessionStorage.getItem('spk_user'));
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
