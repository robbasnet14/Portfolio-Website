const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));
const revealItems = document.querySelectorAll("[data-reveal]");
const progress = document.getElementById("scrollProgress");
const heroMedia = document.getElementById("heroMedia");
const tiltCards = document.querySelectorAll(".tilt-card");
const magneticButtons = document.querySelectorAll(".magnetic");
const motionButtons = document.querySelectorAll(".motion-btn");
const placeholderLiveLinks = document.querySelectorAll('.project-links a[href="#"]');
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

const MOTION_MODES = {
  subtle: { tilt: 0.45, magnetic: 0.04, revealDelay: 20 },
  balanced: { tilt: 1, magnetic: 0.1, revealDelay: 50 },
  sick: { tilt: 1.55, magnetic: 0.16, revealDelay: 80 },
};

let currentMode = localStorage.getItem("motionMode") || "balanced";
if (!MOTION_MODES[currentMode]) currentMode = "balanced";

function getMotion() {
  return MOTION_MODES[currentMode];
}

function applyMotionMode(mode) {
  currentMode = mode;
  localStorage.setItem("motionMode", mode);
  document.body.classList.remove("motion-subtle", "motion-balanced", "motion-sick");
  document.body.classList.add(`motion-${mode}`);
  motionButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.motion === mode);
  });
  revealItems.forEach((item, idx) => {
    item.style.transitionDelay = `${Math.min(idx * getMotion().revealDelay, 320)}ms`;
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("open");
  });

  navAnchors.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach((item) => revealObserver.observe(item));

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const width = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progress.style.width = `${width}%`;

  // Lightweight depth effect for premium feel on scroll.
  const y = scrollTop * 0.03;
  document.documentElement.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
}

function setActiveNav() {
  const offset = window.scrollY + 140;
  navAnchors.forEach((anchor) => {
    const id = anchor.getAttribute("href")?.slice(1);
    if (!id) return;
    const section = document.getElementById(id);
    if (!section) return;

    const inSection = offset >= section.offsetTop && offset < section.offsetTop + section.offsetHeight;
    anchor.classList.toggle("active", inSection);
  });
}

function attachTiltEffect(element, baseDeg = 8) {
  element.addEventListener("mousemove", (e) => {
    const rect = element.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const maxDeg = baseDeg * getMotion().tilt;
    const rx = (0.5 - py) * maxDeg;
    const ry = (px - 0.5) * maxDeg;
    element.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  element.addEventListener("mouseleave", () => {
    element.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
}

if (heroMedia) {
  attachTiltEffect(heroMedia, 6);
}

tiltCards.forEach((card) => attachTiltEffect(card, 7));

magneticButtons.forEach((button) => {
  button.addEventListener("mousemove", (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const strength = getMotion().magnetic;
    button.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translate(0, 0)";
  });
});

placeholderLiveLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!contactStatus) return;

    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    contactStatus.className = "contact-status";
    contactStatus.textContent = "Sending...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Could not send message right now. Please email basnro01@gettysburg.edu.");
      }

      contactStatus.className = "contact-status success";
      contactStatus.textContent = "Message sent successfully.";
      contactForm.reset();
    } catch (error) {
      contactStatus.className = "contact-status error";

      const rawMessage = error instanceof Error ? error.message : "Failed to send message.";
      const emailMatch = rawMessage.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

      if (emailMatch) {
        const emailAddress = emailMatch[0];
        const cleaned = rawMessage.replace(emailAddress, "").replace(/\s+/g, " ").trim();
        const prefix = cleaned ? cleaned.replace(/[.:]$/, "") : "Could not send message right now. Please email";

        contactStatus.textContent = "";
        contactStatus.append(document.createTextNode(`${prefix} `));

        const emailLink = document.createElement("a");
        emailLink.href = `mailto:${emailAddress}`;
        emailLink.textContent = emailAddress;
        emailLink.rel = "noreferrer";

        contactStatus.append(emailLink);
        contactStatus.append(document.createTextNode("."));
      } else {
        contactStatus.textContent = rawMessage || "Failed to send message.";
      }
    }
  });
}

window.addEventListener("scroll", () => {
  updateScrollProgress();
  setActiveNav();
});

motionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.motion;
    if (mode && MOTION_MODES[mode]) {
      applyMotionMode(mode);
    }
  });
});

window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 16;
  const y = (e.clientY / window.innerHeight - 0.5) * 12;
  document.documentElement.style.setProperty("--mouse-x", `${x.toFixed(2)}px`);
  document.documentElement.style.setProperty("--mouse-y", `${y.toFixed(2)}px`);
});

applyMotionMode(currentMode);
updateScrollProgress();
setActiveNav();
