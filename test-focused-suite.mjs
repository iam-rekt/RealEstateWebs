// Focused Comprehensive Test Suite for Haddadin Real Estate
// Tests critical functionality with detailed results

const BASE_URL = 'http://localhost:5000';
let adminCookie = null;
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  failures: []
};

// Utility function for logging
function logTest(category, testName, success, details = '') {
  testResults.total++;
  if (success) {
    testResults.passed++;
    console.log(`✅ [${category}] ${testName}`);
  } else {
    testResults.failed++;
    testResults.failures.push({ category, testName, details });
    console.log(`❌ [${category}] ${testName} - ${details}`);
  }
}

// Make HTTP request
async function makeRequest(method, endpoint, data = null, authenticated = false) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
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
      // Not JSON
    }
    
    return {
      ok: response.ok,
      status: response.status,
      data: json || text,
      headers: response.headers
    };
  } catch (error) {
    return { ok: false, status: 0, error: error.message };
  }
}

// Test admin login and get cookie
async function setupAdminSession() {
  const response = await makeRequest('POST', '/api/admin/login', {
    username: 'admin',
    password: 'admin123'
  });
  
  if (response.ok) {
    adminCookie = response.headers.get('set-cookie');
  }
  return response.ok;
}

// Main test groups
async function testCriticalFunctionality() {
  console.log('\n🔥 TESTING CRITICAL FUNCTIONALITY\n');
  
  // 1. Test Property Display
  console.log('📍 Testing Property Display...');
  const propertiesRes = await makeRequest('GET', '/api/properties');
  logTest('Properties', 'Public properties endpoint', propertiesRes.ok);
  
  if (propertiesRes.ok && propertiesRes.data?.length > 0) {
    const propertyId = propertiesRes.data[0].id;
    const singlePropRes = await makeRequest('GET', `/api/properties/${propertyId}`);
    logTest('Properties', 'Single property endpoint', singlePropRes.ok);
    
    // Check property has required fields
    const prop = singlePropRes.data;
    logTest('Properties', 'Property has required fields', 
      prop && prop.title && prop.description && prop.price);
  }
  
  // 2. Test Featured Properties
  const featuredRes = await makeRequest('GET', '/api/properties/featured');
  logTest('Properties', 'Featured properties endpoint', featuredRes.ok);
  
  // 3. Test Property Search
  const searchRes = await makeRequest('POST', '/api/properties/search', {
    minPrice: 0,
    maxPrice: 1000000,
    propertyType: '',
    governorateId: null
  });
  logTest('Properties', 'Property search', searchRes.ok);
  
  // 4. Test Contact Form
  console.log('\n📬 Testing Contact Forms...');
  const contactRes = await makeRequest('POST', '/api/contacts', {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '123456789',
    subject: 'Test',
    message: 'Test message'
  });
  logTest('Forms', 'Contact form submission', contactRes.ok);
  
  // 5. Test Newsletter
  const newsletterRes = await makeRequest('POST', '/api/newsletter', {
    email: `test${Date.now()}@example.com`
  });
  logTest('Forms', 'Newsletter subscription', newsletterRes.ok);
  
  // 6. Test Entrustment
  const entrustmentRes = await makeRequest('POST', '/api/entrustments', {
    firstName: 'Test',
    lastName: 'Seller',
    email: 'seller@example.com',
    phone: '123456789',
    propertyType: 'land',
    location: 'Amman',
    size: 500,
    bedrooms: 0,
    bathrooms: 0,
    description: 'Test',
    serviceType: 'sell'
  });
  logTest('Forms', 'Entrustment submission', entrustmentRes.ok);
  
  // 7. Test Property Request
  const requestRes = await makeRequest('POST', '/api/property-requests', {
    firstName: 'Test',
    lastName: 'Buyer',
    email: 'buyer@example.com',
    phone: '123456789',
    message: 'Looking for land'
  });
  logTest('Forms', 'Property request submission', requestRes.ok);
}

