const darkToggle = document.getElementById("darkModeToggle");
darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});


// Load dark mode preference
window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
});

const backToTop = document.getElementById("backToTop");

function toggleNav() {
    document.getElementById('navLinks').classList.toggle('active');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener("scroll", () => {
    backToTop.style.display = window.scrollY > 300 ? "flex" : "none";
});

// Background for the dark mode 
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const maxDistance = 150;
const particleCount = 100;
let animationId;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
}

function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: 2 + Math.random() * 2,
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        gradient.addColorStop(0, 'rgba(100, 150, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDistance) {
                let alpha = 1 - dist / maxDistance;
                ctx.strokeStyle = `rgba(100, 150, 255, ${alpha * 0.4})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    animationId = requestAnimationFrame(animate);
}

function startAnimation() {
    resizeCanvas();
    createParticles();
    if (!animationId) {
        animate();
    }
}

function stopAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        ctx.clearRect(0, 0, width, height);
    }
}

function checkDarkMode() {
    if (document.body.classList.contains('dark-mode')) {
        startAnimation();
    } else {
        stopAnimation();
    }
}

window.addEventListener('resize', () => {
    if (document.body.classList.contains('dark-mode')) {
        resizeCanvas();
    }
});

// Listen for dark mode toggling
const observer = new MutationObserver(checkDarkMode);
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

// Initial check
checkDarkMode();


