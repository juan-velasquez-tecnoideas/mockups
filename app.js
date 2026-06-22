const corporate = document.querySelector("#corporate");
const detektorLogin = document.querySelector("#detektorLogin");
const moduleHub = document.querySelector("#moduleHub");
const managerView = document.querySelector("#managerView");
const app = document.querySelector("#app");
const corpLoginBtn = document.querySelector("#corpLoginBtn");
const corpLoginBtnHero = document.querySelector("#corpLoginBtnHero");
const detektorLoginBtn = document.querySelector("#detektorLoginBtn");
const argosCardBtn = document.querySelector("#argosCardBtn");
const managerBtn = document.querySelector("#managerBtn");
const appManagerBtn = document.querySelector("#appManagerBtn");
const sidebarManagerBtn = document.querySelector("#sidebarManagerBtn");
const managerHomeBtn = document.querySelector("#managerHomeBtn");
const managerCloseBtn = document.querySelector("#managerCloseBtn");
const managerBackBtn = document.querySelector("#managerBackBtn");
const hubLogoutBtn = document.querySelector("#hubLogoutBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const managerMenus = document.querySelectorAll(".manager-menu[data-manager-view]");
const managerPages = document.querySelectorAll(".manager-page");
const toast = document.querySelector("#toast");
let managerReturnScreen = moduleHub;

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
};

const showScreen = (screen) => {
  [corporate, detektorLogin, moduleHub, managerView, app].forEach((item) => {
    if (item) item.classList.toggle("is-hidden", item !== screen);
  });
};

const setView = (name) => {
  const menuView = ["sync", "bitacora"].includes(name) ? "geocercas" : name;
  tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === menuView));
  views.forEach((view) => view.classList.toggle("is-active", view.id === `view-${name}`));
  document.querySelector(".content-area").scrollTo({ top: 0, behavior: "smooth" });
};

const closeOpenModals = () => {
  document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
};

corpLoginBtn.addEventListener("click", () => showScreen(detektorLogin));
corpLoginBtnHero.addEventListener("click", () => showScreen(detektorLogin));

detektorLoginBtn.addEventListener("click", () => {
  showScreen(moduleHub);
  showToast("Sesión iniciada");
});

argosCardBtn.addEventListener("click", () => {
  showScreen(app);
  setView("inicio");
  showToast("Módulo Argos abierto");
});

const openManager = (returnScreen) => {
  managerReturnScreen = returnScreen;
  showScreen(managerView);
};

managerBtn.addEventListener("click", () => openManager(moduleHub));
appManagerBtn.addEventListener("click", () => openManager(app));
sidebarManagerBtn.addEventListener("click", () => openManager(app));
managerHomeBtn.addEventListener("click", () => showScreen(moduleHub));
managerCloseBtn.addEventListener("click", () => showScreen(managerReturnScreen));
hubLogoutBtn.addEventListener("click", () => showScreen(corporate));
managerBackBtn.addEventListener("click", () => showScreen(managerReturnScreen));

logoutBtn.addEventListener("click", () => {
  closeOpenModals();
  showScreen(moduleHub);
});

const sidebarToggle = document.querySelector("#sidebarToggle");
const moduleLayout = document.querySelector(".module-layout");
if (sidebarToggle && moduleLayout) {
  sidebarToggle.addEventListener("click", () => {
    const collapsed = moduleLayout.classList.toggle("sidebar-collapsed");
    sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.dataset.view) setView(tab.dataset.view);
  });
});

document.querySelectorAll(".menu-section .menu-group").forEach((groupToggle) => {
  groupToggle.addEventListener("click", () => {
    const section = groupToggle.closest(".menu-section");
    const isOpen = section.classList.toggle("is-open");
    groupToggle.setAttribute("aria-expanded", String(isOpen));
  });
});

document.querySelectorAll(".tab.has-children").forEach((parentTab) => {
  parentTab.addEventListener("click", () => {
    parentTab.closest(".nav-node").classList.toggle("is-open");
  });
});

