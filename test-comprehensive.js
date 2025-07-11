#!/usr/bin/env node

// Comprehensive test script for Haddadin Real Estate website
// Tests both main site and admin panel functionality

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Default admin credentials (from db-storage.ts)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Store session cookies
let sessionCookie = '';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, success, error = null) {
  const result = {
    test: testName,
    success,
    error: error ? error.message || error : null,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  
  if (success) {
    console.log(`✅ ${testName}`);
    testResults.passed++;
  } else {
    console.error(`❌ ${testName}`, error ? `- ${error}` : '');
    testResults.failed++;
  }
}

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, authenticated = false) {
  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {}
  };
  
  if (authenticated && sessionCookie) {
    config.headers['Cookie'] = sessionCookie;
  }
  
  if (data) {
    if (data instanceof FormData) {
      config.data = data;
      config.headers = { ...config.headers, ...data.getHeaders() };
    } else {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }
  }
  
  return axios(config);
}

// Test functions
async function testMainSiteEndpoints() {
  console.log('\n🔍 Testing Main Site Endpoints...\n');
  
  // Test home page
  try {
    const response = await axios.get(BASE_URL);
    logTest('Home page loads', response.status === 200);
  } catch (error) {
    logTest('Home page loads', false, error.message);
  }
  
  // Test site settings endpoint
  try {
    const response = await apiRequest('GET', '/site-settings');
    const hasSettings = response.data && typeof response.data === 'object';
    logTest('Site settings endpoint', hasSettings);
  } catch (error) {
    logTest('Site settings endpoint', false, error.message);
  }
  
  // Test properties endpoints
  try {
    const response = await apiRequest('GET', '/properties');
    const hasProperties = Array.isArray(response.data);
    logTest('Properties listing endpoint', hasProperties);
  } catch (error) {
    logTest('Properties listing endpoint', false, error.message);
  }
  
  try {
    const response = await apiRequest('GET', '/properties/featured');
    const hasFeatured = Array.isArray(response.data);
    logTest('Featured properties endpoint', hasFeatured);
  } catch (error) {
    logTest('Featured properties endpoint', false, error.message);
  }
  
  // Test property search
  try {
    const searchData = {
      propertyType: '',
      governorateId: null,
      directorateId: null,
      minPrice: '',
      maxPrice: '',
      minSize: '',
      maxSize: ''
    };
    const response = await apiRequest('POST', '/properties/search', searchData);
    const hasResults = Array.isArray(response.data);
    logTest('Property search endpoint', hasResults);
  } catch (error) {
    logTest('Property search endpoint', false, error.message);
  }
  
  // Test governorates and directorates
  try {
    const response = await apiRequest('GET', '/governorates');
    const hasGovernorates = Array.isArray(response.data) && response.data.length > 0;
    logTest('Governorates endpoint', hasGovernorates);
  } catch (error) {
    logTest('Governorates endpoint', false, error.message);
  }
  
  try {
    const response = await apiRequest('GET', '/directorates');
    const hasDirectorates = Array.isArray(response.data);
    logTest('Directorates endpoint', hasDirectorates);
  } catch (error) {
    logTest('Directorates endpoint', false, error.message);
  }
  
  // Test property types
  try {
    const response = await apiRequest('GET', '/property-types');
    const hasTypes = Array.isArray(response.data) && response.data.length > 0;
    logTest('Property types endpoint', hasTypes);
  } catch (error) {
    logTest('Property types endpoint', false, error.message);
  }
}

