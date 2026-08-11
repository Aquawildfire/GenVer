function renderPublicProjects() {
    const searchTerm = document.getElementById("public-project-search").value.toLowerCase();

    const visibleProjects = projects.filter(p =>
        p.status !== "archived" && p.name.toLowerCase().includes(searchTerm)
    );

    document.getElementById("public-project-list").innerHTML = visibleProjects.length > 0
        ? visibleProjects.map(renderPublicCard).join('')
        : emptyStateHTML(searchTerm ? `No projects match "${searchTerm}".` : "No projects to show right now.", "fa-diagram-project");
}

document.getElementById("public-project-search").addEventListener("input", renderPublicProjects);

renderPublicProjects();


function renderMemberStatus() {
    const searchTerm = document.getElementById("member-name-search").value.toLowerCase().trim();
    const resultContainer = document.getElementById("member-status-result");

    if (searchTerm === "") {
        resultContainer.innerHTML = '';
        return;
    }

    const matches = members.filter(m => m.name.toLowerCase().includes(searchTerm));

    if (matches.length === 0) {
        resultContainer.innerHTML = `<p class="empty-state">No member found with that name.</p>`;
        return;
    }

    resultContainer.innerHTML = matches.map(member => {
        const rows = member.projects.map(assignment => {
            const proj = projects.find(p => p.id === assignment.projectId);
            if (!proj) return ''; // project may have been deleted since

            return `
            <tr>
                <td>${proj.name}</td>
                <td>₱${assignment.amount.toLocaleString()}</td>
                <td><span class="member-status member-status-${assignment.status}">${assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}</span></td>
            </tr>`;
        }).join('');

        return `
        <div class="member-status-card">
            <h3>${member.name}</h3>
            <table class="project-member-table">
                <thead>
                    <tr><th>Project</th><th>Amount Paid</th><th>Status</th></tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }).join('');
}

document.getElementById("member-name-search").addEventListener("input", renderMemberStatus);


function renderAuthLink() {
    const authLinkContainer = document.getElementById("public-auth-link");

    if (isLoggedIn()) {
        authLinkContainer.innerHTML = `<a href="dashboard.html" data-tooltip="Back to Dashboard"><i class="fa-solid fa-arrow-left"></i> <span class="nav-label"> Back to Dashboard</span></a>`;
    } else {
        authLinkContainer.innerHTML = `<a href="login.html" data-tooltip="Treasurer Login"><i class="fa-solid fa-right-to-bracket"></i> <span class="nav-label"> Treasurer Login</span></a>`;
    }
}

renderAuthLink();


function renderPublicCard(p) {
    const collected = getProjectCollected(p);
    const progress = p.goal > 0 ? Math.round((collected / p.goal) * 100) : 0;
    const remaining = 100 - progress;
    const announcement = getProjectAnnouncement(p);

    return `
    <div class="active-project">
        <h2 class="project-name">${p.name}</h2>
        ${announcement ? `<p class="public-announcement"><i class="fa-solid fa-bullhorn"></i> ${announcement}</p>` : ''}
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