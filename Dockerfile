#Issu de https://modern-javascript.fr/docker-typescript-node-win/
#mais adapté à npm, version de node changée, ajout du .env

###
### Première partie : Compilation du code Typescript
###
FROM node:14.16.1-slim as tsc-builder
WORKDIR /usr/src/app

# Installation des dépendances et build.
COPY . .
RUN npm install && npm run build-ts

###
### Construction de l'image de production (2ème partie)
###
FROM node:14.16.1-slim
WORKDIR /usr/src/app

# On copie les sources compilées depuis la première étape
COPY --from=tsc-builder /usr/src/app/build ./build
COPY --from=tsc-builder ["/usr/src/app/package.json", "/usr/src/app/package-lock.json", "./"]

# On copie le .env
COPY --from=tsc-builder /usr/src/app/.env ./

# Installation des modules de production seulement
RUN npm install --production

# On expose le port 4000 en sortie
EXPOSE 4000

# La commande de lancement
CMD [ "node", "./build/index.js" ]