async function testContactForms() {
  console.log('\n📝 Testing Contact Forms...\n');
  
  // Test contact form submission
  try {
    const contactData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+962791234567',
      message: 'This is a test contact message'
    };
    const response = await apiRequest('POST', '/contacts', contactData);
    logTest('Contact form submission', response.status === 201);
  } catch (error) {
    logTest('Contact form submission', false, error.message);
  }
  
  // Test newsletter subscription
  try {
    const newsletterData = {
      email: `test${Date.now()}@example.com`
    };
    const response = await apiRequest('POST', '/newsletter', newsletterData);
    logTest('Newsletter subscription', response.status === 201);
  } catch (error) {
    logTest('Newsletter subscription', false, error.message);
  }
  
  // Test duplicate newsletter subscription
  try {
    const newsletterData = {
      email: 'duplicate@example.com'
    };
    await apiRequest('POST', '/newsletter', newsletterData);
    const response2 = await apiRequest('POST', '/newsletter', newsletterData);
    logTest('Duplicate newsletter prevention', false, 'Should have failed');
  } catch (error) {
    logTest('Duplicate newsletter prevention', error.response?.status === 409);
  }
  
  // Test entrustment form
  try {
    const entrustmentData = {
      name: 'Test Seller',
      email: 'seller@example.com',
      phone: '+962791234567',
      propertyType: 'أرض سكنية',
      location: 'عمان - عبدون',
      size: '1000',
      price: '500000',
      description: 'Test property for sale'
    };
    const response = await apiRequest('POST', '/entrustments', entrustmentData);
    logTest('Entrustment form submission', response.status === 201);
  } catch (error) {
    logTest('Entrustment form submission', false, error.message);
  }
  
  // Test property request form
  try {
    const requestData = {
      name: 'Test Buyer',
      email: 'buyer@example.com',
      phone: '+962791234567',
      propertyType: 'أرض تجارية',
      location: 'عمان',
      minSize: '500',
      maxSize: '2000',
      minPrice: '100000',
      maxPrice: '300000',
      description: 'Looking for commercial land'
    };
    const response = await apiRequest('POST', '/property-requests', requestData);
    logTest('Property request submission', response.status === 201);
  } catch (error) {
    logTest('Property request submission', false, error.message);
  }
}

async function testAdminAuth() {
  console.log('\n🔐 Testing Admin Authentication...\n');
  
  // Test admin login with wrong credentials
  try {
    const wrongCredentials = {
      username: 'wrong',
      password: 'wrong'
    };
    const response = await apiRequest('POST', '/admin/login', wrongCredentials);
    logTest('Admin login with wrong credentials', false, 'Should have failed');
  } catch (error) {
    logTest('Admin login rejection', error.response?.status === 401);
  }
  
  // Test admin login with correct credentials
  try {
    const credentials = {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    };
    const response = await apiRequest('POST', '/admin/login', credentials);
    
    // Store session cookie
    if (response.headers['set-cookie']) {
      sessionCookie = response.headers['set-cookie'][0];
    }
    
    logTest('Admin login success', response.status === 200 && response.data.admin);
    return true;
  } catch (error) {
    logTest('Admin login success', false, error.message);
    return false;
  }
}

async function testAdminEndpoints() {
  console.log('\n👤 Testing Admin Endpoints...\n');
  
  // Test auth status
  try {
    const response = await apiRequest('GET', '/admin/auth', null, true);
    logTest('Admin auth status check', response.data.authenticated === true);
  } catch (error) {
    logTest('Admin auth status check', false, error.message);
  }
  
  // Test fetching contacts
  try {
    const response = await apiRequest('GET', '/admin/contacts', null, true);
    const hasContacts = Array.isArray(response.data);
    logTest('Admin fetch contacts', hasContacts);
  } catch (error) {
    logTest('Admin fetch contacts', false, error.message);
  }
  
  // Test fetching newsletters
  try {
    const response = await apiRequest('GET', '/admin/newsletters', null, true);
    const hasNewsletters = Array.isArray(response.data);
    logTest('Admin fetch newsletters', hasNewsletters);
  } catch (error) {
    logTest('Admin fetch newsletters', false, error.message);
  }
  
  // Test fetching entrustments
  try {
    const response = await apiRequest('GET', '/admin/entrustments', null, true);
    const hasEntrustments = Array.isArray(response.data);
    logTest('Admin fetch entrustments', hasEntrustments);
  } catch (error) {
    logTest('Admin fetch entrustments', false, error.message);
  }
  
  // Test fetching property requests
  try {
    const response = await apiRequest('GET', '/admin/property-requests', null, true);
    const hasRequests = Array.isArray(response.data);
    logTest('Admin fetch property requests', hasRequests);
  } catch (error) {
    logTest('Admin fetch property requests', false, error.message);
  }
  
  // Test site settings management
  try {
    const response = await apiRequest('GET', '/admin/site-settings', null, true);
    const hasSettings = Array.isArray(response.data);
    logTest('Admin fetch site settings', hasSettings);
  } catch (error) {
    logTest('Admin fetch site settings', false, error.message);
  }
  
  // Test updating site settings
  try {
    const settingsUpdate = {
      settings: {
        footer_phone: '+962 6 999 8888',
        footer_email: 'updated@example.com'
      }
    };
    const response = await apiRequest('POST', '/admin/site-settings', settingsUpdate, true);
    logTest('Admin update site settings', response.status === 200);
  } catch (error) {
    logTest('Admin update site settings', false, error.message);
  }
}

