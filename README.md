# Wellness Path Website

Local nutrition and wellness website with qualification checks, admin uploads, contact form handling, and success stories.

## Run Locally

Start the backend server:

```powershell
node outputs/server.js
```

Open:

```text
http://127.0.0.1:3000/index.html
```

Admin panel:

```text
http://127.0.0.1:3000/admin.html
```

## Notes

Admin-uploaded Excel records and contact submissions are local backend data and are ignored by Git so private user data is not pushed to GitHub.

## Render Hosting

This project includes `render.yaml` for Render deployment.

Recommended Render settings:

```text
Build Command: npm install
Start Command: npm start
```

Environment variables:

```text
ADMIN_ACCESS_ID=your-admin-id
ADMIN_PASSWORD=your-strong-password
DATA_DIR=/opt/render/project/src/storage/backend-data
```

Attach a persistent disk at:

```text
/opt/render/project/src/storage
```

The persistent disk is needed so admin uploads, contact submissions, and backend JSON data survive deploys and restarts.
