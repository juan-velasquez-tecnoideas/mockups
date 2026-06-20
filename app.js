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

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setView(tab.dataset.view));
});

managerMenus.forEach((menu) => {
  menu.addEventListener("click", () => {
    managerMenus.forEach((item) => item.classList.toggle("is-active", item === menu));
    managerPages.forEach((page) => page.classList.toggle("is-active", page.id === `manager-${menu.dataset.managerView}`));
  });
});

document.addEventListener("click", (event) => {
  const modalTrigger = event.target.closest("[data-open-modal]");
  if (modalTrigger) {
    const modal = document.querySelector(`#${modalTrigger.dataset.openModal}`);
    if (modal) modal.showModal();
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
