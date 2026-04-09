const canvas = document.getElementById('miCanvas');
const ctx = canvas.getContext('2d');

const colores = ['#FF0000', '#00FF00', '#0000FF', '#FFA500'];
const bloques = [];
let bloqueActual = 0; 

// Crear los bloques
for (let i = 0; i < colores.length; i++) {
    bloques.push({
        color: colores[i],
        positionZ: -200 * (i + 1), // Posición Z inicial para cada bloque
        visible: false
    });
}

// Mostrar el primer bloque
bloques[bloqueActual].visible = true;

function dibujarBloque() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (const bloque of bloques) {
        if (bloque.visible) {
            const perspective = 300 / (300 + bloque.positionZ);
            const size = 50 * perspective; // Tamaño según la perspectiva
            const x = canvas.width / 2 - size / 2;
            const y = canvas.height / 2 - size / 2;

            ctx.fillStyle = bloque.color;
            ctx.fillRect(x, y, size, size); // Dibujar el bloque
        }
    }
}

// Manejar el scroll
window.addEventListener('scroll', () => {
    const nuevoBloque = Math.floor(window.scrollY / (window.innerHeight / colores.length));

    if (nuevoBloque !== bloqueActual && nuevoBloque < bloques.length) {
        // Hacer visible el nuevo bloque
        bloques[bloqueActual].visible = false; // Ocultar el bloque anterior
        bloqueActual = nuevoBloque;
        bloques[bloqueActual].visible = true; // Mostrar el nuevo bloque

        // Animar la posición Z de ambos bloques
        let animationProgress = 0;
        
        function animar() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const antiguoBloque = bloques[bloqueActual === 0 ? bloques.length - 1 : bloqueActual - 1];

            // Mover el bloque actual hacia adelante
            if (bloques[bloqueActual].positionZ < -50) {
                bloques[bloqueActual].positionZ += 10; // Mover hacia adelante
            }
            // Mover el bloque anterior hacia atrás
            if (antiguoBloque.positionZ < -200) {
                antiguoBloque.positionZ += 10; // Mover hacia atrás
            }

            // Dibujar los bloques
            dibujarBloque();
            if (bloques[bloqueActual].positionZ < -50 || antiguoBloque.positionZ < -200) {
                requestAnimationFrame(animar); // Continuar animación
            }
        }
        animar();
    }
});

// Iniciar el primer dibujo
dibujarBloque();
