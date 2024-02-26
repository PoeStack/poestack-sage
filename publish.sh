docker rmi -f $(docker images -aq)
docker container prune -f
docker image prune -f
gradle npmInstall
gradle npmBuild
docker build -t localsage . --platform=linux/amd64
docker tag localsage registry.digitalocean.com/poestack/sage
docker push registry.digitalocean.com/poestack/sage
