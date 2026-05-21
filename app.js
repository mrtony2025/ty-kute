// Vietnam Horror AI Game Factory - Dashboard Controller (REST Backend Integration)

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadPrompts();
    loadEvents();
    initFormHandlers();
    initAudioSimulator();
    initPlayableMinigame();
});

// 1. Tab Navigation System
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            
            // Update active nav button
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Switch tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${tabId}`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// 2. Fetch and Render Prompts Dynamically
async function loadPrompts() {
    const container = document.getElementById('prompts-container');
    if (!container) return;

    try {
        const response = await fetch('/api/prompts');
        const prompts = await response.json();
        
        container.innerHTML = '';

        if (prompts.length === 0) {
            container.innerHTML = `<p style="font-style: italic; color: var(--text-dark);">Chưa có prompt nào trong thư viện.</p>`;
            return;
        }

        prompts.forEach(prompt => {
            const promptBox = document.createElement('div');
            promptBox.className = 'prompt-box';
            promptBox.innerHTML = `
                <div class="prompt-header">
                    <span>${prompt.name}</span>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-copy" data-target="${prompt.id}"><i class="fa-regular fa-copy"></i> Copy Prompt</button>
                        <button class="btn-delete" onclick="deletePrompt('${prompt.id}')"><i class="fa-solid fa-trash-can"></i> Xóa</button>
                    </div>
                </div>
                <pre id="${prompt.id}">${prompt.content}</pre>
            `;
            container.appendChild(promptBox);
        });

        // Re-initialize copy button events
        initCopyButtons();

    } catch (error) {
        console.error('Lỗi khi tải danh sách prompt:', error);
        container.innerHTML = `<p style="color: var(--neon-red);">Không thể kết nối đến API Server.</p>`;
    }
}

// 3. Fetch and Render Events Dynamically
async function loadEvents() {
    const tableBody = document.getElementById('events-table-body');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        
        tableBody.innerHTML = '';

        if (events.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; font-style: italic;">Chưa có sự kiện nào trong database.</td></tr>`;
            return;
        }

        events.forEach(event => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${event.id}</code></td>
                <td><strong>${event.name}</strong></td>
                <td><span class="badge-text ${event.severity.toLowerCase()}">${event.severity}</span></td>
                <td>${event.desc}</td>
                <td><span style="font-family: var(--font-mono); color: var(--neon-red); font-weight: bold;">${event.stress}%</span></td>
                <td>
                    <button class="btn-delete" onclick="deleteEvent('${event.id}')">
                        <i class="fa-solid fa-trash-can"></i> Xóa
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error('Lỗi khi tải danh sách sự kiện:', error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--neon-red);">Không thể kết nối đến API Server.</td></tr>`;
    }
}

// 4. Initialize Copy Action for Generated Prompts
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.btn-copy');

    copyButtons.forEach(btn => {
        // Remove previous listener to avoid multiples
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', async () => {
            const targetId = newBtn.getAttribute('data-target');
            const codeText = document.getElementById(targetId).innerText;

            try {
                await navigator.clipboard.writeText(codeText);
                
                // Copy feedback
                const originalText = newBtn.innerHTML;
                newBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                newBtn.style.background = '#39ff14';
                newBtn.style.borderColor = '#39ff14';
                newBtn.style.color = '#000';
                
                setTimeout(() => {
                    newBtn.innerHTML = originalText;
                    newBtn.style.background = '';
                    newBtn.style.borderColor = '';
                    newBtn.style.color = '';
                }, 2000);
            } catch (err) {
                console.error('Không thể sao chép: ', err);
            }
        });
    });
}

// 5. Delete Action Functions (Exposed to window)
window.deletePrompt = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa prompt này khỏi thư viện?')) return;
    try {
        const response = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadPrompts();
        } else {
            alert('Lỗi khi xóa prompt.');
        }
    } catch (e) {
        console.error(e);
    }
};

window.deleteEvent = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự kiện siêu nhiên này?')) return;
    try {
        const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadEvents();
        } else {
            alert('Lỗi khi xóa sự kiện.');
        }
    } catch (e) {
        console.error(e);
    }
};

// 6. Form Submission Handlers (C&U API)
function initFormHandlers() {
    const addPromptForm = document.getElementById('form-add-prompt');
    const addEventForm = document.getElementById('form-add-event');

    if (addPromptForm) {
        addPromptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('prompt-name').value;
            const content = document.getElementById('prompt-content').value;
            const id = 'prompt-' + Date.now();

            try {
                const response = await fetch('/api/prompts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, name, content })
                });

                if (response.ok) {
                    addPromptForm.reset();
                    loadPrompts();
                } else {
                    alert('Lỗi khi lưu prompt.');
                }
            } catch (error) {
                console.error(error);
            }
        });
    }

    if (addEventForm) {
        addEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('event-id').value;
            const name = document.getElementById('event-name').value;
            const severity = document.getElementById('event-severity').value;
            const desc = document.getElementById('event-desc').value;
            const stress = parseInt(document.getElementById('event-stress').value);

            try {
                const response = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, name, severity, desc, stress })
                });

                if (response.ok) {
                    addEventForm.reset();
                    loadEvents();
                } else {
                    const data = await response.json();
                    alert(data.error || 'Lỗi khi lưu sự kiện.');
                }
            } catch (error) {
                console.error(error);
            }
        });
    }
}

// --- SHARED AUDIO CONTEXT & SYNTHESIZERS ---
let audioCtx = null;
let activeNodes = {};

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Procedural TV Static (White Noise) Generator
function playStaticTV() {
    const ctx = getAudioContext();
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.15;
    
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    whiteNoise.start();
    
    whiteNoise.filter = filter;
    whiteNoise.gain = gainNode;
    
    return whiteNoise;
}

// Procedural Loa Phường (Speaker Distortion)
function playLoaPhuong() {
    const ctx = getAudioContext();
    const nodes = [];
    
    const oscHum = ctx.createOscillator();
    oscHum.type = 'sine';
    oscHum.frequency.value = 85; 
    
    const oscScreech = ctx.createOscillator();
    oscScreech.type = 'sine';
    oscScreech.frequency.value = 2200; 
    
    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(100);
    distortion.oversample = '4x';
    
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    
    oscHum.connect(distortion);
    oscScreech.connect(distortion);
    distortion.connect(masterGain);
    masterGain.connect(ctx.destination);
    
    oscHum.start();
    oscScreech.start();
    
    nodes.push(oscHum, oscScreech, masterGain);
    
    nodes.stop = () => {
        oscHum.stop();
        oscScreech.stop();
    };
    
    nodes.masterGain = masterGain;
    nodes.oscScreech = oscScreech;
    
    return nodes;
}

// Procedural Gecko Chirp
function playGeckoChirp() {
    const ctx = getAudioContext();
    let isPlaying = true;
    
    const playClick = () => {
        if (!isPlaying) return;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    };
    
    let chirpCount = 0;
    const intervalId = setInterval(() => {
        if (!isPlaying) return;
        playClick();
        chirpCount++;
        
        if (chirpCount > 8) {
            chirpCount = 0;
            clearInterval(intervalId);
            setTimeout(() => {
                if (isPlaying) {
                    const newNodes = playGeckoChirp();
                    activeNodes['btn-play-gecko'] = newNodes;
                }
            }, Math.random() * 4000 + 2000);
        }
    }, 120);

    const stopObj = {
        stop: () => {
            isPlaying = false;
            clearInterval(intervalId);
        }
    };
    
    return stopObj;
}

// 1. Đập Phá Đồ Đạc (Heavy Wood/Ceramic Shatter)
function playSmash() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const bufferSize = ctx.sampleRate * 0.6; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(120, now + 0.5);
    noiseFilter.Q.setValueAtTime(2, now);
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.linearRampToValueAtTime(30, now + 0.4);
    
    const oscFilter = ctx.createBiquadFilter();
    oscFilter.type = 'lowpass';
    oscFilter.frequency.setValueAtTime(180, now);
    
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc.connect(oscFilter);
    oscFilter.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    noise.start(now);
    osc.start(now);
    
    noise.stop(now + 0.6);
    osc.stop(now + 0.6);
    
    return {
        stop: () => {
            try { noise.stop(); } catch(e){}
            try { osc.stop(); } catch(e){}
        }
    };
}

