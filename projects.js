function renderAllTabs() {
    document.getElementById('all').innerHTML = renderTab('all');
    document.getElementById('active').innerHTML = renderTab('active');
    document.getElementById('completed').innerHTML = renderTab('completed');
    document.getElementById('archived').innerHTML = renderTab('archived');
}

document.getElementById("search-input").addEventListener("input", renderAllTabs);
renderAllTabs();

const pages = document.querySelectorAll(".project-cards");
const sorts = document.querySelectorAll(".sort a");
const pageTitle = document.querySelector(".page-title");
const sectionLabels = {
    all: "All Projects",
    active: "Active Projects",
    completed: "Completed Projects",
    archived: "Archived Projects"
};

function showPage(sortId) {
    pages.forEach(function(page) {
        page.style.display = "none";
    });
    sorts.forEach(function(link) {
        link.classList.remove("active");
    });
    document.getElementById(sortId).style.display = "grid";

    document.querySelector(`.sort a[href="#${sortId}"]`)
        .classList.add("active");

    pageTitle.textContent = sectionLabels[sortId];
}

sorts.forEach(function(link) {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        const sortId = link.getAttribute("href").replace("#", "");
        showPage(sortId);
    });
});

showPage("all");


// ----- Create / Edit Project Modal -----
const createBtn = document.getElementById("create-project-btn");
const modal = document.getElementById("create-project-modal");
const cancelBtn = document.getElementById("cancel-create-btn");
const createForm = document.getElementById("create-project-form");
let editingId = null;

function closeModal() {
    modal.classList.remove("open");
    createForm.reset();
    editingId = null;
    document.querySelector(".modal-title").textContent = "Create Project";
    document.querySelector("#create-project-form button[type='submit']").textContent = "Create";
}

createBtn.addEventListener("click", function() {
    editingId = null;
    modal.classList.add("open");
});

cancelBtn.addEventListener("click", closeModal);

createForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("project-name").value;
    const description = document.getElementById("project-description").value;
    const targetDate = document.getElementById("project-date").value;
    const goal = Number(document.getElementById("project-goal").value);

    if (editingId !== null) {
        const project = projects.find(p => p.id === editingId);
        project.name = name;
        project.description = description;
        project.targetDate = targetDate;
        project.goal = goal;
    } else {
        const newProject = {
            id: Date.now(),
            name: name,
            collected: 0,
            status: "active",
            description: description,
            targetDate: targetDate,
            goal: goal
        };
        projects.push(newProject);
    }

    saveProject();
    renderAllTabs();
    closeModal();
});


// ----- Card menu (⋯ dropdown) -----
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
        const card = menuItem.closest(".active-project");
        const id = Number(card.dataset.id);
        const project = projects.find(p => p.id === id);
        if (action === "delete") {
            showConfirmModal(
                "Delete Project?",
                `"${project.name}" will be permanently deleted. This cannot be undone.`,
                function() {
                    projects = projects.filter(p => p.id !== id);
                    saveProject();
                    renderAllTabs();
                }
            );
        }

        if (action === "archive") {
            showConfirmModal(
                "Archive Project?",
                `"${project.name}" will be archived and can still be viewed later under the Archived tab.`,
                function() {
                    project.status = 'archived';
                    saveProject();
                    renderAllTabs();
                }
            );
        }

        
        if (action === "edit") {
            editingId = project.id;

            document.getElementById("project-name").value = project.name;
            document.getElementById("project-description").value = project.description || "";
            document.getElementById("project-date").value = project.targetDate || "";
            document.getElementById("project-goal").value = project.goal || "";

            document.querySelector(".modal-title").textContent = "Edit Project";
            document.querySelector("#create-project-form button[type='submit']").textContent = "Save Changes";

            modal.classList.add("open");
        }

        return;
    }

    const card = e.target.closest(".active-project");

     if (card) {
         window.location.href = `project-detail.html?id=${card.dataset.id}`;
    }
});


