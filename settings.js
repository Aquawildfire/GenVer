// Show the currently saved email (never pre-fill password fields — bad practice
// to display existing passwords back to the user, even your own app's)
function getAccount() {
    const saved = localStorage.getItem("genver_account");
    return saved ? JSON.parse(saved) : { email: "treasurer@genver.com", password: "1234" };
}

document.getElementById("current-email-display").textContent = getAccount().email;

document.getElementById("account-settings-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const currentPassword = document.getElementById("current-password").value;
    const newEmail = document.getElementById("new-email").value.trim();
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const messageEl = document.getElementById("settings-message");

    const account = getAccount();

    // 1. Verify they actually know the current password before allowing any change
    if (currentPassword !== account.password) {
        messageEl.textContent = "Current password is incorrect.";
        messageEl.className = "settings-message settings-error";
        return;
    }

    // 2. If they're changing the password, make sure both new-password fields match
    if (newPassword && newPassword !== confirmPassword) {
        messageEl.textContent = "New password and confirmation don't match.";
        messageEl.className = "settings-message settings-error";
        return;
    }

    // 3. Apply only the fields that were actually filled in — keep the rest unchanged
    const updatedAccount = {
        email: newEmail || account.email,
        password: newPassword || account.password
    };

    localStorage.setItem("genver_account", JSON.stringify(updatedAccount));

    document.getElementById("current-email-display").textContent = updatedAccount.email;
    document.getElementById("account-settings-form").reset();

    messageEl.textContent = "Account updated successfully.";
    messageEl.className = "settings-message settings-success";
});