#!/usr/bin/env bash
set -euo pipefail

mkdir -p /var/www/html/BNote/data/programs \
  /var/www/html/BNote/data/members \
  /var/www/html/BNote/data/webpages \
  /var/www/html/BNote/data/gallery \
  /var/www/html/BNote/data/share \
  /var/www/html/BNote/data/share/users \
  /var/www/html/BNote/data/share/groups

if [ ! -f /var/www/html/BNote/data/iso3166-code3.csv ] && [ -f /opt/bnote-seed/iso3166-code3.csv ]; then
  cp /opt/bnote-seed/iso3166-code3.csv /var/www/html/BNote/data/iso3166-code3.csv
fi
chown -R www-data:www-data /var/www/html/BNote/config /var/www/html/BNote/data || true

if [ ! -f /var/www/html/BNote/vendor/autoload.php ]; then
  if [ -f /var/www/html/BNote/composer.json ]; then
    echo "vendor/ missing -> running composer install"
    (cd /var/www/html/BNote && composer install --no-interaction --no-progress --prefer-dist)
  fi
fi

exec "$@"
