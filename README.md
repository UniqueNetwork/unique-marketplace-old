# Usetech nft marketplace

За основу взят [Create React App](https://github.com/facebook/create-react-app) на 17 react и 4 typescript.
К нему добавлен ant.design 4.8

## Доступные команды

Запуск проекта локально

### `yarn start`

Запускает проект [http://localhost:3000](http://localhost:3000) в development mode.

Для запуска тестов

### `yarn test`

Для продакшен сборки

### `yarn build`

Docker сборка

`docker build -t marketplace:prod .`

`docker run -p 8080:80 -t marketplace:prod`

### Документация по разработке

[https://digitalmerch.atlassian.net/wiki/spaces/MD/pages/1926332420/frontend]
