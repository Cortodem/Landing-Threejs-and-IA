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

// Función generadora de escaleras
function crearEscalera(p1, p2) {
  const grupo = new THREE.Group();
  const dy = p2.y - p1.y;
  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;
  const distanciaHorizontal = Math.sqrt(dx * dx + dz * dz);

  const numEscalones = Math.max(Math.ceil(Math.abs(dy) / 0.18), 1);
  const altoEscalon = dy / numEscalones;
  const profundoEscalon = distanciaHorizontal / numEscalones;

  const geo = new THREE.BoxGeometry(2, Math.abs(altoEscalon), profundoEscalon); [3]
  const mat = new THREE.MeshStandardMaterial({ color: 0x777777 }); [3]

  for (let i = 0; i < numEscalones; i++) {
    const escalon = new THREE.Mesh(geo, mat); [1]
    escalon.position.set(0, (i + 0.5) * altoEscalon, (i + 0.5) * profundoEscalon);
    grupo.add(escalon);
  }

  grupo.position.set(p1.x, p1.y, p1.z);
  grupo.lookAt(p2.x, p1.y, p2.z); // Orienta la escalera hacia el siguiente bloque
  scene.add(grupo);
}

// Tramo 1 (Subida): Del Bloque 1 (clases) al Bloque 2 (profesores)
crearEscalera(
  new THREE.Vector3(a, -0.75, 0),    // Base de Clases (Y=0)
  new THREE.Vector3(-a, 2.25, 0)    // Base de Profesores (Y=3)
);

// Tramo 2 (Bajada): Del Bloque 3 (prefectos) al Bloque 4 (aulas)
crearEscalera(
  new THREE.Vector3(0, 2.25, b),    // Base de Prefectos (Y=3)
  new THREE.Vector3(0, -0.75, -b)   // Base de Aulas (Y=0)
);

// 4. Recorrido Orgánico y Marcador (Cámara)
const puntosEsquiva = [];
const segmentos = 5000;
for (let i = 0; i <= segmentos; i++) {
    const theta = (i / segmentos) * Math.PI * 2;
    const variacion = Math.abs(Math.cos(theta * 2)) * 2.5;
    const x = (a + variacion) * Math.cos(theta);
    const z = (b + variacion) * Math.sin(theta);

    // Elevación suave: sube gradualmente hasta un máximo de 4 (1 de base + 3 de altura)
    // Ajustamos el desfase (PI/4) para que el pico coincida con los objetos elevados
    const y = 1 + Math.pow(Math.sin(theta / 2 + Math.PI / 8), 2) * 3;

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