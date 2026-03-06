(function () {
  const sections = Array.from(document.querySelectorAll(".site-section[id]"));
  const sectionMap = new Map(sections.map(function (section) { return [section.id, section]; }));
  const navLinks = Array.from(document.querySelectorAll(".site-nav a[data-section]"));
  const sectionSwitchers = Array.from(document.querySelectorAll("[data-section]"));
  const defaultSection = "home";

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.dataset.section === id);
    });
  }

  function showSection(id, options) {
    const opts = options || {};
    const targetId = sectionMap.has(id) ? id : defaultSection;
    sections.forEach(function (section) {
      section.classList.toggle("active-page", section.id === targetId);
    });
    setActiveNav(targetId);
    if (opts.resetScroll !== false) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    if (opts.updateHash !== false) {
      history.replaceState(null, "", "#" + targetId);
    }
  }

  if (sections.length) {
    sectionSwitchers.forEach(function (switcher) {
      switcher.addEventListener("click", function (event) {
        event.preventDefault();
        const sectionId = switcher.dataset.section || defaultSection;
        showSection(sectionId, { resetScroll: true, updateHash: true });
      });
    });

    const initial = window.location.hash.replace("#", "") || defaultSection;
    showSection(initial, { resetScroll: false, updateHash: false });
  }

  const filterButtons = Array.from(document.querySelectorAll(".filter"));
  const cards = Array.from(document.querySelectorAll(".project-card[data-category]"));
  const previewButtons = Array.from(document.querySelectorAll("[data-preview]"));
  const filterLabel = document.getElementById("filterLabel");
  const viewer = document.getElementById("projectViewer");
  const viewerImage = document.getElementById("viewerImage");
  const viewerTitle = document.getElementById("viewerTitle");
  const viewerClose = document.getElementById("viewerClose");
  const viewerPrev = document.getElementById("viewerPrev");
  const viewerNext = document.getElementById("viewerNext");

  if (!filterButtons.length || !cards.length || !previewButtons.length || !viewer || !viewerImage || !viewerTitle || !viewerClose || !viewerPrev || !viewerNext) {
    return;
  }

  let activeIndex = 0;

  function visiblePreviewButtons() {
    return previewButtons.filter(function (button) {
      const card = button.closest(".project-card");
      return card ? !card.classList.contains("hidden") : true;
    });
  }

  function openByIndex(index) {
    const pool = visiblePreviewButtons();
    if (!pool.length) return;
    activeIndex = (index + pool.length) % pool.length;
    const target = pool[activeIndex];
    const src = target.getAttribute("data-preview");
    const title = target.getAttribute("data-title") || "Project Preview";
    viewerImage.src = src;
    viewerImage.alt = title + " preview";
    viewerTitle.textContent = title;
    viewer.classList.add("active");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    viewer.classList.remove("active");
    viewer.setAttribute("aria-hidden", "true");
    viewerImage.src = "";
    document.body.style.overflow = "";
  }

  previewButtons.forEach(function (button, idx) {
    button.addEventListener("click", function () {
      const pool = visiblePreviewButtons();
      const localIndex = pool.indexOf(button);
      openByIndex(localIndex > -1 ? localIndex : idx);
    });
  });

  viewerPrev.addEventListener("click", function () { openByIndex(activeIndex - 1); });
  viewerNext.addEventListener("click", function () { openByIndex(activeIndex + 1); });
  viewerClose.addEventListener("click", closeViewer);
  viewer.addEventListener("click", function (event) { if (event.target === viewer) closeViewer(); });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("active");
        item.setAttribute("aria-selected", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      const filter = button.dataset.filter || "all";
      cards.forEach(function (card) {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !show);
      });
      if (filterLabel) {
        filterLabel.textContent = filter === "all" ? "Showing all projects" : "Showing " + filter.toUpperCase() + " projects";
      }
      if (viewer.classList.contains("active")) closeViewer();
    });
  });

  document.addEventListener("keydown", function (event) {
    if (!viewer.classList.contains("active")) return;
    if (event.key === "Escape") closeViewer();
    if (event.key === "ArrowLeft") openByIndex(activeIndex - 1);
    if (event.key === "ArrowRight") openByIndex(activeIndex + 1);
  });
})();
