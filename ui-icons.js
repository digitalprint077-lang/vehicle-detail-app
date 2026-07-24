(function () {
  const svgAttrs = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';

  const ICONS = {
    moon: `<svg ${svgAttrs}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    sun: `<svg ${svgAttrs}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
    lock: `<svg ${svgAttrs}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,
    logout: `<svg ${svgAttrs}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>`,
    key: `<svg ${svgAttrs}><circle cx="8" cy="15" r="4"/><path d="M12 11l8-8"/><path d="M16 5l3 3"/></svg>`,
    truck: `<svg ${svgAttrs}><path d="M3 7h11v8H3z"/><path d="M14 10h4l3 4v1h-7z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/></svg>`,
    certificate: `<svg ${svgAttrs}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h5"/></svg>`,
    search: `<svg ${svgAttrs}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>`,
    save: `<svg ${svgAttrs}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></svg>`,
    plus: `<svg ${svgAttrs}><path d="M12 5v14M5 12h14"/></svg>`,
    print: `<svg ${svgAttrs}><path d="M6 9V3h12v6"/><rect x="6" y="13" width="12" height="8" rx="1"/><path d="M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/></svg>`,
    download: `<svg ${svgAttrs}><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>`,
    user: `<svg ${svgAttrs}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
    trash: `<svg ${svgAttrs}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>`,
    folder: `<svg ${svgAttrs}><path d="M4 7h5l2 2h9a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></svg>`,
    qr: `<svg ${svgAttrs}><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/></svg>`,
    edit: `<svg ${svgAttrs}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>`,
    shield: `<svg ${svgAttrs}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z"/></svg>`,
    eye: `<svg ${svgAttrs}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
    "eye-off": `<svg ${svgAttrs}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M1 1l22 22"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></svg>`,
    sparkles: `<svg ${svgAttrs}><path d="M12 3l1.2 4.2L17.5 8.5 13.2 9.7 12 14l-1.2-4.3L6.5 8.5l4.3-1.3z"/><path d="M5 17l.6 2.1L7.7 20l-2.1.6L5 23l-.6-2.4L2.3 20l2.1-.6z"/><path d="M19 15l.5 1.8L21.3 18l-1.8.5L19 20l-.5-1.7L16.7 18l1.8-.5z"/></svg>`,
    calendar: `<svg ${svgAttrs}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>`,
    hash: `<svg ${svgAttrs}><path d="M10 3 8 21M16 3l-2 18M3 8h18M2 16h18"/></svg>`,
    cog: `<svg ${svgAttrs}><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.66 1.66M17.41 17.41l1.66 1.66M2 12h2M20 12h2M4.93 19.07l1.66-1.66M17.41 6.59l1.66-1.66"/></svg>`,
    layers: `<svg ${svgAttrs}><path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></svg>`,
    map: `<svg ${svgAttrs}><path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
    idcard: `<svg ${svgAttrs}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M15 9h4M15 13h4M5 17c0-2 1.8-3 4-3s4 1 4 3"/></svg>`,
    list: `<svg ${svgAttrs}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
    building: `<svg ${svgAttrs}><path d="M4 21V9l8-4 8 4v12"/><path d="M9 21v-6h6v6"/></svg>`,
  };

  function getIcon(name) {
    return ICONS[name] || "";
  }

  function initPanelIcons(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-icon]").forEach((element) => {
      const name = element.getAttribute("data-icon");
      const icon = getIcon(name);
      if (!icon) return;
      element.classList.add("ui-icon");
      element.innerHTML = icon;
    });
  }

  window.PanelIcons = {
    get: getIcon,
    init: initPanelIcons,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initPanelIcons());
  } else {
    initPanelIcons();
  }
})();
