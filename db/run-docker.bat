@echo off
docker build -t padel-db .
docker run -p 5432:5432 -d padel-db
