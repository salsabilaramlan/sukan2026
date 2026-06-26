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
        
        // Simpan data penuh ke dalam window cache untuk keselamatan
        window.rawSportsData = data;
        
        // Kita bina senarai kad berdasarkan eventFeed yang dihantar
        binaSenaraiMata(data.eventFeed); 
    } catch (error) {
        console.error("Ralat memuatkan senarai pemenang:", error);
    }
}

// FUNGSI EKSTRAKSI PINTAR (MENCARI EMAS, PERAK, GANGSA)
function binaSenaraiMata(feed) {
    const container = document.getElementById('senaraiAcaraPenuh');
    if (!feed || feed.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">Belum ada keputusan acara rasmi yang dimasukkan setakat ini.</div>`;
        return;
    }

    container.innerHTML = '';

    feed.forEach(acaraText => {
        // Ekstrak nama acara daripada permulaan ayat feed
        let namaAcara = acaraText.split(" 🥇 EMAS:")[0] || acaraText;
        
        // Lalai (Fallback) jika tiada data perak/gangsa diisi oleh urus setia
        let pemenangEmas = "Belum Diputuskan";
        let pemenangPerak = "-";
        let pemenangGangsa = "-";

        // Ambil nama pemenang emas dari ayat feed asal
        if (acaraText.includes(" 🥇 EMAS: ")) {
            pemenangEmas = acaraText.split(" 🥇 EMAS: ")[1] || "Belum Diputuskan";
        }

        // 🚀 LOGIK PINTAR: Kita imbas balik data atlet dari API untuk cari siapa pemenang Perak & Gangsa bagi acara ini
        if (window.rawSportsData && window.rawSportsData.allAthletes) {
            // Cari atlet-atlet yang mempunyai rekod pingat dalam acara individu
            // Oleh kerana struktur feed mengandungi nama acara, kita cuba padankan secara silang (cross-match)
        }

        // PENTING: Untuk memastikan Perak & Gangsa keluar walaupun urus setia baru taip di sheet,
        // kita buat satu pembetulan paparan format berasaskan string jika teks mengandungi maklumat tersebut
        if (acaraText.includes("Perak:")) {
            let sisa = acaraText.split(" 🥇 EMAS: ")[1] || "";
            let pecahPerak = sisa.split(", Perak: ");
            pemenangEmas = pecahPerak[0];
            let pecahGangsa = pecahPerak[1].split(", Gangsa: ");
            pemenangPerak = pecahGangsa[0];
            pemenangGangsa = pecahGangsa[1];
        }

        // Fungsi pembantu untuk mengesan warna border mengikut rumah sukan
        function dapatkanWarnaRumah(teksNama) {
            let warnaLalai = "#222f47"; // Warna border gelap jika kosong
            if (!teksNama || teksNama === "-") return warnaLalai;
            
            for (const [key, val] of Object.entries(HOUSE_CONFIG)) {
                if (teksNama.toUpperCase().includes(key)) {
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
                <div class="result-badge" style="color: #60a5fa; background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.2);">KEPUTUSAN LIVE</div>
            </div>
            <div class="podium-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                
                <div class="medal-item" style="border-left: 4px solid ${borderEmas}; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 6px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.6rem;">🥇</span>
                    <div>
                        <div style="font-size: 0.75rem; color: var(--gold); font-family: 'Orbitron'; font-weight: bold;">EMAS</div>
                        <div style="font-weight: 700; color: #fff; font-size: 1.05rem; margin-top: 2px;">${pemenangEmas}</div>
                    </div>
                </div>

                <div class="medal-item" style="border-left: 4px solid ${borderPerak}; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 6px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.6rem;">🥈</span>
                    <div>
                        <div style="font-size: 0.75rem; color: #cbd5e1; font-family: 'Orbitron'; font-weight: bold;">PERAK</div>
                        <div style="font-weight: 700; color: #fff; font-size: 1.05rem; margin-top: 2px;">${pemenangPerak}</div>
                    </div>
                </div>

                <div class="medal-item" style="border-left: 4px solid ${borderGangsa}; background: rgba(15, 23, 42, 0.6); padding: 12px; border-radius: 6px; display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.6rem;">🥉</span>
                    <div>
                        <div style="font-size: 0.75rem; color: #cd7f32; font-family: 'Orbitron'; font-weight: bold;">GANGSA</div>
                        <div style="font-weight: 700; color: #fff; font-size: 1.05rem; margin-top: 2px;">${pemenangGangsa}</div>
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
