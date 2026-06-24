// CONFIGURATION & THEME CONTEXT
const API_URL = "https://script.google.com/macros/s/AKfycbxaMRvtl8pKGQiYpXmh3NQ6Vki6KX-8x3MRKXZwSMIBQeJ2UXZg_oG25eGsXt6rMmSr/exec";

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
        // Fallback mockup jika API gagal dihubungi atau sekatan rangkaian internet padang
        generateMockupIfEmpty();
    }
}

// UPDATE CORE UI COMPONENTS
function updateUI(data) {
    document.getElementById('lastUpdateTxt').innerText = data.lastUpdate || new Date().toLocaleTimeString();

    const ranking = data.rankingRumah;
    
    updateScoreboard(ranking);
    updatePodium(ranking);
    updateChart(ranking);
    updatePredictor(ranking);
    
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

// ALGORITHM FOR CHAMPION PREDICTOR
function updatePredictor(ranking) {
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

    if (diff > 50) {
        textEl.innerText = `${topHouse.rumah} sedang mendominasi dengan jurang kelebihan ${diff} mata. Peluang tinggi untuk bergelar Juara Keseluruhan!`;
    } else {
        textEl.innerText = `${topHouse.rumah} memimpin tipis dengan beza ${diff} mata di hadapan ${secondHouse.rumah}. Kedudukan sangat sengit!`;
    }
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
    if (feed.length === 0) {
        ticker.innerText = "Kejohanan sedang berlangsung sengit di padang SK Satu Sultan Alam Shah!";
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

// FALLBACK MOCKUP DATA GENERATOR
function generateMockupIfEmpty() {
    const mockData = {
        lastUpdate: new Date().toLocaleTimeString(),
        rankingRumah: [
            { rumah: "ALPHA", mata: 425 },
            { rumah: "BETA", mata: 390 },
            { rumah: "DELTA", mata: 365 },
            { rumah: "SIGMA", mata: 310 },
            { rumah: "GAMMA", mata: 295 }
        ],
        medalTable: [
            { rumah: "ALPHA", emas: 12, perak: 8, gangsa: 10 },
            { rumah: "BETA", emas: 10, perak: 11, gangsa: 7 },
            { rumah: "DELTA", emas: 9, perak: 9, gangsa: 12 },
            { rumah: "SIGMA", emas: 7, perak: 6, gangsa: 8 },
            { rumah: "GAMMA", emas: 5, perak: 9, gangsa: 6 }
        ],
        eventFeed: [
            "ACARA 102: Lari 100m (L12) - Emas: ALPHA (M. Rayyan), Perak: BETA, Gangsa: SIGMA",
            "SUKANEKA TAHAP 1: Acara Bawa Bola Ping Pong dalam Sudu - Johan disandang oleh DELTA!",
            "KEMAS KINI: Rumah GAMMA menang tempat pertama perlawanan Tarik Tali Peringkat Saringan."
        ],
        categoryBreakdown: {
            "Balapan": { leader: "ALPHA", mata: 150, percentage: 85 },
            "Padang": { leader: "BETA", mata: 120, percentage: 70 },
            "Sukaneka": { leader: "DELTA", mata: 160, percentage: 90 },
            "Tarik Tali": { leader: "GAMMA", mata: 70, percentage: 45 }
        }
    };
    updateUI(mockData);
}
