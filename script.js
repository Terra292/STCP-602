const stcpHorarios = {
    uteis: ['06:00', '06:25', '06:50', '07:13', '07:35', '08:05', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:32', '16:04', '16:36', '17:08', '17:43', '18:20', '18:55', '19:22', '19:48', '20:15', '20:45'],
    sabados: ['06:00', '06:50', '07:25', '08:00', '08:33', '09:05', '09:35', '10:05', '10:35', '11:05', '11:35', '12:05', '12:35', '13:05', '13:35', '14:05', '14:35', '15:05', '15:35', '16:05', '16:35', '17:05', '17:35', '18:05', '18:35', '19:05', '19:35', '20:12', '20:50']
};

gsap.registerPlugin(ScrollTrigger);
let currentAura = 500;
let isPhonkMode = false;
let ytPlayer;

// --- 1. YOUTUBE IFRAME API FOR PHONK MUSIC ---
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '200', width: '200',
        videoId: 'm2HEx33iR5I', // Alternative High-Energy drift phonk
        playerVars: { 'autoplay': 0, 'controls': 0, 'loop': 1, 'playlist': 'm2HEx33iR5I' },
        events: {
            'onReady': () => console.log("Phonk Audio Engine Ready."),
            'onError': (e) => console.log("YT Engine Error: ", e.data)
        }
    });
}

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
            // Play Audio robustly
            if(ytPlayer && ytPlayer.playVideo) {
                ytPlayer.playVideo();
            }
        } else {
            document.body.classList.remove('phonk-on');
            btn.innerText = "🔥 ATIVAR AURA (PHONK) 🔥";
            if(ytPlayer && ytPlayer.pauseVideo) {
                ytPlayer.pauseVideo();
            }
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
