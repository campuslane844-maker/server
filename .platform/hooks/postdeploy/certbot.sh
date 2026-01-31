#!/bin/bash

# Install certbot if not present
if ! command -v certbot &> /dev/null
then
  dnf install -y certbot python3-certbot-nginx
fi

# Obtain or renew certificate
certbot --nginx -d api.campus-lane.com --non-interactive --agree-tos -m admin@campus-lane.com || true

# Reload nginx
systemctl reload nginx
