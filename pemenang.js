const API_URL = "https://script.google.com/macros/s/AKfycbxpsBu0N8-2KNIkwmfoge5lZY-4dsVzwEfjxcDWwAo-ypkTdhdmBdm2O24rhDVWnZ7N/exec";

const HOUSE_CONFIG = {
    "ALPHA": { name: "ALPHA", color: "#FF3B30" },
    "BETA":  { name: "BETA",  color: "#007AFF" },
    "DELTA": { name: "DELTA", color: "#34C759" },
    "GAMMA": { name: "GAMMA", color: "#FFCC00" },
    "SIGMA": { name: "SIGMA", color: "#AF52DE" }
};

document.addEventListener("DOMContentLoaded", () => {
    muatDataPemenang();
    // Auto refresh setiap 5 saat untuk keputusan terkini
    setInterval(muatDataPemenang, 5000);
});

async function muatDataPemenang() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Simpan timestamp kemas kini akhir
        document.getElementById('pemenangUpdateTxt').innerText = data.lastUpdate || new Date().toLocaleTimeString();
        
        // Kita hantar data ke fungsi pembuat senarai
        binaSenaraiMata(data.eventFeed); 
    } catch (error) {
        console.error("Ralat memuatkan senarai pemenang:", error);
    }
}

// Kerana Apps Script sudah memproses susunan data feed acara dari PEMENANG_INDIVIDU,
// kita pecahkan semula teks tersebut untuk paparan senarai kad yang premium.
function binaSenaraiMata(feed) {
    const container = document.getElementById('senaraiAcaraPenuh');
    if (!feed || feed.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">Belum ada keputusan acara rasmi yang dimasukkan setakat ini.</div>`;
        return;
    }

    container.innerHTML = '';

    feed.forEach(acaraText => {
        // Format asal dari feed: "Nama Acara 🥇 EMAS: Nama Pelajar (RUMAH)"
        // Kita bersihkan teks untuk bina layout senarai list
        
        let bahagianEmas = acaraText.split(" 🥇 EMAS: ");
        let namaAcara = bahagianEmas[0] || "Acara Sukan";
        let pemenangEmas = bahagianEmas[1] || "Belum Diputuskan";
        
        // Cari nama rumah emas untuk letak warna
        let warnaRumahEmas = "#1e293b"; 
        for (const [key, val] of Object.entries(HOUSE_CONFIG)) {
            if (pemenangEmas.toUpperCase().includes(key)) {
                warnaRumahEmas = val.color;
            }
        }

        const card = document.createElement('div');
        card.className = 'result-row';
        
        card.innerHTML = `
            <div class="result-header">
                <div class="result-title"><i class="fa-solid fa-flag-checkered" style="color: var(--gold);"></i> ${namaAcara}</div>
                <div class="result-badge">KEPUTUSAN LIVE</div>
            </div>
            <div class="podium-list">
                <div class="medal-item" style="border-left-color: ${warnaRumahEmas}">
                    <span style="font-size: 1.5rem;">🥇</span>
                    <div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); font-family: 'Orbitron';">TEMPAT PERTAMA (EMAS)</div>
                        <div style="font-weight: 700; color: #fff; font-size: 1.15rem;">${pemenangEmas}</div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Fungsi Carian Pintar / Tapis Acara
function tapisAcara() {
    const input = document.getElementById('pemenangSearch');
    const filter = input.value.toUpperCase();
    const rows = document.getElementsByClassName('result-row');

    for (let i = 0; i < rows.length; i++) {
        let title = rows[i].getElementsByClassName('result-title')[0];
        let textValue = title.textContent || title.innerText;
        
        if (textValue.toUpperCase().indexOf(filter) > -1) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}
