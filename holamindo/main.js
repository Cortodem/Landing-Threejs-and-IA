import * as THREE from 'three';


// 1. Escena, Cámara y Renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
const texturaPiedra = loader.load('assets/textures/castle_wall_1k.jpg');
const texturaMarmol = loader.load('assets/textures/marble_01_diff_1k.jpg');
const texturaMaderaEscaleras = loader.load('assets/textures/wood_table_worn_1k.jpg');
const texturaPuerta = loader.load('assets/textures/wood_planks_dirt_1k.jpg');


texturaPiedra.wrapS = texturaPiedra.wrapT = THREE.RepeatWrapping;
texturaPiedra.repeat.set(4, 1); // Ajusta según prefieras la densidad de la piedra
// Configuramos la repetición para que el mármol se vea realista en la curva
texturaMarmol.wrapS = texturaMarmol.wrapT = THREE.RepeatWrapping;
texturaMarmol.repeat.set(8, 1);
texturaMaderaEscaleras.wrapS = texturaMaderaEscaleras.wrapT = THREE.RepeatWrapping;
texturaMaderaEscaleras.repeat.set(1, 1);

// 2. Configuración de Raycaster para clics
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// 3. Bloques fijos con URLs en userData
const a = 10, b = 5;
const bloques = [];
const datosBloques = [
    { pos: [a, 0, 0], col: 0xfabada, url: 'https://google.com', id: 'clases' },
    { pos: [-a, 3, 0], col: 0x44aa88, url: 'https://threejs.org', id: 'profesores' },
    { pos: [0, 3, b], col: 0x2266dd, url: 'https://greensock.com', id: 'prefectos' },
    { pos: [0, 0, -b], col: 0xff5733, url: 'https://github.com', id: 'aulas' }
];

// Define los radios de la elipse verde antes del bucle
const aV = 12.5;
const bV = 7.5;

datosBloques.forEach((d) => {
  const geoPuerta = new THREE.BoxGeometry(1.2, 2.4, 0.2);
  const matPuerta = new THREE.MeshStandardMaterial({ 
    map: texturaPuerta, // Aplicamos la nueva textura
    roughness: 0.8 
  });
  
  const puerta = new THREE.Mesh(geoPuerta, matPuerta);
  
  // Posicionamiento sobre los suelos cuadrados (a=10, b=5)
  const ySuelo = (d.id === 'profesores' || d.id === 'prefectos') ? 2.25 : -0.75;
  let posX = d.id === 'clases' ? 10 : (d.id === 'profesores' ? -10 : 0);
  let posZ = d.id === 'prefectos' ? 5 : (d.id === 'aulas' ? -5 : 0);

  puerta.position.set(posX, ySuelo + 1.2, posZ);
  puerta.lookAt(0, puerta.position.y, 0);
  
  scene.add(puerta);
  bloques.push(puerta);
});


function crearPasarelaAmarillaPlana(pInicio, pFin, y) {
  const grupo = new THREE.Group();
  const pasos = 80;
  const aV = 12.5; 
  const bV = 7.5;

  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos;
    const theta = (pInicio + (pFin - pInicio) * t) * Math.PI * 2;
    
    const placa = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.05, 0.5),
      new THREE.MeshStandardMaterial({ map: texturaMarmol }) // Sustituimos el color por el mapa
    );

    placa.position.set(aV * Math.cos(theta), y, bV * Math.sin(theta));
    placa.lookAt(aV * Math.cos(theta + 0.01), y, bV * Math.sin(theta + 0.01));
    grupo.add(placa);
  }
  scene.add(grupo);
}

// Tramo Superior Llano: Conecta el fin de subida (0.25) con el inicio de bajada (0.5)
crearPasarelaAmarillaPlana(0.25, 0.5, 2.25);

// Tramo Inferior Llano: Conecta el fin de bajada (0.75) con el inicio de subida (1.0)
crearPasarelaAmarillaPlana(0.75, 1.0, -0.75);




// Función escaleras
function crearEscaleraVerdeEliptica(pInicio, pFin, yBaseInicio, yBaseFin) {
  const grupo = new THREE.Group(); [1]
  const pasos = 35; [1]
  const aV = 12.5; [2, 3]
  const bV = 7.5; [2, 3]

  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos; [1]
    const theta = (pInicio + (pFin - pInicio) * t) * Math.PI * 2; [1]
    
    const x = aV * Math.cos(theta); [3]
    const z = bV * Math.sin(theta); [3]
    const y = yBaseInicio + (yBaseFin - yBaseInicio) * t; [3]

    // Material solo con textura de madera para un look natural
    const matEscalon = new THREE.MeshStandardMaterial({ 
      map: texturaMaderaEscaleras, 
      roughness: 0.9 
    }); [4]

    const geoEscalon = new THREE.BoxGeometry(3, 0.1, 0.5); [2, 4]
    const escalon = new THREE.Mesh(geoEscalon, matEscalon); [4]
    
    escalon.position.set(x, y, z); [5]
    
    // Orientación para seguir la curva de la elipse
    const sigTheta = theta + 0.01;
    escalon.lookAt(aV * Math.cos(sigTheta), y, bV * Math.sin(sigTheta)); [5]
    
    grupo.add(escalon); [1]
  }
  scene.add(grupo); [1, 5]
}

