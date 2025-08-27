-- Verify specific users from your screenshot are properly migrated

-- Check for the specific users I can see in your screenshot
SELECT 
    'Verification of Screenshot Users' as check_type,
    au.email,
    au.raw_user_meta_data->>'display_name' as auth_display_name,
    u.name as db_name,
    u.role,
    u.status,
    CASE 
        WHEN u.id IS NOT NULL THEN '✅ Migrated'
        ELSE '❌ Missing'
    END as migration_status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email IN (
    'dantong@apillis.com',
    'tran.minh@factoryplus.com',
    'le.duc@factoryplus.com',
    'pham.lan@factoryplus.com',
    'hoang.tuan@factoryplus.com',
    'vo.mai@factoryplus.com',
    'dang.linh@factoryplus.com',
    'bui.hung@factoryplus.com',
    'nguyen.huong@factoryplus.com',
    'ly.hoa@factoryplus.com',
    'dinh.khoa@factoryplus.com',
    'cao.nga@factoryplus.com',
    'vu.tam@viettech.com.vn',
    'do.xuan@viettech.com.vn',
    'michael.johnson@autotech.com',
    'rachel.green@autotech.com',
    'ngo.thanh@factoryplus.com'
)
ORDER BY au.email;