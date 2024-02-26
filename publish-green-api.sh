docker container prune -f
docker image prune -f

docker build -t registry.digitalocean.com/poestack/green-api:latest -f ./src/green-api/Dockerfile . --platform=linux/amd64
docker push registry.digitalocean.com/poestack/green-api:latest
