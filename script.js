// --- SYSTEM CONFIGURATION & COSMIC LEVEL MAPPINGS ---
const COSMIC_DATA = {
    1: { name: "Wide Galaxy View", zPos: 0 },
    2: { name: "Dense Star Clusters", zPos: -3500 },
    3: { name: "Nebula & Glowing Dust", zPos: -7000 },
    4: { name: "Spiral Galaxy Core", zPos: -10500 },
    5: { name: "Black Hole Event Horizon", zPos: -14000 },
    6: { name: "Ultra Dense Star Matrix", zPos: -17500 },
    7: { name: "Final Cosmic Reveal", zPos: -21500 }
};

let currentLevel = 1;
let isTransitioning = false;
const inputDebounceTime = 1300; // Enforces strict level navigation sequence

// Lerp Targets for cinematic camera motion profiles
let targetZ = COSMIC_DATA[1].zPos;
let currentZ = COSMIC_DATA[1].zPos;

// Dynamic Parallax Vectors
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

// WebGL Engine Elements
let scene, camera, renderer;
const galaxyLayers = [];

// --- PROCEDURAL GLOWING SPRITE TEXTURE GENERATOR ---
// Generates soft, anti-aliased emissive point structures natively using 2D Canvas Contexts
function buildEmissiveTexture(colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.2, colorHex);
    gradient.addColorStop(0.5, 'rgba(30, 25, 60, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// --- SETUP RUNTIME ENGINE ---
function initCosmos() {
    // 1. Build Scene Infrastructure & Deep Space Fog Model
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020208, 0.00018);

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 26000);
    camera.position.z = currentZ;

    const canvasTarget = document.getElementById('webgl-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvasTarget, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Build Independent Procedural Universe Sub-Systems
    generateCosmicStructures();

    // 3. Register Global Event Processors
    window.addEventListener('resize', handleResizeWindow);
    window.addEventListener('wheel', processMouseWheel, { passive: false });
    window.addEventListener('click', processMouseClicks);
    window.addEventListener('mousemove', processMouseMove);

    // 4. Start Render Engine Tick Lifecycle
    executeRenderLoop();
}

