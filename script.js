const DEFAULT_BRANDS = [
  "Ely Roofing",
  "TWF",
  "Cottage Wellness",
  "Bullens Jewellery",
  "N-Ergise",
  "Hemstocks Jewellery",
  "Tannery",
  "Newrooms",
  "Blossoms",
  "Dr Libby",
  "Poringland Dental",
  "Pollard and Read",
  "Studio 5"
];

const STORAGE_KEY = "contentCalendarApprovalAppV1";

const state = loadState();
let currentBrand = state.brands[0];
let currentMonth = getCurrentMonth();
let editingId = null;
let currentLayout = "board";

const els = {
  brandSelect: document.querySelector("#brandSelect"),
  monthPicker: document.querySelector("#monthPicker"),
  calendarBoard: document.querySelector("#calendarBoard"),
  calendarTableWrap: document.querySelector("#calendarTableWrap"),
  calendarTableBody: document.querySelector("#calendarTableBody"),
  addContentBtn: document.querySelector("#addContentBtn"),
  contentDialog: document.querySelector("#contentDialog"),
  contentForm: document.querySelector("#contentForm"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelDialogBtn: document.querySelector("#cancelDialogBtn"),
  deleteContentBtn: document.querySelector("#deleteContentBtn"),
  duplicateContentBtn: document.querySelector("#duplicateContentBtn"),
  statusFilter: document.querySelector("#statusFilter"),
  typeFilter: document.querySelector("#typeFilter"),
  searchInput: document.querySelector("#searchInput"),
  totalCount: document.querySelector("#totalCount"),
  carouselCount: document.querySelector("#carouselCount"),
  reelCount: document.querySelector("#reelCount"),
  approvedCount: document.querySelector("#approvedCount"),
  totalProgress: document.querySelector("#totalProgress"),
  carouselProgress: document.querySelector("#carouselProgress"),
  reelProgress: document.querySelector("#reelProgress"),
  approvedProgress: document.querySelector("#approvedProgress"),
  exportDataBtn: document.querySelector("#exportDataBtn"),
  importDataInput: document.querySelector("#importDataInput"),
  resetMonthBtn: document.querySelector("#resetMonthBtn"),
  brandOverviewList: document.querySelector("#brandOverviewList"),
  statusBreakdown: document.querySelector("#statusBreakdown"),
  brandManagementList: document.querySelector("#brandManagementList"),
  addBrandForm: document.querySelector("#addBrandForm"),
  newBrandInput: document.querySelector("#newBrandInput"),
  targetTotal: document.querySelector("#targetTotal"),
  targetCarousel: document.querySelector("#targetCarousel"),
  targetReel: document.querySelector("#targetReel"),
  saveTargetsBtn: document.querySelector("#saveTargetsBtn"),
  cardTemplate: document.querySelector("#contentCardTemplate")
};

init();

function init() {
  els.monthPicker.value = currentMonth;
  els.targetTotal.value = state.targets.total;
  els.targetCarousel.value = state.targets.carousel;
  els.targetReel.value = state.targets.reel;

  bindEvents();
  renderAll();
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.brands) && saved.data) {
      return {
        brands: saved.brands,
        data: saved.data,
        targets: saved.targets || { total: 12, carousel: 8, reel: 4 }
      };
    }
  } catch (error) {
    console.warn("Could not load saved data", error);
  }

  return {
    brands: [...DEFAULT_BRANDS],
    data: {},
    targets: { total: 12, carousel: 8, reel: 4 }
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthItems(brand = currentBrand, month = currentMonth) {
  state.data[brand] ??= {};
  state.data[brand][month] ??= [];
  return state.data[brand][month];
}

function renderAll() {
  renderBrandSelect();
  renderCalendar();
  renderOverview();
  renderBrandManagement();
  renderTargets();
}

function renderBrandSelect() {
  els.brandSelect.innerHTML = "";
  state.brands.forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    option.selected = brand === currentBrand;
    els.brandSelect.appendChild(option);
  });
}

function getFilteredItems() {
  const status = els.statusFilter.value;
  const type = els.typeFilter.value;
  const query = els.searchInput.value.trim().toLowerCase();

  return getMonthItems().filter((item) => {
    const matchesStatus = status === "all" || item.status === status;
    const matchesType = type === "all" || item.type === type;
    const haystack = [
      item.title,
      item.contentFocus,
      item.caption,
      item.notes,
      item.visual,
      item.pillar,
      item.assignee,
      item.platform
    ].join(" ").toLowerCase();

    return matchesStatus && matchesType && (!query || haystack.includes(query));
  });
}

function renderCalendar() {
  const items = getFilteredItems();
  renderSummary();
  renderBoard(items);
  renderTable(items);
}

