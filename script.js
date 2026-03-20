const stcpHorarios = {
    uteis: ['06:00', '06:25', '06:50', '07:13', '07:35', '08:05', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:32', '16:04', '16:36', '17:08', '17:43', '18:20', '18:55', '19:22', '19:48', '20:15', '20:45'],
    sabados: ['06:00', '06:50', '07:25', '08:00', '08:33', '09:05', '09:35', '10:05', '10:35', '11:05', '11:35', '12:05', '12:35', '13:05', '13:35', '14:05', '14:35', '15:05', '15:35', '16:05', '16:35', '17:05', '17:35', '18:05', '18:35', '19:05', '19:35', '20:12', '20:50']
};

gsap.registerPlugin(ScrollTrigger);
let currentAura = 500;
let isPhonkMode = false;

// --- 1. PHONK AUDIO SYNTHESIZER (PULLED FROM THE MATRIX) ---
class PhonkEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.isPlaying = false;
        this.tempo = 140; 
        this.lookahead = 25.0; 
        this.scheduleAheadTime = 0.1; 
        this.nextNoteTime = 0.0;
        this.current16thNote = 0;
        this.timerID = null;
    }
    createCowbell(time, freq) {
        const osc1 = this.ctx.createOscillator(); const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain(); const filter = this.ctx.createBiquadFilter();
        osc1.type = 'square'; osc2.type = 'square'; osc1.frequency.value = freq; osc2.frequency.value = freq * 1.48; 
        filter.type = 'bandpass'; filter.frequency.value = 800;
        gain.gain.setValueAtTime(1, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        osc1.connect(filter); osc2.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
        osc1.start(time); osc2.start(time); osc1.stop(time + 0.3); osc2.stop(time + 0.3);
    }
    create808(time) {
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, time); osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
        gain.gain.setValueAtTime(2, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(time); osc.stop(time + 0.8);
    }
    createHihat(time) {
        const bufferSize = this.ctx.sampleRate * 0.1; const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 5000;
        const gain = this.ctx.createGain(); gain.gain.setValueAtTime(0.3, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination); noise.start(time);
    }
    nextNote() { const secondsPerBeat = 60.0 / this.tempo; this.nextNoteTime += 0.25 * secondsPerBeat; this.current16thNote++; if (this.current16thNote === 16) this.current16thNote = 0; }
    scheduleNote(beatNumber, time) {
        if (beatNumber % 4 === 0) this.create808(time); 
        if (beatNumber % 2 === 0) this.createHihat(time); 
        const melody = [540, 0, 540, 0, 600, 0, 540, 480, 540, 0, 0, 600, 540, 0, 480, 0];
        if(melody[beatNumber]) this.createCowbell(time, melody[beatNumber]);
    }
    scheduler() {
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) { this.scheduleNote(this.current16thNote, this.nextNoteTime); this.nextNote(); }
        this.timerID = window.setTimeout(this.scheduler.bind(this), this.lookahead);
    }
    play() {
        if (!this.isPlaying) { this.ctx.resume(); this.isPlaying = true; this.current16thNote = 0; this.nextNoteTime = this.ctx.currentTime + 0.05; this.scheduler(); }
    }
    stop() { this.isPlaying = false; window.clearTimeout(this.timerID); }
}

let phonkEngine = null;

document.addEventListener('DOMContentLoaded', () => {
    initAuraTracker();
    initPhonkMode();
    initChaosTimetable();
    initScrollStaggers();
    initSecretZone();
    try { initAggressiveWebGL(); } catch(e) { console.warn("WebGL failure - 602 aura too strong."); }
});

function addAura(amount) {
    const obj = { val: currentAura };
    currentAura += amount;
    gsap.to(obj, {
        val: currentAura,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => { 
            const displays = document.querySelectorAll('.aura-value');
            displays.forEach(d => d.innerText = Math.floor(obj.val).toLocaleString());
        }
    });
}

