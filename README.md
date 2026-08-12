# <h1 align="center">
    <img src="logo/logo.png" alt="GenVer logo" width="32" valign="middle">
    GenVer
  </h1>

> A fund-tracking web app for student orgs and teams — built with vanilla HTML, CSS, and JavaScript.

**Status:** Front-end complete. Backend/database integration planned next (currently uses `localStorage`, so data stays in one browser only).

---

## What it does

GenVer helps a treasurer track multiple fundraising projects at once — who's paid, who hasn't, and how each project's progress is going — while giving members a way to check their own status without needing a login.

## Features

- **Projects** — create, edit, archive, delete; each with a goal, deadline, description, and announcement
- **Members** — full CRUD, assign to multiple projects, search/filter/sort
- **Payments** — record individual payments per member per project; totals and progress bars update automatically and stay in sync
- **Activity Log** — every payment and change is logged automatically, both per-project and on a global dashboard feed
- **Dashboard** — live stats (total collected, active projects, total members, collection rate)
- **Public View** — no-login page where members can browse projects and check their own payment status by name
- **Login Gate** — simple client-side login separating public viewing from treasurer management *(not real security — a placeholder until a real backend exists)*

## Built With

HTML5 · CSS3 (Grid, Flexbox, custom properties) · Vanilla JavaScript · `localStorage`

## Live Demo

[View GenVer →](https://aquawildfire.github.io/GenVer/login.html)

## What's Next

- Real backend + database (multi-account/multi-org support)
- Real authentication
- Announcement history, more detailed payment records

## Author

**John Kent Pantinuple** — BSIT Student, Philippines 🇵🇭

