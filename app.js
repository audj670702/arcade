// ARCADE / App
// Versión técnica: v1.4.3
// Alcance: links de juegos + estado visual login/logout + instalación PWA

const ARC_LINKS = {
  tetris: "https://www.scad.mx/arc-tetris",
  damas: "https://www.scad.mx/arc-damas",
  fb: "https://www.scad.mx/arc-fb",
  acceso: "https://www.scad.mx/arc-acceso",
  logout: "https://www.scad.mx/arc-acceso?logout=1"
};

let deferredInstallPrompt = null;

document.addEventListener("DOMContentLoaded", () => {
  configurarLinksArcade();
  actualizarEstadoSesionArcade();
  configurarInstalacionArcade();
  registrarServiceWorker();
});

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

  const sesionActiva = localStorage.getItem("arcadeSesionActiva") === "1";

  document.querySelectorAll('[data-game="acceso"]').forEach((button) => {
    if (sesionActiva) {
      button.textContent = "Cerrar sesión";
      button.setAttribute("href", ARC_LINKS.logout);
      button.setAttribute("data-session-action", "logout");
    } else {
      button.textContent = "Iniciar sesión";
      button.setAttribute("href", ARC_LINKS.acceso);
      button.setAttribute("data-session-action", "login");
    }
  });
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
