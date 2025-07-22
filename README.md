# 🧠 FaceAPI - Servicio de Identificación Facial y Registro de Transacciones

FaceAPI es un microservicio backend desarrollado en Node.js, orientado a:

1. Registro de Transacciones: Persistir operaciones de cambio de divisa realizadas exitosamente por los usuarios en cajeros automáticos.
2. Consulta de Acumulado Diario: Consultar el total en dólares operado por un usuario en las últimas 24 horas.
3. Identificación Facial: Usar AWS Rekognition para identificar usuarios cuando se superan límites de operación, cumpliendo con normativas fiscales y de prevención de lavado de dinero.
---

 # 🧱 Arquitectura General

- *Node.js + Express* como backend principal.
- *Base de datos relacional* (PostgreSQL recomendada) con 2 tablas principales: users y transactions.
- AWS Rekognition para reconocimiento facial.
- Manejo de archivos temporales y carga de imágenes.
- Rutas organizadas en tres módulos:
    - /api/user
    - /api/transactions
    - /api/face
      
---
 # ⚙️ Requisitos

- Node.js y Express.js para el backend
- Docker y Docker Compose para contenerización del entorno
- Google Cloud Storage para el almacenamiento de imágenes faciales
- Cuenta de AWS con permisos para Rekognition (crear un IAM User con AwsRekognitionFullAccess)
- PostgreSQL como base de datos (asumido por init.sql, puedes ajustar si es otra)
- .env con claves de configuración necesarias para los servicios externos
---

# ✅ ESTRUCTURA DE PROYECTO 
  ```bash
FACEAPI/
│
├── controllers/
│   ├── faceController.js
│   ├── transactionController.js
│   └── userController.js
│
├── models/
│   ├── db.js
│   ├── transactionModel.js
│   └── userModel.js
│
├── routes/
│   ├── faceRoutes.js
│   ├── transactionRoutes.js
│   └── userRoutes.js
│
├── services/
│   ├── GCStorageService.js
│   └── rekognitionService.js
│
├── .env
├── .env.example
├── .gitignore
├── app.js
├── docker-compose.yml
├── Dockerfile
├── init.sql              # Script para inicializar la base de datos (si aplica)
└── package.json

  ``` 
---
# ⚙️ Instalación y Puesta en Marcha

1. Clona el repositorio
  ```bash
  git clone [https://tu-repo-url/faceapi.git](https://github.com/MaribelMOA/FaceApi.git)
cd faceapi

  ``` 
2. Configura tus variables de entorno
   - Copia el archivo .env.example y nómbralo como .env
   - Llena las claves correspondientes:
  ```bash
  PORT=3000

  # PostgreSQL en producción (actualízalo cuando migres a GCP)
  DATABASE_URL=postgres://postgres:postgres@db:5432/faceapi
  # postgres://user:password@your_cloudsql_ip:5432/faceapi
  
  # Credenciales de AWS
  AWS_ACCESS_KEY_ID=your_aws_key
  AWS_SECRET_ACCESS_KEY=your_aws_secret
  AWS_REGION=us-east-2
  AWS_REKOGNITION_COLLECTION=

  
  # Credenciales de GCS
  GC_PROJECT_ID=
  GC_CLIENT_EMAIL=
  GC_CLIENT_ID=
  GC_PRIVATE_KEY_ID=
  GC_PRIVATE_KEY=
  GC_CLIENT_CERT_URL=
  
  BUCKET_GC=

  ``` 
3. Construye y levanta los contenedores con Docker
 ```bash
  docker-compose up --build
  ```
Esto iniciará:
  - El backend en un contenedor Node.js
  - La base de datos (si aplica) con init.sql
  - Volúmenes y redes necesarias

---
# 🧪 Verificación
Puedes probar las rutas con herramientas como Postman o Swagger si lo integras.

---
# 🧩 Rutas de la API

####  🔹 /api/user – Rutas de Usuario