managerMenus.forEach((menu) => {
  menu.addEventListener("click", () => {
    managerMenus.forEach((item) => item.classList.toggle("is-active", item === menu));
    managerPages.forEach((page) => page.classList.toggle("is-active", page.id === `manager-${menu.dataset.managerView}`));
  });
});

const CITY_GEOCERCAS = {
  "Bogotá / Sabana": [
    [4.78, -74.16],
    [4.79, -74.0],
    [4.66, -73.96],
    [4.6, -74.12],
    [4.66, -74.18],
  ],
  "Medellín": [
    [6.33, -75.63],
    [6.34, -75.52],
    [6.18, -75.52],
    [6.17, -75.64],
  ],
  "Cartagena": [
    [10.47, -75.55],
    [10.47, -75.46],
    [10.32, -75.46],
    [10.32, -75.55],
  ],
  "Tunja": [
    [5.58, -73.41],
    [5.58, -73.32],
    [5.49, -73.32],
    [5.49, -73.41],
  ],
};
const DEFAULT_CITY = "Bogotá / Sabana";

const CITY_META = {
  "Bogotá / Sabana": { zona: "Centro", divipoles: ["Usaquén / Bogotá", "Suba / Bogotá", "Chía / Cundinamarca"] },
  "Medellín": { zona: "Noroccidente", divipoles: ["Envigado", "Itagüí"] },
  "Cartagena": { zona: "Norte", divipoles: ["Mamonal", "Centro histórico"] },
  "Tunja": { zona: "Centro", divipoles: ["Centro / Tunja"] },
};

const centroidOf = (coords) => {
  const sum = coords.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]], [0, 0]);
  return [sum[0] / coords.length, sum[1] / coords.length];
};

const boxAround = ([lat, lng], dLat, dLng) => [
  [lat + dLat, lng - dLng],
  [lat + dLat, lng + dLng],
  [lat - dLat, lng + dLng],
  [lat - dLat, lng - dLng],
];

// Redibuja la geocerca de Divipol (referencia) y la geocerca editable de planta según la ciudad
const refreshPlantLayers = (el) => {
  const map = el._map;
  if (!map) return;
  const center = centroidOf(CITY_GEOCERCAS[cityNameFor(el)]);
  if (el.dataset.divipolRef === "true") {
    if (el._divipolRef) map.removeLayer(el._divipolRef);
    el._divipolRef = L.polygon(boxAround(center, 0.045, 0.05), {
      color: "#ef3038",
      weight: 2,
      dashArray: "5 4",
      fill: false,
      interactive: false,
    }).addTo(map);
    el._divipolRef.bindTooltip("Geocerca de la Divipol (referencia)", { sticky: true });
  }
  if (el.dataset.plantPolygon === "true" && el._drawn) {
    if (el._plantPoly) el._drawn.removeLayer(el._plantPoly);
    el._plantPoly = L.polygon(boxAround(center, 0.012, 0.014), {
      color: "#2e7d32",
      weight: 2,
      fillColor: "#2e7d32",
      fillOpacity: 0.25,
    }).addTo(el._drawn);
  }
};

// Cuadrícula de geohashes de 6 posiciones (tamaño de celda ~0.0055° x 0.011°)
const GEOHASH_LAT_STEP = 0.0054932;
const GEOHASH_LNG_STEP = 0.0109863;

