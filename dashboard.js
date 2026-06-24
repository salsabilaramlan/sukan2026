// CONFIGURATION & THEME CONTEXT
const API_URL = "https://script.google.com/macros/s/AKfycbxpsBu0N8-2KNIkwmfoge5lZY-4dsVzwEfjxcDWwAo-ypkTdhdmBdm2O24rhDVWnZ7N/exec";

const HOUSE_CONFIG = {
    "ALPHA": { name: "ALPHA", color: "#FF3B30" },
    "BETA":  { name: "BETA",  color: "#007AFF" },
    "DELTA": { name: "DELTA", color: "#34C759" },
    "GAMMA": { name: "GAMMA", color: "#FFCC00" },
    "SIGMA": { name: "SIGMA", color: "#AF52DE" }
};

let pointsChart = null;

// INITIALIZE APP
document.addEventListener("DOMContentLoaded", () => {
    initChart();
    fetchDashboardData();
    // Auto-refresh data setiap 5 saat
    setInterval(fetchDashboardData, 5000);
});

// INITIALIZE CHART.JS
function initChart() {
    const ctx = document.getElementById('pointsChart').getContext('2d');
    pointsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Mata Terkini',
                data: [],
                backgroundColor: [],
                borderWidth: 0,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: '#222f47' },
                    ticks: { color: '#94a3b8', font: { family: 'Rajdhani', size: 14 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#fff', font: { family: 'Orbitron', size: 14 } }
                }
            }
        }
    });
}

// FETCH DATA FROM GOOGLE APPS SCRIPT API
async function fetchDashboardData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Gagal mengambil data daripada API");
        const data = await response.json();
        
        updateUI(data);
    } catch (error) {
        console.error("Dashboard Engine Error:", error);
        // Fallback mockup jika API gagal dihubungi atau internet padang terputus seketika
        generateMockupIfEmpty();
    }
}

// UPDATE CORE UI COMPONENTS
function updateUI(data) {
    window.currentSportsData = data; // Simpan cache data global untuk rujukan Admin Log
    document.getElementById('lastUpdateTxt').innerText = data.lastUpdate || new Date().toLocaleTimeString();

    const ranking = data.rankingRumah;
    
    updateScoreboard(ranking);
    updatePodium(ranking);
    updateChart(ranking);
    updatePredictor(ranking, data); 
    
    if (data.medalTable) updateMedals(data.medalTable);
    if (data.eventFeed) updateTicker(data.eventFeed);
    if (data.categoryBreakdown) updateBreakdown(data.categoryBreakdown);
}

// UPDATE LED SCOREBOARD
function updateScoreboard(ranking) {
    const container = document.getElementById('houseStandingsList');
    container.innerHTML = '';
    
    ranking.forEach((item, index) => {
        const houseKey = item.rumah.toUpperCase();
        const conf = HOUSE_CONFIG[houseKey] || { color: '#ffffff' };
        
        const row = document.createElement('div');
        row.className = 'scoreboard-row';
        row.style.setProperty('--house-color', conf.color);
        
        row.innerHTML = `
            <div class="rank-num">${index + 1}</div>
            <div class="house-identity" style="color: ${conf.color}">${item.rumah}</div>
            <div class="house-pts">${item.mata}</div>
        `;
        container.appendChild(row);
    });
}

// UPDATE PODIUM POSITION
function updatePodium(ranking) {
    if (ranking.length < 3) return;
    
    const p1 = ranking[0];
    const p2 = ranking[1];
    const p3 = ranking[2];

    adjustPodiumStep('podium1', p1, HOUSE_CONFIG[p1.rumah.toUpperCase()]);
    adjustPodiumStep('podium2', p2, HOUSE_CONFIG[p2.rumah.toUpperCase()]);
    adjustPodiumStep('podium3', p3, HOUSE_CONFIG[p3.rumah.toUpperCase()]);
}

function adjustPodiumStep(elementId, data, config) {
    const el = document.getElementById(elementId);
    if (!el || !config) return;
    el.querySelector('.podium-house-name').innerText = data.rumah;
    el.querySelector('.podium-house-name').style.color = config.color;
    el.querySelector('.podium-score').innerText = `${data.mata} pts`;
}

