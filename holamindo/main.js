import * as THREE from 'three';


// 1. Escena, Cámara y Renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// 2. Configuración de Raycaster para clics
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


// 3. Bloques fijos con URLs en userData
const a = 10, b = 5;
const bloques = [];
const datosBloques = [
    { pos: [a, 0, 0], col: 0xfabada, url: 'https://google.com', id: 'clases' },
    { pos: [-a, 3, 0], col: 0x44aa88, url: 'https://threejs.org', id: 'profesores' }, // Objeto 2 subido
    { pos: [0, 3, b], col: 0x2266dd, url: 'https://greensock.com', id: 'prefectos' }, // Objeto 3 subido
    { pos: [0, 0, -b], col: 0xff5733, url: 'https://github.com', id: 'aulas' }
];


datosBloques.forEach((d) => {
    const bloque = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 1.5),
        new THREE.MeshStandardMaterial({ color: d.col })
    );
    bloque.position.set(...d.pos);
    bloque.name = d.id; // Asignamos el ID solicitado
    bloque.userData = { url: d.url };
    scene.add(bloque);
    bloques.push(bloque);
});

/// Función para suelos alineados a la base (-0.75 respecto al centro)
const crearSuelo = (yPos, color) => {
    const suelo = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide })
    );
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = yPos - 0.75;
    scene.add(suelo);
};

crearSuelo(0, 0x333333); // Suelo nivel inferior
crearSuelo(3, 0x555555); // Suelo nivel superior

function crearEscaleraVerdeEliptica(pInicio, pFin, yBaseInicio, yBaseFin) {
  const grupo = new THREE.Group();
  const pasos = 35;
  
  // Coordenadas de la elipse verde (a + 2.5 y b + 2.5)
  const aVerde = 12.5; 
  const bVerde = 7.5;

  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos;
    const theta = (pInicio + (pFin - pInicio) * t) * Math.PI * 2;
    
    // X y Z de la elipse verde
    const x = aVerde * Math.cos(theta);
    const z = bVerde * Math.sin(theta);
    
    // Y de la "blanca" (empezando en su nivel -0.75 hasta el bloque elevado)
    const y = yBaseInicio + (yBaseFin - yBaseInicio) * t;

    const peldaño = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.1, 1),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 }) // Color Verde
    );

    peldaño.position.set(x, y, z);
    
    // Orientación siguiendo la elipse verde
    const sigTheta = theta + 0.01;
    peldaño.lookAt(aVerde * Math.cos(sigTheta), y, bVerde * Math.sin(sigTheta));
    
    grupo.add(peldaño);
  }
  scene.add(grupo);
}

// 1. Tramo del Bloque 1 al 3 (Scroll 0 a 0.25) - SUBIDA
crearEscaleraVerdeEliptica(0, 0.25, -0.75, 2.25);

// 2. Tramo del Bloque 2 al 4 (Scroll 0.5 a 0.75) - BAJADA
crearEscaleraVerdeEliptica(0.5, 0.75, 2.25, -0.75);


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