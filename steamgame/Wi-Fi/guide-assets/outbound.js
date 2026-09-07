const outboundLink = document.querySelector("[data-outbound]");

window.addEventListener("load", () => {
  window.setTimeout(() => {
    window.location.replace(outboundLink.href);
  }, 1200);
}, { once: true });