async function testPropertyManagement() {
  console.log('\n🏠 Testing Property Management...\n');
  
  let createdPropertyId = null;
  
  // Test creating a property
  try {
    const propertyData = {
      title: 'Test Property',
      description: 'This is a test property created by automated tests',
      price: 250000,
      size: 1500,
      propertyType: 'أرض سكنية',
      governorateId: 1,
      directorateId: 1,
      village: 'Test Village',
      basin: '10',
      plotNumber: '999',
      neighborhood: 'Test Neighborhood',
      images: [],
      isFeatured: false,
      isPublished: true
    };
    const response = await apiRequest('POST', '/admin/properties', propertyData, true);
    createdPropertyId = response.data.property?.id;
    logTest('Admin create property', response.status === 201 && createdPropertyId);
  } catch (error) {
    logTest('Admin create property', false, error.message);
  }
  
  // Test updating the property
  if (createdPropertyId) {
    try {
      const updateData = {
        title: 'Updated Test Property',
        price: 300000,
        isFeatured: true
      };
      const response = await apiRequest('PUT', `/admin/properties/${createdPropertyId}`, updateData, true);
      logTest('Admin update property', response.status === 200);
    } catch (error) {
      logTest('Admin update property', false, error.message);
    }
    
    // Test deleting the property
    try {
      const response = await apiRequest('DELETE', `/admin/properties/${createdPropertyId}`, null, true);
      logTest('Admin delete property', response.status === 200);
    } catch (error) {
      logTest('Admin delete property', false, error.message);
    }
  }
}

async function testLocationManagement() {
  console.log('\n📍 Testing Location Management...\n');
  
  let createdGovernorateId = null;
  let createdDirectorateId = null;
  
  // Test governorates management
  try {
    const response = await apiRequest('GET', '/admin/governorates', null, true);
    const hasGovernorates = Array.isArray(response.data);
    logTest('Admin fetch governorates', hasGovernorates);
  } catch (error) {
    logTest('Admin fetch governorates', false, error.message);
  }
  
  // Test creating a governorate
  try {
    const governorateData = {
      nameAr: 'محافظة تجريبية',
      nameEn: 'Test Governorate'
    };
    const response = await apiRequest('POST', '/admin/governorates', governorateData, true);
    createdGovernorateId = response.data?.id;
    logTest('Admin create governorate', response.status === 201 && createdGovernorateId);
  } catch (error) {
    logTest('Admin create governorate', false, error.message);
  }
  
  // Test creating a directorate
  if (createdGovernorateId) {
    try {
      const directorateData = {
        governorateId: createdGovernorateId,
        nameAr: 'لواء تجريبي',
        nameEn: 'Test Directorate'
      };
      const response = await apiRequest('POST', '/admin/directorates', directorateData, true);
      createdDirectorateId = response.data?.id;
      logTest('Admin create directorate', response.status === 201 && createdDirectorateId);
    } catch (error) {
      logTest('Admin create directorate', false, error.message);
    }
  }
  
  // Clean up - delete created test data
  if (createdDirectorateId) {
    try {
      await apiRequest('DELETE', `/admin/directorates/${createdDirectorateId}`, null, true);
      logTest('Admin delete directorate', true);
    } catch (error) {
      logTest('Admin delete directorate', false, error.message);
    }
  }
  
  if (createdGovernorateId) {
    try {
      await apiRequest('DELETE', `/admin/governorates/${createdGovernorateId}`, null, true);
      logTest('Admin delete governorate', true);
    } catch (error) {
      logTest('Admin delete governorate', false, error.message);
    }
  }
}

