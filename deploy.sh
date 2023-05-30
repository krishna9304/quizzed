#!/bin/bash

cd quizzed

git pull

# Set the names of the Docker images
IMAGE1_NAME="krishna9304/quizzed_auth:latest"
IMAGE2_NAME="krishna9304/quizzed_quiz:latest"

# Set the names of the Docker containers
CONTAINER1_NAME="quizzed_auth_server"
CONTAINER2_NAME="quizzed_quiz_server"

# Pull the Docker images from Docker Hub
docker pull $IMAGE1_NAME
docker pull $IMAGE2_NAME


# Stop and remove existing containers (if any)
docker stop $CONTAINER1_NAME >/dev/null 2>&1
docker rm $CONTAINER1_NAME >/dev/null 2>&1

docker stop $CONTAINER2_NAME >/dev/null 2>&1
docker rm $CONTAINER2_NAME >/dev/null 2>&1

# Deploy the Docker containers
docker run -d --name $CONTAINER1_NAME -p 8081:8001 --env-file=apps/auth/.env $IMAGE1_NAME
docker run -d --name $CONTAINER2_NAME -p 8080:8000 --env-file=apps/quiz/.env $IMAGE2_NAME

# Print the logs
echo "Deployment completed successfully."
