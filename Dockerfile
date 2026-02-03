FROM php:8.2-apache

# System deps + PHP extensions
RUN apt-get update -y \
    && apt-get install -y libpng-dev libjpeg-dev libzip-dev libonig-dev git unzip curl \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install mysqli gd zip mbstring \
    && a2enmod rewrite \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY BNote/data/impressum.html /opt/bnote-seed/data/impressum.html
COPY BNote/data/terms.html /opt/bnote-seed/data/terms.html
COPY BNote/data/mail_template.html /opt/bnote-seed/data/mail_template.html
COPY BNote/data/iso3166-code3.csv /opt/bnote-seed/data/iso3166-code3.csv
COPY BNote/data/help /opt/bnote-seed/data/help
COPY BNote/data/members/.htaccess /opt/bnote-seed/data/members/.htaccess
COPY BNote/data/share/.htaccess /opt/bnote-seed/data/share/.htaccess
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]
