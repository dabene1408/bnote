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

if [ "${BNOTE_BOOTSTRAP:-0}" = "1" ] && [ ! -f /var/www/html/BNote/config/.bootstrap.done ]; then
  echo "bootstrap: generating config and initializing database"

  if [ ! -f /var/www/html/BNote/config/config.xml ]; then
    SYSTEM_URL="${BNOTE_SYSTEM_URL:-http://localhost/}"
    ADMIN_MAIL="${BNOTE_COMPANY_MAIL:-support@bnote.info}"
    THEME_NAME="${BNOTE_THEME:-default}"
    cat > /var/www/html/BNote/config/config.xml <<EOF
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

  php -r '
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
  '

  php -r '
    parse_str("func=process&last=databaseConfig", $_GET);
    $_POST = array(
      "Server" => getenv("BNOTE_DB_HOST") ?: "mariadb",
      "Port" => getenv("BNOTE_DB_PORT") ?: "3306",
      "Name" => getenv("BNOTE_DB_NAME") ?: "bnote",
      "User" => getenv("BNOTE_DB_USER") ?: "bnote_user",
      "Password" => getenv("BNOTE_DB_PASS") ?: ""
    );
    include "/var/www/html/BNote/install.php";
  '

  php -r '
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
  '

  touch /var/www/html/BNote/config/.bootstrap.done
fi

exec "$@"
