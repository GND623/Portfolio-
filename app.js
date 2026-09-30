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
    $("close-dialog").focus({ preventScroll: true });
  }
  $("close-dialog").addEventListener("click", closeProject);
  dialog.addEventListener("close", () => {
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
  updateNavigation();
})();
