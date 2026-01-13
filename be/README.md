# Nestjs Boilerplate - SASS (Software as a service) with Postgres SQL

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

![Alt text](database.png "database design")

## Requirements

- [Docker >= 26](https://docs.docker.com/install)
- [Node >= 20.16](https://nodejs.org/en/download/)
- [Postgres SQL](https://www.postgresql.org/)

## Installation

```bash
npm install
```

## Setup only database then start in the local

```bash
docker compose -f docker-compose-db.yml up --build
```

## Running the app

```bash
cp .env.example .env

# development
npm run start

# watch mode
npm run start:dev
```

## API documentation

http://localhost:8000/api

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

Config [Unit Test Report](https://stackoverflow.com/questions/24825860/how-to-get-the-code-coverage-report-using-jest) to HTML in package.json

```bash
"jest": {
    "collectCoverage": true,
    "coverageReporters": ["json", "html"],
}
```


## Data test VNPay:
Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ:NGUYEN VAN A
Ngày phát hành:07/15
Mật khẩu OTP:123456
-> Thành công


## License

Nest is [MIT licensed](LICENSE).


// cancel chưa trừ stock
// ban user (có xử lý order như nào)