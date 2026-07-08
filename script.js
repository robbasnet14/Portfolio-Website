const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));
const revealItems = document.querySelectorAll("[data-reveal]");
const progress = document.getElementById("scrollProgress");
const heroMedia = document.getElementById("heroMedia");
const tiltCards = document.querySelectorAll(".tilt-card");
const magneticButtons = document.querySelectorAll(".magnetic");
const motionButtons = document.querySelectorAll(".motion-btn");
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");
const FALLBACK_EMAIL = "basnro01@gettysburg.edu";

const MOTION_MODES = {
  subtle: { tilt: 0.45, magnetic: 0.04, revealDelay: 20 },
  balanced: { tilt: 1, magnetic: 0.1, revealDelay: 50 },
  bold: { tilt: 1.55, magnetic: 0.16, revealDelay: 80 },
};

let currentMode = localStorage.getItem("motionMode") || "balanced";
if (currentMode === "sick") currentMode = "bold";
if (!MOTION_MODES[currentMode]) currentMode = "balanced";

function getMotion() {
  return MOTION_MODES[currentMode];
}

function applyMotionMode(mode) {
  currentMode = mode;
  localStorage.setItem("motionMode", mode);
  document.body.classList.remove("motion-subtle", "motion-balanced", "motion-bold", "motion-sick");
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

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!contactStatus) return;

    const formData = new FormData(contactForm);
    const formEndpoint = contactForm.dataset.formEndpoint?.trim();
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    contactStatus.className = "contact-status";
    contactStatus.textContent = "Preparing message...";

    if (String(formData.get("_gotcha") || "").trim()) {
      contactStatus.textContent = "Message sent successfully.";
      contactForm.reset();
      return;
    }

    if (!payload.name || !payload.email || !payload.message) {
      contactStatus.className = "contact-status error";
      contactStatus.textContent = "Name, email, and message are required.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      contactStatus.className = "contact-status error";
      contactStatus.textContent = "Please enter a valid email address.";
      return;
    }

    function showFallback(message) {
      const subject = encodeURIComponent(`Portfolio Message from ${payload.name}`);
      const body = encodeURIComponent(`Name: ${payload.name}\nEmail: ${payload.email}\n\nMessage:\n${payload.message}`);
      const mailtoHref = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;

      contactStatus.className = "contact-status error";
      contactStatus.textContent = "";
      contactStatus.append(document.createTextNode(`${message} `));

      const emailLink = document.createElement("a");
      emailLink.href = mailtoHref;
      emailLink.textContent = FALLBACK_EMAIL;
      emailLink.rel = "noreferrer";

      contactStatus.append(emailLink);
      contactStatus.append(document.createTextNode("."));
      window.location.href = mailtoHref;
    }

    if (!formEndpoint) {
      showFallback("Email service is not configured yet. Opening your email app to send this message to");
      return;
    }

    contactStatus.textContent = "Sending...";

    try {
      const response = await fetch(formEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          _subject: `Portfolio Message from ${payload.name}`,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const serviceError = Array.isArray(data.errors) ? data.errors.map((item) => item.message).join(" ") : data.error;
        throw new Error(serviceError || "Could not send message right now.");
      }

      contactStatus.className = "contact-status success";
      contactStatus.textContent = "Message sent successfully.";
      contactForm.reset();
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Could not send message right now.";
      showFallback(`${rawMessage} Opening your email app to send this message to`);
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
