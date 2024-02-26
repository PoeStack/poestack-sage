docker container prune -f
docker image prune -f

docker build -t registry.digitalocean.com/poestack/green-app:latest -f ./src/green-app/Dockerfile . --platform=linux/amd64
docker push registry.digitalocean.com/poestack/green-app:latest
