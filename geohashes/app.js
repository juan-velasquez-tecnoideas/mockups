const corporate = document.querySelector("#corporate");
const detektorLogin = document.querySelector("#detektorLogin");
const moduleHub = document.querySelector("#moduleHub");
const managerView = document.querySelector("#managerView");
const app = document.querySelector("#app");
const corpLoginBtn = document.querySelector("#corpLoginBtn");
const corpLoginBtnHero = document.querySelector("#corpLoginBtnHero");
const detektorLoginBtn = document.querySelector("#detektorLoginBtn");
const geohashesCardBtn = document.querySelector("#geohashesCardBtn");
const managerBtn = document.querySelector("#managerBtn");
const managerHomeBtn = document.querySelector("#managerHomeBtn");
const managerCloseBtn = document.querySelector("#managerCloseBtn");
const managerBackBtn = document.querySelector("#managerBackBtn");
const hubLogoutBtn = document.querySelector("#hubLogoutBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const tourBtn = document.querySelector("#tourBtn");
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const managerMenus = document.querySelectorAll(".manager-menu[data-manager-view]");
const managerPages = document.querySelectorAll(".manager-page");
const toast = document.querySelector("#toast");
const tourOverlay = document.querySelector("#tourOverlay");
const tourBubble = document.querySelector("#tourBubble");
const tourStep = document.querySelector("#tourStep");
const tourTitle = document.querySelector("#tourTitle");
const tourText = document.querySelector("#tourText");
const tourNext = document.querySelector("#tourNext");
const tourSkip = document.querySelector("#tourSkip");
let tourIndex = 0;

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
  tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === name));
  views.forEach((view) => view.classList.toggle("is-active", view.id === `view-${name}`));
  document.querySelector(".content-area").scrollTo({ top: 0, behavior: "smooth" });
};

const closeOpenModals = () => {
  document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
};

const tourSteps = [
  {
    view: "zonas",
    target: "menu",
    title: "Flujo de gestión de la fase 1",
    text: "El módulo se organiza por los pasos reales del proceso: primero zonas, luego Divipoles y plantas, después sincronización y permisos.",
  },
  {
    view: "zonas",
    target: "zonas",
    title: "1. Crear y consultar ciudades logísticas",
    text: "Aquí se administran las ciudades logísticas de Colombia, con Departamento, Zona Logística, Divipoles, plantas y geohashes asociados.",
  },
  {
    view: "zonas",
    target: "editar-zona",
    title: "2. Editar una ciudad logística",
    text: "Ver / Editar abre únicamente la ciudad logística seleccionada. El usuario ajusta datos, cobertura y estado sin navegar a otro módulo.",
  },
  {
    view: "zonas",
    modal: "zoneEditModal",
    target: "geohashes-descubiertos",
    title: "3. Descubrir geohashes",
    text: "Cuando se modifica la cobertura de una ciudad logística, el sistema muestra los geohashes descubiertos y los deja pendientes de sincronizar con Command.",
  },
  {
    view: "divipoles",
    target: "divipoles",
    title: "4. Ajustar Divipoles",
    text: "En Divipoles se filtra por ciudad logística y zona logística. Aquí se ajusta la división operativa y se valida que la geocerca esté cerrada.",
  },
  {
    view: "plantas",
    target: "plantas",
    title: "5. Revisar plantas",
    text: "Cada planta pertenece a una sola Divipol. Desde la acción Ver se abre el mapa con la geocerca de la planta.",
  },
  {
    view: "sync",
    target: "sync",
    title: "6. Sincronizar con Command",
    text: "La sincronización trabaja por lotes y Divipol. Por defecto es incremental; la sobrescritura requiere selección y autorización explícita.",
  },
];

const positionTourBubble = (target) => {
  const rect = target.getBoundingClientRect();
  const bubbleRect = tourBubble.getBoundingClientRect();
  const margin = 16;
  let left = Math.min(Math.max(rect.left, margin), window.innerWidth - bubbleRect.width - margin);
  let top = rect.bottom + 18;

  if (top + bubbleRect.height > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - bubbleRect.height - 18);
  }

  tourBubble.style.left = `${left}px`;
  tourBubble.style.top = `${top}px`;
};

const showTourStep = () => {
  const step = tourSteps[tourIndex];
  closeOpenModals();
  setView(step.view);

  if (step.modal) {
    const modal = document.querySelector(`#${step.modal}`);
    if (modal) modal.show();
  }

  window.setTimeout(() => {
    document.querySelectorAll(".tour-focus").forEach((item) => item.classList.remove("tour-focus"));
    const target = document.querySelector(`[data-tour="${step.target}"]`);
    if (!target) return;

    target.classList.add("tour-focus");
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    tourStep.textContent = `Paso ${tourIndex + 1} de ${tourSteps.length}`;
    tourTitle.textContent = step.title;
    tourText.textContent = step.text;
    tourNext.textContent = tourIndex === tourSteps.length - 1 ? "Finalizar" : "Siguiente";
    tourOverlay.classList.remove("is-hidden");
    tourBubble.classList.remove("is-hidden");
    positionTourBubble(target);
  }, 180);
};

const startTour = () => {
  tourIndex = 0;
  showTourStep();
};

const endTour = () => {
  tourOverlay.classList.add("is-hidden");
  tourBubble.classList.add("is-hidden");
  document.querySelectorAll(".tour-focus").forEach((item) => item.classList.remove("tour-focus"));
  closeOpenModals();
  setView("zonas");
};

corpLoginBtn.addEventListener("click", () => showScreen(detektorLogin));
corpLoginBtnHero.addEventListener("click", () => showScreen(detektorLogin));

detektorLoginBtn.addEventListener("click", () => {
  showScreen(moduleHub);
  showToast("Sesión iniciada");
});

geohashesCardBtn.addEventListener("click", () => {
  showScreen(app);
  setView("zonas");
  showToast("Módulo Geohashes abierto");
  window.setTimeout(startTour, 650);
});

managerBtn.addEventListener("click", () => showScreen(managerView));
managerHomeBtn.addEventListener("click", () => showScreen(moduleHub));
managerCloseBtn.addEventListener("click", () => showScreen(moduleHub));
hubLogoutBtn.addEventListener("click", () => showScreen(corporate));
managerBackBtn.addEventListener("click", () => showScreen(moduleHub));

logoutBtn.addEventListener("click", () => {
  endTour();
  showScreen(moduleHub);
});

tourBtn.addEventListener("click", startTour);

tourNext.addEventListener("click", () => {
  if (tourIndex === tourSteps.length - 1) {
    endTour();
    showToast("Recorrido finalizado");
    return;
  }
  tourIndex += 1;
  showTourStep();
});

tourSkip.addEventListener("click", endTour);

window.addEventListener("resize", () => {
  if (tourBubble.classList.contains("is-hidden")) return;
  const step = tourSteps[tourIndex];
  const target = document.querySelector(`[data-tour="${step.target}"]`);
  if (target) positionTourBubble(target);
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
