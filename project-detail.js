// Read "id" from the URL's query string, e.g. project-detail.html?id=5
const urlParams = new URLSearchParams(window.location.search);
const projectId = Number(urlParams.get("id"));

const project = projects.find(p => p.id === projectId);

if (!project) {
    // No matching project (bad/missing id) — send them back rather than show a broken page
    window.location.href = "projects.html";
}

function renderProjectHeader() {
    const collected = getProjectCollected(project);
    const progress = project.goal > 0 ? Math.round((collected / project.goal) * 100) : 0;

    document.getElementById("project-detail-nav-title").textContent = "Project Details";

    document.getElementById("project-detail-header").innerHTML = `
        <h2 class="project-detail-name">${project.name}</h2>
        <p class="project-detail-description">${project.description || "No description yet."}</p>
        <p class="project-detail-deadline">
            <i class="fa-solid fa-calendar"></i>
            ${project.targetDate ? new Date(project.targetDate).toLocaleDateString() : "No deadline set"}
        </p>

        <div class="progress-info">
            <span>Progress</span>
            <span>${progress}%</span>
        </div>
        <div class="progress-container">
            <div class="progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="collected">
            <span>₱${collected.toLocaleString()} - Collected</span>
            <span>₱${project.goal.toLocaleString()} - Goal</span>
        </div>
    `;
}

function getProjectMembers() {
    return members
        .filter(m => m.projects.some(p => p.projectId === project.id))
        .map(m => {
            const assignment = m.projects.find(p => p.projectId === project.id);
            return {
                id: m.id,
                name: m.name,
                amount: assignment.amount,
                status: assignment.status
            };
        });
}

