// ARCADE / App
// Versión técnica: v1.5.3
// Alcance: Colores + bloqueo por sesión + versión visible + estado login/logout + instalación PWA

const ARC_VERSION_VISIBLE = "v.1.5.3";

const ARC_LINKS = {
  tetris: "https://www.scad.mx/arc-tetris",
  damas: "https://www.scad.mx/arc-colores",
  fb: "https://www.scad.mx/arc-fb",
  acceso: "https://www.scad.mx/arc-acceso",
  logout: "https://www.scad.mx/arc-acceso?logout=1"
};

const ARC_MODULOS_REQUIEREN_SESION = ["tetris", "damas", "fb"];

let deferredInstallPrompt = null;
let arcadeSesionActiva = false;

document.addEventListener("DOMContentLoaded", () => {
  actualizarVersionVisibleArcade();
  actualizarTarjetaColoresArcade();
  configurarLinksArcade();
  actualizarEstadoSesionArcade();
  configurarBloqueoClickArcade();
  configurarInstalacionArcade();
  registrarServiceWorker();
});

function actualizarVersionVisibleArcade() {
  document.querySelectorAll(".arcade-version").forEach((version) => {
    version.textContent = ARC_VERSION_VISIBLE;
  });
}

function actualizarTarjetaColoresArcade() {
  document.querySelectorAll('[data-game="damas"]').forEach((card) => {
    card.setAttribute("aria-label", "Colores");
    card.setAttribute("title", "Colores");

    card.querySelectorAll("*").forEach((element) => {
      const texto = element.textContent.trim().toUpperCase();

      if (texto === "DAMAS") {
        element.textContent = "Colores";
      }
    });

    if (card.childNodes.length === 1 && card.textContent.trim().toUpperCase() === "DAMAS") {
      card.textContent = "Colores";
    }
  });
}

function configurarLinksArcade() {
  document.querySelectorAll("[data-game]").forEach((button) => {
    const game = button.dataset.game;
    const url = ARC_LINKS[game];

    if (url) {
      button.setAttribute("href", url);
    }
  });
}

function actualizarEstadoSesionArcade() {
  const params = new URLSearchParams(window.location.search);
  const login = params.get("login");
  const logout = params.get("logout");

  if (login === "1") {
    localStorage.setItem("arcadeSesionActiva", "1");
    limpiarParametrosUrl();
  }

  if (logout === "1") {
    localStorage.removeItem("arcadeSesionActiva");
    limpiarParametrosUrl();
  }

  arcadeSesionActiva = localStorage.getItem("arcadeSesionActiva") === "1";

  document.querySelectorAll('[data-game="acceso"]').forEach((button) => {
    if (arcadeSesionActiva) {
      button.textContent = "Cerrar sesión";
      button.setAttribute("href", ARC_LINKS.logout);
      button.setAttribute("data-session-action", "logout");
    } else {
      button.textContent = "Iniciar sesión";
      button.setAttribute("href", ARC_LINKS.acceso);
      button.setAttribute("data-session-action", "login");
    }
  });

  actualizarBloqueoModulosPorSesion();
}

function actualizarBloqueoModulosPorSesion() {
  ARC_MODULOS_REQUIEREN_SESION.forEach((game) => {
    document.querySelectorAll(`[data-game="${game}"]`).forEach((element) => {
      aplicarEstadoModulo(element, game);
    });
  });

  document.querySelectorAll("a").forEach((link) => {
    const href = normalizarUrl(link.getAttribute("href"));

    if (
      href === normalizarUrl(ARC_LINKS.tetris) ||
      href === normalizarUrl(ARC_LINKS.damas) ||
      href === normalizarUrl(ARC_LINKS.fb)
    ) {
      aplicarEstadoModulo(link);
    }
  });
}