function renderSummary() {
  const items = getMonthItems();
  const total = items.length;
  const carousels = items.filter((item) => item.type === "Carousel").length;
  const reels = items.filter((item) => item.type === "Reel").length;
  const approved = items.filter((item) => item.status === "Approved").length;

  els.totalCount.textContent = `${total} / ${state.targets.total}`;
  els.carouselCount.textContent = `${carousels} / ${state.targets.carousel}`;
  els.reelCount.textContent = `${reels} / ${state.targets.reel}`;
  els.approvedCount.textContent = approved;

  els.totalProgress.style.width = percent(total, state.targets.total);
  els.carouselProgress.style.width = percent(carousels, state.targets.carousel);
  els.reelProgress.style.width = percent(reels, state.targets.reel);
  els.approvedProgress.style.width = percent(approved, total || 1);
}

function percent(value, target) {
  return `${Math.min(100, Math.round((value / Math.max(target, 1)) * 100))}%`;
}

function renderBoard(items) {
  els.calendarBoard.innerHTML = "";

  for (let week = 1; week <= 4; week += 1) {
    const weekItems = items
      .filter((item) => Number(item.week) === week)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    const section = document.createElement("section");
    section.className = "week-column";
    section.dataset.week = week;
    section.innerHTML = `
      <div class="week-header">
        <h3>WEEK ${week}</h3>
        <span>${weekItems.length} content${weekItems.length === 1 ? "" : "s"}</span>
      </div>
      <div class="week-content-list"></div>
    `;

    const list = section.querySelector(".week-content-list");

    if (!weekItems.length) {
      const empty = document.createElement("div");
      empty.className = "empty-week";
      empty.innerHTML = `<div><strong>No content added</strong><br><small>Target: 2 carousels + 1 reel</small></div>`;
      list.appendChild(empty);
    } else {
      weekItems.forEach((item) => list.appendChild(buildCard(item)));
    }

    els.calendarBoard.appendChild(section);
  }
}

function buildCard(item) {
  const node = els.cardTemplate.content.firstElementChild.cloneNode(true);

  const typeBadge = node.querySelector(".type-badge");
  typeBadge.textContent = item.type;
  typeBadge.dataset.type = item.type;
  node.dataset.status = item.status;
  node.querySelector(".card-title").textContent = item.title || "Untitled content";
  node.querySelector(".card-caption").textContent = item.contentFocus || item.caption || item.visual || "No content focus added yet.";
  node.querySelector(".date-text").textContent = item.date ? formatDate(item.date) : "No date";
  node.querySelector(".platform-text").textContent = item.platform || "No platform";

  const statusPill = node.querySelector(".status-pill");
  statusPill.textContent = item.status;
  statusPill.dataset.status = item.status;

  node.querySelector(".assignee-text").textContent = item.assignee ? `Assigned: ${item.assignee}` : "";
  node.querySelector(".client-note-preview").textContent = item.notes ? `Client note: ${item.notes}` : "";

  node.querySelector(".edit-btn").addEventListener("click", () => openEditDialog(item.id));

  node.querySelectorAll(".status-actions button").forEach((button) => {
    button.addEventListener("click", () => {
      updateStatus(item.id, button.dataset.status);
    });
  });

  return node;
}

