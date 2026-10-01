// ── Canvas Particle System (moving dots + connecting lines) ──
(function(){
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const COLORS = ["#60a5fa","#818cf8","#a78bfa","#38bdf8","#e879f9","#ffffff","#93c5fd"];
  const PARTICLE_COUNT = 180;
  const CONNECTION_DIST = 150;
  const MAX_SPEED = 0.45;

  let W, H, particles;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      // ~15% chance of a larger accent dot, rest stay small — gives depth without clutter
      const size = Math.random() < 0.15 ? rand(4.5, 7) : rand(1.5, 3);
      particles.push({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-MAX_SPEED, MAX_SPEED) || 0.15,
        vy: rand(-MAX_SPEED, MAX_SPEED) || 0.15,
        size,
        color,
        alpha: rand(0.35, 0.85),
        pulse: rand(0, Math.PI * 2),
        pulseSpeed: rand(0.01, 0.025)
      });
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // Update positions
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;
      // Wrap edges
      if (p.x < -10) p.x = W + 10;
      else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      else if (p.y > H + 10) p.y = -10;
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(96,165,250,${lineAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw dots
    for (const p of particles) {
      const pulsedAlpha = p.alpha * (0.75 + 0.25 * Math.sin(p.pulse));
      const pulsedSize = p.size * (0.9 + 0.15 * Math.sin(p.pulse));

      // Outer glow halo
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulsedSize * 3, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(p.color, pulsedAlpha * 0.12);
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulsedSize, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(p.color, pulsedAlpha);
      ctx.fill();
    }

    requestAnimationFrame(drawFrame);
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }

  function init() {
    resize();
    createParticles();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      drawFrame();
    }
  }

  // Resize when window or content changes
  window.addEventListener("resize", () => { resize(); createParticles(); }, { passive: true });
  // Also resize after full page load (for dynamic content)
  window.addEventListener("load", () => { resize(); createParticles(); }, { passive: true });

  init();
})();


// ── Hero Typewriter ──────────────────────────────────────────────────────────
(function () {
  const ROLES = [
    "Senior Android Engineer",
    "Mobile Architect",
    "Android Engineering Lead",
    "Kotlin & Jetpack Compose Specialist",
    "Mobile Performance & Security Engineer"
  ];
  const COPY_TEXT = "I design and build scalable, secure and high-performance Android applications with Kotlin, Jetpack Compose and modern architecture — across banking, retail and sports technology.";

  const elIm     = document.getElementById("twIm");
  const elFirst  = document.getElementById("twFirst");
  const elLast   = document.getElementById("twLast");
  const elRole   = document.getElementById("roleText");
  const elCopy   = document.getElementById("twCopy");
  const elCursor = document.getElementById("twCursor");

  if (!elIm || !elFirst || !elLast || !elRole || !elCopy || !elCursor) return;

  // Type a string into an element char by char; returns a Promise
  function typeInto(el, text, speed) {
    return new Promise(resolve => {
      el.textContent = "";
      elCursor.classList.add("tw-typing");
      let i = 0;
      const tick = () => {
        if (i < text.length) {
          el.textContent += text[i++];
          setTimeout(tick, speed);
        } else {
          elCursor.classList.remove("tw-typing");
          resolve();
        }
      };
      tick();
    });
  }

  // Erase a string from an element char by char; returns a Promise
  function eraseFrom(el, speed) {
    return new Promise(resolve => {
      elCursor.classList.add("tw-typing");
      const tick = () => {
        if (el.textContent.length > 0) {
          el.textContent = el.textContent.slice(0, -1);
          setTimeout(tick, speed);
        } else {
          elCursor.classList.remove("tw-typing");
          resolve();
        }
      };
      tick();
    });
  }

  // Pause helper
  const pause = ms => new Promise(r => setTimeout(r, ms));

  // Role cycling loop (runs forever after intro)
  let roleIndex = 0;
  async function cycleRoles() {
    while (true) {
      await pause(2400);
      await eraseFrom(elRole, 38);
      await pause(220);
      roleIndex = (roleIndex + 1) % ROLES.length;
      await typeInto(elRole, ROLES[roleIndex], 46);
    }
  }

  // Intro sequence: I'm → Dipanjan → Chakraborty → copy paragraph → start role loop
  async function intro() {
    await pause(320);
    await typeInto(elIm, "I'm", 90);
    await pause(180);
    await typeInto(elFirst, "Dipanjan", 72);
    await pause(100);
    await typeInto(elLast, "Chakraborty", 68);
    await pause(260);
    await typeInto(elRole, ROLES[0], 46);
    await pause(180);

    // Fade-in copy paragraph then type it
    elCopy.style.transition = "opacity .3s";
    elCopy.style.opacity = "1";
    await typeInto(elCopy, COPY_TEXT, 12);

    cycleRoles(); // kick off the endless role loop
  }

  intro();
})();

