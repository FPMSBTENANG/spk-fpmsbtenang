const GAS_URL = "https://script.google.com/macros/s/AKfycbykZk55FpptMwCZiDtSNr7X2x25pasAU5DWgaOZ9rMUqBp0PevK_2fVFuwCS-zU7oE/exec"; 

async function panggilAPI(action, data) {
    try {
        const respons = await fetch(GAS_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify({
                action: action,
                payload: data
            })
        });
        
        const hasil = await respons.json();
        return hasil;
        
    } catch (error) {
        console.error("Ralat API:", error);
        return { 
            status: false, 
            message: "Gagal berhubung dengan pelayan. Sila semak sambungan internet atau URL API anda." 
        };
    }

}