const pointInPolygon = (lat, lng, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i][0];
    const xi = ring[i][1];
    const yj = ring[j][0];
    const xj = ring[j][1];
    const intersect = (yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const cellInAnyPolygon = (lat, lng, polygons) =>
  polygons.some((ring) => pointInPolygon(lat, lng, ring));

const drawnRings = (el) => {
  const rings = [];
  el._drawn.eachLayer((layer) => {
    if (layer.getLatLngs) {
      const latlngs = layer.getLatLngs()[0];
      if (latlngs) rings.push(latlngs.map((p) => [p.lat, p.lng]));
    }
  });
  return rings;
};

const updateGeohashCounts = (el) => {
  if (!el._gridCells) return;
  const rings = drawnRings(el);
  let newCount = 0;
  el._gridCells.forEach((cell) => {
    const inside = cellInAnyPolygon(cell.lat, cell.lng, rings);
    const isNew = inside && !el._baseline.has(cell.id);
    if (isNew) newCount += 1;
    cell.rect.setStyle({
      fillColor: isNew ? "#2e7d32" : "#1f5f8b",
      fillOpacity: isNew ? 0.45 : el._baseline.has(cell.id) ? 0.22 : 0,
    });
  });
  const dlg = el.closest("dialog");
  const newField = dlg && dlg.querySelector("[data-geohash-new]");
  if (newField) newField.value = String(newCount);
};

const buildGeohashGrid = (el) => {
  const map = el._map;
  if (!map || el._gridCells) return;
  if (!map.getPane("geohashGrid")) {
    map.createPane("geohashGrid").style.zIndex = 350;
  }
  // Si hay geocerca previa (editar) se usa como baseline; en una ciudad nueva el baseline es vacío
  const baselineRing = el._cityPoly ? el._cityPoly.getLatLngs()[0].map((p) => [p.lat, p.lng]) : null;
  const boundsSource = el._cityPoly || L.polygon(CITY_GEOCERCAS[cityNameFor(el)]);
  const b = boundsSource.getBounds().pad(0.18);
  const south = Math.floor(b.getSouth() / GEOHASH_LAT_STEP) * GEOHASH_LAT_STEP;
  const west = Math.floor(b.getWest() / GEOHASH_LNG_STEP) * GEOHASH_LNG_STEP;
  const cells = [];
  const baseline = new Set();
  let id = 0;
  for (let lat = south; lat < b.getNorth(); lat += GEOHASH_LAT_STEP) {
    for (let lng = west; lng < b.getEast(); lng += GEOHASH_LNG_STEP) {
      const cLat = lat + GEOHASH_LAT_STEP / 2;
      const cLng = lng + GEOHASH_LNG_STEP / 2;
      const rect = L.rectangle(
        [[lat, lng], [lat + GEOHASH_LAT_STEP, lng + GEOHASH_LNG_STEP]],
        { pane: "geohashGrid", color: "#9dbdd8", weight: 0.5, fillColor: "#1f5f8b", fillOpacity: 0, interactive: false },
      ).addTo(map);
      const inBaseline = baselineRing ? pointInPolygon(cLat, cLng, baselineRing) : false;
      if (inBaseline) {
        baseline.add(id);
        rect.setStyle({ fillOpacity: 0.22 });
      }
      cells.push({ id, lat: cLat, lng: cLng, rect });
      id += 1;
    }
  }
  el._gridCells = cells;
  el._baseline = baseline;
  const dlg = el.closest("dialog");
  const totalField = dlg && dlg.querySelector("[data-geohash-total]");
  if (totalField) totalField.value = String(baseline.size);
  const newField = dlg && dlg.querySelector("[data-geohash-new]");
  if (newField) newField.value = "0";
};

const cityNameFor = (el) => {
  const dlg = el.closest("dialog");
  const select = dlg && dlg.querySelector(".config-panel select");
  return (select && CITY_GEOCERCAS[select.value]) ? select.value : DEFAULT_CITY;
};

const drawCityRef = (el) => {
  const map = el._map;
  if (!map) return;
  if (el._cityRef) map.removeLayer(el._cityRef);
  el._cityRef = L.polygon(CITY_GEOCERCAS[cityNameFor(el)], {
    color: "#08275a",
    weight: 2,
    dashArray: "6 5",
    fill: false,
    interactive: false,
  }).addTo(map);
  el._cityRef.bindTooltip("Geocerca de la ciudad logística", { sticky: true });
  map.fitBounds(el._cityRef.getBounds(), { padding: [20, 20] });
};

const initLeafletMap = (el) => {
  if (typeof L === "undefined" || !el) return;
  if (el._map) {
    el._map.invalidateSize();
    return;
  }
  const lat = parseFloat(el.dataset.lat || "4.711");
  const lng = parseFloat(el.dataset.lng || "-74.072");
  const zoom = parseInt(el.dataset.zoom || "10", 10);
  const map = L.map(el, { scrollWheelZoom: true }).setView([lat, lng], zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  }).addTo(map);

  const divipolCoords = [
    [4.74, -74.1],
    [4.74, -74.04],
    [4.69, -74.04],
    [4.69, -74.1],
  ];

  const drawn = new L.FeatureGroup().addTo(map);
  el._map = map;
  el._drawn = drawn;
  let fitTarget = null;

  // Geocerca de la ciudad logística como referencia (no editable)
  if (el.dataset.cityPolygon === "true") {
    drawCityRef(el);
    fitTarget = el._cityRef;
  }

  // Geocerca de la ciudad logística como área editable
  if (el.dataset.polygon === "true") {
    const cityPoly = L.polygon(CITY_GEOCERCAS[cityNameFor(el)], {
      color: "#1f5f8b",
      weight: 2,
      fillColor: "#1f5f8b",
      fillOpacity: el.dataset.geohashGrid === "true" ? 0 : 0.18,
    }).addTo(drawn);
    el._cityPoly = cityPoly;
    fitTarget = cityPoly;
  }

  // Geocerca de la Divipol (editable, sobre la ciudad)
  if (el.dataset.divipolPolygon === "true") {
    const divPoly = L.polygon(divipolCoords, {
      color: "#ef3038",
      weight: 2,
      fillColor: "#ef3038",
      fillOpacity: 0.22,
    }).addTo(drawn);
    if (!fitTarget) fitTarget = divPoly;
  }

  // Geocercas de referencia de Divipol + geocerca editable de planta
  if (el.dataset.divipolRef === "true" || el.dataset.plantPolygon === "true") {
    refreshPlantLayers(el);
    if (!fitTarget && el._cityRef) fitTarget = el._cityRef;
    if (!fitTarget && el._plantPoly) fitTarget = el._plantPoly;
  }

  // Cuadrícula de geohashes de 6 posiciones bajo la geocerca
  if (el.dataset.geohashGrid === "true") {
    buildGeohashGrid(el);
  }

  if (fitTarget) {
    map.fitBounds(fitTarget.getBounds(), { padding: [20, 20] });
  }

  if (el.dataset.draw === "true" && L.Control && L.Control.Draw) {
    map.addControl(
      new L.Control.Draw({
        edit: { featureGroup: drawn },
        draw: {
          polygon: { shapeOptions: { color: "#1f5f8b" } },
          rectangle: { shapeOptions: { color: "#1f5f8b" } },
          marker: false,
          polyline: false,
          circle: false,
          circlemarker: false,
        },
      }),
    );
    map.on(L.Draw.Event.CREATED, (e) => {
      drawn.addLayer(e.layer);
      updateGeohashCounts(el);
    });
    map.on(L.Draw.Event.EDITED, () => updateGeohashCounts(el));
    map.on(L.Draw.Event.DELETED, () => updateGeohashCounts(el));
    map.on("draw:editvertex", () => updateGeohashCounts(el));
  }

  window.setTimeout(() => map.invalidateSize(), 60);
};

