# Wallet-app

Unique network wallet application

## Commands

Start project locally

Starts project on [http://localhost:3000](http://localhost:3000) into development mode.

### `yarn start`

For production build

### `yarn build`

Docker build

`docker build -t unique-marketplace:prod .`

`docker run -p 8080:80 -t unique-marketplace:prod`

apps - точка входа в приложение

apps-config - настройки, включая envConfig, api endpoints и другое, касаемо разных сетей.

apps-routing - роуты, здесь мы создаем файлы для каждой отдельной страницы, описываем ее свойства.

page-accounts - отвечает за создание, импорт, хранение и отображение non-extension аккаунтов, трансферы unique.

page-nft-market - страница маркета, отвечает за отображение и поиск токенов, выставленных на продажу.

page-nft-trades - отвечает за историю сделок (trades)

page-nft-wallet - отвечает за кошелек, поиск и добавление токенов в кошелек, отображение их в кошельке, создание и редактирование коллекций и токенов.

react-api - отвечает за подключение api - контекст, позволяющий работать с апи polkadot

react-components - переиспользуемые компоненты для разных страниц

react-hooks - переиспользуемые хуки

react-params - различные настройки для компонент.

react-query - отвечает за очередь транзакций

react-signer - подписчик транзакций

test-support - моки для тестов
