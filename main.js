import * as THREE from 'three';


// --- 1. ESCENA, CÁMARA Y RENDERIZADOR (ACTUALIZADO CON FONDO ESTRELLADO) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// NUEVA IMPLEMENTACIÓN: Posicionar la cámara en el centro de la elipse (X=0, Z=0) a altura Y=1
camera.position.set(14, 1, 0);
// Apuntar la cámara exactamente al origen de coordenadas (0, 2, 0)
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// --- 1.1 GENERACIÓN DE ESTRELLAS ALEATORIAS ---
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 15000; // Cantidad de estrellas
const positions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i++) {
    // Distribuimos las estrellas en un cubo de 1000 unidades
    positions[i] = (Math.random() - 0.5) * 1000;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,           // Tamaño de cada estrella
    sizeAttenuation: true // Hace que las estrellas lejanas se vean más pequeñas
});

const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// 1.2 NUEVA IMPLEMENTACIÓN: Añadir receptor de audio (AudioListener) a la cámara
const listener = new THREE.AudioListener();
camera.add(listener);

// Crear una fuente de sonido global (no posicional para el scroll de interfaz)
const sonidoScroll = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

// Carga el archivo de sonido (reemplaza por la ruta de tu archivo de sonido corto)
audioLoader.load('assets/sounds/wind-effect.mp3', function(buffer) {
    sonidoScroll.setBuffer(buffer);
    sonidoScroll.setVolume(0.15); // Un volumen bajo (15%) evita que resulte molesto
}, 
// Callback opcional de progreso
undefined,
// Callback en caso de error
function(err) {
    console.warn("No se pudo cargar el archivo de audio. Asegúrate de tener un archivo válido en la ruta especificada.", err);
});

const renderSound = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderSound.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderSound.domElement);

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
[texturaPiedra, texturaMarmol, texturaMaderaEscaleras, texturaPuerta].forEach(t => { 
    t.wrapS = t.wrapT = THREE.RepeatWrapping; 
});

texturaPiedra.repeat.set(4, 3);
texturaMarmol.repeat.set(16, 1);
texturaPuerta.repeat.set(1, 0.5);

// --- 3. GEOMETRÍAS Y MATERIALES COMPARTIDOS (OPTIMIZACIÓN DE MEMORIA) ---

// --- 3.1. GEOMETRÍA Y MATERIAL DE LA HOJA DE LA PUERTA (1.60m x 3.60m) ---
const shapePuertaOjival = new THREE.Shape();
shapePuertaOjival.moveTo(-0.80, 0);
shapePuertaOjival.lineTo(-0.80, 2.70);
shapePuertaOjival.quadraticCurveTo(-0.75, 3.55, 0, 3.60);
shapePuertaOjival.quadraticCurveTo(0.75, 3.55, 0.80, 2.70);
shapePuertaOjival.lineTo(0.80, 0);
shapePuertaOjival.closePath();

const extrudePuertaSettings = {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.005,
    bevelThickness: 0.005
};

const geoPuerta = new THREE.ExtrudeGeometry(shapePuertaOjival, extrudePuertaSettings);
geoPuerta.translate(0, 0, -0.09); // Centrado en Z (-0.09 m a +0.09 m)

const matPuerta = new THREE.MeshStandardMaterial({ map: texturaPuerta, roughness: 0.8 });


// --- 3.2. GEOMETRÍA Y MATERIAL DEL MARCO DE PIEDRA (0.12m DE PERFIL POR LADO) ---
const shapeMarco = new THREE.Shape();
// Perfil exterior (Ancho: 1.84 m, Alto: 3.72 m)
shapeMarco.moveTo(-0.92, 0);
shapeMarco.lineTo(-0.92, 2.70);
shapeMarco.quadraticCurveTo(-0.85, 3.65, 0, 3.72);
shapeMarco.quadraticCurveTo(0.85, 3.65, 0.92, 2.70);
shapeMarco.lineTo(0.92, 0);
shapeMarco.closePath();

