#!/usr/bin/env bash
set -euo pipefail

BNOTE_ROOT="/var/www/html/BNote"

wait_for_db() {
  local host port retries
  host="${BNOTE_DB_HOST:-mariadb}"
  port="${BNOTE_DB_PORT:-3306}"
  retries=30

  echo "waiting for database at ${host}:${port}..."
  for _ in $(seq 1 "${retries}"); do
    if (echo > "/dev/tcp/${host}/${port}") >/dev/null 2>&1; then
      echo "database port is reachable"
      return 0
    fi
    sleep 2
  done

  echo "database not reachable after ${retries} attempts"
  return 1
}

mkdir -p "${BNOTE_ROOT}/config" \
  "${BNOTE_ROOT}/data/programs" \
  "${BNOTE_ROOT}/data/members" \
  "${BNOTE_ROOT}/data/webpages" \
  "${BNOTE_ROOT}/data/gallery" \
  "${BNOTE_ROOT}/data/share" \
  "${BNOTE_ROOT}/data/share/users" \
  "${BNOTE_ROOT}/data/share/groups"

if [ ! -f "${BNOTE_ROOT}/data/iso3166-code3.csv" ] && [ -f /opt/bnote-seed/iso3166-code3.csv ]; then
  cp /opt/bnote-seed/iso3166-code3.csv "${BNOTE_ROOT}/data/iso3166-code3.csv"
fi
chown -R www-data:www-data "${BNOTE_ROOT}/config" "${BNOTE_ROOT}/data" || true

if [ ! -f "${BNOTE_ROOT}/vendor/autoload.php" ]; then
  if [ -f "${BNOTE_ROOT}/composer.json" ]; then
    echo "vendor/ missing -> running composer install"
    (cd "${BNOTE_ROOT}" && composer install --no-interaction --no-progress --prefer-dist)
  fi
fi

if [ "${BNOTE_BOOTSTRAP:-0}" = "1" ] && [ ! -f "${BNOTE_ROOT}/config/.bootstrap.done" ]; then
  echo "bootstrap: generating config and initializing database"

  wait_for_db

  if [ ! -f "${BNOTE_ROOT}/config/config.xml" ]; then
    SYSTEM_URL="${BNOTE_SYSTEM_URL:-http://localhost/}"
    ADMIN_MAIL="${BNOTE_COMPANY_MAIL:-support@bnote.info}"
    THEME_NAME="${BNOTE_THEME:-default}"
    cat > "${BNOTE_ROOT}/config/config.xml" <<EOF
<?xml version="1.0" encoding="utf-8" ?>
<Software Name="BNote">

<!-- ID of the Start module -->
<StartModule>1</StartModule>

<!-- URL of the BNote system -->
<URL>${SYSTEM_URL}</URL>

<!-- E-mail-address of the administrator -->
<Admin>${ADMIN_MAIL}</Admin>

<!-- True when this is a demo system with deactived mailing function, otherwise false (default). -->
<DemoMode>false</DemoMode>

<!-- The user IDs of all super users whos credentials will not be shown on the website.
This is a comma separated list without spaces.
-->
<SuperUsers></SuperUsers>

<!-- Default Permissions for a new user. Comma separated list of user IDs without spaces. -->
<DefaultPrivileges>9,10,12,13,14</DefaultPrivileges>

<!-- True when the gallery management is used
and should be displayed and functional, otherwise false. -->
<UseGallery>False</UseGallery>

<!-- True when the infopage/news/additional pages management is used
and should be displayed and functional, otherwise false. -->
<UseInfoPages>True</UseInfoPages>

<!-- Theme Name -->
<Theme>${THEME_NAME}</Theme>
</Software>
EOF
  fi

  (cd "${BNOTE_ROOT}" && php -r '
    parse_str("func=process&last=companyConfig", $_GET);
    $_POST = array(
      "Name" => getenv("BNOTE_COMPANY_NAME") ?: "BNote",
      "Street" => getenv("BNOTE_COMPANY_STREET") ?: "",
      "Zip" => getenv("BNOTE_COMPANY_ZIP") ?: "",
      "City" => getenv("BNOTE_COMPANY_CITY") ?: "",
      "Country" => getenv("BNOTE_COMPANY_COUNTRY") ?: "DEU",
      "Phone" => getenv("BNOTE_COMPANY_PHONE") ?: "",
      "Mail" => getenv("BNOTE_COMPANY_MAIL") ?: "support@bnote.info",
      "Web" => getenv("BNOTE_COMPANY_WEB") ?: ""
    );
    include "/var/www/html/BNote/install.php";
  ')

  (cd "${BNOTE_ROOT}" && php -r '
    parse_str("func=process&last=databaseConfig", $_GET);
    $_POST = array(
      "Server" => getenv("BNOTE_DB_HOST") ?: "mariadb",
      "Port" => getenv("BNOTE_DB_PORT") ?: "3306",
      "Name" => getenv("BNOTE_DB_NAME") ?: "bnote",
      "User" => getenv("BNOTE_DB_USER") ?: "bnote_user",
      "Password" => getenv("BNOTE_DB_PASS") ?: ""
    );
    include "/var/www/html/BNote/install.php";
  ')

  (cd "${BNOTE_ROOT}" && php -r '
    parse_str("func=process&last=adminUser", $_GET);
    $_POST = array(
      "login" => getenv("BNOTE_ADMIN_LOGIN") ?: "admin",
      "password" => getenv("BNOTE_ADMIN_PASSWORD") ?: "admin123",
      "name" => getenv("BNOTE_ADMIN_NAME") ?: "Admin",
      "surname" => getenv("BNOTE_ADMIN_SURNAME") ?: "User",
      "company" => getenv("BNOTE_ADMIN_COMPANY") ?: "",
      "phone" => getenv("BNOTE_ADMIN_PHONE") ?: "",
      "mobile" => getenv("BNOTE_ADMIN_MOBILE") ?: "",
      "email" => getenv("BNOTE_ADMIN_EMAIL") ?: (getenv("BNOTE_COMPANY_MAIL") ?: "support@bnote.info"),
      "street" => getenv("BNOTE_ADMIN_STREET") ?: "",
      "zip" => getenv("BNOTE_ADMIN_ZIP") ?: "",
      "city" => getenv("BNOTE_ADMIN_CITY") ?: "",
      "state" => getenv("BNOTE_ADMIN_STATE") ?: "",
      "country" => getenv("BNOTE_ADMIN_COUNTRY") ?: "DEU",
      "instrument" => getenv("BNOTE_ADMIN_INSTRUMENT") ?: "1"
    );
    include "/var/www/html/BNote/install.php";
  ')

  chown -R www-data:www-data "${BNOTE_ROOT}/config" "${BNOTE_ROOT}/data" || true

  touch "${BNOTE_ROOT}/config/.bootstrap.done"
fi

exec "$@"
