# Auth API Contract

Base URL: `http://localhost:5000/api`

## Register

- **POST** `/auth/register`
- Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "password": "secure123",
  "role": "EMPLOYEE"
}
```

## Login

- **POST** `/auth/login`
- Body:

```json
{
  "email": "jane@company.com",
  "password": "secure123"
}
```

## Me

- **GET** `/auth/me`
- Header: `Authorization: Bearer <jwt_token>`
