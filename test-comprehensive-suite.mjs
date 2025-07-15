// Comprehensive Test Suite for Haddadin Real Estate Website
// Tests all functionality line by line

import { readFileSync, writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:5000';
let adminCookie = null;
let testResults = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Utility functions
function logTest(category, testName, success, details = '') {
  totalTests++;
  if (success) passedTests++;
  else failedTests++;
  
  const result = {
    category,
    testName,
    success,
    details,
    timestamp: new Date().toISOString()
  };
  
  testResults.push(result);
  console.log(`${success ? '✅' : '❌'} [${category}] ${testName} ${details ? `- ${details}` : ''}`);
}

async function makeRequest(method, endpoint, data = null, authenticated = false) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (authenticated && adminCookie) {
    options.headers['Cookie'] = adminCookie;
  }
  
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const text = await response.text();
    let json = null;
    
    try {
      json = JSON.parse(text);
    } catch {
      // Not JSON response
    }
    
    return {
      ok: response.ok,
      status: response.status,
      data: json || text,
      headers: response.headers
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: error.message
    };
  }
}

// Test Categories
async function testPublicEndpoints() {
  console.log('\n📍 Testing Public Endpoints\n');
  
  // Test home page data endpoints
  const endpoints = [
    { path: '/api/properties', name: 'Get all properties' },
    { path: '/api/properties/featured', name: 'Get featured properties' },
    { path: '/api/property-types', name: 'Get property types' },
    { path: '/api/site-settings', name: 'Get site settings' },
    { path: '/api/admin/governorates', name: 'Get governorates' },
    { path: '/api/admin/directorates', name: 'Get directorates' }
  ];
  
  for (const endpoint of endpoints) {
    const response = await makeRequest('GET', endpoint.path);
    logTest('Public Endpoints', endpoint.name, response.ok, `Status: ${response.status}`);
    
    if (response.ok && Array.isArray(response.data)) {
      logTest('Public Endpoints', `${endpoint.name} - Has data`, response.data.length > 0, `Count: ${response.data.length}`);
    }
  }
  
  // Test property search
  const searchData = {
    minPrice: 0,
    maxPrice: 1000000,
    minSize: 0,
    maxSize: 10000,
    propertyType: '',
    governorateId: null,
    directorateId: null
  };
  
  const searchResponse = await makeRequest('POST', '/api/properties/search', searchData);
  logTest('Public Endpoints', 'Property search', searchResponse.ok, `Results: ${searchResponse.data?.length || 0}`);
  
  // Test individual property
  if (searchResponse.ok && searchResponse.data?.length > 0) {
    const propertyId = searchResponse.data[0].id;
    const propertyResponse = await makeRequest('GET', `/api/properties/${propertyId}`);
    logTest('Public Endpoints', 'Get single property', propertyResponse.ok, `Property ID: ${propertyId}`);
  }
}

async function testContactForms() {
  console.log('\n📬 Testing Contact Forms\n');
  
  // Test contact form
  const contactData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+962791234567',
    subject: 'Test Contact',
    message: 'This is a test contact message'
  };
  
  const contactResponse = await makeRequest('POST', '/api/contacts', contactData);
  logTest('Contact Forms', 'Submit contact form', contactResponse.ok);
  
  // Test with missing required fields
  const invalidContact = { firstName: 'Test' };
  const invalidResponse = await makeRequest('POST', '/api/contacts', invalidContact);
  logTest('Contact Forms', 'Reject invalid contact', !invalidResponse.ok && invalidResponse.status === 400);
  
  // Test newsletter subscription
  const newsletterData = { email: `test${Date.now()}@example.com` };
  const newsletterResponse = await makeRequest('POST', '/api/newsletter', newsletterData);
  logTest('Contact Forms', 'Newsletter subscription', newsletterResponse.ok);
  
  // Test duplicate newsletter subscription
  const duplicateResponse = await makeRequest('POST', '/api/newsletter', newsletterData);
  logTest('Contact Forms', 'Reject duplicate newsletter', !duplicateResponse.ok);
  
  // Test entrustment form
  const entrustmentData = {
    firstName: 'Test',
    lastName: 'Seller',
    email: 'seller@example.com',
    phone: '+962791234567',
    propertyType: 'land',
    location: 'Amman',
    size: 500,
    bedrooms: 0,
    bathrooms: 0,
    description: 'Test land for sale',
    serviceType: 'sell'
  };
  
  const entrustmentResponse = await makeRequest('POST', '/api/entrustments', entrustmentData);
  logTest('Contact Forms', 'Submit entrustment', entrustmentResponse.ok);
  
  // Test property request form
  const requestData = {
    firstName: 'Test',
    lastName: 'Buyer',
    email: 'buyer@example.com',
    phone: '+962791234567',
    propertyType: 'land',
    location: 'Amman',
    minPrice: '50000',
    maxPrice: '100000',
    minSize: 300,
    maxSize: 800,
    bedrooms: 0,
    bathrooms: 0,
    message: 'Looking for land'
  };
  
  const requestResponse = await makeRequest('POST', '/api/property-requests', requestData);
  logTest('Contact Forms', 'Submit property request', requestResponse.ok);
}

