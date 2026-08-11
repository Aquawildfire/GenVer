const pages = document.querySelectorAll(".login-card");
const nav = document.querySelectorAll(".login-card p > a")

function showPage(pageId) {
    pages.forEach(function(page) {
        page.style.display = "none";
    });
    document.getElementById(pageId).style.display = "block";
}

nav.forEach(function(link) {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        const pageId = link.getAttribute("href").replace("#", "");
        showPage(pageId);
    });
});

showPage("existing-account");