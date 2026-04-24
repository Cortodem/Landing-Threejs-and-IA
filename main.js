import * as THREE from 'three';


// --- 1. ESCENA, CÁMARA Y RENDERIZADOR ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. GESTIÓN DE TEXTURAS Y PANTALLA DE CARGA ---
const loadingScreen = document.getElementById('loading-screen');
const progressText = document.getElementById('progress-text');

const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => console.log('Cargando texturas...');

// Pantalla de carga
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100);
    progressText.innerText = `Cargando: ${progress}%`;
};

loadingManager.onLoad = () => {
    loadingScreen.style.transition = 'opacity 0.5s ease';
    loadingScreen.style.opacity = '0';
    setTimeout(() => loadingScreen.remove(), 500);
    console.log('¡Todas las texturas listas!');
};

const loader = new THREE.TextureLoader(loadingManager);

const texturaPiedra = loader.load('assets/textures/castle_wall_4k.jpg');
const texturaMarmol = loader.load('assets/textures/marble_01_diff_1k.jpg');
const texturaMaderaEscaleras = loader.load('assets/textures/wood_table_worn_1k.jpg');
const texturaPuerta = loader.load('assets/textures/wood_planks_dirt_1k.jpg');

// Configuración de repetición
[texturaPiedra, texturaMarmol, texturaMaderaEscaleras].forEach(t => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
});
texturaPiedra.repeat.set(4, 1);
texturaMarmol.repeat.set(16, 1);

// --- 3. GEOMETRÍAS Y MATERIALES COMPARTIDOS (OPTIMIZACIÓN DE MEMORIA) ---

const geoPuerta = new THREE.BoxGeometry(1.2, 2.4, 0.2);
const matPuerta = new THREE.MeshStandardMaterial({ map: texturaPuerta, roughness: 0.8 });

const geoMuro = new THREE.BoxGeometry(0.1, 2, 0.6);
const matMuro = new THREE.MeshStandardMaterial({ map: texturaPiedra, roughness: 0.9 });

const geoEscalon = new THREE.BoxGeometry(4, 0.1, 0.5); // Ajustar según diseño
const matEscalon = new THREE.MeshStandardMaterial({ map: texturaMaderaEscaleras });

texturaPiedra.wrapS = texturaPiedra.wrapT = THREE.RepeatWrapping;
texturaPiedra.repeat.set(4, 1); // Ajusta según prefieras la densidad de la piedra

// Recursos compartidos para las pasarelas
const geoPasarela = new THREE.BoxGeometry(4, 0.1, 0.8);
const matPasarela = new THREE.MeshStandardMaterial({ map: texturaMarmol, roughness: 0.7 });


// --- 4. INTERACCIÓN Y RAYCASTER ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateMouseCoords(event) {
    mouse.x = (event.clientX / globalThis.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / globalThis.innerHeight) * 2 + 1;
}

globalThis.addEventListener('click', updateMouseCoords);
globalThis.addEventListener('mousemove', updateMouseCoords);

// --- 5. BLOQUES Y PUERTAS ---
const a = 10, b = 5;
const bloques = [];
const datosBloques = [
    { pos: [a, 0, 0], id: 'clases'},
    { pos: [-a, 3, 0], id: 'personal' },
    { pos: [0, 3, b], id: 'jefes' },
    { pos: [0, 0, -b], id: 'premios' }
];

datosBloques.forEach((d) => {
    const puerta = new THREE.Mesh(geoPuerta, matPuerta);
    const ySuelo = (d.id === 'personal' || d.id === 'jefes') ? 2.25 : -0.75;
    let posX;
    if (d.id === 'clases') {
        posX = 10;
    } else if (d.id === 'personal') {
        posX = -10;
    } else {
        posX = 0;
    }
    let posZ;
    if (d.id === 'jefes') {
        posZ = 5;
    } else if (d.id === 'premios') {
        posZ = -5;
    } else {
        posZ = 0;
    }

    puerta.position.set(posX, ySuelo + 1.2, posZ);
    puerta.lookAt(0, puerta.position.y, 0);
    puerta.userData = { id: d.id };
    scene.add(puerta);
    bloques.push(puerta);
});

