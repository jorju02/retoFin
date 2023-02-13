# Use an image de nginx como base
FROM nginx

# Copiar los archivos a la carpeta de trabajo de nginx
COPY . /usr/share/nginx/html

# Establecer la carpeta de trabajo
WORKDIR /usr/share/nginx/html


# Exponer el puerto 80
EXPOSE 80
# RUN npm install chart.js


# Ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]