function renderTable(items) {
  els.calendarTableBody.innerHTML = "";

  items
    .slice()
    .sort((a, b) => Number(a.week) - Number(b.week) || (a.date || "").localeCompare(b.date || ""))
    .forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>Week ${escapeHtml(item.week)}</td>
        <td>${item.date ? formatDate(item.date) : "—"}</td>
        <td><strong>${escapeHtml(item.title || "Untitled")}</strong><br><small>${escapeHtml(item.pillar || "")}</small></td>
        <td>${escapeHtml(item.type)}</td>
        <td>${escapeHtml(item.platform || "—")}</td>
        <td><span class="status-pill" data-status="${escapeHtml(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.notes || "—")}</td>
        <td><button class="ghost-btn table-edit">Edit</button></td>
      `;
      row.querySelector(".table-edit").addEventListener("click", () => openEditDialog(item.id));
      els.calendarTableBody.appendChild(row);
    });
}

function openNewDialog(week = 1) {
  editingId = null;
  els.contentForm.reset();
  document.querySelector("#dialogTitle").textContent = "Add Content";
  document.querySelector("#contentWeek").value = week;
  document.querySelector("#contentPlatform").value = "Instagram + Facebook";
  document.querySelector("#contentStatus").value = "Pending";
  els.deleteContentBtn.classList.add("hidden");
  els.duplicateContentBtn.classList.add("hidden");
  els.contentDialog.showModal();
}

function openEditDialog(id) {
  const item = getMonthItems().find((entry) => entry.id === id);
  if (!item) return;

  editingId = id;
  document.querySelector("#dialogTitle").textContent = "Edit Content";
  document.querySelector("#contentId").value = item.id;
  document.querySelector("#contentWeek").value = item.week;
  document.querySelector("#contentDate").value = item.date || "";
  document.querySelector("#contentTitle").value = item.title || "";
  document.querySelector("#contentType").value = item.type || "Carousel";
  document.querySelector("#contentPlatform").value = item.platform || "Instagram + Facebook";
  document.querySelector("#contentPillar").value = item.pillar || "";
  document.querySelector("#contentFocus").value = item.contentFocus || "";
  document.querySelector("#contentAssignee").value = item.assignee || "";
  document.querySelector("#contentCaption").value = item.caption || "";
  document.querySelector("#contentVisual").value = item.visual || "";
  document.querySelector("#contentLink").value = item.link || "";
  document.querySelector("#contentStatus").value = item.status || "Pending";
  document.querySelector("#contentNotes").value = item.notes || "";

  els.deleteContentBtn.classList.remove("hidden");
  els.duplicateContentBtn.classList.remove("hidden");
  els.contentDialog.showModal();
}

function closeDialog() {
  els.contentDialog.close();
  editingId = null;
}

function saveContentFromForm(event) {
  event.preventDefault();

  const item = {
    id: editingId || crypto.randomUUID(),
    week: Number(document.querySelector("#contentWeek").value),
    date: document.querySelector("#contentDate").value,
    title: document.querySelector("#contentTitle").value.trim(),
    type: document.querySelector("#contentType").value,
    platform: document.querySelector("#contentPlatform").value,
    pillar: document.querySelector("#contentPillar").value.trim(),
    contentFocus: document.querySelector("#contentFocus").value.trim(),
    assignee: document.querySelector("#contentAssignee").value.trim(),
    caption: document.querySelector("#contentCaption").value.trim(),
    visual: document.querySelector("#contentVisual").value.trim(),
    link: document.querySelector("#contentLink").value.trim(),
    status: document.querySelector("#contentStatus").value,
    notes: document.querySelector("#contentNotes").value.trim(),
    updatedAt: new Date().toISOString()
  };

  const items = getMonthItems();
  const existingIndex = items.findIndex((entry) => entry.id === item.id);

  if (existingIndex >= 0) {
    items[existingIndex] = item;
  } else {
    items.push(item);
  }

  saveState();
  closeDialog();
  renderAll();
}

function updateStatus(id, status) {
  const item = getMonthItems().find((entry) => entry.id === id);
  if (!item) return;
  item.status = status;
  item.updatedAt = new Date().toISOString();
  saveState();
  renderAll();
}

function deleteEditingContent() {
  if (!editingId) return;
  if (!confirm("Delete this content item?")) return;

  const items = getMonthItems();
  const index = items.findIndex((entry) => entry.id === editingId);
  if (index >= 0) items.splice(index, 1);

  saveState();
  closeDialog();
  renderAll();
}

function duplicateEditingContent() {
  if (!editingId) return;
  const source = getMonthItems().find((entry) => entry.id === editingId);
  if (!source) return;

  const duplicate = {
    ...source,
    id: crypto.randomUUID(),
    title: `${source.title} (Copy)`,
    status: "Pending",
    notes: "",
    updatedAt: new Date().toISOString()
  };

  getMonthItems().push(duplicate);
  saveState();
  closeDialog();
  renderAll();
}

function renderOverview() {
  els.brandOverviewList.innerHTML = "";

  state.brands.forEach((brand) => {
    const items = getMonthItems(brand, currentMonth);
    const approved = items.filter((item) => item.status === "Approved").length;

    const item = document.createElement("div");
    item.className = "brand-overview-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(brand)}</strong>
        <div class="progress" style="margin-top:8px; width:220px; max-width:100%;">
          <span style="width:${percent(items.length, state.targets.total)}"></span>
        </div>
      </div>
      <div class="brand-overview-meta">
        ${items.length}/${state.targets.total} total<br>
        ${approved} approved
      </div>
    `;
    els.brandOverviewList.appendChild(item);
  });

  const currentItems = getMonthItems();
  const statuses = ["Pending", "Approved", "Revise", "Rejected"];
  els.statusBreakdown.innerHTML = statuses.map((status) => {
    const count = currentItems.filter((item) => item.status === status).length;
    return `
      <div class="status-row">
        <span>${status}</span>
        <strong>${count}</strong>
      </div>
    `;
  }).join("");
}