// Vano interior recortado (Ancho: 1.60 m, Alto: 3.60 m)
const vanoInterior = new THREE.Path();
vanoInterior.moveTo(-0.80, 0);
vanoInterior.lineTo(-0.80, 2.70);
vanoInterior.quadraticCurveTo(-0.75, 3.55, 0, 3.60);
vanoInterior.quadraticCurveTo(0.75, 3.55, 0.80, 2.70);
vanoInterior.lineTo(0.80, 0);
vanoInterior.closePath();

shapeMarco.holes.push(vanoInterior);

const extrudeMarcoSettings = {
    depth: 0.24,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.008,
    bevelThickness: 0.008
};

const geoMarco = new THREE.ExtrudeGeometry(shapeMarco, extrudeMarcoSettings);
geoMarco.translate(0, 0, -0.12); // Centrado en Z (-0.12 m a +0.12 m)

// Material del marco utilizando la textura de piedra
const matMarco = new THREE.MeshStandardMaterial({ 
    map: texturaPiedra, 
    roughness: 0.85 
});

const geoMuro = new THREE.BoxGeometry(0.1, 2, 0.6);
const matMuro = new THREE.MeshStandardMaterial({ map: texturaPiedra, roughness: 0.9 });

const geoEscalon = new THREE.BoxGeometry(4, 0.1, 0.5); // Ajustar según diseño
const matEscalon = new THREE.MeshStandardMaterial({ map: texturaMaderaEscaleras });

texturaPiedra.wrapS = texturaPiedra.wrapT = THREE.RepeatWrapping;
texturaPiedra.repeat.set(4, 1); // Ajusta según prefieras la densidad de la piedra

// Recursos compartidos para las pasarelas
const geoPasarela = new THREE.BoxGeometry(4, 0.1, 0.8);
const matPasarela = new THREE.MeshStandardMaterial({ map: texturaMarmol, roughness: 0.7 });

// Material para herrajes y bisagras de hierro forjado
const matMetal = new THREE.MeshStandardMaterial({
    color: 0x1f1a17,
    metalness: 0.85,
    roughness: 0.25
});

// Geometría de pletina de bisagra ornamental (0.18 m ancho x 0.05 m alto x 0.025 m grosor)
const geoBisagra = new THREE.BoxGeometry(0.18, 0.05, 0.025);

// Geometrías compartidas para manijas y argollas
const geoPlacaManija = new THREE.BoxGeometry(0.06, 0.24, 0.015);
const geoArgolla = new THREE.TorusGeometry(0.035, 0.008, 12, 24);
const geoPivoteArgolla = new THREE.CylinderGeometry(0.01, 0.01, 0.025, 12);
geoPivoteArgolla.rotateX(Math.PI / 2); // Orientar el cilindro hacia afuera en Z

// Geometría para los paneles verticales en relieve (4 paneles por hoja)
const geoPanelRelieve = new THREE.BoxGeometry(0.11, 2.15, 0.025);

// --- 4. INTERACCIÓN Y RAYCASTER ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateMouseCoords(event) {
    mouse.x = (event.clientX / globalThis.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / globalThis.innerHeight) * 2 + 1;
}

globalThis.addEventListener('click', updateMouseCoords);
globalThis.addEventListener('mousemove', updateMouseCoords);


// --- INTERACCIÓN DE AUDIO (POLÍTICA DE NAVEGADORES) ---
// Desbloquea el AudioContext del navegador con el primer clic del usuario
window.addEventListener('click', () => {
    if (listener.context && listener.context.state === 'suspended') {
        listener.context.resume().then(() => {
            console.log('Contexto de audio reanudado con éxito.');
        });
    }
}, { once: true }); // Se ejecuta solo una vez