// REFRESH CHART DATA LIVE
function updateChart(ranking) {
    if (!pointsChart) return;
    
    const labels = ranking.map(r => r.rumah);
    const scores = ranking.map(r => r.mata);
    const colors = ranking.map(r => (HOUSE_CONFIG[r.rumah.toUpperCase()] || {}).color || '#fff');
    
    pointsChart.data.labels = labels;
    pointsChart.data.datasets[0].data = scores;
    pointsChart.data.datasets[0].backgroundColor = colors;
    pointsChart.update();
}

// CHAMPION PREDICTOR & LIVE ATHLETE TRACKING
function updatePredictor(ranking, data) {
    if (ranking.length === 0) return;
    const topHouse = ranking[0];
    const secondHouse = ranking[1];
    const diff = secondHouse ? (topHouse.mata - secondHouse.mata) : 0;
    
    const textEl = document.getElementById('predictorTxt');
    const badgeEl = document.getElementById('predictorBadge');
    
    const conf = HOUSE_CONFIG[topHouse.rumah.toUpperCase()] || { color: '#fff' };
    badgeEl.innerText = topHouse.rumah;
    badgeEl.style.backgroundColor = conf.color;
    badgeEl.style.color = topHouse.rumah === 'GAMMA' ? '#000' : '#fff';

    let ulasanMata = diff > 50 
        ? `${topHouse.rumah} mendominasi dengan jurang +${diff} mata.` 
        : `${topHouse.rumah} memimpin tipis dengan beza +${diff} mata di hadapan ${secondHouse.rumah}.`;

    let olahragawanTxt = "Menunggu data acara individu...";
    let olahragawatiTxt = "Menunggu data acara individu...";

    if (data && data.olahragawan && data.olahragawan.nama !== "Tiada Data") {
        olahragawanTxt = `👑 <b>${data.olahragawan.nama}</b> (${data.olahragawan.rumah})<br><span style="color: var(--gold); font-size: 0.9rem;">[${data.olahragawan.emas} Emas | ${data.olahragawan.perak} Perak]</span>`;
    }
    if (data && data.olahragawati && data.olahragawati.nama !== "Tiada Data") {
        olahragawatiTxt = `👑 <b>${data.olahragawati.nama}</b> (${data.olahragawati.rumah})<br><span style="color: var(--gold); font-size: 0.9rem;">[${data.olahragawati.emas} Emas | ${data.olahragawati.perak} Perak]</span>`;
    }

    textEl.innerHTML = `
        <div style="margin-bottom: 12px; font-weight: 600;">${ulasanMata}</div>
        <div style="font-size: 0.95rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div><i class="fa-solid fa-person-running" style="color: #60a5fa"></i> <b>Peneraju Olahragawan:</b><br><span style="color: #e2e8f0">${olahragawanTxt}</span></div>
            <div><i class="fa-solid fa-person-running" style="color: #f472b6"></i> <b>Peneraju Olahragawati:</b><br><span style="color: #e2e8f0">${olahragawatiTxt}</span></div>
        </div>
    `;
}

