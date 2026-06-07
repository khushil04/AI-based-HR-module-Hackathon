# Payroll API

Base URL: `http://localhost:5000/api`  
Header: `Authorization: Bearer <token>`

## Salary formula

```
finalSalary = baseSalary + bonus - tax - deductions
```

(Net pay is never negative.)

## Roles

| Action | ADMIN | MANAGER | EMPLOYEE |
|--------|-------|---------|----------|
| List / View payslip | Yes | Yes | Own only |
| Create / Update | Yes | Yes | No |
| Delete | Yes | No | No |
| Report | Yes | Yes | No |

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/payroll` | List payslips |
| GET | `/payroll/report` | Payroll summary |
| GET | `/payroll/:id` | Single payslip |
| POST | `/payroll` | Generate payslip |
| PUT | `/payroll/:id` | Update payslip |
| DELETE | `/payroll/:id` | Delete (ADMIN only) |

## Create payslip

```json
{
  "employeeId": "<employee_mongo_id>",
  "periodMonth": 6,
  "periodYear": 2026,
  "baseSalary": 50000,
  "bonus": 5000,
  "tax": 3000,
  "deductions": 1000,
  "status": "PROCESSED",
  "notes": "June payroll"
}
```

One payslip per employee per month/year (unique constraint).
