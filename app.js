const ARC_LINKS = {
  tetris: "#",
  damas: "#"
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-game]").forEach((button) => {
    const game = button.dataset.game;
    const url = ARC_LINKS[game] || "#";

    button.setAttribute("href", url);

    button.addEventListener("click", (event) => {
      if (url === "#") {
        event.preventDefault();
        alert("Liga pendiente de configurar.");
      }
    });
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
});
