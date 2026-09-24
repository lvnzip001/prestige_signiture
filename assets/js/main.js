(function () {
  document.documentElement.classList.add("js");

  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-nav-panel]");
  var yearNodes = document.querySelectorAll("[data-year]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  yearNodes.forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  var path = window.location.pathname.split("/").pop() || "index.html";
  if (path === "") path = "index.html";
  document.querySelectorAll("[data-nav]").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    var target = href.split("#")[0];
    if (target === path) link.setAttribute("aria-current", "page");
  });

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    document.body.classList.toggle("nav-open", open);
    if (open) {
      var first = panel.querySelector("a, button");
      if (first) first.focus();
    }
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    panel.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (!link) return;
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) === "#") setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1280 && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
      }
    });
  }

  document.querySelectorAll("[data-accordion]").forEach(function (button) {
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      var region = document.getElementById(button.getAttribute("aria-controls"));
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (region) region.hidden = expanded;
    });
  });

  if (!reduceMotion) {
    var reveals = document.querySelectorAll(".reveal");
    if (reveals.length && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16 }
      );
      reveals.forEach(function (node) {
        observer.observe(node);
      });
    }
  }

  function messageFor(field) {
    if (field.validity.valueMissing) {
      return field.type === "checkbox"
        ? "Consent is required before Prestige can contact you."
        : "This field is required.";
    }
    if (field.validity.typeMismatch) return "Enter a valid email address.";
    return "Please check this field.";
  }

  var params = new URLSearchParams(window.location.search);
  ["utm_source", "utm_medium", "utm_campaign"].forEach(function (key) {
    var value = params.get(key);
    if (!value) return;
    document.querySelectorAll('input[name="' + key + '"]').forEach(function (input) {
      input.value = value.slice(0, 120);
    });
  });

  document.querySelectorAll("[data-phase1-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var notice = form.querySelector("[data-form-notice]");
      var fields = form.querySelectorAll("input, select, textarea");
      var firstInvalid = null;
      var valid = true;

      fields.forEach(function (field) {
        if (field.type === "hidden" || field.classList.contains("hp-input")) return;
        var error = form.querySelector('[data-error-for="' + field.id + '"]');
        field.removeAttribute("aria-invalid");
        if (error) error.textContent = "";
        if (!field.checkValidity()) {
          valid = false;
          field.setAttribute("aria-invalid", "true");
          if (error) error.textContent = messageFor(field);
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!valid) {
        if (notice) notice.hidden = true;
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      if (notice) {
        notice.hidden = false;
        notice.focus();
      }
    });
  });

  var hashModals = {
    "#discovery-form": "discovery",
    "#discovery": "discovery",
    "#interest-form": "enrollment",
    "#interest": "enrollment"
  };

  function openModal(name, preset) {
    var dialog = document.querySelector('dialog[data-modal="' + name + '"]');
    if (!dialog || typeof dialog.showModal !== "function") return;
    if (toggle && panel && toggle.getAttribute("aria-expanded") === "true") setMenu(false);
    var source = dialog.querySelector('input[name="source_page"]');
    if (source) {
      var page = window.location.pathname.split("/").pop() || "index.html";
      source.value = page || "index.html";
    }
    if (preset && preset.field) {
      var field = dialog.querySelector('[name="' + preset.field + '"]');
      if (field) field.value = preset.value || "";
    }
    if (!dialog.open) dialog.showModal();
  }

  document.addEventListener("click", function (event) {
    var opener = event.target.closest("[data-open-modal]");
    if (opener) {
      event.preventDefault();
      openModal(opener.getAttribute("data-open-modal"), {
        field: opener.getAttribute("data-preset-field"),
        value: opener.getAttribute("data-preset-value")
      });
      return;
    }
    var closer = event.target.closest("[data-close-modal]");
    if (closer) {
      var dialog = closer.closest("dialog");
      if (dialog) dialog.close();
    }
  });

  document.querySelectorAll("dialog.modal").forEach(function (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
  });

  function openFromHash() {
    var name = hashModals[window.location.hash];
    if (name) openModal(name);
  }

  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
