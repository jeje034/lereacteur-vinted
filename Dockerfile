#https://modern-javascript.fr/docker-typescript-node-win/ adapté à npm et version de node changée

###
### Première partie : Compilation du code Typescript
###
#FROM node:10.15-jessie-slim as tsc-builder
FROM node:14.16.1-slim as tsc-builder
WORKDIR /usr/src/app

# Installation des dépendances et build.
COPY . .
# RUN yarn install && yarn run build
RUN npm install && npm run build-ts

###
### Construction de l'image de production (2ème partie)
###
#FROM node:10.15-jessie-slim as runtime-container
FROM node:14.16.1-slim
WORKDIR /usr/src/app

# On copie les sources compilées depuis la première étape
COPY --from=tsc-builder /usr/src/app/build ./build
#COPY --from=tsc-builder /usr/src/app/locales ./locales
#COPY --from=tsc-builder ["/usr/src/app/package.json", "/usr/src/app/yarn.lock", "./"]
COPY --from=tsc-builder ["/usr/src/app/package.json", "/usr/src/app/package-lock.json", "./"]

# Installation des modules de production seulement
# RUN yarn install --prod
RUN npm install --production

# On expose le port 4000 en sortie
EXPOSE 4000

# La commande de lancement
#CMD [ "node", "./build/main.js" ]
CMD [ "node", "./build/index.js" ]