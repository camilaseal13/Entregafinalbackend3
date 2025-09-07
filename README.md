# AdoptMe API - Entrega Final

Este repositorio contiene las mejoras solicitadas para la **Entrega Final**:

- ✅ Documentación **Swagger** del módulo **Users** (`/docs/users`)
- ✅ **Tests funcionales** para todos los endpoints de `adoption.router.js`
- ✅ **Dockerfile** para construir imagen del proyecto
- ✅ **ReadMe** con instrucciones de Docker y enlace a DockerHub

---

## 🚀 Ejecutar localmente (desarrollo)

```bash
npm install
npm run dev
```

Configura la variable `MONGO_URI` (por defecto `mongodb://localhost:27017/adoptme`).

## 🧪 Tests funcionales

Los tests se ejecutan contra una base **MongoDB en memoria** (no requiere servicios externos).

```bash
npm test
```

Cubre:
- `GET /api/adoptions` (lista)
- `GET /api/adoptions/:aid` (detalle y 404)
- `POST /api/adoptions/:uid/:pid` (éxito, 404s, 400 ya adoptado)

## 📚 Swagger (Users)

Una vez corriendo la app:
- Visita: **http://localhost:8080/docs/users**

La especificación está en `src/docs/users.yaml`.

## 🐳 Docker

### Construir imagen

```bash
npm run docker:build
# o directamente
docker build -t camilaseal13/adoptme:1.0.0 .
docker tag camilaseal13/adoptme:1.0.0 camilaseal13/adoptme:latest
```

### Ejecutar contenedor

```bash
npm run docker:run
# o directamente
docker run -e MONGO_URI="mongodb://host.docker.internal:27017/adoptme" -p 8080:8080 camilaseal13/adoptme:latest
```

### Subir a DockerHub

```bash
npm run docker:push
# o directamente
docker login
docker push camilaseal13/adoptme:1.0.0
docker push camilaseal13/adoptme:latest
```

### Enlace a la imagen en DockerHub

**DockerHub:** https://hub.docker.com/r/camilaseal13/adoptme

## ⚡ Comandos rápidos (Docker)
```bash
docker build -t camilaseal13/adoptme:1.0.0 .
docker tag camilaseal13/adoptme:1.0.0 camilaseal13/adoptme:latest
docker login
docker push camilaseal13/adoptme:1.0.0
docker push camilaseal13/adoptme:latest
docker run -e MONGO_URI="mongodb://host.docker.internal:27017/adoptme" -p 8080:8080 camilaseal13/adoptme:latest
```

---

## Notas de implementación

- `src/app.js` ahora **exporta** `app` y solo conecta/levanta servidor si `NODE_ENV !== "test"`.
- Swagger se monta en `/docs/users` y usa `src/docs/users.yaml`.
- Los tests usan `mongodb-memory-server` para aislar los datos.


## Swagger (Users)
La documentación Swagger del módulo **Users** está disponible en la app. 
- Esquema: `src/docs/users.yaml`
- Acceso (ejemplo): visita `http://localhost:8080/docs` o la ruta configurada en `src/app.js` para Swagger UI.

## Variables de entorno
Incluye un archivo `.env` basado en `.env.example`:
```bash
MONGO_URI=mongodb://host.docker.internal:27017/adoptme
PORT=8080
```

## Docker rápido
Construir y ejecutar:
```bash
npm run docker:build
npm run docker:run
```
O directamente:
```bash
docker build -t camilaseal13/adoptme:1.0.0 .
docker run -e MONGO_URI="mongodb://host.docker.internal:27017/adoptme" -p 8080:8080 camilaseal13/adoptme:latest
```
