#!/bin/bash

# Fix User ID Mismatches Script
# This script fixes ID mismatches by temporarily disabling foreign key constraints

DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"

echo "🚀 Fixing User ID Mismatches with Direct SQL..."

# User ID mappings
declare -A user_mappings=(
    ["083f04db-458a-416b-88e9-94acf10382f8"]="e562c228-5322-4ed3-8998-d06f060c367e"  # admin
    ["99845907-7255-4155-9dd0-c848ab9860cf"]="1ca3818e-878a-495f-a2a4-1657c82267d4"  # ceo
    ["a1f24ed5-319e-4b66-8d21-fbc70d07ea09"]="bd501374-d7ef-48ef-a166-48d066ec4b8a"  # sales
    ["c91843ad-4327-429a-bf57-2b891df50e18"]="b6793310-b9be-48be-8643-9e1ad1d9b496"  # procurement
    ["776edb76-953a-4482-9533-c793a633cc27"]="7c6e33b0-e4b7-4fca-9f8a-efe520266e41"  # engineering
)

echo "📋 Found ${#user_mappings[@]} user ID mismatches to fix"

# Step 1: Disable foreign key constraints
echo ""
echo "🔄 Disabling foreign key constraints..."
psql "$DB_URL" -c "ALTER TABLE projects DISABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not disable projects triggers"
psql "$DB_URL" -c "ALTER TABLE project_assignments DISABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not disable project_assignments triggers"
psql "$DB_URL" -c "ALTER TABLE documents DISABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not disable documents triggers"
psql "$DB_URL" -c "ALTER TABLE reviews DISABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not disable reviews triggers"
psql "$DB_URL" -c "ALTER TABLE messages DISABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not disable messages triggers"
psql "$DB_URL" -c "ALTER TABLE notifications DISABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not disable notifications triggers"
psql "$DB_URL" -c "ALTER TABLE activity_log DISABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not disable activity_log triggers"

echo "✅ Foreign key constraints disabled"

# Step 2: Update all references for each user
for old_id in "${!user_mappings[@]}"; do
    new_id="${user_mappings[$old_id]}"
    
    echo ""
    echo "👤 Updating references: $old_id → $new_id"
    
    # Update all tables that reference user IDs
    echo "   🔄 Updating projects.assigned_to..."
    psql "$DB_URL" -c "UPDATE projects SET assigned_to = '$new_id' WHERE assigned_to = '$old_id';"
    
    echo "   🔄 Updating projects.created_by..."
    psql "$DB_URL" -c "UPDATE projects SET created_by = '$new_id' WHERE created_by = '$old_id';"
    
    echo "   🔄 Updating project_assignments.user_id..."
    psql "$DB_URL" -c "UPDATE project_assignments SET user_id = '$new_id' WHERE user_id = '$old_id';"
    
    echo "   🔄 Updating documents.uploaded_by..."
    psql "$DB_URL" -c "UPDATE documents SET uploaded_by = '$new_id' WHERE uploaded_by = '$old_id';"
    
    echo "   🔄 Updating reviews.reviewer_id..."
    psql "$DB_URL" -c "UPDATE reviews SET reviewer_id = '$new_id' WHERE reviewer_id = '$old_id';"
    
    echo "   🔄 Updating reviews.created_by..."
    psql "$DB_URL" -c "UPDATE reviews SET created_by = '$new_id' WHERE created_by = '$old_id';"
    
    echo "   🔄 Updating messages.sender_id..."
    psql "$DB_URL" -c "UPDATE messages SET sender_id = '$new_id' WHERE sender_id = '$old_id';"
    
    echo "   🔄 Updating notifications.user_id..."
    psql "$DB_URL" -c "UPDATE notifications SET user_id = '$new_id' WHERE user_id = '$old_id';"
    
    echo "   🔄 Updating activity_log.user_id..."
    psql "$DB_URL" -c "UPDATE activity_log SET user_id = '$new_id' WHERE user_id = '$old_id';"
    
    echo "   🔄 Updating users.id..."
    psql "$DB_URL" -c "UPDATE users SET id = '$new_id' WHERE id = '$old_id';"
    
    echo "   ✅ All references updated for user"
done

# Step 3: Re-enable foreign key constraints
echo ""
echo "🔄 Re-enabling foreign key constraints..."
psql "$DB_URL" -c "ALTER TABLE projects ENABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not enable projects triggers"
psql "$DB_URL" -c "ALTER TABLE project_assignments ENABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not enable project_assignments triggers"
psql "$DB_URL" -c "ALTER TABLE documents ENABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not enable documents triggers"
psql "$DB_URL" -c "ALTER TABLE reviews ENABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not enable reviews triggers"
psql "$DB_URL" -c "ALTER TABLE messages ENABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not enable messages triggers"
psql "$DB_URL" -c "ALTER TABLE notifications ENABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not enable notifications triggers"
psql "$DB_URL" -c "ALTER TABLE activity_log ENABLE TRIGGER ALL;" || echo "⚠️  Warning: Could not enable activity_log triggers"

echo "✅ Foreign key constraints re-enabled"

# Step 4: Verify fixes
echo ""
echo "🔍 Verifying fixes..."
echo "📊 Checking user counts:"
psql "$DB_URL" -c "SELECT COUNT(*) as auth_users FROM auth.users;"
psql "$DB_URL" -c "SELECT COUNT(*) as public_users FROM public.users;"

echo ""
echo "📋 Checking specific users:"
psql "$DB_URL" -c "SELECT email, id FROM users WHERE email IN ('admin@factorypulse.vn', 'ceo@factorypulse.vn', 'sales@factorypulse.vn', 'procurement@factorypulse.vn', 'engineering@factorypulse.vn') ORDER BY email;"

echo ""
echo "🎉 User ID Mismatch Fixing Complete!"
echo "📝 Next: Run the authentication test script to verify everything works"