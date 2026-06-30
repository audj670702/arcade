const ARC_LINKS = {
  tetris: "https://www.scad.mx/arc-tetris",
  damas: "https://www.scad.mx/arc-damas",
  fb: "https://www.scad.mx/arc-fb",
  acceso: "https://www.scad.mx/arc-acceso"
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-game]").forEach((button) => {
    const game = button.dataset.game;
    const url = ARC_LINKS[game];

    if (url) {
      button.setAttribute("href", url);
    }
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
});
