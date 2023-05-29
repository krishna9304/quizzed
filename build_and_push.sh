#!/bin/bash

# GitHub details
GITHUB_BRANCH="main"

# Prompt the user for a commit message
read -p "Enter a commit message: " COMMIT_MESSAGE

# Add, commit, and push changes to GitHub
git add .
git commit -m "$COMMIT_MESSAGE"
git push origin $GITHUB_BRANCH

# Docker details
IMAGE1_NAME="krishna9304/quizzed_auth:latest"
IMAGE2_NAME="krishna9304/quizzed_quiz:latest"

# Build and push the Docker image for auth
cd apps/auth
docker build ../../ -f Dockerfile -t $IMAGE1_NAME
docker push $IMAGE1_NAME
cd ../..

# Build and push the Docker image for quiz
cd apps/quiz
docker build ../../ -f Dockerfile -t $IMAGE2_NAME
docker push $IMAGE2_NAME
cd ../..

echo "Build and push done."
