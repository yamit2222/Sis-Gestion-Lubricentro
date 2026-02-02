# Usar una imagen base de Node.js para construir el proyecto
FROM node:18-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar todos los archivos del proyecto
COPY . .

# Instalar dependencias
RUN npm install

# Construir el proyecto para producción
RUN npm run build

# Usar una imagen ligera de Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copiar los archivos construidos al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
#prueba
# Exponer el puerto 80
EXPOSE 8080

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
