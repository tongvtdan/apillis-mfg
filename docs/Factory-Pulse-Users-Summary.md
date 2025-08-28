

## **Complete User Accounts List - All Details**

| **Email**                     | **Name**         | **Role**        | **Department**     | **Status** | **UUID**                               | **Created**         |
| ----------------------------- | ---------------- | --------------- | ------------------ | ---------- | -------------------------------------- | ------------------- |
| `admin@factorypulse.vn`       | Lê Văn Sơn       | **admin**       | IT                 | active     | `550e8400-e29b-41d4-a716-446655440012` | 2025-08-28 10:23:20 |
| `ceo@factorypulse.vn`         | Nguyễn Văn Minh  | **management**  | Executive          | active     | `550e8400-e29b-41d4-a716-446655440002` | 2025-08-28 10:23:20 |
| `customer@factorypulse.vn`    | Trần Thị Kim     | **customer**    | Customer Relations | active     | `550e8400-e29b-41d4-a716-446655440011` | 2025-08-28 10:23:20 |
| `engineering@factorypulse.vn` | Nguyễn Thị Lan   | **engineering** | Engineering        | active     | `550e8400-e29b-41d4-a716-446655440006` | 2025-08-28 10:23:20 |
| `operations@factorypulse.vn`  | Trần Thị Hương   | **management**  | Operations         | active     | `550e8400-e29b-41d4-a716-446655440003` | 2025-08-28 10:23:20 |
| `procurement@factorypulse.vn` | Phạm Văn Hùng    | **procurement** | Procurement        | active     | `550e8400-e29b-41d4-a716-446655440005` | 2025-08-28 10:23:20 |
| `production@factorypulse.vn`  | Lê Thị Mai       | **production**  | Production         | active     | `550e8400-e29b-41d4-a716-446655440008` | 2025-08-28 10:23:20 |
| `qa@factorypulse.vn`          | Trần Văn Dũng    | **qa**          | Quality Assurance  | active     | `550e8400-e29b-41d4-a716-446655440007` | 2025-08-28 10:23:20 |
| `quality@factorypulse.vn`     | Lê Văn Tuấn      | **management**  | Quality            | active     | `550e8400-e29b-41d4-a716-446655440004` | 2025-08-28 10:23:20 |
| `sales@factorypulse.vn`       | Võ Văn Nam       | **sales**       | Sales              | active     | `550e8400-e29b-41d4-a716-446655440009` | 2025-08-28 10:23:20 |
| `supplier@factorypulse.vn`    | Nguyễn Văn Thành | **supplier**    | Procurement        | active     | `550e8400-e29b-41d4-a716-446655440010` | 2025-08-28 10:23:20 |
| `support@factorypulse.vn`     | Phạm Thị Nga     | **customer**    | Support            | active     | `550e8400-e29b-41d4-a716-446655440013` | 2025-08-28 10:23:20 |

### **Login Credentials**
- **Email**: Any of the emails listed above
- **Password**: `Password123!` (same for all users)

### **Role Distribution**
- **admin**: 1 user (admin@factorypulse.vn)
- **management**: 3 users (ceo, operations, quality)
- **engineering**: 1 user
- **qa**: 1 user
- **production**: 1 user
- **procurement**: 1 user
- **sales**: 1 user
- **supplier**: 1 user
- **customer**: 2 users (customer, support)

### **About the "admin role showing as customer" Issue**
The database correctly shows `admin@factorypulse.vn` with role `admin`. If the application is displaying it as `customer`, this suggests:

1. **You might be signed in as a different account** (like `customer@factorypulse.vn` or `support@factorypulse.vn`)
2. **There could be a bug in the profile display logic**
3. **The session might be using cached or incorrect data**

To resolve this, try signing out completely and signing in again with `admin@factorypulse.vn` and password `Password123!`.