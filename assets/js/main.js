(() => {
  "use strict";
  const root = document.documentElement;
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-panel]");
  if (menu) menu.hidden = true;
  const main = document.querySelector("main");
  const footer = document.querySelector(".site-footer");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 1320px)");
  const filename = location.pathname.split("/").pop() || "index.html";
  const page = filename.includes(".") ? filename : `${filename}.html`;
  const pageParams = new URLSearchParams(location.search);
  const focusable = 'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';
  const sectorLinks = [...document.querySelectorAll("[data-sector-link]")];
  const sectorSections = sectorLinks.map(link => document.getElementById(link.hash.slice(1)));

  document.querySelectorAll("[data-year]").forEach(node => { node.textContent = new Date().getFullYear(); });
  document.querySelectorAll("[data-nav]").forEach(link => {
    if (link.getAttribute("href").split("#")[0] === page) link.setAttribute("aria-current", "page");
  });

  function finishClose() {
    if (!menu || menu.classList.contains("is-open")) return;
    menu.hidden = true;
  }
  function setMenu(open, restoreFocus = false) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    document.body.classList.toggle("nav-open", open);
    if (main) main.inert = open;
    if (footer) footer.inert = open;
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
      menu.querySelector(focusable)?.focus();
    } else {
      menu.classList.remove("is-open");
      menu.addEventListener("transitionend", finishClose, { once: true });
      window.setTimeout(finishClose, 380);
      if (restoreFocus) toggle.focus();
    }
  }
  if (toggle && menu) {
    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true", true));
    menu.addEventListener("click", event => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", event => {
      if (menu.hidden) return;
      if (event.key === "Escape") { event.preventDefault(); setMenu(false, true); }
      if (event.key !== "Tab") return;
      const nodes = [toggle, ...menu.querySelectorAll(focusable)];
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || !nodes.includes(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !nodes.includes(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    });
    desktop.addEventListener("change", event => { if (event.matches) setMenu(false); });
  }

  let dismissedMenu = null;
  function dismissMenus(item) {
    if (!header) return;
    dismissedMenu = item || null;
    header.classList.add("menus-closed");
  }
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !desktop.matches || !header || header.classList.contains("menus-closed")) return;
    const open = [...header.querySelectorAll("[data-nav-item]")].find(item => item.matches(":hover, :focus-within"));
    if (!open) return;
    event.preventDefault();
    dismissMenus(open);
    open.querySelector(".nav-link")?.focus();
  });
  header?.addEventListener("focusin", event => {
    const item = event.target.closest("[data-nav-item]");
    if (item && item !== dismissedMenu) {
      header.classList.remove("menus-closed");
      dismissedMenu = null;
    }
  });
  header?.addEventListener("pointerover", event => {
    if (!event.target.closest("[data-nav-item]")) return;
    header.classList.remove("menus-closed");
    dismissedMenu = null;
  });

  let scheduled = false;
  function updateScroll() {
    scheduled = false;
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
    if (!sectorLinks.length) return;
    const offset = (header?.getBoundingClientRect().height || 0) + 150;
    let active = -1;
    sectorSections.forEach((section, i) => { if (section && section.getBoundingClientRect().top <= offset) active = i; });
    sectorLinks.forEach((link, i) => {
      if (i === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();

  // Core content is visible until the observer has been installed successfully.
  if ("IntersectionObserver" in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-in"); observer.unobserve(entry.target); }
    }), { threshold: 0, rootMargin: "0px 0px -35px 0px" });
    document.querySelectorAll(".reveal").forEach(node => observer.observe(node));
    root.classList.add("motion-ready");
    motion.addEventListener("change", event => { if (event.matches) root.classList.remove("motion-ready"); });
  }

  const poiseFeatures = [];
  document.querySelectorAll("[data-rail]").forEach(rail => {
    const track = rail.querySelector("[data-rail-track]");
    const previous = rail.querySelector("[data-rail-prev]");
    const next = rail.querySelector("[data-rail-next]");
    function update() {
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }
    function move(direction) {
      const card = track.querySelector(".program-card");
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: motion.matches ? "instant" : "smooth" });
    }
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
  document.querySelectorAll("[data-poise]").forEach(feature => {
    const controls = feature.querySelector(".poise-controls");
    const tabs = [...feature.querySelectorAll("[data-poise-tab]")];
    const panels = [...feature.querySelectorAll("[data-poise-panel]")];
    controls.setAttribute("role", "tablist");
    function select(index, focus = false) {
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        panels[i].hidden = i !== index;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => {
      tab.id = `${panels[index].id}-tab`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panels[index].id);
      panels[index].setAttribute("role", "tabpanel");
      panels[index].setAttribute("aria-labelledby", tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener("click", event => { event.preventDefault(); select(index); });
      tab.addEventListener("keydown", event => {
        const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
        if (event.key in keys) { event.preventDefault(); select(keys[event.key], true); }
      });
    });
    select(0);
    poiseFeatures.push({ panels, select });
  });

  // Only known select names and their existing option values may prefill a form.
  function applyPrefills(container, params) {
    ["training_interest", "program_interest", "industry"].forEach(name => {
      const value = params.get(name);
      if (!value) return;
      container.querySelectorAll(`select[name="${name}"]`).forEach(select => {
        if ([...select.options].some(option => option.value === value)) select.value = value;
      });
    });
  }
  applyPrefills(document, pageParams);

  function errorMessage(field) {
    if (field.validity.valueMissing) return field.type === "checkbox" ? "Please give permission for Prestige to contact you." : "Please complete this field.";
    if (field.validity.typeMismatch) return "Enter a valid email address.";
    if (field.validity.rangeUnderflow || field.validity.stepMismatch || field.validity.badInput) return "Enter a whole number of at least 1.";
    if (field.validity.customError) return "Please enter a value, rather than spaces.";
    return "Please check this field.";
  }
  document.querySelectorAll("[data-phase1-form]").forEach(form => {
    const fields = [...form.querySelectorAll("input, select, textarea")].filter(field => field.type !== "hidden" && !field.classList.contains("hp-input"));
    const source = form.elements.namedItem("source_page");
    if (source) source.value = page;
    ["utm_source", "utm_medium", "utm_campaign"].forEach(key => {
      const field = form.elements.namedItem(key);
      if (field && pageParams.has(key)) field.value = pageParams.get(key).slice(0, 120);
    });
    const notice = form.querySelector("[data-form-notice]");
    function validate(field) {
      field.setCustomValidity("");
      if (field.required && ["text", "textarea", "tel"].includes(field.type) && field.value && !field.value.trim()) field.setCustomValidity("Whitespace only");
      const valid = field.checkValidity();
      const error = form.querySelector(`[data-error-for="${field.id}"]`);
      if (valid) field.removeAttribute("aria-invalid");
      else field.setAttribute("aria-invalid", "true");
      if (error) error.textContent = valid ? "" : errorMessage(field);
      return valid;
    }
    form.addEventListener("submit", event => {
      event.preventDefault();
      let firstInvalid = null;
      fields.forEach(field => { if (!validate(field) && !firstInvalid) firstInvalid = field; });
      notice.hidden = Boolean(firstInvalid);
      if (firstInvalid) firstInvalid.focus();
      else notice.focus();
    });
    form.addEventListener("input", event => {
      if (fields.includes(event.target) && event.target.hasAttribute("aria-invalid")) validate(event.target);
      notice.hidden = true;
    });
    // Enable only after the no-network submit handler is attached.
    form.querySelectorAll('[type="submit"]').forEach(button => { button.disabled = false; });
  });

  const returnFocus = new WeakMap();
  function openModal(name, opener, params = pageParams) {
    const dialog = document.querySelector(`dialog[data-modal="${name}"]`);
    if (!dialog || typeof dialog.showModal !== "function") return false;
    if (dialog.open) return true;
    const fromMenu = menu?.contains(opener);
    setMenu(false);
    applyPrefills(dialog, params);
    returnFocus.set(dialog, fromMenu ? toggle : (opener || document.activeElement));
    dialog.querySelector("[data-form-notice]").hidden = true;
    dialog.showModal();
    document.body.classList.add("dialog-open");
    dialog.querySelector(".modal-panel").scrollTop = 0;
    return true;
  }
  document.addEventListener("click", event => {
    const opener = event.target.closest("[data-open-modal]");
    if (opener && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
      const params = new URL(opener.href, location.href).searchParams;
      if (openModal(opener.dataset.openModal, opener, params)) {
        event.preventDefault();
        if (opener.closest(".nav-panel, .mobile-sub")) dismissMenus(opener.closest("[data-nav-item]"));
      }
    }
    const closer = event.target.closest("[data-close-modal]");
    if (closer) closer.closest("dialog").close();
  });
  document.querySelectorAll("dialog.modal").forEach(dialog => {
    let backdropDown = false;
    function outside(event) {
      const bounds = dialog.getBoundingClientRect();
      return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    }
    dialog.addEventListener("pointerdown", event => { backdropDown = event.target === dialog && outside(event); });
    dialog.addEventListener("click", event => { if (backdropDown && event.target === dialog && outside(event)) dialog.close(); backdropDown = false; });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      const target = returnFocus.get(dialog);
      if (target?.isConnected) target.focus({ preventScroll: true });
    });
  });

  function followHash() {
    const id = location.hash.slice(1);
    poiseFeatures.forEach(({ panels, select }) => {
      const index = panels.findIndex(panel => panel.id === id);
      if (index >= 0) select(index);
    });
    const target = document.getElementById(id);
    // Program links expose the details they lead to, including on initial load.
    target?.querySelector(".program-details")?.setAttribute("open", "");
    const names = { "discovery-form": "discovery", discovery: "discovery", "interest-form": "enrollment", interest: "enrollment" };
    if (names[id] && !target) openModal(names[id]);
  }
  followHash();
  window.addEventListener("hashchange", followHash);
  root.classList.add("js");
})();