// --- 5.1 CONTENIDOS PARA EL ELEMENTO .INFO ---
const contenidosInfo = {
    'clases': `
        <h2>Nuestras Clases</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
    `,
    'personal': `
        <h2>Personal</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    `,
    'jefes': `
        <h2>Jefes de las casas</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
    `,
    'premios': `
        <h2>Premios anuales</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    `
};

// --- 6. FUNCIONES PROCEDIMENTALES OPTIMIZADAS ---
function crearPasarelaPlana(pInicio, pFin, y) {
    const grupo = new THREE.Group();
    const pasos = 80;
    // Radios alineados con las escaleras (punto medio entre 10 y 14)
    const aV = 12;
    const bV = 7;

    for (let i = 0; i <= pasos; i++) {
        const t = i / pasos;
        const theta = (pInicio + (pFin - pInicio) * t) * Math.PI * 2;

        const x = aV * Math.cos(theta);
        const z = bV * Math.sin(theta);

        const tramo = new THREE.Mesh(geoPasarela, matPasarela);
        tramo.position.set(x, y, z);

        // Orientación siguiendo la curva de la elipse
        const sigTheta = theta + 0.01;
        tramo.lookAt(aV * Math.cos(sigTheta), y, bV * Math.sin(sigTheta));

        grupo.add(tramo);
    }
    scene.add(grupo);
}

function crearEscaleraEliptica(pInicio, pFin, yBaseInicio, yBaseFin) {
    const grupo = new THREE.Group();
    const pasos = 35;
    const aV = 12; // Radio medio para el ancho de 4 (entre 10 y 14)
    const bV = 7;  // Radio medio para el ancho de 4 (entre 5 y 9)

    for (let i = 0; i <= pasos; i++) {
        const t = i / pasos;
        const theta = (pInicio + (pFin - pInicio) * t) * Math.PI * 2;

        const x = aV * Math.cos(theta);
        const z = bV * Math.sin(theta);
        const yBase = yBaseInicio + (yBaseFin - yBaseInicio) * t;

        const escalon = new THREE.Mesh(geoEscalon, matEscalon);
        escalon.position.set(x, yBase, z);

        // Orientación para seguir la curva de la elipse
        const sigTheta = theta + 0.01;
        escalon.lookAt(aV * Math.cos(sigTheta), yBase, bV * Math.sin(sigTheta));

        grupo.add(escalon);
    }
    scene.add(grupo);
}

function crearMurallaExterior(pInicio, pFin, y1, y2) {
    const grupo = new THREE.Group();
    const pasos = 250;
    const aW = 14, bW = 9; // Radios exteriores

    for (let i = 0; i <= pasos; i++) {
        const t = i / pasos;
        const theta = (pInicio + (pFin - pInicio) * t) * Math.PI * 2;
        const x = aW * Math.cos(theta);
        const z = bW * Math.sin(theta);
        const yBase = y1 + (y2 - y1) * t;

        // Reutilización de mallas
        const muro = new THREE.Mesh(geoMuro, matMuro);
        muro.position.set(x, yBase + 1, z);
        muro.lookAt(0, muro.position.y, 0); // Orientación radial al centro
        grupo.add(muro);
    }
    scene.add(grupo);
}

// Inicialización de estructuras
crearPasarelaPlana(0.23, 0.53, 2.25);
crearPasarelaPlana(0.71, 1.3, -0.75);

crearEscaleraEliptica(0.04, 0.23, -0.75, 2.25);
crearEscaleraEliptica(0.54, 0.73, 2.25, -0.75);

crearMurallaExterior(0, 0.25, -1.75, 1.25);
crearMurallaExterior(0.25, 0.5, 1.25, 1.25);
crearMurallaExterior(0.5, 0.75, 1.25, -1.75);
crearMurallaExterior(0.75, 1, -1.75, -1.75);

