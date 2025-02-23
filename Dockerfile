FROM nginx:alpine-slim

LABEL maintainer="Peter Marks <peter.marks@gmail.com>"

COPY site/ /usr/share/nginx/html/
