# Frontend Deployment Guide

## Production Build

The React dashboard will be served at `/painel` on your domain.

### 1. Configuration

The `vite.config.ts` is already configured with `base: '/painel/'` for production deployment.

### 2. Build for Production

```bash
npm install
npm run build
```

This creates a `dist` folder with optimized production files.

### 3. Deploy to EC2

The built files should be placed at:
```
/var/www/pinte-fichas/frontend/dist/
```

### 4. Nginx Configuration

Nginx will serve the React app at `/painel` using the configuration in the backend's `nginx.conf` file.

## Updating the Frontend

```bash
cd /var/www/pinte-fichas/frontend
git pull
npm install
npm run build
```

No service restart needed - Nginx serves static files directly.

## Environment Configuration

### API Base URL

The frontend is configured to use relative URLs for API calls:
- Development: Proxied through Vite dev server
- Production: Served by Nginx, proxied to backend

### Router Base Path

The React Router is configured to work with the `/painel` base path automatically through Vite's `base` configuration.

## Testing Locally with Production Build

```bash
npm run build
npm run preview
```

Then visit: `http://localhost:4173/painel`

## Directory Structure on EC2

```
/var/www/pinte-fichas/frontend/
├── dist/                    # Built production files (served by Nginx)
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── ...
├── src/                     # Source files (not served)
├── package.json
└── vite.config.ts
```

## Access Control

The `/painel` route can be protected using:

### Option 1: HTTP Basic Authentication
Add to Nginx config:
```nginx
location /painel {
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
    # ... rest of config
}
```

Create password:
```bash
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

### Option 2: IP Whitelist
Add to Nginx config:
```nginx
location /painel {
    allow your.ip.address;
    deny all;
    # ... rest of config
}
```

## Troubleshooting

### 404 on /painel routes
- Ensure `base: '/painel/'` is in `vite.config.ts`
- Rebuild: `npm run build`
- Check Nginx `try_files` directive

### Assets not loading
- Check browser console for 404s
- Verify `/painel/assets` location in Nginx config
- Ensure correct permissions on dist folder

### API calls failing
- Check browser console for CORS errors
- Verify backend CORS settings include your domain
- Check Nginx proxy configuration for `/api`
