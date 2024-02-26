docker container prune -f
docker image prune -f

docker build -t registry.digitalocean.com/poestack/credit-api:latest -f ./src/credit-api/Dockerfile . --platform=linux/amd64
docker push registry.digitalocean.com/poestack/credit-api:latest
