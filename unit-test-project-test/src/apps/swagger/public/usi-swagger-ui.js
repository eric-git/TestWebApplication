"use strict";
const setLogo = () => {
  const logoAnchor = document.querySelector(".topbar .link:not([href])");
  if (!logoAnchor) {
    return;
  }
  Object.assign(logoAnchor, {
    href: "https://usi.gov.au",
    target: "_blank",
    title: "Go to USI Web site.",
    innerHTML: null,
  });
};

const themePickerName = "theme-picker";
const themeSettingsName = `${themePickerName}:selected`;

const loadTheme = async (theme) => {
  try {
    const response = await fetch(`${window.themes.baseUrl}/${theme}`);
    if (!response.ok) {
      console.error(response);
      return;
    }
    const data = await response.text();
    let existingStyle = document.body.querySelector("style");
    if (existingStyle) {
      existingStyle.parentNode.removeChild(existingStyle);
    }
    existingStyle = document.createElement("style");
    existingStyle.innerHTML = data;
    document.body.appendChild(existingStyle);
  } catch (error) {
    console.error(error);
  }
};

const onThemeChange = async (event) => {
  const theme = event.target.value;
  await loadTheme(theme);
  if (theme === window.themes.default) {
    localStorage.removeItem(themeSettingsName);
  } else {
    localStorage.setItem(themeSettingsName, theme);
  }
};

const createThemePicker = async () => {
  let themeSelector = document.getElementById(themePickerName);
  if (themeSelector) {
    return;
  }
  if (!window.themes) {
    return;
  }
  const htmlString = `
<div class="theme-picker-wrapper">
  <label for="${themePickerName}">Select a theme</label>
  <select id="${themePickerName}"></select>
</div>`;
  const container = new DOMParser().parseFromString(htmlString, "text/html")
    .body.firstChild;
  document
    .querySelector(".topbar")
    .insertAdjacentElement("afterend", container);
  themeSelector = document.getElementById(themePickerName);
  const selectedTheme =
    localStorage.getItem(themeSettingsName) || window.themes.default;
  window.themes.list.forEach((x) => {
    const option = document.createElement("option");
    const text = x.replace(/-/g, " ");
    Object.assign(option, {
      value: x,
      selected: x === selectedTheme,
      innerText: `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`,
    });
    themeSelector.appendChild(option);
  });
  if (selectedTheme !== window.themes.default) {
    await loadTheme(selectedTheme);
  }
  themeSelector.addEventListener("change", onThemeChange);
};

const onSwaggerComplete = async () => {
  setLogo();
  await createThemePicker();
};

window.addEventListener("load", () => {
  const head = document.getElementsByTagName("head")[0];
  const meta = document.createElement("meta");
  Object.assign(meta, {
    name: "viewport",
    content: "width=device-width, initial-scale=1.0",
  });
  head.appendChild(meta);
  const swaggerUi = window.ui;
  if (swaggerUi) {
    const swaggerConfig = swaggerUi.getConfigs();
    swaggerConfig.onComplete = onSwaggerComplete;
  }
});