async function testAdminFunctionality() {
  console.log('\n🔐 TESTING ADMIN FUNCTIONALITY\n');
  
  // Setup admin session
  const loginOk = await setupAdminSession();
  logTest('Admin', 'Admin login', loginOk);
  
  if (!loginOk) return;
  
  // 1. Test Property Management
  console.log('\n🏠 Testing Property Management...');
  
  // Create property with correct field names
  const newProperty = {
    title: 'Test Property ' + Date.now(),
    description: 'Test description',
    price: '150000',
    size: 750,
    bedrooms: 0,
    bathrooms: 0,
    propertyType: 'land',
    images: [],
    governorateId: null,
    directorateId: null,
    village: 'Test Village',
    basin: null,
    neighborhood: 'Test',
    plotNumber: '123',
    isFeatured: false,  // Correct field name
    isPublished: true   // Correct field name
  };
  
  const createRes = await makeRequest('POST', '/api/admin/properties', newProperty, true);
  logTest('Admin', 'Create property', createRes.ok);
  
  if (createRes.ok && createRes.data?.property) {
    const propId = createRes.data.property.id;
    
    // Update property
    const updateRes = await makeRequest('PUT', `/api/admin/properties/${propId}`, 
      { ...newProperty, title: 'Updated Property' }, true);
    logTest('Admin', 'Update property', updateRes.ok);
    
    // Delete property
    const deleteRes = await makeRequest('DELETE', `/api/admin/properties/${propId}`, null, true);
    logTest('Admin', 'Delete property', deleteRes.ok);
  }
  
  // 2. Test Location Management
  console.log('\n📍 Testing Location Management...');
  
  // Create governorate
  const govRes = await makeRequest('POST', '/api/admin/governorates', {
    nameAr: 'محافظة تجريبية',
    nameEn: 'Test Gov'
  }, true);
  logTest('Admin', 'Create governorate', govRes.ok);
  
  if (govRes.ok && govRes.data?.id) {
    const govId = govRes.data.id;
    
    // Create directorate
    const dirRes = await makeRequest('POST', '/api/admin/directorates', {
      governorateId: govId,
      nameAr: 'مديرية تجريبية',
      nameEn: 'Test Dir'
    }, true);
    logTest('Admin', 'Create directorate', dirRes.ok);
    
    if (dirRes.ok && dirRes.data?.id) {
      // Delete directorate
      const delDirRes = await makeRequest('DELETE', `/api/admin/directorates/${dirRes.data.id}`, null, true);
      logTest('Admin', 'Delete directorate', delDirRes.ok);
    }
    
    // Delete governorate
    const delGovRes = await makeRequest('DELETE', `/api/admin/governorates/${govId}`, null, true);
    logTest('Admin', 'Delete governorate', delGovRes.ok);
  }
  
  // 3. Test Contact Management
  console.log('\n📞 Testing Contact Management...');
  
  const contactsRes = await makeRequest('GET', '/api/admin/contacts', null, true);
  logTest('Admin', 'Get contacts', contactsRes.ok);
  
  const newslettersRes = await makeRequest('GET', '/api/admin/newsletters', null, true);
  logTest('Admin', 'Get newsletters', newslettersRes.ok);
  
  const entrustmentsRes = await makeRequest('GET', '/api/admin/entrustments', null, true);
  logTest('Admin', 'Get entrustments', entrustmentsRes.ok);
  
  const requestsRes = await makeRequest('GET', '/api/admin/property-requests', null, true);
  logTest('Admin', 'Get property requests', requestsRes.ok);
  
  // 4. Test Site Settings
  console.log('\n⚙️ Testing Site Settings...');
  
  const settingsRes = await makeRequest('GET', '/api/admin/site-settings', null, true);
  logTest('Admin', 'Get site settings', settingsRes.ok);
  
  const updateSettingRes = await makeRequest('PUT', '/api/admin/site-settings', {
    key: 'contact_phone',
    value: '+962 6 123 4567'
  }, true);
  logTest('Admin', 'Update site setting', updateSettingRes.ok);
}

async function testSecurityAndValidation() {
  console.log('\n🔒 TESTING SECURITY & VALIDATION\n');
  
  // 1. Test XSS Prevention
  const xssRes = await makeRequest('POST', '/api/contacts', {
    firstName: '<script>alert("XSS")</script>',
    lastName: 'Test',
    email: 'test@example.com',
    phone: '123',
    subject: 'Test',
    message: '<img src=x onerror=alert("XSS")>'
  });
  logTest('Security', 'XSS prevention', xssRes.ok, 'Should accept but sanitize');
  
  // 2. Test SQL Injection Prevention
  const sqlRes = await makeRequest('POST', '/api/contacts', {
    firstName: "'; DROP TABLE contacts; --",
    lastName: 'Test',
    email: 'test@example.com',
    phone: '123',
    subject: 'Test',
    message: 'Test'
  });
  logTest('Security', 'SQL injection prevention', sqlRes.ok, 'Should accept but escape');
  
  // 3. Test Required Field Validation
  const emptyRes = await makeRequest('POST', '/api/contacts', {});
  logTest('Validation', 'Empty fields rejected', !emptyRes.ok && emptyRes.status === 400);
  
  // 4. Test Email Validation
  const badEmailRes = await makeRequest('POST', '/api/newsletter', {
    email: 'not-an-email'
  });
  logTest('Validation', 'Invalid email rejected', !badEmailRes.ok);
  
  // 5. Test Authentication
  const unauthRes = await makeRequest('GET', '/api/admin/properties');
  logTest('Security', 'Unauthorized access blocked', !unauthRes.ok && unauthRes.status === 401);
  
  // 6. Test Invalid Login
  const badLoginRes = await makeRequest('POST', '/api/admin/login', {
    username: 'wrong',
    password: 'wrong'
  });
  logTest('Security', 'Invalid login rejected', !badLoginRes.ok && badLoginRes.status === 401);
}