// INJECT MEDAL DATA
function updateMedals(medalTable) {
    const tbody = document.getElementById('medalTableBody');
    tbody.innerHTML = '';
    
    medalTable.forEach(row => {
        const conf = HOUSE_CONFIG[row.rumah.toUpperCase()] || {};
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="color: ${conf.color || '#fff'}; text-align: left;">${row.rumah}</td>
            <td class="medal-gold">${row.emas}</td>
            <td class="medal-silver">${row.perak}</td>
            <td class="medal-bronze">${row.gangsa}</td>
        `;
        tbody.appendChild(tr);
    });
}

// UPDATE EVENT FEED (TICKER)
function updateTicker(feed) {
    const ticker = document.getElementById('eventFeedTicker');
    if (!feed || feed.length === 0) {
        ticker.innerText = "Kejohanan sedang berlangsung riuh-rendah di padang SK Satu Sultan Alam Shah!";
        return;
    }
    ticker.innerText = feed.join('   |   🚀   ');
}

// CATEGORY BREAKDOWN VISUALS
function updateBreakdown(breakdown) {
    const container = document.getElementById('categoryBreakdown');
    container.innerHTML = '';
    
    for (const [kat, data] of Object.entries(breakdown)) {
        const topHouse = data.leader;
        const conf = HOUSE_CONFIG[topHouse.toUpperCase()] || { color: '#fff' };
        
        const item = document.createElement('div');
        item.className = 'breakdown-item';
        item.innerHTML = `
            <div class="breakdown-header">
                <span>${kat}</span>
                <span style="color: ${conf.color}">Peneraju: ${topHouse} (${data.mata} m)</span>
            </div>
            <div class="progress-track">
                <div class="progress-bar" style="width: ${data.percentage}%; background-color: ${conf.color}"></div>
            </div>
        `;
        container.appendChild(item);
    }
}

// --- LOGIK RAHSIA ADMIN LOG (100% AUTOMATIK DARI LIVE SHEET) ---
function toggleAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'flex';
        renderJadualAdminPenuh(); 
    } else {
        modal.style.display = 'none';
    }
}

function renderJadualAdminPenuh() {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '';

    if (!window.currentSportsData || !window.currentSportsData.allAthletes || window.currentSportsData.allAthletes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="padding: 30px; text-align: center; color: var(--text-muted);">Tiada rekod data atlet individu dijumpai setakat ini.</td></tr>`;
        return;
    }

    const senaraiPenuhAtlet = window.currentSportsData.allAthletes;

    senaraiPenuhAtlet.forEach((atlet, index) => {
        const conf = HOUSE_CONFIG[atlet.rumah.toUpperCase()] || { color: '#fff' };
        const totalPingat = atlet.emas + atlet.perak + atlet.gangsa;
        
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #222f47';
        tr.style.background = index % 2 === 0 ? '#141b2d' : '#111827';
        
        tr.innerHTML = `
            <td style="padding: 12px; text-align: left; font-weight: bold; color: var(--gold);">${index + 1}</td>
            <td class="atlet-name-cell" style="padding: 12px; text-align: left; font-weight: 600;">${atlet.nama}</td>
            <td style="padding: 12px; color: ${conf.color}; font-weight: bold; text-align: center;">${atlet.rumah}</td>
            <td style="padding: 12px; text-align: center; color: #ffd700; font-weight: bold;">${atlet.emas}</td>
            <td style="padding: 12px; text-align: center; color: #e2e8f0; font-weight: bold;">${atlet.perak}</td>
            <td style="padding: 12px; text-align: center; color: #cd7f32; font-weight: bold;">${atlet.gangsa}</td>
            <td style="padding: 12px; text-align: center; font-weight: bold;">${totalPingat}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterAdminTable() {
    const input = document.getElementById('adminSearchInput');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('adminLeaderboardTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let tdNama = tr[i].getElementsByClassName('atlet-name-cell')[0];
        let tdRumah = tr[i].getElementsByTagName('td')[2];
        
        if (tdNama || tdRumah) {
            let txtValueNama = tdNama.textContent || tdNama.innerText;
            let txtValueRumah = tdRumah.textContent || tdRumah.innerText;
            if (txtValueNama.toUpperCase().indexOf(filter) > -1 || txtValueRumah.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// FALLBACK SIMULATION (IF OFFLINE)
function generateMockupIfEmpty() {
    const mockData = {
        lastUpdate: new Date().toLocaleTimeString(),
        rankingRumah: [
            { rumah: "ALPHA", mata: 10 }, { rumah: "BETA", mata: 0 }, { rumah: "DELTA", mata: 0 }, { rumah: "SIGMA", mata: 0 }, { rumah: "GAMMA", mata: 0 }
        ],
        medalTable: [
            { rumah: "ALPHA", emas: 1, perak: 0, gangsa: 0 }, { rumah: "BETA", emas: 0, perak: 0, gangsa: 0 }, { rumah: "DELTA", emas: 0, perak: 0, gangsa: 0 }, { rumah: "SIGMA", emas: 0, perak: 0, gangsa: 0 }, { rumah: "GAMMA", emas: 0, perak: 0, gangsa: 0 }
        ],
        eventFeed: ["Sistem sedia menerima kemas kini dari Google Sheet..."],
        categoryBreakdown: { "Padang": { leader: "ALPHA", mata: 10, percentage: 10 } },
        olahragawan: { nama: "Tiada Data", rumah: "-", emas: 0, perak: 0, gangsa: 0 },
        olahragawati: { nama: "Tiada Data", rumah: "-", emas: 0, perak: 0, gangsa: 0 },
        allAthletes: []
    };
    updateUI(mockData);
}