| Método | Ruta              | Descripción                                      | 
|--------|-------------------|--------------------------------------------------|
| POST   | /get-or-create    | Obtiene un usuario por nombre o lo crea         | 
| GET    | /                 | Lista todos los usuarios                        |
| GET    | /:id              | Obtiene usuario por ID                          | 
| PUT    | /:id              | Actualiza un usuario                            | 
| DELETE | /:id              | Elimina un usuario                              | 

# 📌 POST /api/user/get-or-create

*Descripción*: Verifica si un usuario con faceId y externalImageId existe. Si no existe, lo crea.
🔸 Request body
 ```json
    {
      "faceId": "string",
      "externalImageId": "string"
    }
  ```
✅ Respuesta exitosa
 ```json
    {
      "success": true,
      "user": {
        "id": 1,
        "face_id": "abc123",
        "external_image_id": "user-image-001",
        "created_at": "2024-01-01T12:34:56.000Z"
      }
    }
  ```

❌ Respuestas de error
 - 400: Faltan campos requeridos
 - 500: Error interno del servidor

📎 Ejemplo curl
 ```bash
    curl -X POST http://localhost:3000/api/user/get-or-create \
      -H "Content-Type: application/json" \
      -d '{"faceId":"abc123","externalImageId":"user-image-001"}'
  ```
# 📌 GET /api/user/

*Descripción*: Lista todos los usuarios en orden descendente de creación.

✅ Respuesta exitosa
 ```json
    {
      "success": true,
      "users": [
        {
          "id": 1,
          "face_id": "abc123",
          "external_image_id": "user-image-001",
          "created_at": "2024-01-01T12:34:56.000Z"
        },
        ...
      ]
    }
  ```

📎 Ejemplo curl
 ```bash
    curl http://localhost:3000/api/user/
  ```

# 📌 GET /api/user/:id

*Descripción*: Obtiene un usuario específico por su ID.

✅ Respuesta exitosa
 ```json
    {
      "success": true,
      "user": {
        "id": 1,
        "face_id": "abc123",
        "external_image_id": "user-image-001",
        "created_at": "2024-01-01T12:34:56.000Z"
      }
    }
  ```
❌ Respuestas de error
 - 400: Usuario no encontrado
 - 500: Error interno

📎 Ejemplo curl
 ```bash
    curl http://localhost:3000/api/user/1
  ```

# 📌 PUT /api/user/:id

*Descripción*: Actualiza uno o ambos campos (faceId, externalImageId) de un usuario.
🔸 Request body (al menos uno requerido)
 ```json
    {
      "faceId": "newFace123",
      "externalImageId": "newImageId001"
    }
  ```

✅ Respuesta exitosa
 ```json
    {
      "success": true,
      "user": {
        "id": 1,
        "face_id": "newFace123",
        "external_image_id": "newImageId001",
        "created_at": "2024-01-01T12:34:56.000Z"
      }
    }

  ```
❌ Respuestas de error
 - 400: No se envió ningún campo a actualizar
 - 404: Usuario no encontrado
 - 500: Error interno

📎 Ejemplo curl
 ```bash
    curl -X PUT http://localhost:3000/api/user/1 \
      -H "Content-Type: application/json" \
      -d '{"faceId":"newFace123"}'
  ```
# 📌 DELETE /api/user/:id

*Descripción*: Elimina un usuario por ID.

✅ Respuesta exitosa
 ```json
    {
      "success": true,
      "message": "User deleted",
      "user": {
        "id": 1,
        "face_id": "abc123",
        "external_image_id": "user-image-001",
        "created_at": "2024-01-01T12:34:56.000Z"
      }
    }

  ```
❌ Respuestas de error
 - 404: Usuario no encontrado
 - 500: Error interno

📎 Ejemplo curl
 ```bash
    curl -X DELETE http://localhost:3000/api/user/1
  ```
---
#### 🔹 /api/transactions – Rutas de Transacciones

