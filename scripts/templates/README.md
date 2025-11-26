# Database Management Scripts

## Setup

1. Copy templates to parent directory and remove .template extension:
```bash
   for f in scripts/templates/*.template; do
     cp "$f" "scripts/$(basename "$f" .template)"
   done
```

2. Edit each script and replace placeholders:
   - `YOUR_PASSWORD_HERE` → Your actual database password
   - `YOUR_SSH_USERNAME` → Your SSH username
   - `/path/to/deployment` → Actual server deployment path
   - `YOUR_KEY` → Your SSH key filename

3. Make scripts executable:
```bash
   chmod +x scripts/db-*.sh
```

## Usage

Run the interactive menu:
```bash
./scripts/db-manager.sh
```

Or use individual scripts:
- `./scripts/db-backup-dev.sh` - Backup development database
- `./scripts/db-download.sh` - Download production database
- `./scripts/db-restore.sh <file> [--replace|--merge]` - Restore database
