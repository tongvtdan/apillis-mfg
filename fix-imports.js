const fs = require('fs');
const path = require('path');

const importMappings = [
    {
        pattern: "from '@/hooks/use-toast'",
        replacement: "from '@/shared/hooks/use-toast'"
    },
    {
        pattern: "from '@/hooks/useCustomerOrganizations'",
        replacement: "from '@/features/customer-management/hooks/useCustomerOrganizations'"
    },
    {
        pattern: "from '@/hooks/useSuppliers'",
        replacement: "from '@/features/supplier-management/hooks/useSuppliers'"
    },
    {
        pattern: "from '@/hooks/usePermissions'",
        replacement: "from '@/core/auth/hooks/usePermissions'"
    },
    {
        pattern: "from '@/hooks/usePermissionsAdmin'",
        replacement: "from '@/core/auth/hooks/usePermissionsAdmin'"
    },
    {
        pattern: "from '@/hooks/useUsers'",
        replacement: "from '@/features/customer-management/hooks/useUsers'"
    },
    {
        pattern: "from '@/hooks/useProjectReviews'",
        replacement: "from '@/features/engineering-review/hooks/useProjectReviews'"
    },
    {
        pattern: "from '@/hooks/useProjectUpdate'",
        replacement: "from '@/features/project-management/hooks/useProjectUpdate'"
    }
];

function findFiles(dir, ext) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
                files.push(...findFiles(fullPath, ext));
            }
        } else if (stat.isFile() && path.extname(fullPath) === ext) {
            files.push(fullPath);
        }
    }

    return files;
}

function fixImportsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const mapping of importMappings) {
            if (content.includes(mapping.pattern)) {
                content = content.replace(new RegExp(mapping.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), mapping.replacement);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed imports in: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

console.log('🔍 Finding TypeScript and JavaScript files...');
const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir, '.tsx').concat(findFiles(srcDir, '.ts'));

console.log(`📁 Found ${files.length} files to process`);

for (const file of files) {
    fixImportsInFile(file);
}

console.log('✅ Import fixing complete!');