function renderProjectMemberTable() {
    const projectMembers = getProjectMembers();

    if (projectMembers.length === 0) {
        document.getElementById("project-member-table").innerHTML = `<p class="empty-state">No members assigned to this project yet.</p>`;
        return;
    }

    const rows = projectMembers.map(m => `
        <tr>
            <td>${m.name}</td>
            <td>₱${m.amount.toLocaleString()}</td>
            <td><span class="member-status member-status-${m.status}">${m.status.charAt(0).toUpperCase() + m.status.slice(1)}</span></td>
            <td><button class="record-payment-btn" data-member-id="${m.id}">Record Payment</button></td>
        </tr>
    `).join('');

    document.getElementById("project-member-table").innerHTML = `
        <table class="project-member-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

function renderProjectActivity() {
    const projectActivity = activityLog.filter(entry => entry.projectId === project.id).slice(0, 10);
    renderActivityLog(projectActivity, "project-activity-log", "No activity yet for this proejct.");
}


// Only render once we've confirmed a real project was found — window.location.href
// doesn't stop the script immediately, so without this guard everything below would
// still run once against an undefined project and crash.
if (project) {
    renderProjectAnnouncement();
    renderProjectHeader();
    renderProjectActivity();
    renderProjectMemberTable();
}


const memberSourceRadios = document.querySelectorAll('input[name="member-source"]');
const existingMemberFields = document.getElementById("existing-member-fields");
const newMemberFields = document.getElementById("new-member-fields");

memberSourceRadios.forEach(radio => {
    radio.addEventListener("change", function() {
        const isExisting = document.querySelector('input[name="member-source"]:checked').value === "existing";
        existingMemberFields.style.display = isExisting ? "block" : "none";
        newMemberFields.style.display = isExisting ? "none" : "block";
    });
});

function populateExistingMemberDropdown() {
    const select = document.getElementById("existing-member-select");
    select.innerHTML = '';

    const availableMembers = members.filter(m =>
        !m.projects.some(p => p.projectId === project.id)
    );

    if (availableMembers.length === 0) {
        select.innerHTML = `<option value="">— No available members —</option>`;
        return;
    }

    availableMembers.forEach(m => {
        const option = document.createElement("option");
        option.value = m.id;
        option.textContent = m.name;
        select.appendChild(option);
    });
}

const addProjectMemberBtn = document.getElementById("add-project-member-btn");
const addProjectMemberModal = document.getElementById("add-project-member-modal");
const cancelProjectMemberBtn = document.getElementById("cancel-project-member-btn");
const addProjectMemberForm = document.getElementById("add-project-member-form");

addProjectMemberBtn.addEventListener("click", function() {
    populateExistingMemberDropdown();
    addProjectMemberForm.reset();
    existingMemberFields.style.display = "block";
    newMemberFields.style.display = "none";
    addProjectMemberModal.classList.add("open");
});

cancelProjectMemberBtn.addEventListener("click", function() {
    addProjectMemberModal.classList.remove("open");
});

addProjectMemberForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const source = document.querySelector('input[name="member-source"]:checked').value;
    const amount = Number(document.getElementById("project-member-amount").value);
    const status = document.getElementById("project-member-status").value;

    if (source === "existing") {
        const selectedId = Number(document.getElementById("existing-member-select").value);
        const member = members.find(m => m.id === selectedId);
        if (!member) return; // nobody was available to select

        member.projects.push({ projectId: project.id, amount, status });

        logActivity(`${member.name} joined "${project.name}"`, project.id);
    } else {
        const name = document.getElementById("new-member-name").value;
        if (!name) return; // guard against an empty new-member name

        members.push({
            id: Date.now(),
            name: name,
            joinedDate: new Date().toISOString().split("T")[0],
            projects: [{ projectId: project.id, amount, status }]
        });

        logActivity(`${name} joined "${project.name}"`, project.id);
    }


    saveMembers();
    renderProjectMemberTable();
    renderProjectHeader();

    addProjectMemberModal.classList.remove("open");
    addProjectMemberForm.reset();
});


const recordPaymentModal = document.getElementById("record-payment-modal");
const recordPaymentForm = document.getElementById("record-payment-form");
const cancelPaymentBtn = document.getElementById("cancel-payment-btn");
let payingMemberId = null;

document.addEventListener("click", function(e) {
    const btn = e.target.closest(".record-payment-btn");
    if (!btn) return;

    payingMemberId = Number(btn.dataset.memberId);
    const member = members.find(m => m.id === payingMemberId);

    document.getElementById("record-payment-member-name").textContent = `For: ${member.name}`;
    document.getElementById("payment-date").value = new Date().toISOString().split("T")[0];

    recordPaymentModal.classList.add("open");
});

cancelPaymentBtn.addEventListener("click", function() {
    recordPaymentModal.classList.remove("open");
    recordPaymentForm.reset();
});

recordPaymentForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const amount = Number(document.getElementById("payment-amount").value);
    const date = document.getElementById("payment-date").value;

    const member = members.find(m => m.id === payingMemberId);
    const assignment = member.projects.find(p => p.projectId === project.id);

    // 1. Log the individual payment record
    payments.push({
        id: Date.now(),
        memberId: member.id,
        projectId: project.id,
        amount: amount,
        date: date
    });

    // 2. Add to the member's running total for this project
    assignment.amount += amount;

    const currentFairShare = getCurrentFairShare(project);
    if (assignment.amount >= currentFairShare) assignment.status = "paid"
    if (assignment.amount < currentFairShare && assignment.amount != 0) assignment.status ="partial"
    // Note: project.collected is no longer stored/incremented here — it's
    // calculated live from every member's payments via getProjectCollected(),
    // called inside renderProjectHeader() below. This keeps the project total
    // and member totals impossible to drift apart, since there's only one
    // real source of truth (each member's assignment.amount).


    logActivity(`${member.name} paid ₱${amount.toLocaleString()} for "${project.name}"`, project.id);

    savePayments();
    saveMembers();

    renderProjectHeader();
    renderProjectMemberTable();

    recordPaymentModal.classList.remove("open");
    recordPaymentForm.reset();
});



function renderProjectAnnouncement() {
    const announcement = getProjectAnnouncement(project);
    const container = document.getElementById("project-announcement-section");

    if (announcement) {
        container.innerHTML = `
            <div class="announcement-box">
                <i class="fa-solid fa-bullhorn"></i>
                <p>${announcement}</p>
                <button id="edit-announcement-btn" class="announcement-edit-btn"><i class="fa-solid fa-pen"></i></button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <button id="edit-announcement-btn" class="announcement-empty-btn">
                <i class="fa-solid fa-plus"></i> Add an announcement
            </button>
        `;
    }

    document.getElementById("edit-announcement-btn").addEventListener("click", openAnnouncementEditor);
}

function openAnnouncementEditor() {
    const container = document.getElementById("project-announcement-section");
    const current = getProjectAnnouncement(project);

    container.innerHTML = `
        <div class="announcement-editor">
            <textarea id="announcement-input" rows="2" placeholder="Type an announcement for this project...">${current}</textarea>
            <div class="announcement-editor-actions">
                <button id="cancel-announcement-btn" class="btn-secondary">Cancel</button>
                <button id="save-announcement-btn" class="btn-primary">Save</button>
            </div>
        </div>
    `;

    document.getElementById("cancel-announcement-btn").addEventListener("click", renderProjectAnnouncement);

    document.getElementById("save-announcement-btn").addEventListener("click", function() {
        const newText = document.getElementById("announcement-input").value.trim();
        project.announcement = newText;
        saveProject();

        logActivity(`Announcement updated for "${project.name}"`, project.id); 

        renderProjectAnnouncement();
        renderProjectActivity();
    });
}