// Tramo del Bloque 1 al 3 (Scroll 0 a 0.25) - SUBIDA
crearEscaleraVerdeEliptica(0, 0.25, -0.75, 2.25);

// Tramo del Bloque 2 al 4 (Scroll 0.5 a 0.75) - BAJADA
crearEscaleraVerdeEliptica(0.5, 0.75, 2.25, -0.75);

// function crearMurallaExterior(pInicio, pFin, y1, y2) {
//     const grupo = new THREE.Group();
//     const pasos = 250;
//     // Radios exteriores (aV + 1.5 para estar fuera del ancho 3) [1, 2]
//     const aW = 14, bW = 9;

//     for (let i = 0; i <= pasos; i++) {
//         const t = i / pasos;
//         const theta = (pInicio + (pFin - pInicio) * t) * Math.PI * 2;
//         const x = aW * Math.cos(theta);
//         const z = bW * Math.sin(theta);
//         const yBase = y1 + (y2 - y1) * t;

//         // Muralla de altura 2
//         const muro = new THREE.Mesh(
//             new THREE.BoxGeometry(0.1, 2, 0.6),
//             new THREE.MeshStandardMaterial({
//                 map: texturaPiedra, // Aplicamos la textura [2]
//                 roughness: 0.9
//             })
//         );
//         // Posicionamos el centro a +1 para que la base toque la pasarela
//         muro.position.set(x, yBase + 1, z);
//         muro.lookAt(0, muro.position.y, 0);
//         grupo.add(muro);
//     }
//     scene.add(grupo);
// }

// // Aplicar muralla a todo el circuito sincronizado con las alturas [2, 3]
// crearMurallaExterior(0, 0.25, -1.75, 1.25);    // Tramo Subida Verde
// crearMurallaExterior(0.25, 0.5, 1.25, 1.25);   // Tramo Llano Amarillo Superior
// crearMurallaExterior(0.5, 0.75, 1.25, -1.75);  // Tramo Bajada Verde
// crearMurallaExterior(0.75, 1.0, -1.75, -1.75); // Tramo Llano Amarillo Inferior

// 1. Crear geometría de cilindro abierto (sin tapas)
const radioBase = a; // Usamos el radio mayor de 10 [1]
const alturaCilindro = 10;
const geoCilindro = new THREE.CylinderGeometry(radioBase, radioBase, alturaCilindro, 64, 1, true);

// 2. Material con doble cara para que se vea el interior
const matCilindro = new THREE.MeshStandardMaterial({ 
  map: texturaPiedra,
  side: THREE.DoubleSide, 
  
  roughness: 0.8
});

const cilindroHueco = new THREE.Mesh(geoCilindro, matCilindro);

// 3. Transformar en elipse ajustando la escala Z (b/a = 5/10 = 0.5)
cilindroHueco.scale.set(1, 1, b / a);

// 4. Posicionar (centrado entre el nivel -0.75 y 3)
cilindroHueco.position.set(0, 1.125, 0);

scene.add(cilindroHueco);


// 4. Recorrido Elíptico Sincronizado
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


// 5. Iluminación
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const luz = new THREE.DirectionalLight(0xffffff, 1.5);
luz.position.set(0, 10, 5);
scene.add(luz);


// 6. Animación Scroll y Cámara
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
        camera.lookAt(0, 0, 0);
    }
});

// 7. Evento de Clic
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    raycaster.setFromCamera(mouse, camera);
    const intersectados = raycaster.intersectObjects(bloques);

    // Debes usar  para acceder a la primera colisión detectada
    if (intersectados.length > 0) {
        const url = intersectados[0].object.userData.url;
        window.open(url, '_blank');
    }

});


// Mover scroll a objeto al hacer clic en menú
window.irAObjeto = (id) => {
    console.log("irAObjeto run con id:" + id);


    const indices = { 'clases': 0, 'profesores': 0.5, 'prefectos': 0.25, 'aulas': 0.75 };
    const progresoDestino = indices[id];

    // Desplazamos el scroll de la página
    window.scrollTo({
        top: progresoDestino * (document.body.scrollHeight - window.innerHeight),
        behavior: 'smooth'
    });

};


// Cambiar el cursor al pasar sobre un bloque
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bloques);

    // Si hay colisión, cursor pointer; si no, default 
    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';

});

// 8. Redimensionamiento y Loop
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();