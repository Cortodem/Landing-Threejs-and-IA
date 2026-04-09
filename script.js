const canvas = document.getElementById('miCanvas');
const ctx = canvas.getContext('2d');

const bloques = [
    { color: 'red', url: 'https://www.latorredeoro.com', posX: 50, posY: 50 },
    { color: 'green', url: 'https://www.papelpintadoflores.com', posX: 100, posY: 100 },
    { color: 'blue', url: 'https://www.davidmartinezpsicologia.com', posX: 150, posY: 150 },
    { color: 'orange', url: 'https://www.as.com', posX: 200, posY: 200 }
];

// Control de posición del bloque actual
let bloqueActual = 0;
let posX = 50;
let posY = 50;
// Función para dibujar un bloque en el canvas
function dibujarBloque() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    ctx.fillStyle = bloques[bloqueActual].color;
    ctx.fillRect(bloques[bloqueActual].posX, bloques[bloqueActual].posY, 300, 200); // Dibujar el bloque
    canvas.style.display = 'block'; // Mostrar canvas
    canvas.style.opacity = 1; // Asegurarse de que esté visible
}

// Manejar el scroll para mostrar el siguiente bloque
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    const newIndex = Math.floor(currentScroll / window.innerHeight); // Calcular el nuevo índice basado en el scroll

    if (newIndex < bloques.length && newIndex !== bloqueActual) {
        bloqueActual = newIndex; // Cambiar al nuevo bloque
        dibujarBloque(); // Dibujar el bloque correspondiente
    }
});


// Manejar los clics en el canvas
canvas.addEventListener('click', () => {
    if (bloqueActual < bloques.length) {
        window.location.href = bloques[bloqueActual].url; // Redirigir al enlace
    }
});

// Dibuja el primer bloque
dibujarBloque();

// const canvas = document.getElementById('miCanvas');
// const ctx = canvas.getContext('2d');

// let angle = 0; // Ángulo de rotación

// function dibujarCubo() {
//     const size = 50; // Tamaño del cubo
//     const distances = [
//         [-size, -size, -size], [size, -size, -size], [size, size, -size], [-size, size, -size],
//         [-size, -size, size], [size, -size, size], [size, size, size], [-size, size, size]
//     ];

//     // Aplicar rotación
//     const rotY = angle;
//     const rotZ = angle;

//     const proyectar = (x, y, z) => {
//         const perspective = 300 / (300 + z); // Perspectiva
//         const xProj = x * perspective;
//         const yProj = y * perspective;
//         return { x: xProj, y: yProj };
//     };

//     ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    
//     // Dibujar líneas entre las esquinas del cubo
//     const edges = [
//         [0, 1], [1, 2], [2, 3], [3, 0], // Cara delantera
//         [4, 5], [5, 6], [6, 7], [7, 4], // Cara trasera
//         [0, 4], [1, 5], [2, 6], [3, 7]  // Conexiones entre caras
//     ];

//     for (const [start, end] of edges) {
//         const [x1, y1, z1] = distances[start].map((val) => {
//             // Rotación en el eje Z
//             const tempX = Math.cos(rotZ) * val[0] - Math.sin(rotZ) * val[1];
//             const tempY = Math.sin(rotZ) * val[0] + Math.cos(rotZ) * val[1];
//             return tempX;
//         });
        
//         const [x2, y2, z2] = distances[end].map((val) => {
//             const tempX = Math.cos(rotZ) * val[0] - Math.sin(rotZ) * val[1];
//             const tempY = Math.sin(rotZ) * val[0] + Math.cos(rotZ) * val[1];
//             return tempY;
//         });

//         const p1 = proyectar(x1, y1, z1);
//         const p2 = proyectar(x2, y2, z2);

//         ctx.beginPath();
//         ctx.moveTo(p1.x + canvas.width / 2, p1.y + canvas.height / 2);
//         ctx.lineTo(p2.x + canvas.width / 2, p2.y + canvas.height / 2);
//         ctx.strokeStyle = '#000';
//         ctx.stroke();
//     }
// }

// // Animación
// function animar() {
//     angle += 0.01; // Incremento del ángulo
//     dibujarCubo();
//     requestAnimationFrame(animar);
// }

// // Iniciar la animación
// animar();
