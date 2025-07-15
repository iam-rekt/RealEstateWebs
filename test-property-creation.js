// Test property creation after fixing field name mismatches
const fs = require('fs');

async function testPropertyCreation() {
  console.log('Testing property creation after fixes...\n');
  
  try {
    // First, login as admin
    const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Admin login failed');
      return;
    }
    
    // Get the cookie from the login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✓ Admin login successful');
    
    // Test creating a property with correct field names
    const propertyData = {
      title: 'أرض سكنية في الزرقاء',
      description: 'أرض سكنية مميزة في منطقة الزرقاء، مساحة ممتازة ومناسبة للبناء',
      price: '75000',
      size: 1200,
      bedrooms: 0,
      bathrooms: 0,
      propertyType: 'land',
      images: [],
      governorateId: null,
      directorateId: null,
      village: 'الزرقاء',
      basin: null,
      neighborhood: 'حي الأمير محمد',
      plotNumber: '456',
      isFeatured: false,  // Correct field name (was 'featured')
      isPublished: true   // Correct field name (was 'available')
    };
    
    console.log('\nTesting property creation with correct field names:');
    console.log('- Using isFeatured instead of featured');
    console.log('- Using isPublished instead of available');
    console.log('- Removed location and address fields');
    
    const createResponse = await fetch('http://localhost:5000/api/admin/properties', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify(propertyData)
    });
    
    if (createResponse.ok) {
      const property = await createResponse.json();
      console.log('\n✅ Property created successfully!');
      console.log('Property ID:', property.id);
      console.log('Title:', property.title);
      
      // Test fetching all properties to verify it's in the list
      const listResponse = await fetch('http://localhost:5000/api/properties');
      const properties = await listResponse.json();
      console.log('\n✓ Total properties in system:', properties.length);
      
      const newProperty = properties.find(p => p.id === property.id);
      if (newProperty) {
        console.log('✓ New property found in listings');
        console.log('✓ Property is published:', newProperty.isPublished);
        console.log('✓ Property is featured:', newProperty.isFeatured);
      }
      
    } else {
      const error = await createResponse.json();
      console.error('\n❌ Property creation failed:');
      console.error('Status:', createResponse.status);
      console.error('Error:', error.message || JSON.stringify(error));
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

// Run the test
testPropertyCreation();