// --- 5. BLOQUES Y PUERTAS GÓTICAS COMPLETAS (MARCO, BISAGRAS, MANIJAS Y PANELES) ---
const a = 10, b = 5;
const bloques = [];
const datosBloques = [
    { pos: [a, 0, 0], id: 'clases' },
    { pos: [-a, 3, 0], id: 'personal' },
    { pos: [0, 3, b], id: 'jefes' },
    { pos: [0, 0, -b], id: 'premios' }
];

datosBloques.forEach((d) => {
    const grupoPuerta = new THREE.Group();

    // 1. Hoja de la puerta
    const puerta = new THREE.Mesh(geoPuerta, matPuerta);
    puerta.userData = { id: d.id };
    grupoPuerta.add(puerta);

    // 2. Marco exterior de piedra
    const marco = new THREE.Mesh(geoMarco, matMarco);
    marco.userData = { id: d.id };
    grupoPuerta.add(marco);

    // 3. Bisagras ornamentales (Alturas: 0.45 m, 1.50 m y 2.70 m)
    const alturasBisagras = [0.45, 1.50, 2.70];
    alturasBisagras.forEach((yPos) => {
        [-0.71, 0.71].forEach((xPos) => {
            // Frontal (+Z)
            const bisagraF = new THREE.Mesh(geoBisagra, matMetal);
            bisagraF.position.set(xPos, yPos, 0.095);
            bisagraF.userData = { id: d.id };
            grupoPuerta.add(bisagraF);

            // Posterior (-Z)
            const bisagraP = new THREE.Mesh(geoBisagra, matMetal);
            bisagraP.position.set(xPos, yPos, -0.095);
            bisagraP.userData = { id: d.id };
            grupoPuerta.add(bisagraP);

            bloques.push(bisagraF, bisagraP);
        });
    });

    // 4. Manijas y argollas (Centradas a 1.10 m del suelo)
    const yManija = 1.10;
    const offsetHojas = [-0.06, 0.06];

    offsetHojas.forEach((xPos) => {
        // Frontal (+Z)
        const placaF = new THREE.Mesh(geoPlacaManija, matMetal);
        placaF.position.set(xPos, yManija, 0.098);
        placaF.userData = { id: d.id };
        grupoPuerta.add(placaF);

        const pivoteF = new THREE.Mesh(geoPivoteArgolla, matMetal);
        pivoteF.position.set(xPos, yManija + 0.05, 0.11);
        pivoteF.userData = { id: d.id };
        grupoPuerta.add(pivoteF);

        const argollaF = new THREE.Mesh(geoArgolla, matMetal);
        argollaF.position.set(xPos, yManija + 0.015, 0.118);
        argollaF.userData = { id: d.id };
        grupoPuerta.add(argollaF);

        // Posterior (-Z)
        const placaP = new THREE.Mesh(geoPlacaManija, matMetal);
        placaP.position.set(xPos, yManija, -0.098);
        placaP.userData = { id: d.id };
        grupoPuerta.add(placaP);

        const pivoteP = new THREE.Mesh(geoPivoteArgolla, matMetal);
        pivoteP.position.set(xPos, yManija + 0.05, -0.11);
        pivoteP.userData = { id: d.id };
        grupoPuerta.add(pivoteP);

        const argollaP = new THREE.Mesh(geoArgolla, matMetal);
        argollaP.position.set(xPos, yManija + 0.015, -0.118);
        argollaP.userData = { id: d.id };
        grupoPuerta.add(argollaP);

        bloques.push(placaF, argollaF, placaP, argollaP);
    });

    // 5. PANELES VERTICALES EN RELIEVE (4 PANELES POR HOJA)
    [-1, 1].forEach((lado) => { // Hoja izquierda (-1) y Hoja derecha (+1)
        const xCentroHoja = lado * 0.40; // Centro horizontal de la hoja (-0.40m o +0.40m)
        const xSpacing = 0.16;

        for (let i = 0; i < 4; i++) {
            const xPos = xCentroHoja + (i - 1.5) * xSpacing;

            // Relieve frontal (+Z)
            const panelFrontal = new THREE.Mesh(geoPanelRelieve, matPuerta);
            panelFrontal.position.set(xPos, 1.35, 0.098);
            panelFrontal.userData = { id: d.id };
            grupoPuerta.add(panelFrontal);

            // Relieve posterior (-Z)
            const panelPosterior = new THREE.Mesh(geoPanelRelieve, matPuerta);
            panelPosterior.position.set(xPos, 1.35, -0.098);
            panelPosterior.userData = { id: d.id };
            grupoPuerta.add(panelPosterior);

            bloques.push(panelFrontal, panelPosterior);
        }
    });

    // Posicionamiento final del grupo en el suelo y orientación vertical a 90º
    const ySuelo = (d.id === 'personal' || d.id === 'jefes') ? 2.25 : -0.75;
    
    let posX;
    if (d.id === 'clases') { posX = 10; }
    else if (d.id === 'personal') { posX = -10; }
    else { posX = 0; }
    
    let posZ;
    if (d.id === 'jefes') { posZ = 5; }
    else if (d.id === 'premios') { posZ = -5; }
    else { posZ = 0; }

    grupoPuerta.position.set(posX, ySuelo, posZ);
    grupoPuerta.lookAt(0, grupoPuerta.position.y, 0);
    grupoPuerta.userData = { id: d.id };
    
    scene.add(grupoPuerta);
    bloques.push(puerta, marco);
});

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
// crearPasarelaPlana(0.23, 0.53, 2.25);
// crearPasarelaPlana(0.71, 1.3, -0.75);

