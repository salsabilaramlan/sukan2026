// CONFIGURATION & THEME CONTEXT - NEW DEPLOYMENT URL
const API_URL = "https://script.google.com/macros/s/AKfycbxmfqoPmpI3EvRRFNPxztwZBK9uSfknb0JfxzzrKgixb_6ZytkgWAim9eUtRgurlO7v/exec";

const HOUSE_CONFIG = {
    "ALPHA": { name: "ALPHA", color: "#FF3B30" },
    "BETA":  { name: "BETA",  color: "#007AFF" },
    "DELTA": { name: "DELTA", color: "#34C759" },
    "GAMMA": { name: "GAMMA", color: "#FFCC00" },
    "SIGMA": { name: "SIGMA", color: "#AF52DE" }
};

document.addEventListener("DOMContentLoaded", () => {
    muatDataPemenang();
    // Auto-refresh keputusan terkini daripada padang setiap 5 saat
    setInterval(muatDataPemenang, 5000);
});

async function muatDataPemenang() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Gagal memanggil pelayan API");
        const data = await response.json();
        
        document.getElementById('pemenangUpdateTxt').innerText = data.lastUpdate || new Date().toLocaleTimeString();
        
        // Membaca tatasusunan senaraiKeputusanPenuh tulen yang dihantar terus dari Google Apps Script
        binaSenaraiMata(data.senaraiKeputusanPenuh); 
    } catch (error) {
        console.error("Ralat memuatkan senarai pemenang:", error);
    }
}

function binaSenaraiMata(senarai) {
    const container = document.getElementById('senaraiAcaraPenuh');
    if (!senarai || senarai.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">Belum ada keputusan rasmi yang dimasukkan oleh urus setia sukan.</div>`;
        return;
    }

    container.innerHTML = '';

    senarai.forEach(item => {
        // Fungsi pembantu automatik mengesan warna sempadan berdasarkan nama rumah sukan murid
        function dapatkanWarnaRumah(teksNama) {
            let warnaLalai = "#222f47"; // Kelabu/Gelap lalai jika tiada data
            if (!teksNama || teksNama === "-") return warnaLalai;
            
            for (const [key, val] of Object.entries(HOUSE_CONFIG)) {
                if (teksNama.toUpperCase().includes(key)) return val.color;
            }
            return warnaLalai;
        }

        const borderEmas = dapatkanWarnaRumah(item.emas);
        const borderPerak = dapatkanWarnaRumah(item.perak);
        const borderGangsa = dapatkanWarnaRumah(item.gangsa);

        const card = document.createElement('div');
        card.className = 'result-row';
        
        card.innerHTML = `
            <div class="result-header">
                <div class="result-title"><i class="fa-solid fa-flag-checkered" style="color: var(--gold);"></i> ${item.acara}</div>
                <div class="result-badge" style="color: #60a5fa; background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.2);">KEPUTUSAN LIVE</div>
            </div>
            <div class="podium-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                
                <!-- EMAS / JOHAN -->
                <div class="medal-item" style="border-left: 4px solid ${borderEmas}; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 6px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.6rem; filter: drop-shadow(0 0 4px #ffd700);">🥇</span>
                    <div>
                        <div style="font-size: 0.75rem; color: var(--gold); font-family: 'Orbitron'; font-weight: bold; letter-spacing: 0.5px;">EMAS / JOHAN</div>
                        <div style="font-weight: 700; color: #fff; font-size: 1.05rem; margin-top: 2px; line-height: 1.3;">${item.emas}</div>
                    </div>
                </div>

                <!-- PERAK / NAIB JOHAN -->
                <div class="medal-item" style="border-left: 4px solid ${borderPerak}; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 6px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.6rem; filter: drop-shadow(0 0 4px #cbd5e1);">🥈</span>
                    <div>
                        <div style="font-size: 0.75rem; color: #cbd5e1; font-family: 'Orbitron'; font-weight: bold; letter-spacing: 0.5px;">PERAK / NAIB JOHAN</div>
                        <div style="font-weight: 700; color: #fff; font-size: 1.05rem; margin-top: 2px; line-height: 1.3;">${item.perak}</div>
                    </div>
                </div>

                <!-- GANGSA / KETIGA -->
                <div class="medal-item" style="border-left: 4px solid ${borderGangsa}; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 6px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.6rem; filter: drop-shadow(0 0 4px #cd7f32);">🥉</span>
                    <div>
                        <div style="font-size: 0.75rem; color: #cd7f32; font-family: 'Orbitron'; font-weight: bold; letter-spacing: 0.5px;">GANGSA / KETIGA</div>
                        <div style="font-weight: 700; color: #fff; font-size: 1.05rem; margin-top: 2px; line-height: 1.3;">${item.gangsa}</div>
                    </div>
                </div>

            </div>
        `;
        container.appendChild(card);
    });
}

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
