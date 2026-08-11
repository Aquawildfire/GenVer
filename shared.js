// shared.js
// Single source of truth for all projects, members, and payments —
// used across dashboard.html, projects.html, member.html, project-detail.html

const defaultProjects = [];

function loadProjects() {
    const saved = localStorage.getItem("genver_projects");
    let data = saved ? JSON.parse(saved) : defaultProjects;

    data.forEach(p => {
        if (!p.id) p.id = Date.now() + Math.random();

        if (typeof p.collected === "string") {
            p.collected = Number(p.collected.replace(/[₱,]/g, "")) || 0;
        }

        if (p.goal === undefined) {
            p.goal = p.collected > 0 ? Math.round(p.collected / ((p.progress || 1) / 100)) : 1000;
        }
    });

    return data;
}

function saveProject() {
    localStorage.setItem("genver_projects", JSON.stringify(projects));
}

const defaultMembers = [];

function loadMembers() {
    const saved = localStorage.getItem("genver_members");
    return saved ? JSON.parse(saved) : defaultMembers;
}

function saveMembers() {
    localStorage.setItem("genver_members", JSON.stringify(members));
}

function loadPayments() {
    const saved = localStorage.getItem("genver_payments");
    return saved ? JSON.parse(saved) : [];
}

function savePayments() {
    localStorage.setItem("genver_payments", JSON.stringify(payments));
}

// IMPORTANT: every loader function above this line must be defined BEFORE
// these three run — otherwise a first-time user (empty localStorage) hits a
// "Cannot access before initialization" error the moment loadMembers() tries
// to fall back to defaultMembers, which wouldn't exist yet.
let projects = loadProjects();
let members = loadMembers();
let payments = loadPayments();


function calculateFairShare(project, excludeMemberId = null) {
    // Used .some() inside .filter(): loop every member, check if any of
    // their project entries match this project's id, keep only those that
    // do (excluding the member currently being edited, if any), then divide
    // the goal by (that count + 1) to include the person being added now.
    const currentMemberCount = members.filter(m =>
        m.id !== excludeMemberId && m.projects.some(p => p.projectId === project.id)
    ).length;
    return Math.round(project.goal / (currentMemberCount + 1));
}

function getProjectMemberCount(project) {
    return members.filter(m => m.projects.some(p => p.projectId === project.id)).length;
}

function getCurrentFairShare(project) {
    const count = getProjectMemberCount(project);
    return count > 0 ? Math.round(project.goal / count) : project.goal;
}

function getProjectCollected(proj) {
    return members.reduce((sum, m) => {
        const assignment = m.projects.find(p => p.projectId === proj.id);
        return assignment ? sum + assignment.amount : sum;
    }, 0);
}

function renderCard(p, showTags = true) {
    const collected = getProjectCollected(p);
    const progress = p.goal > 0 ? Math.round((collected / p.goal) * 100) : 0;
    const remaining = 100 - progress;

  return `
    <div class="active-project" data-id="${p.id}">
        <h2 class="project-name">${p.name}</h2>
        <div class="card-menu">
            <button class="menu-btn"><i class="fa-solid fa-ellipsis"></i></button>
            <div class="menu-dropdown">
                <button class="menu-item" data-action="edit">Edit</button>
                <button class="menu-item" data-action="archive">Archive</button>
                <button class="menu-item menu-item-danger" data-action="delete">Delete</button>
            </div>
        </div>
        <div class="progress-info">
            <span>Progress</span>
            <span>${progress}%</span>
        </div>
        <div class="progress-container">
            <div class="progress-fill" style="width:${progress}%"></div>
        </div>
        <p class="total-collected">Total Collected</p>
        <div class="collected">₱
            ${collected.toLocaleString()}
            <span class="percentage">${remaining}% Remaining</span>
        </div>
        ${showTags ? `
        <div class="tag">
            <span class="active-${p.status === 'active' ? 'on' : 'off'}">Active</span>
            <span class="completed-${p.status === 'completed' ? 'on' : 'off'}">Completed</span>
            <span class="archived-${p.status === 'archived' ? 'on' : 'off'}">Archived</span>
        </div>` : ''}
    </div>`;
}

function renderTab(status) {
    const searchTerm = document.getElementById("search-input") ? document.getElementById("search-input").value.toLowerCase() : "";

    let filtered = status === 'all' ? projects : projects.filter(p => p.status === status);
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));

    if (filtered.length === 0) {
        const message = searchTerm
            ? `No projects match "${searchTerm}".`
            : `No ${status === 'all' ? '' : status + ' '}projects yet.`;
        return emptyStateHTML(message, "fa-diagram-project");
    }

    return filtered.map(p => renderCard(p)).join('');
}

