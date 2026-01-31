#!/bin/bash

mkdir -p /etc/letsencrypt/live/api.campus-lane.com

if [ ! -f "/etc/letsencrypt/live/api.campus-lane.com/fullchain.pem" ]; then
  openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
  -keyout /etc/letsencrypt/live/api.campus-lane.com/privkey.pem \
  -out /etc/letsencrypt/live/api.campus-lane.com/fullchain.pem \
  -subj "/CN=api.campus-lane.com"
fi
