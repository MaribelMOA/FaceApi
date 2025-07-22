# 🧠 FaceAPI - Servicio de Identificación Facial y Registro de Transacciones

FaceAPI es un microservicio backend desarrollado en Node.js, orientado a:

1. Registro de Transacciones: Persistir operaciones de cambio de divisa realizadas exitosamente por los usuarios en cajeros automáticos.
2. Consulta de Acumulado Diario: Consultar el total en dólares operado por un usuario en las últimas 24 horas.
3. Identificación Facial: Usar AWS Rekognition para identificar usuarios cuando se superan límites de operación, cumpliendo con normativas fiscales y de prevención de lavado de dinero.
---

🧱 Arquitectura General

- *Node.js + Express* como backend principal.
- *Base de datos relacional* (PostgreSQL recomendada) con 2 tablas principales: users y transactions.
- AWS Rekognition para reconocimiento facial.
- Manejo de archivos temporales y carga de imágenes.
- Rutas organizadas en tres módulos:
    - /api/user
    - /api/transactions
    - /api/face
      
---
⚙️ Requisitos

- Node.js y Express.js para el backend
- Docker y Docker Compose para contenerización del entorno
- Google Cloud Storage para el almacenamiento de imágenes faciales
- Cuenta de AWS con permisos para Rekognition (crear un IAM User con AwsRekognitionFullAccess)
- PostgreSQL como base de datos (asumido por init.sql, puedes ajustar si es otra)
- .env con claves de configuración necesarias para los servicios externos
---

✅ ESTRUCTURA DE PROYECTO 
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
⚙️ Instalación y Puesta en Marcha

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
#🧪 Verificación
Puedes probar las rutas con herramientas como Postman o Swagger si lo integras.
