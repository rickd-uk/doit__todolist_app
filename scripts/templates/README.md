# Database Script Templates

These are template versions of the database management scripts with placeholders for passwords and configuration.

## Setup Instructions

1. **Copy templates to active scripts:**

```bash
   cp scripts/templates/db-backup-dev.sh.template scripts/db-backup-dev.sh
   cp scripts/templates/db-backup.sh.template scripts/db-backup.sh
   cp scripts/templates/db-download.sh.template scripts/db-download.sh
   cp scripts/templates/db-restore.sh.template scripts/db-restore.sh
   cp scripts/templates/db-manager.sh.template scripts/db-manager.sh
```

2. **Edit each script and update:**
   - `DB_PASSWORD="YOUR_PASSWORD_HERE"` → Set your actual password
   - `SERVER_USER="YOUR_SSH_USERNAME"` → Set your SSH username (in db-download.sh)
   - `SERVER_PATH="/root/deployment"` → Set your server path (in db-download.sh)

3. **Make executable:**

```bash
   chmod +x scripts/db-*.sh
```

4. **Test:**

```bash
   ./scripts/db-manager.sh
```

## Security

⚠️ **The active scripts (scripts/db-\*.sh) are gitignored** to protect your passwords.

Only these templates are committed to git.
