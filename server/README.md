# server

### System Requirements
1. `npm` - `9.6.6`
2. `node` - `v20.2.0`
3. `openssl` - `OpenSSL 1.1.1n  15 Mar 2022`

### Setup Instructions
```sh
openssl genpkey -algorithm RSA -out private.pem
openssl rsa -pubout -in private.pem -out public.pem
npm install
cp .env.example .env
```

### Running Instructions
```sh
npm run db:reset
npm run db:seed <insert-admin-email> <insert-password>
npm start
```

### Notes
- you are expected to fill out the `.env` file during setup
- you are expected to provide your own admin credentials for database seeding