// crearEscaleraEliptica(0.04, 0.23, -0.75, 2.25);
// crearEscaleraEliptica(0.54, 0.73, 2.25, -0.75);

// crearMurallaExterior(0, 0.25, -1.75, 1.25);
// crearMurallaExterior(0.25, 0.5, 1.25, 1.25);
// crearMurallaExterior(0.5, 0.75, 1.25, -1.75);
// crearMurallaExterior(0.75, 1, -1.75, -1.75);

// --- 7. CILINDRO CENTRAL ---
// NUEVA IMPLEMENTACIÓN: Aumentamos la altura de la geometría de 10 a 30.
// Esto expande la torre automáticamente tanto por arriba como por abajo desde su centro.
const geoCilindro = new THREE.CylinderGeometry(a, a, 30, 64, 1, true); 
const matCilindro = new THREE.MeshStandardMaterial({ map: texturaPiedra, side: THREE.DoubleSide, roughness: 0.8 }); 
const cilindroCentral = new THREE.Mesh(geoCilindro, matCilindro); 

// Mantenemos la base circular aumentada (1.5 veces de tamaño en X y Z) de la actualización anterior
cilindroCentral.scale.set(1.5, 1, 1.5); 

// El centro de la torre permanece en Y = 1.125, por lo que ahora se extiende desde Y = -13.875 hasta Y = 16.125
cilindroCentral.position.set(0, 1.125, 0); 
scene.add(cilindroCentral);


// --- 8. Recorrido Elíptico Sincronizado (40 Vueltas) ---
const puntosEsquiva = [];
const vueltasTotales = 40;
// 300 segmentos por vuelta * 40 vueltas = 12.000 puntos para mantener la resolución de interpolación en Three.js
const segmentos = 300 * vueltasTotales; 
const aCamara = 14;  // Radio elipse verde en X (a + 2.5)
const bCamara = 9;   // Radio elipse verde en Z (b + 2.5)

