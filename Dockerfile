FROM php:8.2-apache

# To access a MySQL database the according PHP module must be installed
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# The .htaccess file in the export API folder contains rewrite rules. Those
# rules are not supported by Apache by default. The according Apache module
# must be installed. Otherwise the BNote-App will not work.
RUN a2enmod rewrite

# The SimpleImage class used by website module and share module requires the GD
# library for basic image processing. The base Docker image does not include
# that library. The PHP GD library module itself needs libraries to handle PNG
# and JPEG. The PHP module zip is required for downloading share folders.
RUN apt-get update -y \
    && apt-get install -y libpng-dev libjpeg-dev libzip-dev \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install gd zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