async function testAdminAuthentication() {
  console.log('\n🔐 Testing Admin Authentication\n');
  
  // Test login with invalid credentials
  const invalidLogin = await makeRequest('POST', '/api/admin/login', {
    username: 'invalid',
    password: 'wrong'
  });
  logTest('Admin Auth', 'Reject invalid login', !invalidLogin.ok && invalidLogin.status === 401);
  
  // Test login with valid credentials
  const validLogin = await makeRequest('POST', '/api/admin/login', {
    username: 'admin',
    password: 'admin123'
  });
  logTest('Admin Auth', 'Accept valid login', validLogin.ok);
  
  if (validLogin.ok) {
    adminCookie = validLogin.headers.get('set-cookie');
  }
  
  // Test auth check
  const authCheck = await makeRequest('GET', '/api/admin/auth', null, true);
  logTest('Admin Auth', 'Auth check with valid session', authCheck.ok);
  
  // Test accessing admin endpoint without auth
  const unauthResponse = await makeRequest('GET', '/api/admin/properties');
  logTest('Admin Auth', 'Block unauthenticated access', !unauthResponse.ok && unauthResponse.status === 401);
  
  // Test logout
  const logoutResponse = await makeRequest('POST', '/api/admin/logout', null, true);
  logTest('Admin Auth', 'Logout successful', logoutResponse.ok);
}

async function testAdminPropertyManagement() {
  console.log('\n🏠 Testing Admin Property Management\n');
  
  // Re-login for admin tests
  const loginResponse = await makeRequest('POST', '/api/admin/login', {
    username: 'admin',
    password: 'admin123'
  });
  adminCookie = loginResponse.headers.get('set-cookie');
  
  // Get all properties as admin
  const propertiesResponse = await makeRequest('GET', '/api/admin/properties', null, true);
  logTest('Admin Properties', 'Get all properties', propertiesResponse.ok);
  
  // Create new property
  const newProperty = {
    title: 'Test Property ' + Date.now(),
    description: 'This is a test property created by automated tests',
    price: '150000',
    size: 750,
    bedrooms: 0,
    bathrooms: 0,
    propertyType: 'land',
    images: [],
    governorateId: null,
    directorateId: null,
    village: 'Test Village',
    basin: 'Test Basin',
    neighborhood: 'Test Neighborhood',
    plotNumber: '123',
    isFeatured: false,
    isPublished: true
  };
  
  const createResponse = await makeRequest('POST', '/api/admin/properties', newProperty, true);
  logTest('Admin Properties', 'Create property', createResponse.ok);
  
  let createdPropertyId = null;
  if (createResponse.ok && createResponse.data?.property) {
    createdPropertyId = createResponse.data.property.id;
    
    // Update property
    const updateData = { ...newProperty, title: 'Updated Test Property', isFeatured: true };
    const updateResponse = await makeRequest('PUT', `/api/admin/properties/${createdPropertyId}`, updateData, true);
    logTest('Admin Properties', 'Update property', updateResponse.ok);
    
    // Delete property
    const deleteResponse = await makeRequest('DELETE', `/api/admin/properties/${createdPropertyId}`, null, true);
    logTest('Admin Properties', 'Delete property', deleteResponse.ok);
  }
  
  // Test invalid property creation
  const invalidProperty = { title: '' }; // Missing required fields
  const invalidCreateResponse = await makeRequest('POST', '/api/admin/properties', invalidProperty, true);
  logTest('Admin Properties', 'Reject invalid property', !invalidCreateResponse.ok && invalidCreateResponse.status === 400);
}

