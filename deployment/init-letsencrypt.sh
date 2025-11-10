#!/bin/bash

# SSL Certificate Setup Script for Let's Encrypt
# Usage: ./init-letsencrypt.sh

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DOMAIN=${DOMAIN:-yourdomain.com}
EMAIL=${EMAIL:-your-email@example.com}
STAGING=${STAGING:-0}

# Check if domain and email are set
if [ "$DOMAIN" == "yourdomain.com" ] || [ "$EMAIL" == "your-email@example.com" ]; then
    echo "Error: Please update DOMAIN and EMAIL in .env file"
    exit 1
fi

echo "### Setting up SSL certificates for $DOMAIN"

# Create certbot directories
mkdir -p deployment/certbot/conf
mkdir -p deployment/certbot/www

# Download recommended TLS parameters
if [ ! -e "deployment/certbot/conf/options-ssl-nginx.conf" ]; then
    echo "### Downloading recommended TLS parameters..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > deployment/certbot/conf/options-ssl-nginx.conf
fi

if [ ! -e "deployment/certbot/conf/ssl-dhparams.pem" ]; then
    echo "### Downloading recommended TLS DH parameters..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > deployment/certbot/conf/ssl-dhparams.pem
fi

# Create dummy certificate for nginx to start
echo "### Creating dummy certificate for $DOMAIN..."
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
mkdir -p "deployment/certbot/conf/live/$DOMAIN"

if [ ! -f "deployment/certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "deployment/certbot/conf/live/$DOMAIN/privkey.pem" \
        -out "deployment/certbot/conf/live/$DOMAIN/fullchain.pem" \
        -subj "/CN=$DOMAIN"
fi

echo "### Starting nginx..."
podman-compose up -d nginx-proxy

echo "### Deleting dummy certificate..."
podman-compose exec nginx-proxy rm -rf /etc/letsencrypt/live/$DOMAIN

echo "### Requesting Let's Encrypt certificate..."
STAGING_ARG=""
if [ $STAGING != "0" ]; then
    STAGING_ARG="--staging"
fi

podman-compose run --rm certbot certonly --webroot \
    -w /var/www/certbot \
    $STAGING_ARG \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

echo "### Reloading nginx..."
podman-compose exec nginx-proxy nginx -s reload

echo "### SSL certificate setup complete!"
echo "### Certificate will be automatically renewed by certbot container"