for (let i = 0; i <= segmentos; i++) {
    // Multiplicamos por (40 * 2 * Math.PI) para completar 80π radianes totales
    const theta = (i / segmentos) * Math.PI * 2 * vueltasTotales;

    // Posición X y Z en la elipse a lo largo de las 40 vueltas
    const x = aCamara * Math.cos(theta);
    const z = bCamara * Math.sin(theta);

    // Normalizamos el ángulo a la vuelta actual (0 a 2π) para reutilizar el patrón Y de subida/bajada
    const thetaNorm = theta % (Math.PI * 2);

    // Y sigue la subida y bajada del escenario en cada una de las 40 vueltas
    let y = 1;
    // Tramo 1 a 3 (Subida):
    if (thetaNorm > 0 && thetaNorm < Math.PI / 2) {
        y = 1 + (thetaNorm / (Math.PI / 2)) * 3;
    }
    // Tramo 3 a 2 (Meseta):
    else if (thetaNorm >= Math.PI / 2 && thetaNorm <= Math.PI) {
        y = 4;
    }
    // Tramo 2 a 4 (Bajada):
    else if (thetaNorm > Math.PI && thetaNorm < (3 * Math.PI) / 2) {
        y = 4 - ((thetaNorm - Math.PI) / (Math.PI / 2)) * 3;
    }

    puntosEsquiva.push(new THREE.Vector3(x, y, z));
}


// --- 9. ILUMINACIÓN (OPTIMIZADA) ---
function initLighting() {
    // A. Luz de hemisferio: aporta profundidad (color cielo, color suelo, intensidad)
    const hemiLight = new THREE.HemisphereLight(0xaaaaff, 0x222277, 1);
    scene.add(hemiLight);

    // B. Luz direccional: resalta las texturas y relieves de piedra/madera
    const dirLight = new THREE.DirectionalLight(0xaaaaff, 1.2);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);
}
initLighting();


// --- 9. ANIMACIÓN Y SCROLL (GSAP) ---
// Instancia de reloj para calcular el tiempo transcurrido
const clock = new THREE.Clock();

// Vector que almacena la posición base de la cámara según el scroll
const posicionBaseCamara = new THREE.Vector3().copy(camera.position);

const scrollData = { progreso: 0 };

gsap.to(scrollData, {
    progreso: 1,
    ease: "none",
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    },
    onUpdate: () => {
        const index = Math.floor(scrollData.progreso * segmentos) % segmentos;
        if (puntosEsquiva[index]) {
            // Actualizamos solo la posición base, dejando que animate() aplique el vaivén
            posicionBaseCamara.copy(puntosEsquiva[index]);
        }
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
        const idPuerta = puertaClicada.userData.id;

        const infoElement = document.querySelector('.info');
        if (infoElement && contenidosInfo[idPuerta]) {
            // Inyectamos el HTML correspondiente del array/objeto contenidosInfo
            document.querySelector(`#${idPuerta}`).classList.remove('hidden');
        document.querySelector(`#${idPuerta}`).classList.add('open');
        infoElement.classList.remove('close');
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

    const tiempo = clock.getElapsedTime();

    // MOVIMIENTO DE ESCOBA ESTÁTICA (Oscilación armónica):
    // - Elevación/Descenso vertical (amplitud: 0.15 m, velocidad: 1.8 rad/s)
    // - Balanceo suave secundario en Z (amplitud: 0.04 m)
    const flotacionY = Math.sin(tiempo * 0.8) * 0.15;
    const balanceoZ = Math.cos(tiempo * 1.2) * 0.04;

    // Aplicar la oscilación sobre la posición base
    camera.position.x = posicionBaseCamara.x + balanceoZ;
    camera.position.y = posicionBaseCamara.y + flotacionY;
    camera.position.z = posicionBaseCamara.z + balanceoZ;

    // Mantener la cámara enfocada en el punto de interés del escenario (origen Y=2)
    camera.lookAt(0, 2, 0);

    // Raycasting optimizado (procesado una vez por frame cuando hay movimiento)
    if (typeof necesitaRaycast !== 'undefined' && necesitaRaycast) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(bloques, false);
        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
        necesitaRaycast = false;
    }

    renderer.render(scene, camera);
}
animate();