// Al cambiar la ciudad logística en los modales de Divipol, repinta su geocerca de referencia
document.querySelectorAll("#divipolModal, #divipolEditModal").forEach((dlg) => {
  const citySelect = dlg.querySelector(".config-panel select");
  const mapEl = dlg.querySelector("[data-leaflet]");
  if (citySelect && mapEl) {
    citySelect.addEventListener("change", () => {
      if (mapEl._map) drawCityRef(mapEl);
    });
  }
});

// Vehículo: la ciudad logística se deriva de la planta
const PLANT_CITY = {
  "513 - Puente Aranda": "Bogotá / Sabana",
  "503 - Calle 80": "Bogotá / Sabana",
  "522 - Chía": "Bogotá / Sabana",
};
document.querySelectorAll("#vehiculoEditModal").forEach((dlg) => {
  const plantSelect = dlg.querySelector("[data-veh-planta]");
  const cityInput = dlg.querySelector("[data-veh-ciudad]");
  if (plantSelect && cityInput) {
    plantSelect.addEventListener("change", () => {
      cityInput.value = PLANT_CITY[plantSelect.value] || "";
    });
  }
});

// Vehículos: filtro "Mostrar incompletos" (sin alias, planta o tipo)
const incompletosBtn = document.querySelector("[data-vehiculo-incompletos]");
if (incompletosBtn) {
  incompletosBtn.addEventListener("click", () => {
    const onlyIncomplete = incompletosBtn.classList.toggle("is-active");
    incompletosBtn.textContent = onlyIncomplete ? "Mostrar todos" : "Mostrar incompletos";
    document.querySelectorAll("#view-vehiculos tbody tr").forEach((row) => {
      const cells = row.querySelectorAll("td");
      const incomplete = [cells[1], cells[3], cells[4]].some((td) => !td || !td.textContent.trim());
      row.style.display = onlyIncomplete && !incomplete ? "none" : "";
    });
  });
}

