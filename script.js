const menuItems = [
  "Home",
  "Task Manager",
  "Groceries List",
  "Calendar",
  "House Settings",
];
let activeSection = "home";
let isSidebarCollapsed = true;

const menuIcons = {
  home: `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    </svg>`,
  "task manager": `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>`,
  "user profile": `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>`,
  "groceries list": `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>`,
  calendar: `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>`,
  "house settings": `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>`,
};

function setActiveSection(section) {
  activeSection = section;
  renderSidebar();
  renderContent();
}

function goToHome() {
  setActiveSection("home");
}

function toggleSidebar() {
  isSidebarCollapsed = !isSidebarCollapsed;
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const content = document.getElementById("content");

  if (isSidebarCollapsed) {
    sidebar.classList.add("collapsed");
    sidebarToggle.classList.add("collapsed");
    content.classList.add("full-width");
  } else {
    sidebar.classList.remove("collapsed");
    sidebarToggle.classList.remove("collapsed");
    content.classList.remove("full-width");
  }
}

function updateLogo() {
  const logo = document.getElementById("logo");
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  logo.src = isDarkMode ? "assets/darkLogo.svg" : "assets/lightLogo.svg";
}

function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const chevronColor = isDarkMode ? "rgb(147 197 253)" : "rgb(29 78 216)";
  const inactiveColor = isDarkMode ? "rgb(156 163 175)" : "rgb(156 163 175)";

  sidebar.innerHTML = menuItems
    .map(
      (item) => `
        <div class="menu-item ${
          activeSection === item.toLowerCase() ? "active" : ""
        }" 
             onclick="setActiveSection('${item.toLowerCase()}')">
            <div class="menu-item-content">
                ${menuIcons[item.toLowerCase()]}
                <span>${item}</span>
            </div>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" 
                 stroke="${
                   activeSection === item.toLowerCase()
                     ? chevronColor
                     : inactiveColor
                 }" 
                 stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </div>
    `
    )
    .join("");
}

async function renderContent() {
  const content = document.getElementById("content");
  try {
    switch (activeSection) {
      case "home":
        content.innerHTML = await renderHomeContent();
        break;
      case "task manager":
        content.innerHTML = await TaskManager.renderTaskManagerContent();
        break;
      case "groceries list":
        content.innerHTML =
          await GroceriesManager.renderGroceriesManagerContent();
        break;
      case "calendar":
        content.innerHTML = await CalendarManager.renderCalendarContent();
        break;
      case "house settings":
        content.innerHTML = await window.renderHouseSettingsContent();
        break;
      default:
        content.innerHTML = `<h2 class="content-title">Page Not Found</h2>`;
    }
  } catch (error) {
    console.error("Error rendering content:", error);
    content.innerHTML = `<h2 class="content-title">Error Loading Content</h2>`;
  }
}

async function initializeApp() {
  try {
    // Set initial sidebar state
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const content = document.getElementById("content");

    sidebar.classList.add("collapsed");
    sidebarToggle.classList.add("collapsed");
    content.classList.add("full-width");

    // Set up event listeners
    sidebarToggle.addEventListener("click", toggleSidebar);
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        renderSidebar();
        updateLogo();
      });

    // Initialize UI
    updateLogo();
    renderSidebar();

    // Set and render home page
    activeSection = "home";
    await renderContent();
  } catch (error) {
    console.error("Error initializing app:", error);
  }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", initializeApp);