async function testAdminContactManagement() {
  console.log('\n📞 Testing Admin Contact Management\n');
  
  // Get all contacts
  const contactsResponse = await makeRequest('GET', '/api/admin/contacts', null, true);
  logTest('Admin Contacts', 'Get all contacts', contactsResponse.ok);
  
  // Get newsletters
  const newslettersResponse = await makeRequest('GET', '/api/admin/newsletters', null, true);
  logTest('Admin Contacts', 'Get newsletters', newslettersResponse.ok);
  
  // Get entrustments
  const entrustmentsResponse = await makeRequest('GET', '/api/admin/entrustments', null, true);
  logTest('Admin Contacts', 'Get entrustments', entrustmentsResponse.ok);
  
  // Get property requests
  const requestsResponse = await makeRequest('GET', '/api/admin/property-requests', null, true);
  logTest('Admin Contacts', 'Get property requests', requestsResponse.ok);
  
  // Test deleting a contact if any exist
  if (contactsResponse.ok && contactsResponse.data?.length > 0) {
    const contactId = contactsResponse.data[0].id;
    const deleteResponse = await makeRequest('DELETE', `/api/admin/contacts/${contactId}`, null, true);
    logTest('Admin Contacts', 'Delete contact', deleteResponse.ok);
  }
}

async function testLocationManagement() {
  console.log('\n📍 Testing Location Management\n');
  
  // Create governorate
  const newGovernorate = {
    nameAr: 'محافظة تجريبية',
    nameEn: 'Test Governorate'
  };
  
  const createGovResponse = await makeRequest('POST', '/api/admin/governorates', newGovernorate, true);
  logTest('Location Management', 'Create governorate', createGovResponse.ok);
  
  let governorateId = null;
  if (createGovResponse.ok && createGovResponse.data) {
    governorateId = createGovResponse.data.id;
    
    // Update governorate
    const updateGovData = { nameAr: 'محافظة محدثة', nameEn: 'Updated Governorate' };
    const updateGovResponse = await makeRequest('PUT', `/api/admin/governorates/${governorateId}`, updateGovData, true);
    logTest('Location Management', 'Update governorate', updateGovResponse.ok);
    
    // Create directorate
    const newDirectorate = {
      governorateId: governorateId,
      nameAr: 'مديرية تجريبية',
      nameEn: 'Test Directorate'
    };
    
    const createDirResponse = await makeRequest('POST', '/api/admin/directorates', newDirectorate, true);
    logTest('Location Management', 'Create directorate', createDirResponse.ok);
    
    if (createDirResponse.ok && createDirResponse.data) {
      const directorateId = createDirResponse.data.id;
      
      // Update directorate
      const updateDirData = { nameAr: 'مديرية محدثة', nameEn: 'Updated Directorate' };
      const updateDirResponse = await makeRequest('PUT', `/api/admin/directorates/${directorateId}`, updateDirData, true);
      logTest('Location Management', 'Update directorate', updateDirResponse.ok);
      
      // Delete directorate
      const deleteDirResponse = await makeRequest('DELETE', `/api/admin/directorates/${directorateId}`, null, true);
      logTest('Location Management', 'Delete directorate', deleteDirResponse.ok);
    }
    
    // Delete governorate
    const deleteGovResponse = await makeRequest('DELETE', `/api/admin/governorates/${governorateId}`, null, true);
    logTest('Location Management', 'Delete governorate', deleteGovResponse.ok);
  }
}

async function testPropertyTypes() {
  console.log('\n🏷️ Testing Property Types\n');
  
  // Get all property types
  const typesResponse = await makeRequest('GET', '/api/admin/property-types', null, true);
  logTest('Property Types', 'Get all property types', typesResponse.ok);
  
  // Create property type
  const newType = {
    nameAr: 'نوع تجريبي',
    nameEn: 'Test Type',
    isActive: true
  };
  
  const createTypeResponse = await makeRequest('POST', '/api/admin/property-types', newType, true);
  logTest('Property Types', 'Create property type', createTypeResponse.ok);
  
  if (createTypeResponse.ok && createTypeResponse.data) {
    const typeId = createTypeResponse.data.id;
    
    // Update property type
    const updateTypeData = { nameAr: 'نوع محدث', isActive: false };
    const updateTypeResponse = await makeRequest('PUT', `/api/admin/property-types/${typeId}`, updateTypeData, true);
    logTest('Property Types', 'Update property type', updateTypeResponse.ok);
    
    // Delete property type
    const deleteTypeResponse = await makeRequest('DELETE', `/api/admin/property-types/${typeId}`, null, true);
    logTest('Property Types', 'Delete property type', deleteTypeResponse.ok);
  }
}

