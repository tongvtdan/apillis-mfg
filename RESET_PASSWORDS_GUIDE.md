# Reset Passwords for Existing Users

Since you can't delete the existing auth users, here's how to reset their passwords to `DemoFP123`:

## Method 1: Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. **For each user you want to reset:**
   - Click on the user's email
   - Click **"Reset Password"** 
   - This will send a reset email, but you can also set a new password directly
   - Set password to: `DemoFP123`
   - Make sure **"Email Confirmed"** is checked

## Method 2: Bulk Password Reset via SQL

1. **Run `database/update-existing-passwords.sql`** first to confirm all emails
2. **Then use Supabase CLI** (if you have it installed):

```bash
# For each user, run:
supabase auth update --password=DemoFP123 --email=tran.minh@factoryplus.com
supabase auth update --password=DemoFP123 --email=le.duc@factoryplus.com
# ... etc for each user
```

## Method 3: Manual Password Reset (Recommended)

Since the dashboard method is most reliable, here are the specific users to update:

### Users to Reset (Password: DemoFP123)

1. **tran.minh@factoryplus.com** - Trần Văn Minh
2. **le.duc@factoryplus.com** - Lê Văn Đức  
3. **pham.lan@factoryplus.com** - Phạm Thị Lan
4. **hoang.tuan@factoryplus.com** - Hoàng Văn Tuấn
5. **vo.mai@factoryplus.com** - Võ Thị Mai
6. **dang.linh@factoryplus.com** - Đặng Thị Linh
7. **bui.hung@factoryplus.com** - Bùi Văn Hùng
8. **nguyen.huong@factoryplus.com** - Nguyễn Thị Hương
9. **ly.hoa@factoryplus.com** - Lý Thị Hoa
10. **dinh.khoa@factoryplus.com** - Đinh Văn Khoa
11. **cao.nga@factoryplus.com** - Cao Thị Nga
12. **vu.tam@viettech.com.vn** - Vũ Minh Tâm
13. **do.xuan@viettech.com.vn** - Đỗ Thị Xuân
14. **michael.johnson@autotech.com** - Michael Johnson
15. **rachel.green@autotech.com** - Rachel Green
16. **ngo.thanh@factoryplus.com** - Ngô Văn Thành

## Steps for Each User:

1. **Click on the user's email** in the Supabase Dashboard
2. **Set new password:** `DemoFP123`
3. **Ensure email is confirmed** ✓
4. **Save changes**

## After Resetting Passwords:

All users can then sign in with:
- **Their existing email**
- **Password:** `DemoFP123`

## Test Sign-In:

Try with any user:
- **Email:** `tran.minh@factoryplus.com`
- **Password:** `DemoFP123`

The system should work perfectly since the database records are already properly synced!