export PATH := ./node_modules/.bin:$(PATH)

default: install build

install:
	npm install

build: build-webpack
build-webpack:
	NODE_ENV=production webpack --progress --hide-modules

watch:
	webpack-dev-server

deploy:
	surge .