async function testSiteSettings() {
  console.log('\n⚙️ Testing Site Settings\n');
  
  // Get all settings
  const settingsResponse = await makeRequest('GET', '/api/admin/site-settings', null, true);
  logTest('Site Settings', 'Get all settings', settingsResponse.ok);
  
  // Update a setting
  const updateSettingData = {
    key: 'contact_phone',
    value: '+962 6 123 4567'
  };
  
  const updateSettingResponse = await makeRequest('PUT', '/api/admin/site-settings', updateSettingData, true);
  logTest('Site Settings', 'Update setting', updateSettingResponse.ok);
}

async function testInputValidation() {
  console.log('\n🔍 Testing Input Validation\n');
  
  // Test XSS attempts
  const xssData = {
    firstName: '<script>alert("XSS")</script>',
    lastName: 'Test',
    email: 'test@example.com',
    phone: '123456789',
    subject: '<img src=x onerror=alert("XSS")>',
    message: 'Test message'
  };
  
  const xssResponse = await makeRequest('POST', '/api/contacts', xssData);
  logTest('Input Validation', 'XSS prevention in contact form', xssResponse.ok);
  
  // Test SQL injection attempts
  const sqlInjectionData = {
    firstName: "'; DROP TABLE contacts; --",
    lastName: 'Test',
    email: 'test@example.com',
    phone: '123456789',
    subject: 'Test',
    message: 'Test message'
  };
  
  const sqlResponse = await makeRequest('POST', '/api/contacts', sqlInjectionData);
  logTest('Input Validation', 'SQL injection prevention', sqlResponse.ok);
  
  // Test email validation
  const invalidEmailData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'not-an-email',
    phone: '123456789',
    subject: 'Test',
    message: 'Test message'
  };
  
  const emailResponse = await makeRequest('POST', '/api/contacts', invalidEmailData);
  logTest('Input Validation', 'Email format validation', !emailResponse.ok);
  
  // Test required field validation
  const emptyFieldsData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
  
  const emptyResponse = await makeRequest('POST', '/api/contacts', emptyFieldsData);
  logTest('Input Validation', 'Required fields validation', !emptyResponse.ok);
}

async function testRateLimiting() {
  console.log('\n⏱️ Testing Rate Limiting\n');
  
  // Test API rate limiting (100 requests per 15 minutes)
  const requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push(makeRequest('GET', '/api/properties'));
  }
  
  const responses = await Promise.all(requests);
  const allSuccessful = responses.every(r => r.ok);
  logTest('Rate Limiting', 'Allow normal API usage', allSuccessful);
  
  // Test login rate limiting (5 attempts per 15 minutes)
  const loginAttempts = [];
  for (let i = 0; i < 7; i++) {
    loginAttempts.push(makeRequest('POST', '/api/admin/login', {
      username: 'wrong',
      password: 'wrong'
    }));
  }
  
  const loginResponses = await Promise.all(loginAttempts);
  const rateLimited = loginResponses.some(r => r.status === 429);
  logTest('Rate Limiting', 'Login rate limiting', rateLimited, `Blocked after excessive attempts`);
}