// --- 7. CILINDRO CENTRAL ---
const geoCilindro = new THREE.CylinderGeometry(a, a, 10, 64, 1, true);
const matCilindro = new THREE.MeshStandardMaterial({ map: texturaPiedra, side: THREE.DoubleSide, roughness: 0.8 });
const cilindroCentral = new THREE.Mesh(geoCilindro, matCilindro);
cilindroCentral.scale.set(1, 1, b / a);
cilindroCentral.position.set(0, 1.125, 0);
scene.add(cilindroCentral);


// 8. Recorrido Elíptico Sincronizado
const puntosEsquiva = [];
const segmentos = 300;
const aCamara = 12.5; // Radio elipse verde en X (a + 2.5)
const bCamara = 7.5;  // Radio elipse verde en Z (b + 2.5)

for (let i = 0; i <= segmentos; i++) {
    const theta = (i / segmentos) * Math.PI * 2;

    // X y Z siguen una elipse perfecta
    const x = aCamara * Math.cos(theta);
    const z = bCamara * Math.sin(theta);

    // Y sigue la subida y bajada de las escaleras (Y base 1 + elevación de 3)
    let y = 1;
    // Tramo 1 a 3 (Subida):
    if (theta > 0 && theta < Math.PI / 2) {
        y = 1 + (theta / (Math.PI / 2)) * 3;
    }
    // Tramo 3 a 2 (Meseta):
    else if (theta >= Math.PI / 2 && theta <= Math.PI) {
        y = 4;
    }
    // Tramo 2 a 4 (Bajada):
    else if (theta > Math.PI && theta < (3 * Math.PI) / 2) {
        y = 4 - ((theta - Math.PI) / (Math.PI / 2)) * 3;
    }

    puntosEsquiva.push(new THREE.Vector3(x, y, z));
}


// --- 9. ILUMINACIÓN (OPTIMIZADA) ---
function initLighting() {
    // A. Luz de hemisferio: aporta profundidad (color cielo, color suelo, intensidad)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(hemiLight);

    // B. Luz direccional: resalta las texturas y relieves de piedra/madera
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);
}
initLighting();


// --- 9. ANIMACIÓN Y SCROLL (GSAP) ---
const scrollData = { progreso: 0 };
gsap.to(scrollData, {
    progreso: 1,
    ease: "none",
    scrollTrigger: {
        trigger: "body", start: "top top", end: "bottom bottom", scrub: 1,
        onLeave: () => window.scrollTo(0, 1),
        onEnterBack: () => window.scrollTo(0, document.body.scrollHeight - 1)
    },
    onUpdate: () => {
        const index = Math.floor(scrollData.progreso * segmentos) % segmentos;
        camera.position.copy(puntosEsquiva[index]);
        camera.lookAt(0, 2, 0);
    }
});

// --- 10. EVENTO DE CLIC (ACTUALIZADO CON CONTENIDO DINÁMICO) ---
globalThis.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bloques);

    if (intersects.length > 0) {
        const puertaClicada = intersects[0].object;
        console.log(puertaClicada.userData.id);
        const idPuerta = puertaClicada.userData.id;
        console.log(contenidosInfo[idPuerta]);
        
        const infoElement = document.querySelector('.info');
        if (infoElement && contenidosInfo[idPuerta]) {
            // Inyectamos el HTML correspondiente del array/objeto contenidosInfo
            document.querySelector('.block-info').innerHTML = contenidosInfo[idPuerta];
            infoElement.style.opacity = 1;
            infoElement.style.pointerEvents = 'auto';
        }
    }
});

// Cambiar el cursor al pasar sobre un bloque
globalThis.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bloques);

    // Si hay colisión, cursor pointer; si no, default 
    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';

});

// --- 11. EVENTOS Y LOOP ---
let resizeTimeout;
window.addEventListener('resize', () => {
    // Cancelamos el redimensionamiento previo si el evento sigue disparándose
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        console.log('Resolución ajustada:', width, 'x', height);
    }, 150); // 150ms es el tiempo ideal para evitar sobrecarga en móviles
});



function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();