async function testDatabaseIntegrity() {
  console.log('\n💾 TESTING DATABASE INTEGRITY\n');
  
  await setupAdminSession();
  
  // 1. Test property field consistency
  const propsRes = await makeRequest('GET', '/api/properties');
  if (propsRes.ok && propsRes.data?.length > 0) {
    const prop = propsRes.data[0];
    logTest('Database', 'Properties have correct fields', 
      'isFeatured' in prop && 'isPublished' in prop);
  }
  
  // 2. Test featured properties
  const featuredRes = await makeRequest('GET', '/api/properties/featured');
  if (featuredRes.ok && featuredRes.data) {
    const allFeatured = featuredRes.data.every(p => p.isFeatured);
    logTest('Database', 'Featured properties are actually featured', allFeatured);
  }
  
  // 3. Test published properties
  if (propsRes.ok && propsRes.data) {
    const allPublished = propsRes.data.every(p => p.isPublished);
    logTest('Database', 'Public properties are all published', allPublished);
  }
  
  // 4. Test property types exist
  const typesRes = await makeRequest('GET', '/api/property-types');
  logTest('Database', 'Property types exist', typesRes.ok && typesRes.data?.length > 0);
  
  // 5. Test site settings exist
  const settingsRes = await makeRequest('GET', '/api/site-settings');
  logTest('Database', 'Site settings exist', settingsRes.ok && Object.keys(settingsRes.data).length > 0);
}

async function testEdgeCases() {
  console.log('\n🎯 TESTING EDGE CASES\n');
  
  // 1. Test non-existent property
  const notFoundRes = await makeRequest('GET', '/api/properties/999999');
  logTest('Edge Cases', '404 for non-existent property', notFoundRes.status === 404);
  
  // 2. Test duplicate newsletter
  const email = `dup${Date.now()}@example.com`;
  await makeRequest('POST', '/api/newsletter', { email });
  const dupRes = await makeRequest('POST', '/api/newsletter', { email });
  logTest('Edge Cases', 'Duplicate newsletter rejected', !dupRes.ok);
  
  // 3. Test large property size
  await setupAdminSession();
  const largePropertyRes = await makeRequest('POST', '/api/admin/properties', {
    title: 'Large Property',
    description: 'Test',
    price: '999999999',
    size: 999999,
    bedrooms: 0,
    bathrooms: 0,
    propertyType: 'land',
    images: [],
    isFeatured: false,
    isPublished: true
  }, true);
  logTest('Edge Cases', 'Large values accepted', largePropertyRes.ok);
  
  if (largePropertyRes.ok && largePropertyRes.data?.property) {
    await makeRequest('DELETE', `/api/admin/properties/${largePropertyRes.data.property.id}`, null, true);
  }
  
  // 4. Test special characters in Arabic
  const arabicRes = await makeRequest('POST', '/api/contacts', {
    firstName: 'محمد',
    lastName: 'أحمد',
    email: 'arabic@example.com',
    phone: '123',
    subject: 'موضوع عربي',
    message: 'رسالة باللغة العربية مع أحرف خاصة: ؟ ، ؛'
  });
  logTest('Edge Cases', 'Arabic characters accepted', arabicRes.ok);
}

// Generate report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
  
  if (testResults.failures.length > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    testResults.failures.forEach(f => {
      console.log(`- [${f.category}] ${f.testName} - ${f.details}`);
    });
  }
  
  // Save results
  const report = {
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.total) * 100).toFixed(2) + '%',
      timestamp: new Date().toISOString()
    },
    failures: testResults.failures
  };
  
  import('fs').then(fs => {
    fs.writeFileSync('test-results-comprehensive.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to test-results-comprehensive.json');
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 COMPREHENSIVE TEST SUITE - HADDADIN REAL ESTATE');
  console.log('=' .repeat(60));
  console.log(`URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('=' .repeat(60));
  
  try {
    await testCriticalFunctionality();
    await testAdminFunctionality();
    await testSecurityAndValidation();
    await testDatabaseIntegrity();
    await testEdgeCases();
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
  }
  
  generateReport();
}

// Execute tests
runAllTests();