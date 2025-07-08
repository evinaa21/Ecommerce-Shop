FROM php:8.1-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create app directory
WORKDIR /var/www

# Copy existing application directory contents
COPY . /var/www

# Install app dependencies
RUN composer install --no-dev --optimize-autoloader

# Change current user to www
RUN chown -R www-data:www-data /var/www

# Expose port (Railway will set PORT env var)
EXPOSE 8080

# Start the application using Railway's PORT environment variable
CMD php -S 0.0.0.0:${PORT:-8080} -t public