// 2. Mài Dao Kim Loại (Metallic Sharpening/Scraping Loop)
function playKnife() {
    const ctx = getAudioContext();
    let isPlaying = true;
    
    const scratch = () => {
        if (!isPlaying) return;
        const now = ctx.currentTime;
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        
        osc1.frequency.setValueAtTime(2200, now);
        osc1.frequency.linearRampToValueAtTime(2600, now + 0.5);
        osc2.frequency.setValueAtTime(2220, now);
        osc2.frequency.linearRampToValueAtTime(2640, now + 0.5);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, now);
        filter.Q.setValueAtTime(4, now);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        const bufSize = ctx.sampleRate * 0.5;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.0, now);
        noiseGain.gain.linearRampToValueAtTime(0.06, now + 0.08);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc1.connect(filter);
        osc2.connect(filter);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        noise.start(now);
        
        osc1.stop(now + 0.6);
        osc2.stop(now + 0.6);
        noise.stop(now + 0.6);
    };
    
    scratch();
    const intervalId = setInterval(scratch, 1800);
    
    return {
        stop: () => {
            isPlaying = false;
            clearInterval(intervalId);
        }
    };
}

// 3. Tiếng Cười Rùng Rợn (Ghostly Creepy Laugh with Cavern Reverb/Delay)
function playLaugh() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 1.3);
    
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(6.5, now);
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(35, now);
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 1.3);
    filter.Q.setValueAtTime(3.5, now);
    
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.25, now);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    
    const delay = ctx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.25, now);
    
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.45, now);
    
    osc.connect(filter);
    filter.connect(mainGain);
    
    mainGain.connect(ctx.destination);
    mainGain.connect(delay);
    delay.connect(delayFeedback);
    delayFeedback.connect(delay);
    delayFeedback.connect(ctx.destination);
    
    lfo.start(now);
    osc.start(now);
    
    lfo.stop(now + 1.4);
    osc.stop(now + 1.4);
    
    return {
        stop: () => {
            try { lfo.stop(); } catch(e){}
            try { osc.stop(); } catch(e){}
        }
    };
}

// 4. Sách Báo Sột Soạt (Paper Rustling Loop)
function playRustle() {
    const ctx = getAudioContext();
    let isPlaying = true;
    
    const rustle = () => {
        if (!isPlaying) return;
        const now = ctx.currentTime;
        const bursts = Math.floor(Math.random() * 4) + 3;
        let offset = 0;
        
        for (let i = 0; i < bursts; i++) {
            const dur = Math.random() * 0.06 + 0.02;
            const bufSize = ctx.sampleRate * dur;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let j = 0; j < bufSize; j++) {
                data[j] = Math.random() * 2 - 1;
            }
            
            const source = ctx.createBufferSource();
            source.buffer = buf;
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(Math.random() * 2500 + 1500, now + offset);
            filter.Q.setValueAtTime(2.5, now + offset);
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.06, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
            
            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            
            source.start(now + offset);
            source.stop(now + offset + dur);
            
            offset += dur + Math.random() * 0.06;
        }
    };
    
    rustle();
    const intervalId = setInterval(rustle, 1200);
    
    return {
        stop: () => {
            isPlaying = false;
            clearInterval(intervalId);
        }
    };
}

// 5. Nước Dột Tong Tỏng (Periodic Water Dripping Loop with Deep Well Resonance)
function playDripLoop() {
    const ctx = getAudioContext();
    let isPlaying = true;
    
    const drip = () => {
        if (!isPlaying) return;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(1300, now + 0.035);
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        
        const delay = ctx.createDelay(0.5);
        delay.delayTime.setValueAtTime(0.18, now);
        const delayGain = ctx.createGain();
        delayGain.gain.setValueAtTime(0.35, now);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.1);
    };
    
    drip();
    const intervalId = setInterval(drip, 2200);
    
    return {
        stop: () => {
            isPlaying = false;
            clearInterval(intervalId);
        }
    };
}

function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

// Global update parameters for active sounds
function updateSynthParameters(stress) {
    const ctx = getAudioContext();
    const intensity = stress / 100;
    
    const tvNode = activeNodes['btn-play-static'];
    if (tvNode) {
        if (tvNode.filter) {
            tvNode.filter.Q.value = 0.5 + (intensity * 2.0);
            tvNode.filter.frequency.value = 1000 + (intensity * 800);
        }
        if (tvNode.gain) {
            tvNode.gain.gain.value = 0.15 + (intensity * 0.25);
        }
    }
    
    const loaNodes = activeNodes['btn-play-loa'];
    if (loaNodes && loaNodes.oscScreech) {
        loaNodes.oscScreech.frequency.setValueAtTime(2200 + (intensity * 600), ctx.currentTime);
        if (loaNodes.masterGain) {
            loaNodes.masterGain.gain.value = 0.3 + (intensity * 0.4);
        }
    }
}

// 7. Web Audio API Procedural Sound Generator (Simulation Dashboard Wiring)
function initAudioSimulator() {
    const stressSlider = document.getElementById('stress-slider');
    const stressValue = document.getElementById('stress-value');
    
    if (!stressSlider) return;

    // Update Stress HUD
    stressSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        stressValue.innerText = `${val}%`;
        
        const intensity = val / 100;
        const glow = document.querySelector('.ambient-glow');
        if (glow) {
            glow.style.background = `radial-gradient(circle, rgba(255, 0, 60, ${0.03 + (intensity * 0.08)}) 0%, transparent 60%)`;
        }
        
        updateSynthParameters(val);
    });

    // Toggle Buttons
    setupSoundToggle('btn-play-static', () => playStaticTV());
    setupSoundToggle('btn-play-loa', () => playLoaPhuong());
    setupSoundToggle('btn-play-gecko', () => playGeckoChirp());
    setupSoundToggle('btn-play-smash', () => playSmash());
    setupSoundToggle('btn-play-knife', () => playKnife());
    setupSoundToggle('btn-play-laugh', () => playLaugh());
    setupSoundToggle('btn-play-rustle', () => playRustle());
    setupSoundToggle('btn-play-drip', () => playDripLoop());

    function setupSoundToggle(btnId, playFunc) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        
        btn.addEventListener('click', () => {
            getAudioContext();
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                stopSound(btnId);
            } else {
                btn.classList.add('active');
                activeNodes[btnId] = playFunc();
            }
        });
    }

    function stopSound(id) {
        if (activeNodes[id]) {
            if (Array.isArray(activeNodes[id])) {
                activeNodes[id].forEach(n => { try { n.stop(); } catch(e){} });
            } else {
                try { activeNodes[id].stop(); } catch(e){}
            }
            delete activeNodes[id];
        }
    }
}

