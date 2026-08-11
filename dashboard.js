const sidebarToggle = document.getElementById("sidebar-toggle")
const sidebar = document.querySelector(".side-bar")
const backdrop = document.getElementById("sidebar-backdrop");


if (localStorage.getItem("sidebarCollapsed") === "true") {
    sidebar.classList.add("collapsed")
}

sidebarToggle.addEventListener("click", function() {
    sidebar.classList.toggle("collapsed");
    localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));

    if (window.innerWidth <= 900) {
        backdrop.classList.toggle("open", !sidebar.classList.contains("collapsed"));
    }
});

backdrop.addEventListener("click", function() {
    sidebar.classList.add("collapsed");
    backdrop.classList.remove("open");
    localStorage.setItem("sidebarCollapsed", "true");
});


const dashboardCardsContainer = document.getElementById("dashboard-cards");
if (dashboardCardsContainer) {
    const activeCards = projects.filter(p => p.status === "active");
    dashboardCardsContainer.innerHTML = activeCards.length > 0
        ? activeCards.map(p => renderCard(p, false)).join('')
        : emptyStateHTML("No active projects right now.", "fa-diagram-project");
}



const dashboardActivity = activityLog.slice(0, 5);
renderActivityLog(dashboardActivity, "dashboard-activity-log");


function renderDashboardStats() {
    const statValues = document.querySelectorAll(".dash-stat-card .stat-value");
    if (statValues.length === 0) return;

    const totalCollected = projects.reduce((sum, p) => sum + getProjectCollected(p), 0);
    const totalGoal = projects.reduce((sum, p) => sum + p.goal, 0);
    const activeCount = projects.filter(p => p.status === "active").length;
    const collectionRate = totalGoal > 0 ? Math.round((totalCollected / totalGoal) * 100) : 0;

    statValues[0].textContent = `₱${totalCollected.toLocaleString()}`;
    statValues[1].textContent = activeCount;
    statValues[2].textContent = members.length;
    statValues[3].textContent = `${collectionRate}%`;
}

renderDashboardStats();




// ----- Responsive sidebar (auto-collapse on narrow screens) -----
// Only forces a change the moment the screen crosses the breakpoint,
// so it doesn't fight the manual toggle button on every resize event.

const collapseBreakpoint = 900;
let wasNarrow = window.innerWidth <= collapseBreakpoint;

function handleResponsiveSidebar() {
    const isNarrow = window.innerWidth <= collapseBreakpoint;

    if (isNarrow && !wasNarrow) {
        sidebar.classList.add("collapsed");
    }

    wasNarrow = isNarrow;
}

window.addEventListener("resize", handleResponsiveSidebar);
handleResponsiveSidebar();
