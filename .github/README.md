# Frontend CI/CD with GitHub Actions

This directory contains GitHub Actions workflows for automated deployment.

## Workflow: `deploy.yml`

Automatically builds and deploys the React frontend to EC2 when code is pushed to the `main` branch.

### What it does:

1. ✅ Checks out code
2. ✅ Sets up Node.js environment
3. ✅ Installs npm dependencies
4. ✅ Builds production bundle
5. ✅ Copies `dist` folder to EC2
6. ✅ Verifies deployment success

### Required GitHub Secrets:

Set these in **Settings → Secrets and variables → Actions**:

- `EC2_HOST` - Your EC2 IP address or domain
- `EC2_USERNAME` - SSH username (e.g., `ubuntu`)
- `EC2_SSH_KEY` - Private SSH key for EC2 access

### Manual Deployment:

1. Go to **Actions** tab in GitHub
2. Select "Deploy Frontend to EC2"
3. Click **Run workflow**
4. Choose branch and click **Run workflow**

### Build Configuration:

The frontend is configured to be served at `/painel` via the `base: '/painel/'` setting in `vite.config.ts`.

### Monitoring:

View deployment logs in the **Actions** tab of your repository.

### Troubleshooting:

If deployment fails:
1. Check the Actions log for error messages
2. Verify GitHub secrets are correctly set
3. Ensure build completes successfully
4. Check that EC2 has proper file permissions

For detailed setup instructions, see `GITHUB_ACTIONS_SETUP.md` in the root directory.
