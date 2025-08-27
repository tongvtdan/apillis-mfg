# Create Demo Accounts Guide

Since the other accounts can't sign in, here's how to create new demo accounts with the password `DemoFP123`:

## Method 1: Use Supabase Dashboard (Recommended)

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** for each account below
4. Use these details:

### Factory Plus Team (Management/Engineering)
```
Email: tran.minh@factoryplus.com
Password: DemoFP123
Display Name: Trần Văn Minh
✓ Email confirmed
```

```
Email: le.duc@factoryplus.com  
Password: DemoFP123
Display Name: Lê Văn Đức
✓ Email confirmed
```

```
Email: pham.lan@factoryplus.com
Password: DemoFP123
Display Name: Phạm Thị Lan
✓ Email confirmed
```

```
Email: hoang.tuan@factoryplus.com
Password: DemoFP123
Display Name: Hoàng Văn Tuấn
✓ Email confirmed
```

```
Email: vo.mai@factoryplus.com
Password: DemoFP123
Display Name: Võ Thị Mai
✓ Email confirmed
```

### Quality & Production Team
```
Email: dang.linh@factoryplus.com
Password: DemoFP123
Display Name: Đặng Thị Linh
✓ Email confirmed
```

```
Email: bui.hung@factoryplus.com
Password: DemoFP123
Display Name: Bùi Văn Hùng
✓ Email confirmed
```

```
Email: ngo.thanh@factoryplus.com
Password: DemoFP123
Display Name: Ngô Văn Thành
✓ Email confirmed
```

### Suppliers
```
Email: vu.tam@viettech.com.vn
Password: DemoFP123
Display Name: Vũ Minh Tâm
✓ Email confirmed
```

```
Email: do.xuan@viettech.com.vn
Password: DemoFP123
Display Name: Đỗ Thị Xuân
✓ Email confirmed
```

### Customers
```
Email: michael.johnson@autotech.com
Password: DemoFP123
Display Name: Michael Johnson
✓ Email confirmed
```

```
Email: rachel.green@autotech.com
Password: DemoFP123
Display Name: Rachel Green
✓ Email confirmed
```

## Method 2: Quick Test Accounts (Alternative)

If you want to test quickly, create these simple accounts:

```
Email: demo1@factoryplus.com
Password: DemoFP123
Display Name: Demo User 1
Role: engineering
```

```
Email: demo2@factoryplus.com
Password: DemoFP123
Display Name: Demo User 2
Role: production
```

```
Email: supplier@viettech.com.vn
Password: DemoFP123
Display Name: Demo Supplier
Role: supplier
```

```
Email: customer@autotech.com
Password: DemoFP123
Display Name: Demo Customer
Role: customer
```

## After Creating Accounts

1. **The system will automatically create user records** in the database (thanks to our updated AuthContext)
2. **All accounts can sign in** with password `DemoFP123`
3. **Users can update their profiles** later using the profile form

## Test Sign-In

Try signing in with any of the created accounts:
- **Email:** Any of the emails above
- **Password:** `DemoFP123`

The system should work perfectly now!