| Método | Ruta                                   | Descripción                                             | 
|--------|----------------------------------------|---------------------------------------------------------|
| POST   | /                                      | Guarda una transacción                                  |
| GET    | /users/:userId/accumulated             | Devuelve total operado en últimas 24h por el usuario    | 
| GET    | /                                      | Lista todas las transacciones                          | 
| GET    | /:id                                   | Obtiene una transacción por ID                         | 
| PUT    | /:id                                   | Actualiza una transacción                              | 
| DELETE | /:id                                   | Elimina una transacción                        
        | 

# 📌  POST /api/transactions

*Descripción*: Crea una nueva transacción con tipo, monto y ruta de imagen asociada a un usuario.
🔸 Request body (al menos uno requerido)
 ```json
    {
      "user_id": 1,
      "type": "compra",
      "amount": 100.5,
      "image_path": "/images/img.jpg"
    }
  ```

✅ Respuesta exitosa
 ```json
    {
      "success": true
    }
  ```
❌ Respuestas de error
 - 400: Faltan datos obligatorios
 - 500: Error interno al guardar la transacción

📎 Ejemplo curl
 ```bash
    curl -X POST http://localhost:3000/api/transactions \
      -H "Content-Type: application/json" \
      -d '{"user_id":1,"type":"compra","amount":100.5,"image_path":"/images/img.jpg"}'
  ```

# 📌GET /api/transactions/users/:userId/accumulated

*Descripción*: Devuelve el total operado por un usuario en las últimas 24 horas.
(Compras se suman, ventas se dividen por tasa fija y luego se suman)
🔸 Parámetros
    - userId: ID del usuario (en la URL)

✅ Respuesta exitosa
 ```json
    {
      "success": true,
      "total": 45.71
    }

  ```
❌ Respuestas de error
 - 500: Error al consultar el total

📎 Ejemplo curl
 ```bash
    curl http://localhost:3000/api/transactions/users/1/accumulated
 ```
# 📌 GET /api/transactions

*Descripción*: Devuelve la lista completa de todas las transacciones registradas.

✅ Respuesta exitosa
 ```json
    {
      "success": true,
      "transactions": [
        {
          "id": 1,
          "user_id": 1,
          "type": "compra",
          "amount": 100.5,
          "image_path": "/images/img.jpg",
          "created_at": "2025-07-21T12:00:00.000Z"
        },
        ...
      ]
    }

  ```
❌ Error al obtener las transacciones
 - 500: Error al consultar el total

📎 Ejemplo curl
 ```bash
    curl http://localhost:3000/api/transactions
 ```
# 📌 GET /api/transactions/:id

*Descripción*: Recupera una transacción por su id.

🔸 Parámetros
    - id: ID de la transacción (en la URL)

✅ Respuesta exitosa
 ```json
    {
      "success": true,
      "transaction": {
        "id": 1,
        "user_id": 1,
        "type": "compra",
        "amount": 100.5,
        "image_path": "/images/img.jpg",
        "created_at": "2025-07-21T12:00:00.000Z"
      }
    }
  ```
❌ Error al obtener las transacciones
 - 404: Transacción no encontrada
 - 500: Error al obtener la transacción

📎 Ejemplo curl
 ```bash
    curl http://localhost:3000/api/transactions/1
 ```
# PUT /api/transactions/:id

*Descripción*: Actualiza los campos type, amount o image_path de una transacción existente.

🔸 Parámetros
    - id: ID de la transacción (en la URL)
🔸 Request body (al menos uno requerido)
 ```json
    {
      "type": "venta",
      "amount": 150.0
    }
  ```

✅ Respuesta exitosa  
 ```json
    {
      "success": true,
      "transaction": {
        "id": 1,
        "user_id": 1,
        "type": "venta",
        "amount": 150.0,
        "image_path": "/images/img.jpg",
        "created_at": "2025-07-21T12:00:00.000Z"
      }
    }
  ```
