function checkCredentials(email, password) {
    const saved = localStorage.getItem("genver_account");
    const account = saved ? JSON.parse(saved) : { email: "test@gmail.com", password: "1234" };

    return email === account.email && password === account.password;
}

function isLoggedIn() {
    return sessionStorage.getItem("genver_authenticated") === "true";
}

function logout() {
    sessionStorage.removeItem("genver_authenticated");
    window.location.href = "login.html";
}

function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        if (checkCredentials(email, password)) {
            sessionStorage.setItem("genver_authenticated", "true");
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("login-error").textContent = "Incorrect email or password.";
        }
    });
}


function createAccount(username, email, password) {
    const account = { username: username, email: email, password: password };
    localStorage.setItem("genver_account", JSON.stringify(account));
}

const signupForm = document.getElementById("signup-form");
if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const username = document.getElementById("user-name").value;
        const email = document.getElementById("new-email").value;
        const password = document.getElementById("enter-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const errorEl = document.getElementById("signup-error");

        if (password !== confirmPassword) {
            errorEl.textContent = "Passwords don't match.";
            return;
        }

        if (password.length < 4) {
            errorEl.textContent = "Password must be at least 4 characters.";
            return;
        }

        createAccount(username, email, password);

        sessionStorage.setItem("genver_authenticated", "true");
        window.location.href = "dashboard.html";
    });
}