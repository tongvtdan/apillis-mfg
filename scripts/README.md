# Authentication Scripts

This directory contains scripts for managing user authentication in the Factory Pulse system.

## Scripts Overview

### Create Auth Users (`create-auth-users.js`)
Creates Supabase auth.users accounts from the sample data, ensuring matching IDs between auth.users and the users table.

**Usage:**
```bash
npm run create:auth-users
```

**Features:**
- Creates auth accounts with IDs matching sample-data/03-users.json
- Sets display names and user metadata
- Uses default password: `FactoryPulse@2025`
- Auto-confirms email addresses
- Includes employee_id, department, role in metadata

## Prerequisites

1. **Local Supabase Running:**
   ```bash
   supabase start
   ```

2. **Environment Variables:**
   Ensure `.env.local` contains:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_SERVICE_ROLE_KEY`

## Sample User Accounts

The script creates accounts for all users in `sample-data/03-users.json`:

| Role        | Email                                 | Name              | Department         |
| ----------- | ------------------------------------- | ----------------- | ------------------ |
| management  | ceo@factorypulse.vn                   | Nguyễn Quang Minh | Executive          |
| management  | operations@factorypulse.vn            | Trần Ngọc Hương   | Operations         |
| management  | quality@factorypulse.vn               | Lê Viết Tuấn      | Quality            |
| engineering | senior.engineer@factorypulse.vn       | Phạm Văn Dũng     | Engineering        |
| engineering | mechanical.engineer@factorypulse.vn   | Hoàng Thị Lan     | Engineering        |
| engineering | electrical.engineer@factorypulse.vn   | Vũ Đình Nam       | Engineering        |
| qa          | qa.engineer@factorypulse.vn           | Ngô Thị Hà        | Quality            |
| production  | production.supervisor@factorypulse.vn | Trịnh Văn Sơn     | Production         |
| production  | team.lead@factorypulse.vn             | Lý Thị Mai        | Production         |
| qa          | quality.inspector@factorypulse.vn     | Đặng Văn Hùng     | Quality            |
| sales       | sales.manager@factorypulse.vn         | Bùi Thị Thu       | Sales              |
| procurement | procurement@factorypulse.vn           | Lê Văn Phúc       | Procurement        |
| management  | project.coordinator@factorypulse.vn   | Phan Thị Kim      | Project Management |
| admin       | admin@factorypulse.vn                 | Võ Đình Tài       | IT                 |
| sales       | customer.service@factorypulse.vn      | Nguyễn Thị Hoa    | Customer Service   |

## Security Notes

- All users are created with default password: `FactoryPulse@2025`
- Email confirmation is automatically handled
- Service role key is required for admin operations

## Troubleshooting

**Error: Missing environment variables**
- Ensure Supabase is running locally
- Check `.env.local` file exists and contains required variables

**Error: User already exists**
- The script will skip existing users and continue
- Manually update passwords through Supabase dashboard if needed

**Error: Rate limiting**
- The script includes small delays between operations
- If issues persist, run the script again
- Use `--force` flag carefully as it overwrites existing data