❌ Error al obtener las transacciones
 - 400: No se enviaron campos válidos para actualizar
 - 404: Transacción no encontrada
 - 500: Error interno

📎 Ejemplo curl
 ```bash
    curl -X PUT http://localhost:3000/api/transactions/1 \
      -H "Content-Type: application/json" \
      -d '{"amount":200}'
 ```

# 📌 DELETE /api/transactions/:id

*Descripción*: Elimina una transacción por su id.

🔸 Parámetros
    - id: ID de la transacción (en la URL)

✅ Respuesta exitosa  
 ```json
    {
      "success": true,
      "deleted": {
        "id": 1,
        "user_id": 1,
        "type": "venta",
        "amount": 150,
        "image_path": "/images/img.jpg",
        "created_at": "2025-07-21T12:00:00.000Z"
      }
    }

  ```
❌ Error al obtener las transacciones
 - 404: Transacción no encontrada
 - 500: Error interno

📎 Ejemplo curl
 ```bash
    curl -X DELETE http://localhost:3000/api/transactions/1
 ```

#### 🔹 /api/face – Rutas de Reconocimiento Facial


| Método | Ruta                                   | Descripción                                                       |
|--------|----------------------------------------|-------------------------------------------------------------------|
| POST   | /identify                              | Identifica una persona usando AWS Rekognition                     | 
| POST   | /register-image                        | Registra una imagen facial de un usuario                         | 
| DELETE | /delete-tempImage/:tempFileName        | Elimina imagen temporal por nombre                               | 
| GET    | /check-aws                             | Verifica conexión con AWS Rekognition                            |
| POST   | /register-and-transaction              | Registra imagen + guarda transacción                             | 
| GET    | /get-image                             | Obtiene imagen temporal almacenada                               | 
| GET    | /images/by-user/:userId                | Lista imágenes por ID de usuario                                 |
| GET    | /images/by-realfilename                | Obtiene imagen por nombre real                                   | 
| GET    | /images/by-user-date                   | Lista imágenes por usuario y fecha                               | 

# 📌 POST /api/face/identify

*Descripción*: Identifica a un usuario usando AWS Rekognition a partir de una imagen.

🔸 # Request (multipart/form-data)
Campo requerido: image (archivo de imagen)

✅ Respuesta exitosa  
 ```json
    {
      "success": true,
      "confidence": 99.85,
      "user": {
        "id": 1,
        "face_id": "abc123",
        "external_image_id": "img789",
        "created_at": "2024-01-01T12:34:56.000Z"
      },
      "image_file_path": "face_xyz_172345678.jpg"
    }

  ```
❌ Error al obtener las transacciones
 - 400: No se envió archivo de imagen
 - 404: Rostro no reconocido
 - 500: Error interno

📎 Ejemplo curl
 ```bash
    curl -X POST http://localhost:3000/api/face/identify \
      -H "Content-Type: multipart/form-data" \
      -F "image=@/ruta/a/imagen.jpg"
 ```
# 📌 POST /api/face/register-image

*Descripción*: Registra una imagen temporal en el bucket definitivo de GCS.

🔸 Request body (al menos uno requerido)
 ```json
    {
      "userId": 1,
      "tempFileName": "face_xyz_172345678.jpg",
      "realFileName": "entrada_001"
    }

  ```

✅ Respuesta exitosa  
 ```json
    {
      "success": true,
      "confidence": 99.85,
      "user": {
        "id": 1,
        "face_id": "abc123",
        "external_image_id": "img789",
        "created_at": "2024-01-01T12:34:56.000Z"
      },
      "image_file_path": "face_xyz_172345678.jpg"
    }

  ```
❌ Error al obtener las transacciones
 - 400: No se envió archivo de imagen
 - 404: Rostro no reconocido
 - 500: Error interno

📎 Ejemplo curl
 ```bash
    curl -X POST http://localhost:3000/api/face/identify \
      -H "Content-Type: multipart/form-data" \
      -F "image=@/ruta/a/imagen.jpg"
 ```
