
# Shopping List CRUD API – DU4

Backend aplikace pro domácí úkol č. 4

## 1. Instalace a spuštění


npm install

npm start


Aplikace poběží na portu `3000`.

## 2. Autentizace / profily

Profil uživatele se předává v HTTP hlavičce:

- `x-user-profile: user`
- `x-user-profile: owner`
- `x-user-profile: member`

Middleware `auth` uloží profil do `req.user.profile` a mockované `req.user.id`.

## 3. End-pointy (uuCmds)

- `POST /shoppingList/create`
- `GET /shoppingList/get?id=...`
- `GET /shoppingList/listMine?includeArchived=true|false`
- `POST /shoppingList/archive`
- `POST /shoppingList/delete`
- `POST /shoppingList/member/add`
- `POST /shoppingList/member/remove`
- `POST /shoppingList/item/add`
- `POST /shoppingList/item/update`
- `POST /shoppingList/item/remove`
- `POST /shoppingList/item/setCompleted`

Každý end-point:

- validuje `dtoIn`,
- kontroluje oprávnění dle profilu,
- provádí CRUD operace nad MongoDB kolekcí `shoppinglists`,
- vrací `dtoOut` ve struktuře navržené v DU3,
- v případě chyby vrací JSON `{ errorCode, message, param? }`.

## 4. Testování (Insomnia / Postman)

Pro každý uuCmd si v Insomnia vytvoř HTTP request:

- nastav URL, metodu,
- nastav hlavičku `x-user-profile`,
- nastav JSON body / query param dle `dtoIn`.

Následně můžeš projekt z Insomnia exportovat do souboru
a uložit ho do složky `test/insomnia` v tomto repozitáři (podle zadání DU4).