function aplicarEstadoModulo(element, game) {
  if (!element.dataset.arcUrlOriginal) {
    const hrefActual = element.getAttribute("href");

    if (hrefActual) {
      element.dataset.arcUrlOriginal = hrefActual;
    }
  }

  if (arcadeSesionActiva) {
    element.classList.remove("arc-disabled");
    element.removeAttribute("aria-disabled");
    element.removeAttribute("tabindex");
    element.style.opacity = "";
    element.style.filter = "";
    element.style.cursor = "";
    element.style.pointerEvents = "";

    const hrefRestaurado = game ? ARC_LINKS[game] : element.dataset.arcUrlOriginal;

    if (hrefRestaurado) {
      element.setAttribute("href", hrefRestaurado);
    }

    return;
  }

  element.classList.add("arc-disabled");
  element.setAttribute("aria-disabled", "true");
  element.setAttribute("tabindex", "-1");
  element.removeAttribute("href");

  element.style.opacity = "0.38";
  element.style.filter = "grayscale(1)";
  element.style.cursor = "not-allowed";
}

function configurarBloqueoClickArcade() {
  document.addEventListener(
    "click",
    (event) => {
      if (arcadeSesionActiva) return;

      const accesoModulo = event.target.closest(
        '[data-game="tetris"], [data-game="damas"], [data-game="fb"], a'
      );

      if (!accesoModulo) return;

      const game = accesoModulo.dataset.game;
      const href = normalizarUrl(
        accesoModulo.getAttribute("href") || accesoModulo.dataset.arcUrlOriginal
      );

      const esModuloBloqueado =
        ARC_MODULOS_REQUIEREN_SESION.includes(game) ||
        href === normalizarUrl(ARC_LINKS.tetris) ||
        href === normalizarUrl(ARC_LINKS.damas) ||
        href === normalizarUrl(ARC_LINKS.fb);

      if (!esModuloBloqueado) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    },
    true
  );
}

function normalizarUrl(url) {
  if (!url) return "";

  try {
    return new URL(url, window.location.origin).href.replace(/\/$/, "");
  } catch (err) {
    return String(url).replace(/\/$/, "");
  }
}

function limpiarParametrosUrl() {
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
}

function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register("service-worker.js").catch(() => {});
}

function configurarInstalacionArcade() {
  const btnInstall = document.getElementById("btnInstallArcade");
  const installStatus = document.getElementById("installStatus");
  const installHelp = document.getElementById("installHelp");
  const installHelpText = document.getElementById("installHelpText");
  const btnCloseInstallHelp = document.getElementById("btnCloseInstallHelp");

  if (!btnInstall || !installStatus || !installHelp || !installHelpText || !btnCloseInstallHelp) {
    return;
  }

  if (estaInstalada()) {
    mostrarEstadoInstalada(btnInstall, installStatus);
    return;
  }

  if (esIOS()) {
    btnInstall.hidden = false;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    btnInstall.hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    mostrarEstadoInstalada(btnInstall, installStatus);
  });

  btnInstall.addEventListener("click", async () => {
    if (estaInstalada()) {
      mostrarEstadoInstalada(btnInstall, installStatus);
      return;
    }

    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();

      try {
        await deferredInstallPrompt.userChoice;
      } catch (err) {}

      deferredInstallPrompt = null;
      return;
    }

    mostrarAyudaInstalacion(installHelp, installHelpText);
  });

  btnCloseInstallHelp.addEventListener("click", () => {
    installHelp.classList.add("hidden");
  });
}

function estaInstalada() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function esIOS() {
  const ua = window.navigator.userAgent.toLowerCase();
  const isiPhoneOrIPad = /iphone|ipad|ipod/.test(ua);
  const isMacTouch = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isiPhoneOrIPad || isMacTouch;
}

function mostrarEstadoInstalada(btnInstall, installStatus) {
  btnInstall.hidden = true;
  installStatus.hidden = false;
}

function mostrarAyudaInstalacion(installHelp, installHelpText) {
  if (esIOS()) {
    installHelpText.textContent =
      "En iPhone: toca Compartir y selecciona “Agregar a pantalla de inicio”.";
  } else {
    installHelpText.textContent =
      "Abre las opciones del navegador y selecciona “Instalar app” o “Agregar a pantalla de inicio”.";
  }

  installHelp.classList.remove("hidden");
}
