// Initialize lucide icons
window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

// Show pop-word animations after page load
window.addEventListener("load", () => {
  document.querySelectorAll(".pop-word").forEach(el => {
    el.style.animationPlayState = "running";
  });
});

// Scroll-triggered reveal logic using IntersectionObserver
function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  revealElements.forEach(el => {
    observer.observe(el);
  });
}

// Navbar shadow and backdrop blur on scroll + run scroll reveal
function handleScrollEffects() {
  const navbar = document.getElementById("navbar");
  if(window.scrollY > 50) {
    navbar.classList.add("bg-white/95", "backdrop-blur-md", "shadow-xl");
  } else {
    navbar.classList.remove("bg-white/95", "backdrop-blur-md", "shadow-xl");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  handleScrollEffects();
  setupScrollReveal();
});

window.addEventListener("scroll", () => {
  handleScrollEffects();
});


gsap.registerPlugin(ScrollTrigger);

const video = document.getElementById("bg-video");
const loader = document.getElementById("loader");

// ⏳ Delay loader fade-out after video is ready
video.addEventListener("canplaythrough", () => {
  setTimeout(() => {
    loader.classList.add("fade-out");
  }, 2000); // 2 seconds delay
});

// 🎞️ Scroll-triggered clip and glow
gsap.to("#video-wrapper", {
  scrollTrigger: {
    trigger: ".page1",
    start: "top top",        // top of section reaches top of viewport
    end: "bottom top",       // bottom of section reaches top of viewport
    scrub: true,
  },
  clipPath: "inset(20% 20% 20% 20% round 30px)"
});



gsap.to("#video-wrapper::before", {
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom top",
    scrub: true
  },
  opacity: 1,
  ease: "power2.out",
});