function initAuraTracker() {
    addAura(0);
    document.querySelectorAll('.meme-card').forEach(card => card.addEventListener('mouseenter', () => addAura(602)));
}

function initPhonkMode() {
    const btn = document.getElementById('btn-phonk');
    btn.addEventListener('click', () => {
        isPhonkMode = !isPhonkMode;
        if(isPhonkMode) {
            document.body.classList.add('phonk-on');
            btn.innerText = "🛑 PARAR AURA (MUTE) 🛑";
            addAura(99999);
            
            // Activate Native Synth Audio
            if(!phonkEngine) phonkEngine = new PhonkEngine();
            phonkEngine.play();
            
        } else {
            document.body.classList.remove('phonk-on');
            btn.innerText = "🔥 ATIVAR AURA (PHONK) 🔥";
            
            if(phonkEngine) phonkEngine.stop();
        }
    });
}

function initChaosTimetable() {
    const container = document.getElementById('timetable-list');
    const tabs = document.querySelectorAll('.tab-btn');

    function render(type) {
        container.innerHTML = '';
        const times = stcpHorarios[type] || stcpHorarios.uteis;
        times.forEach(t => {
            const div = document.createElement('div');
            div.className = 'chaos-time';
            div.innerText = t;
            div.addEventListener('mouseenter', () => {
                if(isPhonkMode) div.innerText = "GOAT";
                addAura(70);
            });
            div.addEventListener('mouseleave', () => {
                if(isPhonkMode) setTimeout(() => div.innerText = t, 500);
            });
            container.appendChild(div);
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            render(e.target.dataset.type);
            addAura(1000);
        });
    });

    render('uteis');
}

function initSecretZone() {
    const backrooms = document.getElementById('secret-zone');
    const btn1 = document.getElementById('btn-secret');
    const btn2 = document.getElementById('enter-moreira');
    const btnExit = document.getElementById('exit-secret');

    function openZone() {
        if(isPhonkMode) return; // Cannot enter backrooms while phonk is blasting
        backrooms.style.display = 'flex';
        setTimeout(() => backrooms.classList.add('active'), 10);
        addAura(9999999);
        setInterval(() => addAura(100000), 100); // Infinite Aura Loop
    }
    function closeZone() {
        backrooms.classList.remove('active');
        setTimeout(() => backrooms.style.display = 'none', 600);
        currentAura = 500; // Punish for leaving the zone
        addAura(0);
    }
    
    btn1.addEventListener('click', openZone);
    btn2.addEventListener('click', openZone);
    btnExit.addEventListener('click', closeZone);
}

function initScrollStaggers() {
    gsap.utils.toArray('.gs-fade-up').forEach(elem => {
        gsap.from(elem, {
            y: 50, opacity: 0, rotation: "random(-2, 2)", duration: 0.8, ease: "bounce.out",
            scrollTrigger: { trigger: elem, start: "top 90%" }
        });
    });
}

// RAW WEBGL FOR SPEED LINES
function initAggressiveWebGL() {
    const canvas = document.getElementById('ambient-canvas');
    if(!canvas) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 20;

    const material = new THREE.LineBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.3 });
    const points = [];
    for(let i=0; i<300; i++) {
        points.push(new THREE.Vector3((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, -100));
        points.push(new THREE.Vector3(points[i*2].x, points[i*2].y, points[i*2].z + 30));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const lines = new THREE.LineSegments(geometry, material);
    scene.add(lines);

    function animate() {
        requestAnimationFrame(animate);
        scene.position.z += isPhonkMode ? 10.0 : 0.5;
        if(scene.position.z > 100) scene.position.z = 0;
        
        if(isPhonkMode) {
            camera.rotation.z = Math.sin(Date.now() * 0.02) * 0.1;
            material.color.setHex(Math.random() > 0.5 ? 0xff0055 : 0x00d2ff);
        } else {
            camera.rotation.z = 0;
            material.color.setHex(0x0056a0);
        }
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