// Modales de planta: cascada ciudad -> zona logística + divipoles, y geocercas de referencia
document.querySelectorAll("#plantModal, #plantEditModal").forEach((dlg) => {
  const citySelect = dlg.querySelector("[data-plant-city]");
  const zonaInput = dlg.querySelector("[data-plant-zona]");
  const divipolSelect = dlg.querySelector("[data-plant-divipol]");
  const mapEl = dlg.querySelector("[data-leaflet]");
  if (!citySelect) return;
  const sync = () => {
    const meta = CITY_META[citySelect.value] || CITY_META[DEFAULT_CITY];
    if (zonaInput) zonaInput.value = meta.zona;
    if (divipolSelect) divipolSelect.innerHTML = meta.divipoles.map((d) => `<option>${d}</option>`).join("");
    if (mapEl && mapEl._map) {
      drawCityRef(mapEl);
      refreshPlantLayers(mapEl);
    }
  };
  citySelect.addEventListener("change", sync);
  sync();
});

document.addEventListener("click", (event) => {
  const modalTrigger = event.target.closest("[data-open-modal]");
  if (modalTrigger) {
    const modal = document.querySelector(`#${modalTrigger.dataset.openModal}`);
    if (modal) {
      modal.showModal();
      modal.querySelectorAll("[data-leaflet]").forEach((el) => window.setTimeout(() => initLeafletMap(el), 50));
    }
  }

  const navTrigger = event.target.closest("[data-nav]");
  if (navTrigger) {
    setView(navTrigger.dataset.nav);
  }

  const toastTrigger = event.target.closest("[data-toast]");
  if (toastTrigger) {
    showToast(toastTrigger.dataset.toast);
  }

  const action = event.target.closest("[data-action]");
  if (action) {
    const messages = {
      consultar: "Consulta actualizada",
      generate: "Geohashes de 6 posiciones generados y marcados como pendientes",
      retry: "Lotes con error marcados para reintento por Divipol",
      "retry-one": "Geohash d2g6dt marcado para reintento en el próximo lote",
    };
    showToast(messages[action.dataset.action] || "Acción registrada");
  }

  const chip = event.target.closest(".chip");
  if (chip) {
    chip.classList.toggle("is-on");
  }
});

document.querySelectorAll('input[type="search"]').forEach((input) => {
  input.addEventListener("input", (event) => {
    const view = event.target.closest(".view");
    const term = event.target.value.toLowerCase();
    view.querySelectorAll("tbody tr").forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
    });
  });
});

const zoneSelect = document.querySelector("#zoneSelect");
if (zoneSelect) {
  zoneSelect.addEventListener("change", (event) => {
    showToast(`Ciudad logística seleccionada: ${event.target.selectedOptions[0].text}`);
  });
}
