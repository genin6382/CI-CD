# README 

## Documenting learning journey

## My Learning Journey

### 1. Created a Sample Node.js App
* A simple API to manage users and metrics.
* Used Express.js for the server framework.
* Implemented database connection logic with the `pg` library.

### 2. Dockerized the App
* Created a `Dockerfile` to containerize the Node.js application.
* Explained the purpose of each layer, including copying `package.json`, installing dependencies, and copying the source code.
* Set up an `entrypoint.sh` script to handle a  startup process, including waiting for the database to be ready and running migrations.

### 3. Created Docker Compose for PostgreSQL and Node.js
* Wrote a `docker-compose.yml` file to manage both the Node.js app and a PostgreSQL database.
* Explained service relationships and configurations, such as:
  - **`depends_on: service_healthy`**: To prevent a race condition where the Node.js app tries to connect before the database is ready.

### 4. Started deploying the app in a multi-node k8s cluster
* Used StatefulSet and Headless service to host the PostgreSQL database 
* Used Deployments to host Node.js backend . Exposed the backend using NodePort service .

