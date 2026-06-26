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
    // Auto-refresh keputusan terkini setiap 5 saat
    setInterval(muatDataPemenang, 5000);
});

async function muatDataPemenang() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        document.getElementById('pemenangUpdateTxt').innerText = data.lastUpdate || new Date().toLocaleTimeString();
        
        binaSenaraiMata(data.eventFeed); 
    } catch (error) {
        console.error("Ralat memuatkan senarai pemenang:", error);
    }
}

// MEMBINA LAYOUT LIST EMAS, PERAK, GANGSA LENGKAP
function binaSenaraiMata(feed) {
    const container = document.getElementById('senaraiAcaraPenuh');
    if (!feed || feed.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">Belum ada keputusan acara rasmi yang dimasukkan setakat ini.</div>`;
        return;
    }

    container.innerHTML = '';

    feed.forEach(acaraText => {
        // Data asal dari API: "Nama Acara -> Emas: Nama (RUMAH), Perak: Nama (RUMAH), Gangsa: Nama (RUMAH)"
        // Teks ditapis menggunakan RegEx / String Split supaya pecah dengan bersih
        
        let namaAcara = "Acara Sukan";
        let pemenangEmas = "Tiada Pemenang";
        let pemenangPerak = "Tiada Pemenang";
        let pemenangGangsa = "Tiada Pemenang";

        try {
            // Pecahkan antara Nama Acara dengan data pemenang
            if (acaraText.includes("🥇 EMAS: ")) {
                // Sempurnakan jika teks menggunakan simbol terus dari feed backend
                let part1 = acaraText.split(" 🥇 EMAS: ");
                namaAcara = part1[0];
                
                // Jika teks mengandungi format penuh koma (Emas, Perak, Gangsa)
                let sisaPemenang = part1[1] || "";
                let pecahanPingat = sisaPemenang.split(", Perak: ");
                pemenangEmas = pecahanPingat[0] || "-";
                
                if (pecahanPingat[1]) {
                    let pecahanGangsa = pecahanPingat[1].split(", Gangsa: ");
                    pemenangPerak = pecahanGangsa[0] || "-";
                    pemenangGangsa = pecahanGangsa[1] || "-";
                }
            } else if (acaraText.includes(" -> Emas: ")) {
                let part1 = acaraText.split(" -> Emas: ");
                namaAcara = part1[0];
                let sisa = part1[1] || "";
                let pecahanPerak = sisa.split(", Perak: ");
                pemenangEmas = pecahanPerak[0];
                let pecahanGangsa = pecahanPerak[1].split(", Gangsa: ");
                pemenerangPerak = pecahanGangsa[0];
                pemenangGangsa = pecahanGangsa[1];
            } else {
                namaAcara = acaraText;
            }
        } catch(e) {
            // Pemulihan sekiranya pemisahan teks ralat
            namaAcara = acaraText.split("🥇")[0] || acaraText;
        }

        // Fungsi pembantu mencari warna border kad mengikut warna rumah sukan
        function dapatkanWarnaRumah(teksNama) {
            let warnaLalai = "#1e293b";
            for (const [key, val] of Object.entries(HOUSE_CONFIG)) {
                if (teksNama && teksNama.toUpperCase().includes(key)) {
                    return val.color;
                }
            }
            return warnaLalai;
        }

        const borderEmas = dapatkanWarnaRumah(pemenangEmas);
        const borderPerak = dapatkanWarnaRumah(pemenangPerak);
        const borderGangsa = dapatkanWarnaRumah(pemenangGangsa);

        const card = document.createElement('div');
        card.className = 'result-row';
        
        card.innerHTML = `
            <div class="result-header">
                <div class="result-title"><i class="fa-solid fa-flag-checkered" style="color: var(--gold);"></i> ${namaAcara}</div>
                <div class="result-badge" style="color: #60a5fa; background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.2);">LIVE RESULT</div>
            </div>
            <div class="podium-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                
                <div class="medal-item" style="border-left: 4px solid ${borderEmas}; background: rgba(20,27,45,0.6);">
                    <span style="font-size: 1.6rem; filter: drop-shadow(0 0 4px #ffd700);">🥇</span>
                    <div>
                        <div style="font-size: 0.75rem; color: var(--gold); font-family: 'Orbitron'; font-weight: bold; letter-spacing: 0.5px;">TEMPAT PERTAMA (EMAS)</div>
                        <div style="font-weight: 700; color: #fff; font-size: 1.1rem; margin-top: 2px;">${pemenangEmas}</div>
                    </div>
                </div>

                <div class="medal-item" style="border-left: 4px solid ${borderPerak}; background: rgba(20,27,45,0.6);">
                    <span style="font-size: 1.6rem; filter: drop-shadow(0 0 4px #e2e8f0);">🥈</span>
                    <div>
                        <div style="font-size: 0.75rem; color: #cbd5e1; font-family: 'Orbitron'; font-weight: bold; letter-spacing: 0.5px;">TEMPAT KEDUA (PERAK)</div>
                        <div style="font-weight: 700; color: #fff; font-size: 1.1rem; margin-top: 2px;">${pemenangPerak}</div>
                    </div>
                </div>

                <div class="medal-item" style="border-left: 4px solid ${borderGangsa}; background: rgba(20,27,45,0.6);">
                    <span style="font-size: 1.6rem; filter: drop-shadow(0 0 4px #cd7f32);">🥉</span>
                    <div>
                        <div style="font-size: 0.75rem; color: #b45309; font-family: 'Orbitron'; font-weight: bold; letter-spacing: 0.5px;">TEMPAT KETIGA (GANGSA)</div>
                        <div style="font-weight: 700; color: #fff; font-size: 1.1rem; margin-top: 2px;">${pemenangGangsa}</div>
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