function renderBrandManagement() {
  els.brandManagementList.innerHTML = "";

  state.brands.forEach((brand) => {
    const row = document.createElement("div");
    row.className = "brand-management-item";
    row.innerHTML = `
      <span>${escapeHtml(brand)}</span>
      <button class="remove-brand-btn" type="button">Remove</button>
    `;
    row.querySelector("button").addEventListener("click", () => removeBrand(brand));
    els.brandManagementList.appendChild(row);
  });
}

function addBrand(event) {
  event.preventDefault();
  const name = els.newBrandInput.value.trim();
  if (!name) return;

  if (state.brands.some((brand) => brand.toLowerCase() === name.toLowerCase())) {
    alert("That brand already exists.");
    return;
  }

  state.brands.push(name);
  currentBrand = name;
  els.newBrandInput.value = "";
  saveState();
  renderAll();
}

function removeBrand(brand) {
  if (state.brands.length === 1) {
    alert("At least one brand is required.");
    return;
  }

  if (!confirm(`Remove ${brand}? Its saved calendar data will also be removed.`)) return;

  state.brands = state.brands.filter((item) => item !== brand);
  delete state.data[brand];

  if (currentBrand === brand) {
    currentBrand = state.brands[0];
  }

  saveState();
  renderAll();
}

function renderTargets() {
  document.querySelector(".sidebar-card strong").textContent = `${state.targets.total} contents`;
  document.querySelector(".sidebar-card small").textContent = `${state.targets.carousel} carousels · ${state.targets.reel} reels`;
}

function saveTargets() {
  const total = Number(els.targetTotal.value);
  const carousel = Number(els.targetCarousel.value);
  const reel = Number(els.targetReel.value);

  if (total < 1 || carousel < 0 || reel < 0) {
    alert("Please enter valid target numbers.");
    return;
  }

  state.targets = { total, carousel, reel };
  saveState();
  renderAll();
}

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "Content Calendar Approval Dashboard",
    ...state
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `content-calendar-backup-${currentMonth}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported.brands) || !imported.data) {
        throw new Error("Invalid backup structure");
      }

      state.brands = imported.brands;
      state.data = imported.data;
      state.targets = imported.targets || { total: 12, carousel: 8, reel: 4 };
      currentBrand = state.brands[0];
      saveState();
      renderAll();
      alert("Content calendar data imported successfully.");
    } catch (error) {
      alert("This file is not a valid content calendar backup.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function resetCurrentMonth() {
  if (!confirm(`Reset all content for ${currentBrand} in ${currentMonth}?`)) return;
  state.data[currentBrand] ??= {};
  state.data[currentBrand][currentMonth] = [];
  saveState();
  renderAll();
}

function bindEvents() {
  els.brandSelect.addEventListener("change", (event) => {
    currentBrand = event.target.value;
    renderAll();
  });

  els.monthPicker.addEventListener("change", (event) => {
    currentMonth = event.target.value || getCurrentMonth();
    renderAll();
  });

  els.addContentBtn.addEventListener("click", () => openNewDialog());
  els.closeDialogBtn.addEventListener("click", closeDialog);
  els.cancelDialogBtn.addEventListener("click", closeDialog);
  els.contentForm.addEventListener("submit", saveContentFromForm);
  els.deleteContentBtn.addEventListener("click", deleteEditingContent);
  els.duplicateContentBtn.addEventListener("click", duplicateEditingContent);

  [els.statusFilter, els.typeFilter].forEach((el) => {
    el.addEventListener("change", renderCalendar);
  });
  els.searchInput.addEventListener("input", renderCalendar);

  document.querySelectorAll(".toggle-btn").forEach((button) => {
    button.addEventListener("click", () => {
      currentLayout = button.dataset.layout;
      document.querySelectorAll(".toggle-btn").forEach((btn) => btn.classList.toggle("active", btn === button));
      els.calendarBoard.classList.toggle("hidden", currentLayout !== "board");
      els.calendarTableWrap.classList.toggle("hidden", currentLayout !== "table");
    });
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((btn) => btn.classList.toggle("active", btn === button));
      document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
      document.querySelector(`#${button.dataset.view}View`).classList.add("active");
      document.querySelector("#pageTitle").textContent = {
        calendar: "Monthly Content Calendar",
        overview: "Brand Overview",
        settings: "Settings"
      }[button.dataset.view];
    });
  });

  els.exportDataBtn.addEventListener("click", exportData);
  els.importDataInput.addEventListener("change", importData);
  els.resetMonthBtn.addEventListener("click", resetCurrentMonth);
  els.addBrandForm.addEventListener("submit", addBrand);
  els.saveTargetsBtn.addEventListener("click", saveTargets);
}

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
