let currentStatusFilter = "all";

function renderMemberList() {
    const searchTerm = document.getElementById("member-search-input").value.toLowerCase();
    const sortMode = document.getElementById("member-sort-select").value;

    let filtered = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm);
        const matchesStatus = currentStatusFilter === "all" || getMemberOverallStatus(m) === currentStatusFilter;
        return matchesSearch && matchesStatus;
    });

    if (sortMode === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === "newest") {
        filtered.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
    } else if (sortMode === "projects") {
        filtered.sort((a, b) => b.projects.length - a.projects.length);
    }

    if (filtered.length === 0) {
        const message = searchTerm ? `No members match "${searchTerm}".`
        : `No members yet.`;
        document.getElementById("member-list").innerHTML = emptyStateHTML(message, "fa-people-group");
        return;
    }

    document.getElementById("member-list").innerHTML = filtered.map(renderMemberCard).join('');
}

document.getElementById("member-search-input").addEventListener("input", renderMemberList);
document.getElementById("member-sort-select").addEventListener("change", renderMemberList);

const statusTabs = document.querySelectorAll(".sort a");

statusTabs.forEach(function(tab) {
    tab.addEventListener("click", function(e) {
        e.preventDefault();

        currentStatusFilter = tab.getAttribute("href").replace("#", "");

        statusTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        renderMemberList();
    });
});

renderMemberList();


// ----- Add/Edit Member Modal -----
const addMemberBtn = document.getElementById("add-member-btn");
const addMemberModal = document.getElementById("add-member-modal");
const cancelMemberBtn = document.getElementById("cancel-member-btn");
const addMemberForm = document.getElementById("add-member-form");
const checkboxGrid = document.getElementById("project-checkbox-grid");
const assignmentFieldsContainer = document.getElementById("project-assignment-fields");

let editingMemberId = null;

function getAssignmentDefaults(project) {
    if (editingMemberId != null) {
        const member = members.find(m => m.id === editingMemberId);
        const existing = member.projects.find(p => p.projectId === project.id);
        if (existing) {
            return { amount: existing.amount, goal: existing.goal, status: existing.status };
        }
    }

    return { amount: 0, goal: 0, status: "unpaid" };
}

function renderProjectCheckboxes() {
    checkboxGrid.innerHTML = '';

    projects.forEach(p => {
        const label = document.createElement("label");
        label.title = p.name;
        label.innerHTML = `<input type="checkbox" value="${p.id}" class="box"> <span>${p.name}</span>`;
        checkboxGrid.appendChild(label);
    });

    checkboxGrid.querySelectorAll("input[type='checkbox']").forEach(box => {
        box.addEventListener("change", renderAssignmentFields);
    });
}

// This function looks for checked projects and creates a corresponding input row for each one.
// checkboxGrid.querySelectorAll(...) returns a NodeList, not a real array, so it's converted
// with Array.from() before .map() can be used to build one HTML string per checked project.
function renderAssignmentFields() {
    const checkedBoxes = checkboxGrid.querySelectorAll("input[type='checkbox']:checked");

    assignmentFieldsContainer.innerHTML = Array.from(checkedBoxes).map(box => {
        const project = projects.find(p => p.id === Number(box.value));
        const defaults = getAssignmentDefaults(project);

        return `
        <div class="project-assignment-row">
            <span class="assignment-project-name">${project.name}</span>

            <label for="assign-amount-${project.id}">Amount Contributed</label>
            <input type="number" id="assign-amount-${project.id}" min="0" value="${defaults.amount}">

            <label for="assign-status-${project.id}">Payment Status</label>
            <select id="assign-status-${project.id}">
                <option value="unpaid" ${defaults.status === "unpaid" ? "selected" : ""}>Unpaid</option>
                <option value="partial" ${defaults.status === "partial" ? "selected" : ""}>Partial</option>
                <option value="paid" ${defaults.status === "paid" ? "selected" : ""}>Paid</option>
            </select>
        </div>`;
    }).join('');
}

document.addEventListener("click", function(e) {
    const menuBtn = e.target.closest(".menu-btn");
    const menuItem = e.target.closest(".menu-item");

    document.querySelectorAll(".card-menu.open").forEach(menu => {
        if (!menuBtn || menu !== menuBtn.closest(".card-menu")) {
            menu.classList.remove("open");
        }
    });

    if (menuBtn) {
        menuBtn.closest(".card-menu").classList.toggle("open");
        return;
    }

    if (menuItem) {
        const action = menuItem.dataset.action;
        const card = menuItem.closest(".member-card");
        if (!card) return; // clicked something unrelated to a member card's menu

        const id = Number(card.dataset.id);
        const member = members.find(m => m.id === id);

        if (action === "remove-member") {
            showConfirmModal(
                "Remove Member?",
                `"${member.name}" will be permanently removed. This cannot be undone.`,
                function() {
                    members = members.filter(m => m.id !== id);
                    saveMembers();
                    renderMemberList();
                }
            );
        }

        if (action === "edit-member") {
            editingMemberId = member.id;

            document.getElementById("member-name").value = member.name;
            document.getElementById("member-joined-date").value = member.joinedDate;

            renderProjectCheckboxes();

            member.projects.forEach(p => {
                const box = checkboxGrid.querySelector(`input[value="${p.projectId}"]`);
                if (box) box.checked = true;
            });

            renderAssignmentFields();

            document.querySelector(".modal-title").textContent = "Edit Member";
            document.querySelector("#add-member-form button[type='submit']").textContent = "Save Changes";

            addMemberModal.classList.add("open");
        }
    }
});

function closeMemberModal() {
    addMemberModal.classList.remove("open");
    addMemberForm.reset();
    assignmentFieldsContainer.innerHTML = '';
    editingMemberId = null;
    document.querySelector(".modal-title").textContent = "Add Member";
    document.querySelector("#add-member-form button[type='submit']").textContent = "Add Member";
}

addMemberBtn.addEventListener("click", function() {
    editingMemberId = null;
    renderProjectCheckboxes();
    assignmentFieldsContainer.innerHTML = '';
    addMemberModal.classList.add("open");
});

cancelMemberBtn.addEventListener("click", closeMemberModal);

addMemberForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("member-name").value;
    const joinedDate = document.getElementById("member-joined-date").value;
    const checkedBoxes = checkboxGrid.querySelectorAll("input[type='checkbox']:checked");

    const projectAssignments = Array.from(checkedBoxes).map(box => {
        const projectId = Number(box.value);
        const amount = Number(document.getElementById(`assign-amount-${projectId}`).value);
        const status = document.getElementById(`assign-status-${projectId}`).value;
        const project = projects.find(p => p.id === projectId);
        return { projectId, amount, status };
    });

    if (editingMemberId !== null) {
        const member = members.find(m => m.id === editingMemberId);
        member.name = name;
        member.joinedDate = joinedDate;
        member.projects = projectAssignments;
    } else {
        members.push({
            id: Date.now(),
            name: name,
            joinedDate: joinedDate,
            projects: projectAssignments
        });
    }

    saveMembers();
    renderMemberList();
    closeMemberModal();
});
