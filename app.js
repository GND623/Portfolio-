"use strict";

(() => {
  const portfolio = window.PORTFOLIO;
  if (!portfolio || !Array.isArray(portfolio.projects)) {
    document.getElementById("fashion-grid").textContent = "作品暂时无法加载，请稍后刷新页面。";
    return;
  }
  const { profile, projects } = portfolio;
  const categories = {
    fashion: "FASHION DESIGN / 服装作品",
    illustration: "ILLUSTRATION / 绘画",
    graphic: "GRAPHIC DESIGN / 平面设计"
  };
  const $ = (id) => document.getElementById(id);
  const text = (id, value) => { if (value !== undefined && value !== null) $(id).textContent = value; };
  const make = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };
  // Restrict user-edited media paths to the local asset folder.
  const asset = (path) => typeof path === "string" && /^assets\/[a-zA-Z0-9_./-]+$/.test(path) && !path.includes("..") ? path : "";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pageLayer = $("page-transition");
  const dialogLayer = $("dialog-transition");
  const canAnimate = () => !reducedMotion.matches && typeof Element.prototype.animate === "function";
  let navigationSequence = 0;
  let dialogSequence = 0;
  let pageAnimations = [];
  let dialogAnimations = [];

  function animatePanels(layer, from, to, duration) {
    return [...layer.querySelectorAll(".motion-panel")].map((panel, index) => panel.animate(
      [{ transform: `translateY(${from}%)` }, { transform: `translateY(${to}%)` }],
      { duration, delay: index * 35, easing: "cubic-bezier(.76,0,.24,1)", fill: "both" }
    ));
  }
  function hideLayer(layer, animations) {
    if (layer) {
      layer.hidden = true;
      layer.classList.remove("is-active", "is-intro");
    }
    animations.forEach(animation => animation.cancel());
  }
  // New navigation supersedes any transition still in progress.
  async function transitionSection(action) {
    const sequence = ++navigationSequence;
    pageAnimations.forEach(animation => animation.cancel());
    if (!pageLayer || !canAnimate()) {
      hideLayer(pageLayer, pageAnimations);
      action();
      return;
    }
    pageLayer.classList.remove("is-intro");
    pageLayer.hidden = false;
    pageLayer.classList.add("is-active");
    try {
      pageAnimations = animatePanels(pageLayer, 102, 0, 260);
      await Promise.allSettled(pageAnimations.map(animation => animation.finished));
      if (sequence !== navigationSequence) return;
      action();
      pageAnimations.forEach(animation => animation.cancel());
      pageAnimations = animatePanels(pageLayer, 0, -102, 390);
      await Promise.allSettled(pageAnimations.map(animation => animation.finished));
    } finally {
      if (sequence === navigationSequence) hideLayer(pageLayer, pageAnimations);
    }
  }
  function stopDialogMotion() {
    ++dialogSequence;
    hideLayer(dialogLayer, dialogAnimations);
    dialogAnimations = [];
  }
  async function revealDialog() {
    stopDialogMotion();
    if (!dialogLayer || !canAnimate()) return;
    const sequence = dialogSequence;
    dialogLayer.hidden = false;
    dialogLayer.classList.add("is-active");
    try {
      dialogAnimations = animatePanels(dialogLayer, 0, -102, 440);
      await Promise.allSettled(dialogAnimations.map(animation => animation.finished));
    } finally {
      if (sequence === dialogSequence) hideLayer(dialogLayer, dialogAnimations);
    }
  }
  if (pageLayer) {
    pageLayer.addEventListener("animationend", event => {
      if (event.animationName === "intro-layer-end" && !pageLayer.classList.contains("is-active")) hideLayer(pageLayer, []);
    });
    if (reducedMotion.matches) hideLayer(pageLayer, []);
  }

  if (profile) {
    text("english-name", profile.englishName);
    text("discipline", profile.discipline);
    text("intro", profile.intro);
    text("school", profile.school);
    text("degree", profile.degree);
    text("education-period", profile.educationPeriod);
    text("languages", profile.languages);
    text("hero-caption", profile.heroCaption);
    text("footer-copy", profile.footer);
    if (profile.name) {
      $("name").firstChild.textContent = profile.name;
      document.title = `${profile.name} ${profile.englishName || ""} — 个人作品集`;
    }
    if (profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      $("profile-email").href = `mailto:${profile.email}`;
      $("profile-email").firstChild.textContent = `${profile.email} `;
    }
    if (asset(profile.heroImage)) $("hero-image").src = asset(profile.heroImage);
    if (profile.heroAlt) $("hero-image").alt = profile.heroAlt;
    if (Array.isArray(profile.skills)) $("skills").replaceChildren(...profile.skills.map(s => make("li", "", s)));
  }
  $("year").textContent = new Date().getFullYear();

  const dialog = $("project-dialog");
  let activeButton = null;
  function closeProject() { dialog.close(); }
  function openProject(project, button) {
    activeButton = button;
    text("dialog-category", categories[project.category] || "作品");
    text("dialog-title", project.title);
    text("dialog-subtitle", project.subtitle || "作品展示");
    text("dialog-description", project.description || "");
    const figures = project.images.map((item, index) => {
      const figure = make("figure");
      const img = make("img");
      img.src = asset(item.src);
      img.alt = item.alt || project.title;
      img.loading = index === 0 ? "eager" : "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => {
        img.replaceWith(make("p", "image-error", "这张图片暂时无法加载，请检查网络后重新打开作品。"));
      }, { once: true });
      const caption = make("figcaption");
      caption.append(make("span", "", String(index + 1).padStart(2, "0")), make("span", "", item.alt || project.title));
      figure.append(img, caption);
      return figure;
    });
    $("dialog-images").replaceChildren(...figures);
    document.body.classList.add("modal-open");
    dialog.showModal();
    dialog.scrollTop = 0;
    revealDialog();
    $("close-dialog").focus({ preventScroll: true });
  }
  $("close-dialog").addEventListener("click", closeProject);
  dialog.addEventListener("close", () => {
    stopDialogMotion();
    document.body.classList.remove("modal-open");
    if (activeButton) activeButton.focus({ preventScroll: true });
  });
  let startedOutside = false;
  dialog.addEventListener("pointerdown", (event) => {
    const r = dialog.getBoundingClientRect();
    startedOutside = event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
  });
  dialog.addEventListener("click", (event) => {
    const r = dialog.getBoundingClientRect();
    if (startedOutside && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) closeProject();
    startedOutside = false;
  });

  function createCard(project, index) {
    const article = make("article", "work-card");
    const button = make("button", "work-button");
    button.type = "button";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-label", `查看${project.title}，${project.images.length}张作品图`);
    const visual = make("span", "work-visual");
    const img = make("img");
    img.src = asset(project.cover);
    img.alt = project.images.find(i => i.src === project.cover)?.alt || project.title;
    img.loading = "lazy";
    img.decoding = "async";
    const icon = make("span", "work-open", "↗");
    icon.setAttribute("aria-hidden", "true");
    visual.append(img, icon);
    const caption = make("span", "work-caption");
    const number = make("span", "work-index", String(index + 1).padStart(2, "0"));
    number.setAttribute("aria-hidden", "true");
    const titleGroup = make("span");
    titleGroup.append(make("span", "work-title", project.title), make("span", "work-subtitle", project.subtitle));
    caption.append(number, titleGroup);
    if (project.images.length > 1) caption.append(make("span", "work-count", `${String(project.images.length).padStart(2, "0")} IMAGES`));
    button.append(visual, caption);
    button.addEventListener("click", () => openProject(project, button));
    article.append(button);
    return article;
  }
  for (const category of Object.keys(categories)) {
    const container = $(`${category}-grid`);
    const items = projects.filter(p => p.category === category && Array.isArray(p.images) && p.images.length);
    container.replaceChildren(...items.map(createCard));
    if (!items.length) container.append(make("p", "secondary", "作品整理中。"));
  }

  const sectionIds = ["about", "fashion", "art"];
  const navLinks = [...document.querySelectorAll("nav a")];
  let tick = false;
  function updateNavigation() {
    const headerHeight = document.querySelector(".site-header").offsetHeight + 70;
    let active = "about";
    for (const id of sectionIds) if ($(id).getBoundingClientRect().top <= headerHeight) active = id;
    navLinks.forEach(link => {
      if (link.getAttribute("href") === `#${active}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    tick = false;
  }
  window.addEventListener("scroll", () => { if (!tick) { requestAnimationFrame(updateNavigation); tick = true; } }, { passive: true });
  window.addEventListener("resize", updateNavigation, { passive: true });
  document.querySelectorAll('a[href="#about"], a[href="#fashion"], a[href="#art"]').forEach(link => {
    link.addEventListener("click", event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = link.getAttribute("href");
      const section = $(hash.slice(1));
      if (!section) return;
      event.preventDefault();
      transitionSection(() => {
        if (window.location.hash !== hash) {
          try { history.pushState(null, "", hash); }
          catch { window.location.hash = hash; }
        }
        section.scrollIntoView({ behavior: "instant", block: "start" });
        if (event.detail === 0) {
          const heading = section.querySelector("h1, h2");
          if (heading) {
            heading.setAttribute("tabindex", "-1");
            heading.focus({ preventScroll: true });
          }
        }
        updateNavigation();
      });
    });
  });
  updateNavigation();
})();