async function testPropertyTypes() {
  console.log('\n🏷️ Testing Property Types Management...\n');
  
  let createdTypeId = null;
  
  // Test fetching property types
  try {
    const response = await apiRequest('GET', '/admin/property-types', null, true);
    const hasTypes = Array.isArray(response.data);
    logTest('Admin fetch property types', hasTypes);
  } catch (error) {
    logTest('Admin fetch property types', false, error.message);
  }
  
  // Test creating a property type
  try {
    const typeData = {
      nameAr: 'نوع تجريبي',
      nameEn: 'Test Type',
      isActive: true
    };
    const response = await apiRequest('POST', '/admin/property-types', typeData, true);
    createdTypeId = response.data?.id;
    logTest('Admin create property type', response.status === 201 && createdTypeId);
  } catch (error) {
    logTest('Admin create property type', false, error.message);
  }
  
  // Test updating property type
  if (createdTypeId) {
    try {
      const updateData = {
        isActive: false
      };
      const response = await apiRequest('PUT', `/admin/property-types/${createdTypeId}`, updateData, true);
      logTest('Admin update property type', response.status === 200);
    } catch (error) {
      logTest('Admin update property type', false, error.message);
    }
    
    // Delete the test property type
    try {
      await apiRequest('DELETE', `/admin/property-types/${createdTypeId}`, null, true);
      logTest('Admin delete property type', true);
    } catch (error) {
      logTest('Admin delete property type', false, error.message);
    }
  }
}

async function testInputValidation() {
  console.log('\n🛡️ Testing Input Validation...\n');
  
  // Test invalid email in contact form
  try {
    const invalidContact = {
      name: 'Test',
      email: 'invalid-email',
      phone: '123',
      message: 'Test'
    };
    await apiRequest('POST', '/contacts', invalidContact);
    logTest('Invalid email validation', false, 'Should have failed');
  } catch (error) {
    logTest('Invalid email validation', error.response?.status === 400);
  }
  
  // Test missing required fields
  try {
    const incompleteData = {
      name: 'Test Only'
    };
    await apiRequest('POST', '/contacts', incompleteData);
    logTest('Required fields validation', false, 'Should have failed');
  } catch (error) {
    logTest('Required fields validation', error.response?.status === 400);
  }
  
  // Test SQL injection attempt
  try {
    const sqlInjection = {
      username: "admin' OR '1'='1",
      password: "password"
    };
    await apiRequest('POST', '/admin/login', sqlInjection);
    logTest('SQL injection prevention', false, 'Should have failed');
  } catch (error) {
    logTest('SQL injection prevention', error.response?.status === 401);
  }
}

async function testRateLimiting() {
  console.log('\n⏱️ Testing Rate Limiting...\n');
  
  // Test API rate limiting (should allow 100 requests per 15 minutes)
  const requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push(apiRequest('GET', '/properties'));
  }
  
  try {
    await Promise.all(requests);
    logTest('API rate limiting (allows legitimate traffic)', true);
  } catch (error) {
    logTest('API rate limiting (allows legitimate traffic)', false, error.message);
  }
  
  // Note: Testing actual rate limit (100+ requests) would be too aggressive for a test
}

async function testAdminLogout() {
  console.log('\n🚪 Testing Admin Logout...\n');
  
  try {
    const response = await apiRequest('POST', '/admin/logout', null, true);
    logTest('Admin logout', response.status === 200);
    sessionCookie = ''; // Clear session
  } catch (error) {
    logTest('Admin logout', false, error.message);
  }
  
  // Verify logout worked
  try {
    await apiRequest('GET', '/admin/contacts', null, true);
    logTest('Access denied after logout', false, 'Should have failed');
  } catch (error) {
    logTest('Access denied after logout', error.response?.status === 401);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Starting Comprehensive Website Tests');
  console.log('=====================================\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Admin Credentials: ${ADMIN_USERNAME} / [HIDDEN]\n`);
  
  try {
    // Run all test suites
    await testMainSiteEndpoints();
    await testContactForms();
    await testAdminAuth();
    
    if (sessionCookie) {
      await testAdminEndpoints();
      await testPropertyManagement();
      await testLocationManagement();
      await testPropertyTypes();
      await testAdminLogout();
    }
    
    await testInputValidation();
    await testRateLimiting();
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
  
  // Print summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📝 Total:  ${testResults.passed + testResults.failed}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  // Save detailed results
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const resultsFile = `test-results-${timestamp}.json`;
  fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();