function getMemberOverallStatus(member) {
    if (member.projects.length === 0) return "unpaid";

    const statuses = member.projects.map(p => p.status);

    if (statuses.every(s => s === "paid")) return "paid";
    if (statuses.every(s => s === "unpaid")) return "unpaid";
    return "partial";
}

function getMemberTotals(member) {
    const totalContributed = member.projects.reduce((sum, p) => sum + p.amount, 0);
    const projectsJoined = member.projects.length;
    return { totalContributed, projectsJoined };
}

function renderMemberCard(member) {
    const { totalContributed, projectsJoined } = getMemberTotals(member);
    const status = getMemberOverallStatus(member);

    return `
    <div class="member-card" data-id="${member.id}">
        <div class="card-menu">
            <button class="menu-btn"><i class="fa-solid fa-ellipsis"></i></button>
            <div class="menu-dropdown">
                <button class="menu-item" data-action="edit-member">Edit</button>
                <button class="menu-item menu-item-danger" data-action="remove-member">Remove</button>
            </div>
        </div>
        <h2 class="member-name">${member.name}</h2>
        <div class="member-stats">
            <div class="member-stat">
                <span class="stat-label-small">Total Contributed</span>
                <span class="stat-value-small">₱${totalContributed.toLocaleString()}</span>
            </div>
            <div class="member-stat member-stat-right">
                <span class="stat-label-small">Projects Joined</span>
                <span class="stat-value-small">${projectsJoined}</span>
            </div>
        </div>
        <div class="member-status-row">
            <span class="stat-label-small">Payment Status</span>
            <span class="member-status member-status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>
    </div>`;
}




function loadActivity() {
    const saved = localStorage.getItem("genver_activity_log");
    return saved ? JSON.parse(saved) : [];
}




function saveActivityLog() {
    localStorage.setItem("genver_activity_log", JSON.stringify(activityLog))
}

let activityLog = loadActivity();



function logActivity(message, projectId = null) {
    activityLog.unshift({
        id: Date.now(),
        message: message,
        projectId: projectId,
        timestamp: new Date().toISOString()
    })
    saveActivityLog();
}



function formatRelativeTime(isoString) {
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);

    if ( diffMins < 1 ) return "just now";
    if ( diffMins < 60 ) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if ( diffHours < 24 ) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}



function renderActivityLog(entries, containerId, emptyMessage = "No recent activity.") {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (entries.length === 0) {
        container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
        return;
    }

    container.innerHTML = entries.map(entry => `
        <div class="log-entry">
            <p class="log-message">${entry.message}</p>
            <p class="log-time">${formatRelativeTime(entry.timestamp)}</p>
        </div>
    `).join('');
}



function renderPublicCard(p) {
    const collected = getProjectCollected(p);
    const progress = p.goal > 0 ? Math.round((collected / p.goal) * 100) : 0;
    const remaining = 100 - progress;

    return `
    <div class="active-project">
        <h2 class="project-name">${p.name}</h2>
        <div class="progress-info">
            <span>Progress</span>
            <span>${progress}%</span>
        </div>
        <div class="progress-container">
            <div class="progress-fill" style="width:${progress}%"></div>
        </div>
        <p class="total-collected">Total Collected</p>
        <div class="collected">₱
            ${collected.toLocaleString()}
            <span class="percentage">${remaining}% Remaining</span>
        </div>
    </div>`;
}

const logoutLink = document.getElementById("logout-link");
if (logoutLink) {
    logoutLink.addEventListener("click", function(e) {
        e.preventDefault();
        logout();
    });
}


function getProjectAnnouncement(proj) {
    return proj.announcement ||"";
}


function emptyStateHTML(message, icon = "fa-inbox") {
    return `
        <div class="empty-state-block">
            <i class="fa-solid ${icon}"></i>
            <p>${message}</p>
        </div>
    `;
}


let pendingConfirmAction = null;

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById("confirm-modal");
    if (!modal) return; // this page doesn't have the confirm modal, skip silently

    document.getElementById("confirm-modal-title").textContent = title;
    document.getElementById("confirm-modal-message").textContent = message;
    pendingConfirmAction = onConfirm;
    modal.classList.add("open");
}

function initConfirmModal() {
    const modal = document.getElementById("confirm-modal");
    if (!modal) return;

    document.getElementById("confirm-confirm-btn").addEventListener("click", function() {
        modal.classList.remove("open");
        if (pendingConfirmAction) pendingConfirmAction();
        pendingConfirmAction = null;
    });

    document.getElementById("confirm-cancel-btn").addEventListener("click", function() {
        modal.classList.remove("open");
        pendingConfirmAction = null;
    });
}

initConfirmModal();