// --- PROCEDURAL UNIVERSE MODEL BUILDER ---
function generateCosmicStructures() {
    // Generate isolated color asset spaces
    const whiteStar = buildEmissiveTexture('#ffffff');
    const cyanStar = buildEmissiveTexture('#4ef2d2');
    const deepViolet = buildEmissiveTexture('#a64eff');
    const solarAmber = buildEmissiveTexture('#ffbc4e');

    // LEVEL 1: Wide Spiral Galaxy View (Z-Depth Base: 0)
    const l1Group = new THREE.Group();
    const l1Geometry = new THREE.BufferGeometry();
    const l1Count = 20000;
    const l1Positions = new Float32Array(l1Count * 3);
    for(let i=0; i<l1Count; i++) {
        const radius = Math.pow(Math.random(), 2.2) * 1800;
        const spiralAngle = Math.random() * Math.PI * 2 * 3.5;
        const armIndex = (i % 2 === 0 ? 0 : Math.PI);
        const x = Math.cos(spiralAngle + armIndex) * radius + (Math.random() - 0.5) * 120;
        const y = (Math.random() - 0.5) * 140 * (1 - radius/1800);
        const z = Math.sin(spiralAngle + armIndex) * radius + (Math.random() - 0.5) * 120;
        l1Positions[i*3] = x; l1Positions[i*3+1] = y; l1Positions[i*3+2] = z + COSMIC_DATA[1].zPos;
    }
    l1Geometry.setAttribute('position', new THREE.BufferAttribute(l1Positions, 3));
    const l1Material = new THREE.PointsMaterial({ size: 12, map: whiteStar, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
    const l1Points = new THREE.Points(l1Geometry, l1Material);
    l1Group.add(l1Points);
    scene.add(l1Group);
    galaxyLayers.push({ element: l1Group, dynamicSpin: 0.0008 });

    // LEVEL 2: Dense Deep Cluster Coordinates (Z-Depth Base: -3500)
    const l2Group = new THREE.Group();
    const clusters = [
        new THREE.Vector3(450, 250, -3500),
        new THREE.Vector3(-500, -150, -3600),
        new THREE.Vector3(-100, -400, -3400),
        new THREE.Vector3(200, 500, -3700)
    ];
    clusters.forEach(origin => {
        const geom = new THREE.BufferGeometry();
        const density = 3500;
        const positions = new Float32Array(density * 3);
        for(let i=0; i<density; i++) {
            const rad = Math.cbrt(Math.random()) * 280; // High central distribution density
            const u = Math.random(); const v = Math.random();
            const theta = u * 2 * Math.PI; const phi = Math.acos(2 * v - 1);
            positions[i*3] = origin.x + rad * Math.sin(phi) * Math.cos(theta);
            positions[i*3+1] = origin.y + rad * Math.sin(phi) * Math.sin(theta);
            positions[i*3+2] = origin.z + rad * Math.cos(phi);
        }
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({ size: 9, map: solarAmber, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
        l2Group.add(new THREE.Points(geom, mat));
    });
    scene.add(l2Group);
    galaxyLayers.push({ element: l2Group, dynamicSpin: -0.0012 });

    // LEVEL 3: Nebula + Soft Glowing Cosmic Dust (Z-Depth Base: -7000)
    const l3Group = new THREE.Group();
    const l3Geometry = new THREE.BufferGeometry();
    const l3Count = 7500;
    const l3Positions = new Float32Array(l3Count * 3);
    for(let i=0; i<l3Count; i++) {
        l3Positions[i*3] = (Math.random() - 0.5) * 3000;
        l3Positions[i*3+1] = (Math.random() - 0.5) * 1800;
        l3Positions[i*3+2] = COSMIC_DATA[3].zPos + (Math.random() - 0.5) * 1400;
    }
    l3Geometry.setAttribute('position', new THREE.BufferAttribute(l3Positions, 3));
    // Scale size up to emulate giant clouds of intergalactic gas structures
    const l3Material = new THREE.PointsMaterial({ size: 95, map: deepViolet, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false });
    l3Group.add(new THREE.Points(l3Geometry, l3Material));
    scene.add(l3Group);
    galaxyLayers.push({ element: l3Group, dynamicSpin: 0.0004 });

    // LEVEL 4: Concentrated Spiral Core (Z-Depth Base: -10500)
    const l4Group = new THREE.Group();
    const l4Geometry = new THREE.BufferGeometry();
    const l4Count = 28000;
    const l4Positions = new Float32Array(l4Count * 3);
    for(let i=0; i<l4Count; i++) {
        const rad = Math.pow(Math.random(), 1.6) * 750;
        const phase = Math.random() * Math.PI * 2;
        l4Positions[i*3] = Math.cos(phase) * rad;
        l4Positions[i*3+1] = (Math.random() - 0.5) * 220 * (1 - rad/750);
        l4Positions[i*3+2] = Math.sin(phase) * rad + COSMIC_DATA[4].zPos;
    }
    l4Geometry.setAttribute('position', new THREE.BufferAttribute(l4Positions, 3));
    const l4Material = new THREE.PointsMaterial({ size: 8, map: cyanStar, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    l4Group.add(new THREE.Points(l4Geometry, l4Material));
    scene.add(l4Group);
    galaxyLayers.push({ element: l4Group, dynamicSpin: 0.0035 });

    // LEVEL 5: Black Hole Accretion Horizon Vortex (Z-Depth Base: -14000)
    const l5Group = new THREE.Group();
    const l5Geometry = new THREE.BufferGeometry();
    const l5Count = 26000;
    const l5Positions = new Float32Array(l5Count * 3);
    for(let i=0; i<l5Count; i++) {
        // Enforce exclusion zone boundary modeling central Singularity void space
        const rad = 85 + Math.pow(Math.random(), 1.3) * 550;
        const theta = Math.random() * Math.PI * 2;
        l5Positions[i*3] = Math.cos(theta) * rad;
        l5Positions[i*3+1] = (Math.random() - 0.5) * 20; // Flatten disk perfectly
        l5Positions[i*3+2] = Math.sin(theta) * rad + COSMIC_DATA[5].zPos;
    }
    l5Geometry.setAttribute('position', new THREE.BufferAttribute(l5Positions, 3));
    const l5Material = new THREE.PointsMaterial({ size: 8, map: solarAmber, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
    l5Group.add(new THREE.Points(l5Geometry, l5Material));
    scene.add(l5Group);
    galaxyLayers.push({ element: l5Group, dynamicSpin: 0.014 }); // Intense accretion rotational velocity

    // LEVEL 6: Ultra Dense Spatial Matrix Gate (Z-Depth Range: -17500 to -21000)
    const l6Group = new THREE.Group();
    const l6Geometry = new THREE.BufferGeometry();
    const l6Count = 45000;
    const l6Positions = new Float32Array(l6Count * 3);
    for(let i=0; i<l6Count; i++) {
        l6Positions[i*3] = (Math.random() - 0.5) * 4500;
        l6Positions[i*3+1] = (Math.random() - 0.5) * 4500;
        l6Positions[i*3+2] = COSMIC_DATA[6].zPos + (Math.random() - 0.5) * 3500;
    }
    l6Geometry.setAttribute('position', new THREE.BufferAttribute(l6Positions, 3));
    const l6Material = new THREE.PointsMaterial({ size: 5, map: whiteStar, transparent: true, opacity: 0.75, depthWrite: false });
    l6Group.add(new THREE.Points(l6Geometry, l6Material));
    scene.add(l6Group);
    galaxyLayers.push({ element: l6Group, dynamicSpin: 0.0002 });
}

// --- INTERACTIVE NAVIGATION PIPELINE ---
function navigateUniverse(stepDelta) {
    if (isTransitioning) return;

    let possibleDestination = currentLevel + stepDelta;
    if (possibleDestination >= 1 && possibleDestination <= 7) {
        isTransitioning = true;
        currentLevel = possibleDestination;
        
        // Trigger Audio Placeholder Simulation
        triggerAudioChirp();

        // Refresh System Display HUD
        refreshHUDScreen();

        // Alter Camera Vector Targets
        targetZ = COSMIC_DATA[currentLevel].zPos;

        setTimeout(() => {
            isTransitioning = false;
        }, inputDebounceTime);
    }
}

function processMouseWheel(event) {
    event.preventDefault();
    if (event.deltaY > 15) {
        navigateUniverse(1);  // Zoom Deep
    } else if (event.deltaY < -15) {
        navigateUniverse(-1); // Zoom Back Out
    }
}

function processMouseClicks(event) {
    if (event.target.tagName === 'BUTTON') return; // Protect active UI buttons
    navigateUniverse(1);
}

function processMouseMove(event) {
    // Normalise delta values around standard coordinate centers [-0.5, 0.5]
    targetMouseX = (event.clientX / window.innerWidth) - 0.5;
    targetMouseY = (event.clientY / window.innerHeight) - 0.5;
}

// --- UI REFRESH LIFE-CYCLE ---
function refreshHUDScreen() {
    const textName = document.getElementById('level-name');
    const textNum = document.getElementById('current-level-num');
    const barProgress = document.getElementById('progress-bar');

    // Applied cinematic HUD text warp effect
    textName.style.opacity = '0';
    textName.style.transform = 'scale(1.08) translateY(-6px)';

    setTimeout(() => {
        textName.innerText = COSMIC_DATA[currentLevel].name;
        textNum.innerText = currentLevel;
        barProgress.style.width = `${(currentLevel / 7) * 100}%`;
        
        textName.style.opacity = '1';
        textName.style.transform = 'scale(1) translateY(0)';
    }, 250);
}

// --- SYSTEM INITIAL QUANTUM REBOOT ---
function resetUniverse() {
    const screenFinal = document.getElementById('finalScreen');
    const layoutHUD = document.getElementById('hud');

    screenFinal.style.opacity = '0';
    setTimeout(() => {
        screenFinal.style.display = 'none';
        layoutHUD.style.opacity = '1';
        currentLevel = 1;
        targetZ = COSMIC_DATA[1].zPos;
        currentZ = COSMIC_DATA[1].zPos;
        camera.position.z = currentZ;
        refreshHUDScreen();
        isTransitioning = false;
    }, 1000);
}

// --- AUDIO PLACEHOLDER EFFECT ENGINE ---
function triggerAudioChirp() {
    const elementAudio = document.getElementById('ambient-audio');
    if (elementAudio) {
        elementAudio.play().catch(() => {
            /* Muted safely if browser context bans autoplay before interaction */
        });
    }
}

// --- CORE FRAME LOOP ENGINE (60 FPS OPTIMIZED) ---
function executeRenderLoop() {
    requestAnimationFrame(executeRenderLoop);

    // 1. Smoothly Lerp Camera Vectors for Inertial Cinematic Depth Tracking
    const interpolationFactor = isTransitioning ? 0.038 : 0.055; // Alters acceleration profile during zoom transitions
    currentZ += (targetZ - currentZ) * interpolationFactor;
    camera.position.z = currentZ;

    // 2. Drive Real-Time Star System Twinkle And Angular Rotations
    galaxyLayers.forEach((layer, index) => {
        layer.element.rotation.z += layer.dynamicSpin;
        
        // Emulate subtle expansion pulse on inner materials based on time
        const pulseRatio = Math.sin(Date.now() * 0.001 + index) * 0.05 + 1.0;
        layer.element.scale.set(pulseRatio, pulseRatio, 1);
    });

    // 3. Translate Mouse Parallax Trajectories Smoothly
    mouseX += (targetMouseX - mouseX) * 0.06;
    mouseY += (targetMouseY - mouseY) * 0.06;
    camera.position.x = mouseX * 500;
    camera.position.y = -mouseY * 500;
    
    // Maintain focus looking deep down the galactic track barrel
    camera.lookAt(new THREE.Vector3(0, 0, camera.position.z - 150));

    // 4. State Monitor for Level 7 Unlock Final Scene Hand-off
    if (currentLevel === 7 && Math.abs(targetZ - currentZ) < 25) {
        const screenFinal = document.getElementById('finalScreen');
        const layoutHUD = document.getElementById('hud');
        
        if (screenFinal.style.display === 'none') {
            layoutHUD.style.opacity = '0';
            screenFinal.style.display = 'flex';
            setTimeout(() => {
                screenFinal.style.opacity = '1';
            }, 80);
        }
    }

    renderer.render(scene, camera);
}

// --- GLOBAL ENGINE SCALE MONITOR ---
function handleResizeWindow() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Kickstart execution once DOM pipeline mounts
window.onload = () => {
    initCosmos();
};