// 8. Playable Interactive Minigame Logic (DƯỚI GIẾNG - Vertical Slice)
function initPlayableMinigame() {
    // Game variables
    let gameFlashlight = true;
    let gameBattery = 100;
    let gameStress = 10;
    let gameInventory = [];
    let solvedRadio = false;
    let solvedAltar = false; // false, true, or 'destroyed'
    let discoveredTruth = false;
    let gameActive = false;
    let gameLocation = 'yard'; // yard, radio, altar, well
    let gameInterval = null;
    let cubeRotation = { x: -20, y: 30 };
    
    // Ambient sound in game
    let activeGameAmbience = null;
    
    // DOM Elements
    const tabPlayable = document.getElementById('tab-playable');
    const stressBar = document.getElementById('game-stress-bar');
    const stressLbl = document.getElementById('game-stress-lbl');
    const batteryBar = document.getElementById('game-battery-bar');
    const batteryLbl = document.getElementById('game-battery-lbl');
    const btnFlashlight = document.getElementById('game-btn-flashlight');
    const gameScreen = document.getElementById('game-screen');
    const overlayScare = document.getElementById('screen-overlay-scare');
    const textContent = document.getElementById('screen-text-content');
    const actionButtonsContainer = document.getElementById('game-action-buttons');
    const inventoryListContainer = document.getElementById('game-inventory-list');
    const gameLogsContainer = document.getElementById('game-logs');
    const inspectModal = document.getElementById('game-inspect-modal');
    const inspectObject = document.getElementById('inspect-object');
    const btnCloseInspect = document.getElementById('btn-close-inspect');
    
    if (!tabPlayable) return;
    
    // Listen for tab switching to play/pause game loop
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            if (tabId === 'playable') {
                startGame();
            } else {
                pauseGame();
            }
        });
    });
    
    // Flashlight Toggle
    btnFlashlight.addEventListener('click', () => {
        if (gameBattery <= 0) {
            addLog("Đèn pin đã cạn pin, không thể bật!", "scare");
            return;
        }
        gameFlashlight = !gameFlashlight;
        updateFlashlightUI();
        if (gameFlashlight) {
            addLog("Bạn bật đèn pin. Ánh sáng vàng nhạt xua tan bóng tối xung quanh.", "action");
            gameScreen.classList.remove('darkness');
        } else {
            addLog("Bạn tắt đèn pin. Bóng tối đen đặc nuốt chửng mọi thứ.", "scare");
            gameScreen.classList.add('darkness');
        }
        renderLocation();
    });

    // Mouse Move on Viewport for Flashlight Spotlight
    const gameViewportElement = document.getElementById('game-viewport');
    if (gameViewportElement) {
        gameViewportElement.addEventListener('mousemove', (e) => {
            const rect = gameViewportElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            gameViewportElement.style.setProperty('--mouse-x', `${x}px`);
            gameViewportElement.style.setProperty('--mouse-y', `${y}px`);
        });
        
        // Handle touch events for mobile
        gameViewportElement.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                const rect = gameViewportElement.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const y = e.touches[0].clientY - rect.top;
                gameViewportElement.style.setProperty('--mouse-x', `${x}px`);
                gameViewportElement.style.setProperty('--mouse-y', `${y}px`);
            }
        });
    }
    
    function updateFlashlightUI() {
        if (gameFlashlight) {
            btnFlashlight.classList.add('active');
            btnFlashlight.innerHTML = `<i class="fa-solid fa-lightbulb"></i> Đèn Pin: BẬT`;
            gameScreen.classList.remove('darkness');
        } else {
            btnFlashlight.classList.remove('active');
            btnFlashlight.innerHTML = `<i class="fa-solid fa-lightbulb-slash"></i> Đèn Pin: TẮT`;
            gameScreen.classList.add('darkness');
        }
    }
    
    // 3D Object rotation buttons
    const inspectDirBtns = document.querySelectorAll('.btn-inspect-dir');
    inspectDirBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.getAttribute('data-dir');
            if (dir === 'left') cubeRotation.y -= 90;
            else if (dir === 'right') cubeRotation.y += 90;
            else if (dir === 'up') cubeRotation.x += 90;
            else if (dir === 'down') cubeRotation.x -= 90;
            
            inspectObject.style.transform = `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`;
            
            // Check if rotated to back face (rotated 180 degrees)
            const normalizedY = Math.abs(cubeRotation.y) % 360;
            if (normalizedY === 180) {
                addLog("Bạn xoay mặt sau của chiếc ấm trà cũ... Có vài ký tự màu đỏ: 108.", "action");
                playRustleOnce();
            }
        });
    });
    
    // Close Inspect Modal
    btnCloseInspect.addEventListener('click', () => {
        inspectModal.classList.remove('active');
        addLog("Bạn đặt chiếc ấm trà cũ xuống đất.", "action");
    });
    
    function setAmbience(ambienceFunc) {
        if (activeGameAmbience) {
            try { activeGameAmbience.stop(); } catch(e){}
            activeGameAmbience = null;
        }
        if (ambienceFunc && gameActive) {
            getAudioContext();
            activeGameAmbience = ambienceFunc();
        }
    }
    
    function playRustleOnce() {
        const r = playRustle();
        setTimeout(() => {
            try { r.stop(); } catch(e){}
        }, 500);
    }
    
    function startGame() {
        gameActive = true;
        addLog("Khởi chạy phiên mô phỏng game DƯỚI GIẾNG...", "system");
        renderLocation();
        
        if (!gameInterval) {
            gameInterval = setInterval(() => {
                if (!gameActive) return;
                
                // Flashlight battery logic
                if (gameFlashlight && gameBattery > 0) {
                    gameBattery -= 1; // 1% per second
                    if (gameBattery <= 0) {
                        gameBattery = 0;
                        gameFlashlight = false;
                        updateFlashlightUI();
                        addLog("Đèn pin chớp tắt vài lần rồi tắt ngúm. Hết pin!", "scare");
                        triggerJumpscare(15);
                    }
                }
                
                // Stress logic
                if (!gameFlashlight || gameBattery <= 0) {
                    gameStress += 2.5; // Increases rapidly in dark
                    if (gameStress > 100) gameStress = 100;
                    
                    // Low probability scary ambient log when in dark
                    if (Math.random() < 0.1 && gameStress < 100) {
                        const darkScaryLogs = [
                            "Có tiếng thì thầm rầm rì phát ra từ bóng tối...",
                            "Bạn cảm thấy như có bàn tay lạnh giá đang lướt qua gáy...",
                            "Một tiếng kẽo kẹt phát ra từ phía bàn thờ treo...",
                            "Tiếng thạch sùng kêu dồn dập vang dội khắp khoảng sân tối."
                        ];
                        addLog(darkScaryLogs[Math.floor(Math.random() * darkScaryLogs.length)], "scare");
                    }
                } else {
                    // Flashlight is ON: stress decreases slowly if high
                    if (gameStress > 10) {
                        gameStress -= 0.5;
                        if (gameStress < 10) gameStress = 10;
                    }
                }
                
                updateHUD();
                
                // Check Stress Ending
                if (gameStress >= 100) {
                    triggerEnding('chimsau');
                }
            }, 1000);
        }
    }
    
    function pauseGame() {
        gameActive = false;
        setAmbience(null);
    }
    
    function updateHUD() {
        stressBar.style.width = `${gameStress}%`;
        stressLbl.innerText = `${Math.round(gameStress)}%`;
        
        if (gameStress > 70) {
            stressBar.style.background = 'var(--neon-red)';
            stressBar.style.boxShadow = '0 0 10px var(--neon-red)';
        } else if (gameStress > 40) {
            stressBar.style.background = '#f97316';
            stressBar.style.boxShadow = '0 0 10px #f97316';
        } else {
            stressBar.style.background = 'linear-gradient(90deg, var(--neon-red), #990024)';
            stressBar.style.boxShadow = '';
        }
        
        batteryBar.style.width = `${gameBattery}%`;
        batteryLbl.innerText = `${gameBattery}%`;
        
        if (gameBattery < 20) {
            batteryBar.style.background = 'var(--neon-red)';
            batteryBar.style.boxShadow = '0 0 8px var(--neon-red)';
        } else {
            batteryBar.style.background = 'linear-gradient(90deg, var(--neon-green), #128e07)';
            batteryBar.style.boxShadow = '';
        }
        
        // Sync with dashboard stress slider for ambient sound
        const stressSlider = document.getElementById('stress-slider');
        if (stressSlider) {
            stressSlider.value = Math.round(gameStress);
            stressSlider.dispatchEvent(new Event('input'));
        }
    }
    
    function addLog(text, type = 'system') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerText = `> [${new Date().toLocaleTimeString()}] ${text}`;
        gameLogsContainer.appendChild(entry);
        gameLogsContainer.scrollTop = gameLogsContainer.scrollHeight;
    }
    
    function triggerJumpscare(stressVal) {
        addLog("Aaaaa! Một bóng đen quét qua tầm mắt!", "scare");
        playLaugh(); // Spooky laughter foley
        
        // Jumpscare visual effect inside well opening if present
        const scareFace = document.getElementById('game-scare-face');
        if (scareFace) {
            scareFace.classList.add('flash');
            setTimeout(() => {
                scareFace.classList.remove('flash');
            }, 600);
        }
        
        overlayScare.classList.add('flash');
        setTimeout(() => {
            overlayScare.classList.remove('flash');
        }, 300);
        
        gameStress += stressVal;
        if (gameStress > 100) gameStress = 100;
        updateHUD();
    }
    
    function updateInventoryUI() {
        inventoryListContainer.innerHTML = '';
        if (gameInventory.length === 0) {
            inventoryListContainer.innerHTML = `<span class="empty-inv">Trống rỗng</span>`;
            return;
        }
        
        gameInventory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `<span><i class="fa-solid fa-scroll"></i> ${item}</span>`;
            inventoryListContainer.appendChild(div);
        });
    }
    
    function renderLocation() {
        let desc = '';
        let buttons = [];
        
        if (gameStress >= 100) return; // Don't render if dead
        
        // Handle Location specific sound foleys
        if (gameLocation === 'well') {
            setAmbience(playDripLoop); // Water dripping foley loop inside well
        } else {
            setAmbience(null); // Clear dripping foley elsewhere
        }
        
        // Dynamically update game viewport visual
        const gameViewport = document.getElementById('game-viewport');
        if (gameViewport) {
            // Apply darkness class if flashlight is OFF
            if (!gameFlashlight || gameBattery <= 0) {
                gameViewport.className = 'game-viewport darkness-active';
            } else {
                gameViewport.className = 'game-viewport';
            }
            
            // Build visual representation based on current location
            if (gameLocation === 'yard') {
                gameViewport.innerHTML = `
                    <div class="viewport-yard">
                        <svg viewBox="0 0 600 240" class="svg-yard" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#040205" />
                                    <stop offset="60%" stop-color="#140608" />
                                    <stop offset="100%" stop-color="#030102" />
                                </linearGradient>
                                <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#1c1c24" stop-opacity="0.8"/>
                                    <stop offset="100%" stop-color="#0d0d12" stop-opacity="0.9"/>
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                            
                            <rect width="600" height="240" fill="url(#skyGrad)" />
                            
                            <!-- Red Moon -->
                            <circle cx="500" cy="50" r="22" fill="#ff1a1a" filter="url(#glow)" opacity="0.85">
                                <animate attributeName="opacity" values="0.75;0.95;0.75" dur="4s" repeatCount="indefinite"/>
                            </circle>
                            
                            <!-- Clouds/Smoke drifting in sky -->
                            <path d="M 0 40 Q 150 20 300 40 T 600 40 L 600 80 L 0 80 Z" fill="#ffffff" opacity="0.04">
                                <animate attributeName="d" values="M 0 40 Q 150 20 300 40 T 600 40 L 600 80 L 0 80 Z; M 0 35 Q 180 30 320 35 T 600 35 L 600 80 L 0 80 Z; M 0 40 Q 150 20 300 40 T 600 40 L 600 80 L 0 80 Z" dur="10s" repeatCount="indefinite"/>
                            </path>
                            
                            <!-- Background Wall with moss & cracks -->
                            <rect x="0" y="80" width="600" height="130" fill="url(#wallGrad)" />
                            <path d="M 120 80 L 120 210 M 240 80 L 240 210 M 360 80 L 360 210 M 480 80 L 480 210" stroke="#08080a" stroke-width="1.5" opacity="0.4" />
                            <path d="M 0 120 L 600 120 M 0 160 L 600 160" stroke="#08080a" stroke-width="1.5" opacity="0.4" />
                            
                            <!-- Creepy stains and cracks on wall -->
                            <path d="M 150 80 Q 155 110 148 135 T 152 170" fill="none" stroke="#000000" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
                            <path d="M 420 90 Q 410 120 415 150" fill="none" stroke="#000000" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/>
                            
                            <!-- Altar Silhouette hanging on the wall -->
                            <g id="altar-mini">
                                <line x1="200" y1="80" x2="200" y2="120" stroke="#0d0d12" stroke-width="2" />
                                <line x1="240" y1="80" x2="240" y2="120" stroke="#0d0d12" stroke-width="2" />
                                <rect x="185" y="120" width="70" height="8" fill="#14141c" rx="1" />
                                <!-- Red glowing candles -->
                                <circle cx="205" cy="116" r="2" fill="#ff3300" filter="url(#glow)">
                                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="235" cy="116" r="2" fill="#ff3300" filter="url(#glow)">
                                    <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" />
                                </circle>
                            </g>
                            
                            <!-- Old Wooden Chair and Radio -->
                            <g id="chair-radio-mini">
                                <path d="M 410 160 L 435 160 L 435 185 L 410 185 Z" fill="#0f0f14" />
                                <path d="M 410 185 L 410 215 M 435 185 L 435 215 M 415 185 L 415 210 M 430 185 L 430 210" stroke="#09090c" stroke-width="2.5" />
                                <rect x="415" y="146" width="16" height="14" fill="#241b18" stroke="#07070a" stroke-width="1" rx="1" />
                                <circle cx="419" cy="153" r="3" fill="#0e0e12" />
                                <circle cx="427" cy="153" r="1.5" fill="${solvedRadio ? '#39ff14' : '#ff0000'}">
                                    <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                                </circle>
                            </g>
                            
                            <!-- Deep Concrete Well silhouette -->
                            <g id="well-mini">
                                <path d="M 60 155 Q 60 148 100 148 T 140 155 L 142 210 H 58 Z" fill="#111117" stroke="#1c1c24" stroke-width="1.5" />
                                <ellipse cx="100" cy="155" rx="38" ry="7" fill="#050508" />
                                <path d="M 100 80 Q 98 115 101 155" fill="none" stroke="#2b2b35" stroke-width="2" stroke-dasharray="3,3" />
                            </g>
                            
                            <!-- Ground (bottom dirt & stones) -->
                            <rect x="0" y="210" width="600" height="30" fill="#050508" />
                            <line x1="0" y1="210" x2="600" y2="210" stroke="#0f0f14" stroke-width="2" />
                            
                        </svg>
                        
                        <!-- Spooky Red Eyes hidden in the dark (shown in darkness only, outside SVG for proper stacking context) -->
                        <div class="red-glowing-eyes"></div>
                    </div>
                `;
            } else if (gameLocation === 'radio') {
                const solvedClass = solvedRadio ? 'solved' : '';
                gameViewport.innerHTML = `
                    <div class="viewport-radio ${solvedClass}">
                        <svg viewBox="0 0 320 200" class="svg-radio" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="woodGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#54382e" />
                                    <stop offset="50%" stop-color="#3b261f" />
                                    <stop offset="100%" stop-color="#241612" />
                                </linearGradient>
                                <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#0f1912" />
                                    <stop offset="100%" stop-color="#030504" />
                                </linearGradient>
                                <pattern id="speakerMesh" width="6" height="6" patternUnits="userSpaceOnUse">
                                    <circle cx="3" cy="3" r="1.5" fill="#120907" />
                                    <circle cx="3" cy="3" r="0.8" fill="#000" />
                                </pattern>
                                <filter id="glow-led">
                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            <!-- Radio cabinet background -->
                            <rect x="10" y="10" width="300" height="180" fill="url(#woodGrad)" stroke="#110a08" stroke-width="6" rx="12" />
                            <rect x="14" y="14" width="292" height="172" fill="none" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1.5" rx="9" />
                            
                            <!-- Left Speaker Mesh -->
                            <rect x="30" y="35" width="115" height="105" fill="#2d1c18" stroke="#160e0c" stroke-width="3" rx="4" />
                            <rect x="33" y="38" width="109" height="99" fill="url(#speakerMesh)" rx="2" />
                            
                            <!-- Right Control Panel -->
                            <rect x="160" y="35" width="130" height="105" fill="#1d120f" stroke="#110a08" stroke-width="3" rx="4" />
                            
                            <!-- Tuning Scale Glass -->
                            <rect x="170" y="45" width="110" height="36" fill="url(#glassGrad)" stroke="#2f1f1a" stroke-width="1.5" rx="2" />
                            
                            <!-- Frequency ticks & Numbers -->
                            <path d="M 180 72 L 180 78 M 190 72 L 190 75 M 200 72 L 200 75 M 210 72 L 210 75 M 220 72 L 220 78 M 230 72 L 230 75 M 240 72 L 240 75 M 250 72 L 250 75 M 260 72 L 260 78 M 270 72 L 270 75" stroke="#4c5d50" stroke-width="1" />
                            <text x="174" y="55" font-family="'Courier New', monospace" font-weight="bold" font-size="7" fill="#586e5c">AM  54  70  90  108  140  160</text>
                            <text x="174" y="64" font-family="'Courier New', monospace" font-weight="bold" font-size="7" fill="#586e5c">KHz x10</text>
                            
                            <!-- LED Power Indicator -->
                            <circle cx="275" cy="98" r="3.5" fill="${solvedRadio ? '#39ff14' : '#ff0f0f'}" filter="url(#glow-led)">
                                <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                            <text x="238" y="101" font-family="sans-serif" font-size="6" fill="#888" letter-spacing="0.5">TUNING</text>
                            
                            <!-- Tuning Knob -->
                            <circle cx="195" cy="112" r="16" fill="#32201b" stroke="#110a08" stroke-width="2.5" />
                            <circle cx="195" cy="112" r="12" fill="#201411" />
                            <!-- Indent mark on knob -->
                            <line x1="195" y1="112" x2="${solvedRadio ? '203' : '185'}" y2="${solvedRadio ? '124' : '104'}" stroke="#0c0706" stroke-width="3" stroke-linecap="round" />
                            
                            <!-- Tuning Pointer -->
                            <line x1="${solvedRadio ? '246' : '195'}" y1="46" x2="${solvedRadio ? '246' : '195'}" y2="80" stroke="${solvedRadio ? '#39ff14' : '#ff3300'}" stroke-width="2" filter="url(#glow-led)" />

                            <!-- Radio static waves (only shown when not solved) -->
                            ${!solvedRadio ? `
                            <g class="radio-waves">
                                <path d="M 40 160 Q 55 135 70 160 T 100 160 T 130 160" fill="none" stroke="#ff3300" stroke-width="1.5" opacity="0.6">
                                    <animate attributeName="d" values="M 40 160 Q 55 135 70 160 T 100 160 T 130 160; M 40 160 Q 55 150 70 160 T 100 160 T 130 160; M 40 160 Q 55 135 70 160 T 100 160 T 130 160" dur="0.8s" repeatCount="indefinite"/>
                                </path>
                            </g>
                            ` : ''}
                            
                            <text x="35" y="170" font-family="'Courier New', monospace" font-size="9" fill="${solvedRadio ? '#39ff14' : '#8c2d19'}" font-weight="bold">
                                ${solvedRadio ? 'STATUS: DECODED (108 KHz)' : 'STATUS: TUNING NOISE...'}
                            </text>
                        </svg>
                    </div>
                `;
            } else if (gameLocation === 'altar') {
                let altarClass = '';
                if (solvedAltar === 'destroyed') altarClass = 'destroyed';
                else if (solvedAltar) altarClass = 'solved';
                
                gameViewport.innerHTML = `
                    <div class="viewport-altar ${altarClass}">
                        <svg viewBox="0 0 320 200" class="svg-altar" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="altarWood" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#4e3025" />
                                    <stop offset="100%" stop-color="#21120c" />
                                </linearGradient>
                                <linearGradient id="candleGrad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stop-color="#b81d13" />
                                    <stop offset="50%" stop-color="#ff3333" />
                                    <stop offset="100%" stop-color="#80100a" />
                                </linearGradient>
                                <linearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
                                    <stop offset="0%" stop-color="#ff3300" />
                                    <stop offset="50%" stop-color="#ffaa00" />
                                    <stop offset="100%" stop-color="#ffffcc" />
                                </linearGradient>
                                <linearGradient id="wallBg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#140f0c" />
                                    <stop offset="100%" stop-color="#080605" />
                                </linearGradient>
                                <filter id="glow-flame">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <filter id="glow-eyes">
                                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            <!-- Decaying Wall Background -->
                            <rect width="320" height="200" fill="url(#wallBg)" />
                            <path d="M 30 0 L 25 40 Q 20 80 27 120 T 22 200 M 270 0 Q 285 60 280 130 T 290 200" stroke="#000" stroke-width="2" opacity="0.45" fill="none" />
                            <path d="M 120 0 Q 130 50 120 70" stroke="#000" stroke-width="1.5" opacity="0.35" fill="none" />

                            <!-- Exorcism red strings (Chỉ đỏ trừ tà đan chéo) -->
                            <g stroke="#9c0909" stroke-width="1" opacity="0.65">
                                ${solvedAltar !== 'destroyed' ? `
                                    <line x1="0" y1="0" x2="320" y2="200" />
                                    <line x1="320" y1="0" x2="0" y2="200" />
                                    <line x1="50" y1="0" x2="270" y2="200" />
                                    <line x1="270" y1="0" x2="50" y2="200" />
                                    <line x1="0" y1="60" x2="320" y2="140" />
                                    <line x1="0" y1="140" x2="320" y2="60" />
                                    <line x1="160" y1="0" x2="160" y2="200" />
                                ` : `
                                    <!-- Torn strings when destroyed -->
                                    <path d="M 0 0 L 110 68 M 210 132 L 320 200" />
                                    <path d="M 320 0 L 210 68 M 110 132 L 0 200" />
                                    <path d="M 50 0 L 100 74 M 220 162 L 270 200" />
                                    <path d="M 270 0 L 220 74 M 100 162 L 50 200" />
                                    <line x1="160" y1="0" x2="160" y2="50" />
                                    <line x1="160" y1="150" x2="160" y2="200" />
                                `}
                            </g>

                            <!-- Yellow Paper Talismans on wall -->
                            <g opacity="0.55">
                                <g transform="translate(25, 25) rotate(-15)">
                                    <rect width="12" height="22" fill="#eec900" stroke="#a08000" stroke-width="0.8" rx="0.5" />
                                    <path d="M 3 3 L 9 3 M 6 3 L 6 18 M 4 8 L 8 8 M 4 13 L 8 13" stroke="#800" stroke-width="0.7" fill="none" />
                                </g>
                                <g transform="translate(285, 30) rotate(12)">
                                    <rect width="12" height="22" fill="#eec900" stroke="#a08000" stroke-width="0.8" rx="0.5" />
                                    <path d="M 3 3 L 9 3 M 6 3 L 6 18 M 4 8 L 8 8 M 4 13 L 8 13" stroke="#800" stroke-width="0.7" fill="none" />
                                </g>
                                <g transform="translate(20, 110) rotate(8)">
                                    <rect width="12" height="22" fill="#eec900" stroke="#a08000" stroke-width="0.8" rx="0.5" />
                                    <path d="M 3 3 L 9 3 M 6 3 L 6 18 M 4 8 L 8 8 M 4 13 L 8 13" stroke="#800" stroke-width="0.7" fill="none" />
                                </g>
                            </g>

                            <!-- Hanging ropes -->
                            <g stroke="#3a251e" stroke-width="2.5" opacity="0.8">
                                <line x1="80" y1="0" x2="80" y2="150" />
                                <line x1="240" y1="0" x2="240" y2="150" />
                                ${solvedAltar === 'destroyed' ? `
                                    <line x1="240" y1="110" x2="255" y2="135" stroke-dasharray="4,4" />
                                ` : ''}
                            </g>

                            <!-- Wooden Board Altar -->
                            <g id="altar-shelf" transform="${solvedAltar === 'destroyed' ? 'rotate(-12, 160, 150) translate(0, 15)' : ''}">
                                <!-- Shadow -->
                                <rect x="45" y="152" width="230" height="15" fill="#080403" opacity="0.6" rx="4" />
                                <!-- Shelf -->
                                <rect x="50" y="145" width="220" height="12" fill="url(#altarWood)" stroke="#160c09" stroke-width="2.5" rx="3" />
                                
                                <!-- Creepy Wooden Teu Puppet (Chú Tễu) standing behind incense burner -->
                                <g id="teu-puppet" transform="${solvedAltar === 'destroyed' ? 'rotate(55, 160, 135) translate(8, 12)' : ''}">
                                    <!-- Puppet head -->
                                    <circle cx="160" cy="113" r="9" fill="#e2b998" stroke="#805d43" stroke-width="1.2" />
                                    <!-- Bun Hair (Búi tóc củ tỏi) -->
                                    <circle cx="160" cy="102" r="4.2" fill="#301f19" />
                                    <!-- Puppet ears -->
                                    <path d="M 150.5 110 Q 148 113 151 116" fill="#e2b998" stroke="#805d43" stroke-width="1" />
                                    <path d="M 169.5 110 Q 172 113 169 116" fill="#e2b998" stroke="#805d43" stroke-width="1" />
                                    <!-- Face features (Chipped paint & creepy frozen smile) -->
                                    <!-- Eyebrows -->
                                    <path d="M 154 109 Q 157 107 159 110 M 166 109 Q 163 107 161 110" fill="none" stroke="#222" stroke-width="1" />
                                    <!-- Creepy red eyes (Dreadful glowing dots) -->
                                    <circle cx="156.5" cy="111.5" r="1" fill="#000" />
                                    <circle cx="163.5" cy="111.5" r="1" fill="#000" />
                                    ${solvedAltar !== 'destroyed' ? `
                                        <circle cx="156.5" cy="111.5" r="0.75" fill="#ff0a0a" filter="url(#glow-eyes)">
                                            <animate attributeName="opacity" values="0.1;0.9;0.1" dur="1.5s" repeatCount="indefinite" />
                                        </circle>
                                        <circle cx="163.5" cy="111.5" r="0.75" fill="#ff0a0a" filter="url(#glow-eyes)">
                                            <animate attributeName="opacity" values="0.1;0.9;0.1" dur="1.5s" repeatCount="indefinite" />
                                        </circle>
                                    ` : ''}
                                    <!-- Creepy red smile -->
                                    <path d="M 155 118 Q 160 122 165 118" fill="none" stroke="#b00606" stroke-width="1.5" stroke-linecap="round" />
                                    
                                    <!-- Puppet Neck -->
                                    <rect x="157.5" y="121.5" width="5" height="4.5" fill="#e2b998" stroke="#805d43" stroke-width="0.8" />
                                    <!-- Puppet Body (phệ béo) -->
                                    <ellipse cx="160" cy="135" rx="11.5" ry="9" fill="#e2b998" stroke="#805d43" stroke-width="1.2" />
                                    <!-- Red Loincloth (Khố đỏ) -->
                                    <path d="M 152 139 Q 160 144 168 139 C 168 143 152 143 152 139 Z" fill="#a00808" stroke="#500202" stroke-width="0.5" />
                                    <!-- Arms dang ngang -->
                                    <path d="M 148.5 130 Q 140 132 142 138" fill="none" stroke="#e2b998" stroke-width="2.8" stroke-linecap="round" />
                                    <path d="M 171.5 130 Q 180 132 178 138" fill="none" stroke="#e2b998" stroke-width="2.8" stroke-linecap="round" />
                                    
                                    <!-- Chipped decay spots on puppet -->
                                    <circle cx="157" cy="130" r="1.5" fill="#78533b" opacity="0.8" />
                                    <path d="M 162 132 Q 165 135 163 137 Z" fill="#78533b" opacity="0.85" />
                                    <path d="M 158 115 L 159 118" stroke="#78533b" stroke-width="0.8" />
                                    
                                    <!-- Strings binding the puppet -->
                                    ${solvedAltar !== 'destroyed' ? `
                                        <path d="M 149 133 Q 160 136 171 133 M 150 137 Q 160 140 170 137 M 153 129 L 167 141" fill="none" stroke="#8a0000" stroke-width="0.85" opacity="0.85" />
                                    ` : ''}
                                </g>

                                <!-- Candles (if not destroyed) -->
                                ${solvedAltar !== 'destroyed' ? `
                                    <!-- Left Candle -->
                                    <g transform="translate(68, 95)">
                                        <rect x="0" y="10" width="12" height="40" fill="url(#candleGrad)" rx="1" stroke="#3d0704" stroke-width="1"/>
                                        <ellipse cx="6" cy="10" rx="6" ry="2" fill="#e03024" />
                                        <line x1="6" y1="10" x2="6" y2="4" stroke="#1f0301" stroke-width="1.5" />
                                        <path d="M 6 4 C 2 4 1 -6 6 -12 C 11 -6 10 4 6 4 Z" fill="url(#flameGrad)" filter="url(#glow-flame)">
                                            <animate attributeName="d" values="M 6 4 C 2 4 1 -6 6 -12 C 11 -6 10 4 6 4 Z; M 6 4 C 3 4 3 -5 6 -15 C 9 -5 9 4 6 4 Z; M 6 4 C 2 4 1 -6 6 -12 Z" dur="1.2s" repeatCount="indefinite" />
                                        </path>
                                    </g>
                                    
                                    <!-- Right Candle -->
                                    <g transform="translate(240, 95)">
                                        <rect x="0" y="10" width="12" height="40" fill="url(#candleGrad)" rx="1" stroke="#3d0704" stroke-width="1"/>
                                        <ellipse cx="6" cy="10" rx="6" ry="2" fill="#e03024" />
                                        <line x1="6" y1="10" x2="6" y2="4" stroke="#1f0301" stroke-width="1.5" />
                                        <path d="M 6 4 C 2 4 1 -6 6 -12 C 11 -6 10 4 6 4 Z" fill="url(#flameGrad)" filter="url(#glow-flame)">
                                            <animate attributeName="d" values="M 6 4 C 2 4 1 -6 6 -12 C 11 -6 10 4 6 4 Z; M 6 4 C 1 4 2 -8 6 -14 C 10 -8 11 4 6 4 Z; M 6 4 C 2 4 1 -6 6 -12 Z" dur="1.4s" repeatCount="indefinite" />
                                        </path>
                                    </g>
                                ` : `
                                    <!-- Fallen candles -->
                                    <g transform="translate(60, 140) rotate(-75)">
                                        <rect x="0" y="0" width="12" height="40" fill="url(#candleGrad)" rx="1" />
                                    </g>
                                    <g transform="translate(245, 148) rotate(80)">
                                        <rect x="0" y="0" width="12" height="40" fill="url(#candleGrad)" rx="1" />
                                    </g>
                                `}

                                <!-- Incense Burner Bowl -->
                                <g transform="translate(137, 108)">
                                    ${solvedAltar !== 'destroyed' ? `
                                        <!-- Incense Sticks -->
                                        <g stroke="#91523c" stroke-width="1.5" stroke-linecap="round">
                                            <line x1="16" y1="20" x2="8" y2="-12" />
                                            <circle cx="8" cy="-12" r="1.5" fill="#ffa600" filter="url(#glow-flame)" />
                                            
                                            <line x1="23" y1="20" x2="23" y2="-16" />
                                            <circle cx="23" cy="-16" r="1.5" fill="#ffa600" filter="url(#glow-flame)" />
                                            
                                            <line x1="30" y1="20" x2="38" y2="-12" />
                                            <circle cx="38" cy="-12" r="1.5" fill="#ffa600" filter="url(#glow-flame)" />
                                        </g>
                                        
                                        <!-- Incense Smoke Animation using dashed stroke simulation -->
                                        <path d="M 23 -20 Q 15 -35 25 -50 T 20 -85" fill="none" stroke="#cccccc" stroke-width="2.5" opacity="0.3" stroke-linecap="round">
                                            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
                                            <animate attributeName="stroke-dasharray" values="5,15; 15,5; 5,15" dur="3s" repeatCount="indefinite" />
                                        </path>
                                    ` : ''}
                                    
                                    <!-- Burner Bowl Body -->
                                    <path d="M 0 38 C 0 16 46 16 46 38 Z" fill="#b08d33" stroke="#5c4411" stroke-width="2" />
                                    <ellipse cx="23" cy="20" rx="23" ry="5" fill="#7d601b" />
                                    <ellipse cx="23" cy="20" rx="19" ry="3.5" fill="#2d2105" />
                                    
                                    <!-- Bua Phong An (Amulet paper) or empty slot -->
                                    ${solvedAltar === true ? `
                                        <!-- Glowing Amulet Paper -->
                                        <g transform="translate(11, -12) rotate(6)">
                                            <rect width="24" height="38" fill="#ffd700" stroke="#b08d13" stroke-width="1.5" rx="1" filter="url(#glow-flame)">
                                                <animate attributeName="opacity" values="0.85;1;0.85" dur="1.5s" repeatCount="indefinite" />
                                            </rect>
                                            <path d="M 6 6 L 18 6 M 12 6 L 12 32 M 8 12 L 16 12 M 9 20 L 15 20 M 12 32 C 10 32 8 28 8 26 M 12 32 C 14 32 16 28 16 26" fill="none" stroke="#cc0000" stroke-width="1.5" stroke-linecap="round" />
                                        </g>
                                    ` : ''}
                                    
                                    ${solvedAltar === false ? `
                                        <!-- Highlighted Empty Slot (Dotted red outline) -->
                                        <rect x="11" y="10" width="24" height="8" fill="#000000" stroke="#ff3300" stroke-width="1.5" stroke-dasharray="3,3" rx="1">
                                            <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
                                        </rect>
                                    ` : ''}
                                </g>
                            </g>
                        </svg>
                    </div>
                `;
            } else if (gameLocation === 'well') {
                const revealedClass = discoveredTruth ? 'revealed' : '';
                gameViewport.innerHTML = `
                    <div class="viewport-well ${revealedClass}">
                        <svg viewBox="0 0 320 200" class="svg-well" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="wellDepth" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stop-color="#020305" />
                                    <stop offset="60%" stop-color="#090d16" />
                                    <stop offset="85%" stop-color="#1b1c24" />
                                    <stop offset="100%" stop-color="#2a2b36" />
                                </radialGradient>
                                <radialGradient id="waterGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stop-color="#1d2e47" stop-opacity="0.5" />
                                    <stop offset="70%" stop-color="#060c14" stop-opacity="0.1" />
                                    <stop offset="100%" stop-color="#000000" stop-opacity="0" />
                                </radialGradient>
                                <filter id="wellGlow">
                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            <!-- Ground surrounding well -->
                            <rect width="320" height="200" fill="#050508" />
                            
                            <!-- Outer Well Rim (Concrete wall structure) -->
                            <circle cx="160" cy="100" r="82" fill="#2d2d38" stroke="#17171d" stroke-width="4" />
                            
                            <!-- Moss and dirt overlays on the rim -->
                            <path d="M 85 70 C 95 60 120 62 140 68 C 160 74 185 64 210 70 C 235 76 240 100 235 120 C 230 140 210 148 180 142" fill="none" stroke="#162c0e" stroke-width="8" stroke-opacity="0.45" stroke-linecap="round" filter="url(#wellGlow)"/>
                            
                            <!-- Well Pit Depth -->
                            <circle cx="160" cy="100" r="70" fill="url(#wellDepth)" />
                            
                            <!-- Water reflection with ripples -->
                            <ellipse cx="160" cy="100" rx="64" ry="64" fill="url(#waterGlow)">
                                <animate attributeName="rx" values="60;66;60" dur="6s" repeatCount="indefinite" />
                                <animate attributeName="ry" values="64;58;64" dur="6s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
                            </ellipse>
                            
                            <!-- Chains going down into the well -->
                            <path d="M 160 20 L 160 130" stroke="#333" stroke-width="5" stroke-dasharray="8,6" opacity="0.65" />
                            <path d="M 160 20 L 160 130" stroke="#111" stroke-width="1" opacity="0.8" />
                            
                            <!-- Skeleton Bones & Skull at the bottom (revealed only when discoveredTruth is true) -->
                            <g class="skeleton-reveal" opacity="${discoveredTruth ? '0.65' : '0'}" transform="translate(138, 70)">
                                <path d="M 22 10 C 12 10 10 20 10 28 C 10 36 14 42 22 42 C 24 42 26 44 26 46 L 26 50 H 18 V 54 H 26 V 58 H 30 V 54 H 38 V 50 H 30 L 30 46 C 30 44 32 42 34 42 C 42 42 46 36 46 28 C 46 20 44 10 34 10 Z" fill="#9999aa" stroke="#333344" stroke-width="1.5" />
                                <circle cx="20" cy="26" r="4.5" fill="#050608" />
                                <circle cx="36" cy="26" r="4.5" fill="#050608" />
                                <path d="M 28 32 L 25 38 L 31 38 Z" fill="#050608" />
                                <line x1="24" y1="48" x2="24" y2="52" stroke="#222" stroke-width="1" />
                                <line x1="28" y1="48" x2="28" y2="52" stroke="#222" stroke-width="1" />
                                <line x1="32" y1="48" x2="32" y2="52" stroke="#222" stroke-width="1" />
                                <path d="M 2 54 L 42 78 M 42 54 L 2 78" stroke="#888899" stroke-width="3.5" stroke-linecap="round" />
                                <circle cx="2" cy="54" r="3" fill="#888899" />
                                <circle cx="42" cy="54" r="3" fill="#888899" />
                                <circle cx="2" cy="78" r="3" fill="#888899" />
                                <circle cx="42" cy="78" r="3" fill="#888899" />
                            </g>
                        </svg>

                        <!-- Scare Face Overlay using absolute SVG for maximum control -->
                        <div class="scare-face" id="game-scare-face">
                            <svg viewBox="0 0 320 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <filter id="scareGlow">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <rect width="320" height="200" fill="#000000" opacity="0.9" />
                                <!-- Scary ghost eyes -->
                                <path d="M 70 70 Q 110 40 150 70 Q 110 80 70 70 Z" fill="#ff0000" filter="url(#scareGlow)" />
                                <path d="M 170 70 Q 210 40 250 70 Q 210 80 170 70 Z" fill="#ff0000" filter="url(#scareGlow)" />
                                <circle cx="110" cy="65" r="4.5" fill="#ffffff" />
                                <circle cx="210" cy="65" r="4.5" fill="#ffffff" />
                                <!-- Bleeding mouth -->
                                <path d="M 120 120 Q 160 80 200 120 Q 160 170 120 120 Z" fill="#2d0202" stroke="#ff0000" stroke-width="4.5" />
                                <path d="M 130 135 L 130 158 M 190 135 L 190 162 M 160 140 L 160 153" stroke="#ff0000" stroke-width="2.5" stroke-linecap="round" />
                                <text x="160" y="180" text-anchor="middle" font-family="'Special Elite', cursive, sans-serif" font-size="14" fill="#ff0000" font-weight="bold" letter-spacing="2">OÁN HỒN</text>
                            </svg>
                        </div>
                    </div>
                `;
            }
        }
        
        switch (gameLocation) {
            case 'yard':
                desc = "Bạn đang ở giữa khoảng sân tối tăm của khu trọ cũ. Gió lạnh rít từng cơn thổi qua bức tường rêu phong rách nát. Trước mặt bạn là giếng nước bê tông ẩm mốc, một bàn thờ treo tường gạch cũ, một chiếc ấm trà đặt trên bàn đá, và chiếc radio cũ trên ghế gỗ.";
                
                buttons = [
                    { text: "Soi chiếc Ấm Trà cổ", action: () => {
                        cubeRotation = { x: -20, y: 30 };
                        inspectObject.style.transform = `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`;
                        inspectModal.classList.add('active');
                        addLog("Bạn cầm chiếc ấm trà cũ lên để xem xét kĩ lưỡng.", "action");
                        playRustleOnce(); // Light crunching paper/dust sound when lifting
                    }},
                    { text: "Đến gần Bàn thờ treo", action: () => {
                        gameLocation = 'altar';
                        addLog("Bạn tiến lại sát bàn thờ treo tường gạch mục.", "action");
                        // Play a single metal scrape foley when approaching the mysterious altar
                        const k = playKnife();
                        setTimeout(() => k.stop(), 500);
                        renderLocation();
                    }},
                    { text: "Kiểm tra chiếc Radio", action: () => {
                        gameLocation = 'radio';
                        addLog("Bạn tiến tới cạnh chiếc ghế gỗ đặt radio.", "action");
                        renderLocation();
                    }},
                    { text: "Lại gần miệng Giếng cổ", action: () => {
                        gameLocation = 'well';
                        addLog("Bạn đi chậm rãi tới thành giếng bê tông nứt nẻ. Tiếng nước dột vang vọng kẽo kẹt...", "action");
                        renderLocation();
                    }}
                ];
                break;
                
            case 'radio':
                if (solvedRadio) {
                    desc = "Chiếc radio cũ lúc này đã ngừng tiếng rè inh tai. Nó chỉ phát ra những đoạn nhạc phát thanh loa phường rè rè rất nhỏ và đều đặn.";
                } else {
                    desc = "Chiếc radio cũ bám đầy mạng nhện đang phát ra âm thanh rè rít chói tai điếc óc làm đầu óc bạn căng thẳng. Núm vặn dò tần số bị gỉ sét.";
                }
                
                buttons = [];
                if (!solvedRadio) {
                    buttons.push({ text: "Dò tần số (Nhập mã)", action: () => {
                        const freq = prompt("Nhập tần số dò đài (ví dụ: 90, 100, ...):");
                        if (freq === '108') {
                            solvedRadio = true;
                            gameInventory.push("Lá bùa phong ấn");
                            addLog("Bạn dò trúng tần số 108. Radio đột ngột dừng rè rít, nắp pin sau bật ra và rơi ra một [Lá bùa phong ấn] cổ!", "action");
                            playRustleOnce();
                            updateInventoryUI();
                        } else if (freq !== null) {
                            addLog(`Bạn dò tần số ${freq} nhưng chỉ nhận lại tiếng rít chói tai tột cùng!`, "scare");
                            triggerJumpscare(15);
                        }
                        renderLocation();
                    }});
                }
                
                buttons.push({ text: "Quay lại Sân trọ", action: () => {
                    gameLocation = 'yard';
                    addLog("Bạn lùi lại giữa sân trọ.", "action");
                    renderLocation();
                }});
                break;
                
            case 'altar':
                if (solvedAltar === 'destroyed') {
                    desc = "Bàn thờ treo đã bị bạn đập phá tan hoang. Búp bê chú Tễu bị vỡ làm đôi nằm vương vãi cạnh bát hương nát vụn dưới đất, những sợi chỉ đỏ đứt lìa rơi rụng xung quanh. Oán khí từ đây dường như cuồn cuộn dồn hết về phía giếng cổ.";
                } else if (solvedAltar) {
                    desc = "Bàn thờ treo đã được dán [Lá bùa phong ấn]. Búp bê chú Tễu đột ngột rung lên bần bật, đôi mắt đỏ ngầu mở to đầy căm hờn, mạng lưới chỉ đỏ xung quanh phát sáng rực rỡ theo nhịp thở dồn dập rồi bốc khói đen kịt âm ỉ.";
                } else {
                    desc = "Một bàn thờ nhỏ treo chông chênh trên vách tường gạch cũ mốc, chăng chằng chịt chỉ đỏ trừ tà và bùa chú giấy vàng. Ở giữa ban thờ nổi bật một búp bê rối gỗ chú Tễu với nụ cười đông cứng. Bát hương nguội ngắt đầy tàn tro có một rãnh khuyết hẹp kỳ lạ ở giữa bát hương, vừa khít để nhét một thứ mỏng dẹt.";
                }
                
                buttons = [];
                if (gameInventory.includes("Lá bùa phong ấn") && !solvedAltar) {
                    buttons.push({ text: "Đặt [Lá bùa phong ấn] vào rãnh bát hương", action: () => {
                        solvedAltar = true;
                        gameInventory = gameInventory.filter(item => item !== "Lá bùa phong ấn");
                        updateInventoryUI();
                        addLog("Lá bùa bốc cháy dữ dội trên bàn thờ. Phía giếng cổ vang lên tiếng thét chói tai đầy giận dữ!", "action");
                        playLaugh(); // Supernatural scream
                        renderLocation();
                    }});
                }
                
                if (discoveredTruth && solvedAltar !== 'destroyed' && solvedAltar !== true) {
                    buttons.push({ text: "Đập nát bàn thờ treo", action: () => {
                        solvedAltar = 'destroyed';
                        addLog("Bạn dùng chân đạp đổ chiếc bàn thờ treo xập xệ xuống đất! Bát hương vỡ tan. Xích sắt dưới giếng va vào nhau loảng xoảng!", "action");
                        playSmash(); // Physical smash sound
                        renderLocation();
                    }});
                }
                
                buttons.push({ text: "Quay lại Sân trọ", action: () => {
                    gameLocation = 'yard';
                    addLog("Bạn lùi lại giữa sân trọ.", "action");
                    renderLocation();
                }});
                break;
                
            case 'well':
                if (solvedAltar === 'destroyed') {
                    desc = "Miệng giếng cổ bốc lên luồng khói đen nghi ngút. Tiếng xích sắt dưới đáy giếng đã ngừng rung lắc. Oán linh oán khí bị giam cầm hàng trăm năm đã được giải thoát.";
                } else if (solvedAltar) {
                    desc = "Giếng cổ lúc này im phăng phắc. Mặt nước đen ngòm phẳng lặng như tờ. Lớp bùa chú dán quanh thành giếng phát ra ánh sáng đỏ nhạt rồi nguội hẳn.";
                } else {
                    desc = "Giếng bê tông cổ sâu hoắm, nước giếng đen ngòm và sâu thăm thẳm. Mùi ẩm mốc lạnh lẽo bốc lên xộc thẳng vào mũi bạn. Tiếng giọt nước dột dồn dập vang dội khắp lòng giếng...";
                }
                
                buttons = [];
                if (solvedAltar === 'destroyed') {
                    buttons.push({ text: "Nhìn sâu xuống giếng giải phóng oán linh", action: () => {
                        triggerEnding('suthat');
                    }});
                } else if (solvedAltar) {
                    buttons.push({ text: "Làm lễ phong ấn giếng cổ", action: () => {
                        triggerEnding('hoagiai');
                    }});
                } else {
                    buttons.push({ text: "Nhìn xuống lòng giếng sâu", action: () => {
                        addLog("Bạn nhoài người nhìn xuống lòng giếng...", "action");
                        triggerJumpscare(25);
                        renderLocation();
                    }});
                    
                    if (gameFlashlight && gameBattery > 0 && !discoveredTruth) {
                        buttons.push({ text: "Chiếu đèn pin soi lòng giếng sâu", action: () => {
                            discoveredTruth = true;
                            addLog("Bạn soi đèn pin thẳng xuống lòng giếng. Đáy giếng cạn trơ xương hài cốt quấn xích gắn chặt vào vách đá. Bạn tìm thấy tấm bia đá khắc: 'Bàn thờ treo chính là ổ khóa nhốt linh hồn làm lễ tế. Kẻ xây bàn thờ mới là kẻ giết người.'", "action");
                            // Play a nice paper rustling foley to simulate reading old text
                            const r = playRustle();
                            setTimeout(() => r.stop(), 1500);
                            renderLocation();
                        }});
                    }
                }
                
                buttons.push({ text: "Quay lại Sân trọ", action: () => {
                    gameLocation = 'yard';
                    addLog("Bạn lùi lại giữa sân trọ.", "action");
                    renderLocation();
                }});
                break;
        }
        
        // Render content
        let flashlightText = "";
        if (!gameFlashlight) {
            flashlightText = `<div style="color: var(--neon-red); font-weight: bold; margin-bottom: 1rem;"><i class="fa-solid fa-ghost"></i> BÓNG TỐI BAO PHỦ - STRESS ĐANG TĂNG NHANH!</div>`;
        }
        
        textContent.innerHTML = `${flashlightText}<p class="room-desc">${desc}</p>`;
        
        // Render buttons
        actionButtonsContainer.innerHTML = '';
        buttons.forEach(btn => {
            const buttonEl = document.createElement('button');
            buttonEl.className = 'game-btn';
            buttonEl.innerHTML = `<i class="fa-solid fa-chevron-right"></i> ${btn.text}`;
            buttonEl.addEventListener('click', btn.action);
            actionButtonsContainer.appendChild(buttonEl);
        });
    }
    
    function triggerEnding(endingType) {
        gameActive = false;
        setAmbience(null);
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        
        let endingTitle = "";
        let endingDesc = "";
        let endingClass = "";
        
        if (endingType === 'chimsau') {
            endingTitle = "ENDING: CHÌM SÂU (BAD ENDING)";
            endingDesc = "Stress của bạn đã vượt quá giới hạn chịu đựng (100%). Cơn hoảng loạn tột độ bóp nghẹt tâm trí bạn. Trong bóng đêm đen đặc của khu trọ ma ám, một cánh tay xám xịt, lạnh ngắt từ dưới giếng vươn dài kéo bạn chìm sâu xuống đáy nước lạnh lẽo vĩnh viễn...";
            endingClass = "crit";
            
            playLaugh();
            setTimeout(() => playSmash(), 800);
        } else if (endingType === 'hoagiai') {
            endingTitle = "ENDING: HÓA GIẢI (GOOD ENDING)";
            endingDesc = "Nhờ dán lá bùa phong ấn linh nghiệm lên bàn thờ, luồng oán khí dâng trào của giếng cổ đã bị kìm hãm hoàn toàn. Giếng nước xẹp xuống, trả lại bầu không khí bình yên tĩnh lặng cho khu trọ. Cơn ác mộng đã khép lại, bạn thoát khỏi sân trọ dưới ánh bình minh hé rạng.";
            endingClass = "success";
            
            const d = playDripLoop();
            setTimeout(() => d.stop(), 1000);
        } else if (endingType === 'suthat') {
            endingTitle = "ENDING: SỰ THẬT KINH HOÀNG (SECRET ENDING)";
            endingDesc = "Bằng cách đập tan phong ấn giả mạo trên bàn thờ treo, bạn đã giải phóng oan hồn bị xích sâu dưới đáy giếng. Oán linh thoát ra hóa thành cơn lốc xoáy đen quét sạch vết tích của những kẻ thủ ác xưa kia. Bạn sống sót bước ra khỏi khu trọ, mang theo bí mật kinh hoàng về lịch sử đẫm máu được chôn giấu hàng thế kỷ.";
            endingClass = "info";
            
            playSmash();
            setTimeout(() => playLaugh(), 500);
        }
        
        // Show ending on screen
        textContent.innerHTML = `
            <div style="padding: 1rem 0;">
                <h3 class="badge ${endingClass}" style="font-size: 1.2rem; display: inline-block; margin-bottom: 1rem; padding: 0.5rem 1rem;">${endingTitle}</h3>
                <p class="room-desc" style="font-size: 1rem; line-height: 1.8; color: var(--text-primary); text-align: justify;">${endingDesc}</p>
                <button id="btn-restart-game" class="btn-submit" style="margin-top: 1.5rem; padding: 0.6rem 1.5rem;">Chơi Lại Từ Đầu</button>
            </div>
        `;
        
        actionButtonsContainer.innerHTML = '';
        addLog(`Kích hoạt ${endingTitle}! Trò chơi kết thúc.`, "scare");
        
        // Bind restart button
        document.getElementById('btn-restart-game').addEventListener('click', () => {
            resetGame();
        });
    }
    
    function resetGame() {
        gameFlashlight = true;
        gameBattery = 100;
        gameStress = 10;
        gameInventory = [];
        solvedRadio = false;
        solvedAltar = false;
        discoveredTruth = false;
        gameLocation = 'yard';
        cubeRotation = { x: -20, y: 30 };
        inspectObject.style.transform = `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`;
        
        updateFlashlightUI();
        updateInventoryUI();
        updateHUD();
        
        gameLogsContainer.innerHTML = `<div class="log-entry system">> Đã khởi động lại phiên mô phỏng game "DƯỚI GIẾNG"...</div>`;
        
        startGame();
    }
}