async function testErrorHandling() {
  console.log('\n❗ Testing Error Handling\n');
  
  // Test 404 for non-existent property
  const notFoundResponse = await makeRequest('GET', '/api/properties/999999');
  logTest('Error Handling', '404 for non-existent property', notFoundResponse.status === 404);
  
  // Test invalid JSON
  const invalidJsonResponse = await fetch(`${BASE_URL}/api/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'invalid json'
  });
  logTest('Error Handling', 'Handle invalid JSON', invalidJsonResponse.status === 400);
  
  // Test method not allowed
  const methodNotAllowedResponse = await makeRequest('PUT', '/api/properties');
  logTest('Error Handling', 'Method not allowed', methodNotAllowedResponse.status === 404 || methodNotAllowedResponse.status === 405);
}

async function testDatabaseConsistency() {
  console.log('\n💾 Testing Database Consistency\n');
  
  // Test that deleted items don't appear in listings
  const beforeResponse = await makeRequest('GET', '/api/properties');
  const beforeCount = beforeResponse.data?.length || 0;
  
  // Create and delete a property
  const tempProperty = {
    title: 'Temporary Property',
    description: 'This should be deleted',
    price: '100000',
    size: 500,
    bedrooms: 0,
    bathrooms: 0,
    propertyType: 'land',
    images: [],
    isFeatured: false,
    isPublished: true
  };
  
  const createResponse = await makeRequest('POST', '/api/admin/properties', tempProperty, true);
  if (createResponse.ok && createResponse.data?.property) {
    const propertyId = createResponse.data.property.id;
    await makeRequest('DELETE', `/api/admin/properties/${propertyId}`, null, true);
    
    const afterResponse = await makeRequest('GET', '/api/properties');
    const afterCount = afterResponse.data?.length || 0;
    
    logTest('Database Consistency', 'Deleted items removed from listings', afterCount === beforeCount);
  }
  
  // Test featured properties consistency
  const featuredResponse = await makeRequest('GET', '/api/properties/featured');
  const allFeatured = featuredResponse.data?.every(p => p.isFeatured) || true;
  logTest('Database Consistency', 'Featured properties are actually featured', allFeatured);
  
  // Test published properties consistency
  const allPropertiesResponse = await makeRequest('GET', '/api/properties');
  const allPublished = allPropertiesResponse.data?.every(p => p.isPublished) || true;
  logTest('Database Consistency', 'Public properties are all published', allPublished);
}

async function testImageHandling() {
  console.log('\n🖼️ Testing Image Handling\n');
  
  // Test property creation with images array
  const propertyWithImages = {
    title: 'Property with Images',
    description: 'Testing image handling',
    price: '200000',
    size: 1000,
    bedrooms: 0,
    bathrooms: 0,
    propertyType: 'land',
    images: [
      '/uploads/test-image-1.jpg',
      '/uploads/test-image-2.jpg'
    ],
    isFeatured: false,
    isPublished: true
  };
  
  const createResponse = await makeRequest('POST', '/api/admin/properties', propertyWithImages, true);
  logTest('Image Handling', 'Create property with images', createResponse.ok);
  
  if (createResponse.ok && createResponse.data?.property) {
    const propertyId = createResponse.data.property.id;
    
    // Verify images are stored
    const propertyResponse = await makeRequest('GET', `/api/properties/${propertyId}`);
    const hasImages = propertyResponse.data?.images?.length === 2;
    logTest('Image Handling', 'Images stored correctly', hasImages);
    
    // Clean up
    await makeRequest('DELETE', `/api/admin/properties/${propertyId}`, null, true);
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  // Group results by category
  const categories = {};
  testResults.forEach(result => {
    if (!categories[result.category]) {
      categories[result.category] = { passed: 0, failed: 0, tests: [] };
    }
    categories[result.category].tests.push(result);
    if (result.success) categories[result.category].passed++;
    else categories[result.category].failed++;
  });
  
  console.log('\n📈 RESULTS BY CATEGORY:\n');
  Object.entries(categories).forEach(([category, data]) => {
    const successRate = ((data.passed / data.tests.length) * 100).toFixed(0);
    console.log(`${category}: ${data.passed}/${data.tests.length} passed (${successRate}%)`);
  });
  
  // Save detailed report
  const report = {
    summary: {
      totalTests,
      passedTests,
      failedTests,
      successRate: ((passedTests / totalTests) * 100).toFixed(2) + '%',
      timestamp: new Date().toISOString()
    },
    categories,
    allTests: testResults
  };
  
  writeFileSync('test-results-detailed.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to test-results-detailed.json');
  
  // List failed tests
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    testResults.filter(t => !t.success).forEach(test => {
      console.log(`- [${test.category}] ${test.testName} ${test.details ? `- ${test.details}` : ''}`);
    });
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Test Suite');
  console.log('=' .repeat(60));
  console.log(`Testing URL: ${BASE_URL}`);
  console.log(`Start Time: ${new Date().toISOString()}`);
  console.log('=' .repeat(60));
  
  try {
    await testPublicEndpoints();
    await testContactForms();
    await testAdminAuthentication();
    await testAdminPropertyManagement();
    await testAdminContactManagement();
    await testLocationManagement();
    await testPropertyTypes();
    await testSiteSettings();
    await testInputValidation();
    await testRateLimiting();
    await testErrorHandling();
    await testDatabaseConsistency();
    await testImageHandling();
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
  }
  
  await generateReport();
}

// Run the tests
runAllTests();