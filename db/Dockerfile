FROM postgres:latest
ENV POSTGRES_DB padel-db-dev
ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD postgres

COPY ./padel-db-dev.sql /docker-entrypoint-initdb.d/