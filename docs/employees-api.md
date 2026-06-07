# Employees API Contract

Base URL: `http://localhost:5000/api`

All routes require: `Authorization: Bearer <jwt_token>`

## Roles

| Action | ADMIN | MANAGER | RECRUITER |
|--------|-------|---------|-----------|
| List / Get | Yes | Yes | Yes |
| Create / Update / Delete | Yes | Yes | No |

## List Employees

- **GET** `/employees`
- Query params: `page`, `limit`, `search`, `department`, `status` (`ACTIVE` | `INACTIVE`)

Response:

```json
{
  "employees": [],
  "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 1 }
}
```

## Get Employee

- **GET** `/employees/:id`

## Create Employee

- **POST** `/employees`
- Body:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "department": "Engineering",
  "position": "Software Engineer",
  "hireDate": "2024-01-15",
  "status": "ACTIVE"
}
```

## Update Employee

- **PUT** `/employees/:id`
- Body: partial fields from create

## Delete Employee

- **DELETE** `/employees/:id`