const spotlight=document.getElementById("spotlight");window.addEventListener("mousemove",e=>{document.documentElement.style.setProperty("--mx",e.clientX+"px");document.documentElement.style.setProperty("--my",(e.clientY+window.scrollY)+"px");if(spotlight)spotlight.style.background=`radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px,rgba(59,130,246,.035),transparent 80%)`},{passive:true});

// ── Smooth scroll for all [data-nav] links ──
const navLinks=[...document.querySelectorAll("[data-nav]")];
navLinks.forEach(a=>a.addEventListener("click",e=>{
  const href=a.getAttribute("href");
  if(href?.startsWith("#")){
    e.preventDefault();
    const target=document.querySelector(href);
    if(target) target.scrollIntoView({behavior:"smooth"});
  }
}));

// ── Scroll-spy: activate the nav link matching the section currently in view ──
// Order MUST match DOM order of sections on the page.
const SPY_ANCHORS=["hero","about","skills","techstack","experience","projects","education","contact"];
const desktopLinks=[...document.querySelectorAll(".desktop-nav a")];

function updateActiveNav(){
  // Use 40% down the viewport as the trigger point
  const triggerY=window.scrollY+window.innerHeight*0.40;
  let active="hero";
  for(const id of SPY_ANCHORS){
    const el=document.getElementById(id);
    if(el){
      const top=el.getBoundingClientRect().top+window.scrollY;
      if(triggerY>=top) active=id;
    }
  }
  desktopLinks.forEach(l=>l.classList.toggle("active",l.getAttribute("href")==="#"+active));
}

// On page load scroll=0 → hero is the only match → only "Home" gets active class
updateActiveNav();
window.addEventListener("scroll",updateActiveNav,{passive:true});

// ── Navbar scroll: transparent → frosted + hide-on-scroll-down / show-on-scroll-up ──
const navbar=document.getElementById("navbar");
const progressBar=document.getElementById("scroll-progress");
let lastScrollY=window.scrollY;
let ticking=false;
function updateNavbarScroll(){
  const currentY=window.scrollY;
  // Frosted glass once past top
  if(navbar) navbar.classList.toggle("scrolled",currentY>10);
  // Hide when scrolling DOWN (user scrolled at least 80px from top to avoid jitter at page top)
  // Show when scrolling UP
  if(currentY>80){
    const goingDown=currentY>lastScrollY;
    if(navbar) navbar.classList.toggle("nav-hidden",goingDown);
  } else {
    // Always show near top of page
    if(navbar) navbar.classList.remove("nav-hidden");
  }
  lastScrollY=currentY;
  // Scroll progress bar
  if(progressBar){
    const docH=document.documentElement.scrollHeight-window.innerHeight;
    const pct=docH>0?Math.min(100,(currentY/docH)*100):0;
    progressBar.style.width=pct+"%";
  }
  ticking=false;
}
updateNavbarScroll();
window.addEventListener("scroll",()=>{
  if(!ticking){requestAnimationFrame(updateNavbarScroll);ticking=true;}
},{passive:true});

// ── Section-level fade-up (unchanged) ──
document.querySelectorAll(".section,.ts-section,.job,.skill-group,.recognition-card").forEach((el,i)=>{el.classList.add("reveal");el.style.transitionDelay=(i%5)*50+"ms"});
const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");ro.unobserve(e.target)}}),{threshold:.08});
document.querySelectorAll(".reveal").forEach(e=>ro.observe(e));

