// ---------- Configuration ----------
// 1) Use a publicly‑available 10 MB file (no CORS issues in most cases)
const DOWNLOAD_TEST_FILE = 'https://speedtest.tele2.net/10MB.zip';
// 2) For a true upload test you need a server endpoint (see explanation below)
const UPLOAD_TEST_URL = 'https://your‑server.com/upload';

/** Simple helper to format numbers */
const fmt = n => (n ? n.toFixed(2) : '0.00');

/** Start the test when the button is clicked */
document.getElementById('startBtn').addEventListener('click', async () => {
    const btn = document.getElementById('startBtn');
    const gaugeText = document.getElementById('gaugeText');
    const gaugeFill = document.getElementById('gaugeFill');
    const resultDiv = document.getElementById('result');

    btn.disabled = true;
    resultDiv.innerHTML = '';
    gaugeText.textContent = '...';
    gaugeFill.style.background = 'conic-gradient(#4caf50 0deg, #e0e0e0 0deg)';

    // ---------- Download Speed ----------
    const downloadMbps = await testDownload();
    updateGauge(downloadMbps);
    gaugeText.textContent = `${fmt(downloadMbps)} Mbps`;
    resultDiv.innerHTML += `<p>Download: <strong>${fmt(downloadMbps)} Mbps</strong></p>`;

    // ---------- Upload Speed (placeholder) ----------
    // To make upload work, host a small server script (Node, PHP, Python, etc.)
    // that accepts a POST request and returns the same data.
    const uploadMbps = await testUpload(); // returns 0 if you don't have a server
    resultDiv.innerHTML += `<p>Upload: <strong>${fmt(uploadMbps)} Mbps</strong></p>`;

    btn.disabled = false;
});

/** Download test – fetch a known‑size file and time it */
async function testDownload() {
    const start = performance.now();
    try {
        const resp = await fetch(DOWNLOAD_TEST_FILE, { cache: 'no-store' });
        if (!resp.ok) throw new Error('Network error');
        const blob = await resp.blob();
        const end = performance.now();
        const seconds = (end - start) / 1000;
        const bitsLoaded = blob.size * 8;
        const speedBps = bitsLoaded / seconds;
        const speedMbps = speedBps / 1_000_000;
        return speedMbps;
    } catch (e) {
        console.error('Download test failed:', e);
        return 0;
    }
}

/** Upload test – POST random data to your server */
async function testUpload() {
    // Create a 1 MB blob of random data (you can adjust the size)
    const size = 1 * 1024 * 1024; // 1 MiB
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) data[i] = Math.floor(Math.random() * 256);

    const start = performance.now();
    try {
        const resp = await fetch(UPLOAD_TEST_URL, {
            method: 'POST',
            body: data,
            headers: { 'Content-Type': 'application/octet-stream' }
        });
        if (!resp.ok) throw new Error('Upload failed');
        const end = performance.now();
        const seconds = (end - start) / 1000;
        const bitsSent = size * 8;
        const speedBps = bitsSent / seconds;
        const speedMbps = speedBps / 1_000_000;
        return speedMbps;
    } catch (e) {
        console.error('Upload test failed (no server?):', e);
        return 0;
    }
}

/** Update the gauge visual – just a simple conic‑gradient */
function updateGauge(mbps) {
    const max = 100; // assumed max speed for the gauge
    const percent = Math.min((mbps / max) * 100, 100);
    const deg = (percent / 100) * 360;
    const gaugeFill = document.getElementById('gaugeFill');
    gaugeFill.style.background = `conic-gradient(#4caf50 ${deg}deg, #e0e0e0 ${deg}deg)`;
}