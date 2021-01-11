FROM node:12

LABEL "com.github.actions.name"="Verdaccio Private Registry"
LABEL "com.github.actions.description"="Publish on Verdaccio v4"
LABEL "com.github.actions.icon"="package"
LABEL "com.github.actions.color"="#4b5e40"

LABEL "repository"="https://github.com/verdaccio/github-actions"
LABEL "homepage"="https://github.com/verdaccio/github-actions"
LABEL "maintainer"="Juan Picado <juanpicado19@gmail.com>"

RUN npm install -g verdaccio && \
	  npm install -g verdaccio-auth-memory && \
		npm install -g verdaccio-memory && \
		npm install -g npm-auth-to-token@1.0.0

COPY config.yaml /config.yaml

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