// ── Per-card staggered reveal (scale + fade-up, first scroll only) ──
(function(){
  const CARD_SELECTORS = [
    ".project-card",
    ".skill-overview-card",
    ".ts-card",
    ".about-hl-card",
    ".about-stat-card",
    ".edu-card",
    ".cert-card",
    ".job-card"
  ];
  // Group cards by their direct parent so stagger resets per grid/row
  const groups = new Map();
  document.querySelectorAll(CARD_SELECTORS.join(",")).forEach(card => {
    const parent = card.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(card);
  });
  groups.forEach(cards => {
    cards.forEach((card, i) => {
      card.classList.add("reveal-card");
      card.style.transitionDelay = (i * 70) + "ms";
    });
  });
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        cardObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal-card").forEach(c => cardObserver.observe(c));
})();

const contactForm=document.getElementById("contactForm");
if(contactForm){
  contactForm.addEventListener("submit",e=>{
    e.preventDefault();
    const name=document.getElementById("cf-name").value.trim();
    const email=document.getElementById("cf-email").value.trim();
    const subject=document.getElementById("cf-subject").value.trim();
    const message=document.getElementById("cf-message").value.trim();
    const feedback=document.getElementById("cf-feedback");
    if(!name||!email||!subject||!message){
      feedback.style.color="#f87171";
      feedback.textContent="Please fill in all required fields.";
      return;
    }
    const mailto=`mailto:chakraborty.dipanjan07@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("Name: "+name+"\nEmail: "+email+"\n\n"+message)}`;
    window.location.href=mailto;
    feedback.style.color="#4ade80";
    feedback.textContent="Opening your email client...";
    setTimeout(()=>{feedback.textContent="";contactForm.reset();},3000);
  });
}

document.querySelectorAll("#projectTabs button").forEach(btn=>btn.onclick=()=>{document.querySelectorAll("#projectTabs button").forEach(b=>b.classList.remove("active"));btn.classList.add("active");const filter=btn.dataset.filter;document.querySelectorAll(".project-card").forEach(card=>card.classList.toggle("hide",filter!=="all"&&card.dataset.category!==filter))});

// ── Tech Stack filter tabs ──
document.querySelectorAll("#tsTabs .ts-filter-btn").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll("#tsTabs .ts-filter-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  const filter=btn.dataset.tsfilter;
  document.querySelectorAll("#tsGrid .ts-card").forEach(card=>card.classList.toggle("ts-hide",filter!=="all"&&card.dataset.tscategory!==filter));
});

document.querySelectorAll("#skillsCategoryRow .skills-category-chip").forEach(btn=>btn.onclick=()=>{document.querySelectorAll("#skillsCategoryRow .skills-category-chip").forEach(b=>b.classList.remove("active"));btn.classList.add("active");const filter=btn.dataset.skillFilter;document.querySelectorAll("#skills .skill-overview-card").forEach(card=>card.classList.toggle("hide",filter!=="all"&&card.dataset.skillCategory!==filter))});

const palette=document.getElementById("palette"),input=document.getElementById("paletteInput");const commandBtn=document.getElementById("commandBtn");if(commandBtn)commandBtn.onclick=()=>{palette.classList.add("open");palette.setAttribute("aria-hidden","false");input.focus()};if(palette){palette.addEventListener("click",e=>{if(e.target===palette)palette.classList.remove("open")});document.querySelectorAll(".palette button").forEach(b=>b.onclick=()=>{palette.classList.remove("open");document.querySelector(b.dataset.target)?.scrollIntoView({behavior:"smooth"})});}document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();if(palette){palette.classList.toggle("open");if(palette.classList.contains("open")&&input)input.focus()}}if(e.key==="Escape"&&palette)palette.classList.remove("open")});

if(!matchMedia("(prefers-reduced-motion: reduce)").matches){document.querySelectorAll(".project-card").forEach(card=>{card.addEventListener("pointermove",e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${(-y*1.8).toFixed(2)}deg) rotateY(${(x*2.2).toFixed(2)}deg) translateY(-5px)`});card.addEventListener("pointerleave",()=>card.style.transform="")})}

const langBtn=document.getElementById("langBtn");if(langBtn){langBtn.addEventListener("click",()=>{langBtn.textContent=langBtn.textContent.includes("EN")?"◎ EN":"◎ EN"})}
