FROM ubuntu:latest
RUN export DEBIAN_FRONTEND=noninteractive
RUN export TZ=Europe/Madrid
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt update 
RUN apt install -y gnupg gosu curl ca-certificates zip unzip git supervisor sqlite3 libcap2-bin libpng-dev python2 dnsutils 
RUN curl -sS 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x14aa40ec0831756756d7f66c4f4ea0aae5267a6c' | gpg --dearmor | tee /usr/share/keyrings/ppa_ondrej_php.gpg > /dev/null 
RUN echo "deb [signed-by=/usr/share/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu jammy main" > /etc/apt/sources.list.d/ppa_ondrej_php.list 
RUN apt update 
RUN apt install -y php8.2-cli php8.2-dev 
RUN apt install -y php8.2-pgsql php8.2-sqlite3 php8.2-gd 
RUN apt install -y php8.2-curl  
RUN apt install -y php8.2-imap php8.2-mysql php8.2-mbstring 
RUN apt install -y php8.2-xml php8.2-zip php8.2-bcmath php8.2-soap 
RUN apt install -y php8.2-intl php8.2-readline 
RUN apt install -y php8.2-ldap 
RUN apt install -y php8.2-msgpack php8.2-igbinary php8.2-redis php8.2-swoole 
RUN apt install -y php8.2-memcached php8.2-pcov php8.2-xdebug 
RUN php -r "readfile('https://getcomposer.org/installer');" | php -- --install-dir=/usr/bin/ --filename=composer 
RUN curl -sLS https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs 
RUN npm install -g npm 
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarn.gpg >/dev/null 
RUN echo "deb [signed-by=/usr/share/keyrings/yarn.gpg] https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list 
RUN apt update
RUN apt install -y yarn
RUN apt install -y mysql-client
RUN apt install -y apache2 libapache2-mod-php
RUN apt -y autoremove 
RUN apt clean 
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


WORKDIR /src/app

EXPOSE 8000

COPY ["./.", "/src/app"]
RUN cd /src/app \
    && composer install 
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf
COPY php.ini /etc/php/8.2/cli/conf.d/laravel.ini
RUN chmod -R 775 /src/app \
    && chown -R www-data:www-data /src/app
RUN a2enmod rewrite
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]