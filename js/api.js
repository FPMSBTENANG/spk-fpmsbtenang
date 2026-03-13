// Fail: js/api.js
// Menguruskan semua sambungan ke pangkalan data Google Apps Script (Backend)

// ⚠️ AMARAN PENTING: 
// Gantikan URL di bawah dengan URL Web App Google Apps Script kau yang sebenar!
// Pastikan kau copy URL yang berakhir dengan /exec
const GAS_URL = "https://script.google.com/macros/s/AKfycbx_1C32ROtZx3riNqKc510i36J44zo87iEaNFPuL3iecbFjAqcUHGSFsCMffW4m0J0/exec"; 

/**
 * Fungsi utama untuk menghantar arahan dan data ke Backend
 * @param {string} action - Nama arahan (Contoh: 'login', 'createSPK', 'mohonVO')
 * @param {object} data - Data yang ingin dihantar
 */
async function panggilAPI(action, data) {
    try {
        const respons = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: action,
                payload: data
            })
        });
        
        // Tukar jawapan dari pelayan (server) kepada format JSON yang boleh dibaca
        const hasil = await respons.json();
        return hasil;
        
    } catch (error) {
        console.error("Ralat API:", error);
        // Jika internet terputus atau URL salah, ia pulangkan ralat ni tanpa crash sistem
        return { 
            status: false, 
            message: "Gagal berhubung dengan pelayan. Sila semak sambungan internet atau URL API anda." 
        };
    }

}
