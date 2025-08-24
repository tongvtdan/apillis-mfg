// Simple test script to verify the project service works
console.log('🧪 Testing Project Service...');

// Test the mock data
import { getMockProjectById } from './src/data/mockProjects.ts';

const testId = '11111111-1111-1111-1111-111111111003';
console.log(`🔍 Testing project ID: ${testId}`);

try {
    const project = getMockProjectById(testId);
    if (project) {
        console.log('✅ Mock project found:');
        console.log(`  - ID: ${project.id}`);
        console.log(`  - Project ID: ${project.project_id}`);
        console.log(`  - Title: ${project.title}`);
        console.log(`  - Status: ${project.status}`);
        console.log(`  - Customer: ${project.customer?.company || project.contact_name}`);
    } else {
        console.log('❌ Mock project not found');
    }
} catch (error) {
    console.error('❌ Error testing mock data:', error);
}

console.log('🎉 Test complete!');