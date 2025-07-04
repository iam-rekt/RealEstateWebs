#!/usr/bin/env node

/**
 * Automated Test Script for Haddadin Real Estate Website
 * This script tests all major functionality from admin panel to user interactions
 */

import https from 'https';
import http from 'http';

const BASE_URL = 'http://localhost:5000';
let sessionCookie = '';

// Test utilities
const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      // Capture session cookie
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'][0];
      }

      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

const log = (section, message, status = 'INFO') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${status}] [${section}] ${message}`);
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

// Test sections
class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      sections: {}
    };
  }

  async runTest(sectionName, testName, testFn) {
    try {
      log(sectionName, `Starting: ${testName}`);
      await testFn();
      this.results.passed++;
      this.results.sections[sectionName] = this.results.sections[sectionName] || { passed: 0, failed: 0 };
      this.results.sections[sectionName].passed++;
      log(sectionName, `✓ PASSED: ${testName}`, 'PASS');
    } catch (error) {
      this.results.failed++;
      this.results.sections[sectionName] = this.results.sections[sectionName] || { passed: 0, failed: 0 };
      this.results.sections[sectionName].failed++;
      log(sectionName, `✗ FAILED: ${testName} - ${error.message}`, 'FAIL');
    }
  }

  // Authentication Tests
  async testAuthentication() {
    await this.runTest('AUTH', 'Admin Login', async () => {
      const response = await makeRequest('POST', '/api/admin/login', {
        username: 'admin',
        password: 'admin123'
      });
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(response.data.message === 'Login successful', 'Login message mismatch');
      assert(sessionCookie, 'Session cookie not set');
    });

    await this.runTest('AUTH', 'Verify Authentication', async () => {
      const response = await makeRequest('GET', '/api/admin/auth');
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(response.data.authenticated === true, 'Should be authenticated');
    });
  }

  // Location Management Tests
  async testLocationManagement() {
    let testGovernorateId;
    let testDirectorateId;

    await this.runTest('LOCATION', 'Get Existing Governorates', async () => {
      const response = await makeRequest('GET', '/api/admin/governorates');
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(Array.isArray(response.data), 'Should return array of governorates');
    });

    await this.runTest('LOCATION', 'Create New Governorate', async () => {
      const response = await makeRequest('POST', '/api/admin/governorates', {
        nameAr: 'الكرك',
        nameEn: 'Karak'
      });
      assert(response.status === 201, `Expected 201, got ${response.status}`);
      assert(response.data.nameAr === 'الكرك', 'Arabic name mismatch');
      testGovernorateId = response.data.id;
    });

    await this.runTest('LOCATION', 'Create New Directorate', async () => {
      const response = await makeRequest('POST', '/api/admin/directorates', {
        nameAr: 'الكرك',
        nameEn: 'Karak Center',
        governorateId: testGovernorateId
      });
      assert(response.status === 201, `Expected 201, got ${response.status}`);
      assert(response.data.governorateId === testGovernorateId, 'Governorate ID mismatch');
      testDirectorateId = response.data.id;
    });

    await this.runTest('LOCATION', 'Get Directorates by Governorate', async () => {
      const response = await makeRequest('GET', '/api/admin/directorates');
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      const newDirectorate = response.data.find(d => d.id === testDirectorateId);
      assert(newDirectorate, 'New directorate not found in list');
      assert(newDirectorate.governorateId === testGovernorateId, 'Directorate governorate mismatch');
    });
  }

  // Property Type Management Tests
  async testPropertyTypes() {
    let testPropertyTypeId;

    await this.runTest('PROPERTY_TYPES', 'Get Existing Property Types', async () => {
      const response = await makeRequest('GET', '/api/admin/property-types');
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(Array.isArray(response.data), 'Should return array of property types');
    });

    await this.runTest('PROPERTY_TYPES', 'Create New Property Type', async () => {
      const response = await makeRequest('POST', '/api/admin/property-types', {
        nameAr: 'أرض استثمارية',
        nameEn: 'Investment Land',
        isActive: true
      });
      assert(response.status === 201, `Expected 201, got ${response.status}`);
      assert(response.data.nameAr === 'أرض استثمارية', 'Arabic name mismatch');
      testPropertyTypeId = response.data.id;
    });

    await this.runTest('PROPERTY_TYPES', 'Update Property Type', async () => {
      const response = await makeRequest('PUT', `/api/admin/property-types/${testPropertyTypeId}`, {
        nameAr: 'أرض استثمارية محدثة',
        nameEn: 'Updated Investment Land',
        isActive: false
      });
      assert(response.status === 200, `Expected 200, got ${response.status}`);
    });
  }

  // Property Management Tests
  async testPropertyManagement() {
    let testPropertyId;

    await this.runTest('PROPERTIES', 'Get Existing Properties', async () => {
      const response = await makeRequest('GET', '/api/properties');
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(Array.isArray(response.data), 'Should return array of properties');
    });

    await this.runTest('PROPERTIES', 'Create New Property', async () => {
      const response = await makeRequest('POST', '/api/admin/properties', {
        title: 'أرض للبيع في الكرك',
        description: 'أرض واسعة بموقع ممتاز في الكرك',
        price: '150000',
        size: 1000,
        bedrooms: 0,
        bathrooms: 0,
        propertyType: 'أرض سكنية',
        location: 'الكرك، الأردن',
        address: 'شارع الملك حسين',
        images: ['https://example.com/image1.jpg'],
        governorateId: 2, // Use existing governorate
        directorateId: 4, // Use existing directorate
        village: 'المزار',
        basin: 'حوض الكرك',
        neighborhood: 'حي الأمير حمزة',
        plotNumber: '12345',
        featured: true,
        available: true
      });
      assert(response.status === 201, `Expected 201, got ${response.status}`);
      assert(response.data.title === 'أرض للبيع في الكرك', 'Title mismatch');
      testPropertyId = response.data.id;
    });

    await this.runTest('PROPERTIES', 'Update Property', async () => {
      const response = await makeRequest('PUT', `/api/admin/properties/${testPropertyId}`, {
        title: 'أرض محدثة للبيع في الكرك',
        description: 'أرض واسعة بموقع ممتاز في الكرك - محدثة',
        price: '160000',
        size: 1200,
        bedrooms: 0,
        bathrooms: 0,
        propertyType: 'أرض سكنية',
        location: 'الكرك، الأردن',
        address: 'شارع الملك حسين - محدث',
        images: ['https://example.com/image1.jpg'],
        governorateId: 2,
        directorateId: 4,
        village: 'المزار',
        basin: 'حوض الكرك',
        neighborhood: 'حي الأمير حمزة',
        plotNumber: '12345',
        featured: true,
        available: true
      });
      assert(response.status === 200, `Expected 200, got ${response.status}`);
    });

    await this.runTest('PROPERTIES', 'Get Property by ID', async () => {
      const response = await makeRequest('GET', `/api/properties/${testPropertyId}`);
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(response.data.title === 'أرض محدثة للبيع في الكرك', 'Updated title mismatch');
    });

    await this.runTest('PROPERTIES', 'Get Featured Properties', async () => {
      const response = await makeRequest('GET', '/api/properties/featured');
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(Array.isArray(response.data), 'Should return array of featured properties');
      const newProperty = response.data.find(p => p.id === testPropertyId);
      assert(newProperty, 'New property should be featured');
    });

    await this.runTest('PROPERTIES', 'Search Properties', async () => {
      const response = await makeRequest('POST', '/api/properties/search', {
        propertyType: 'أرض سكنية',
        minPrice: 100000,
        maxPrice: 200000
      });
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(Array.isArray(response.data), 'Should return array of search results');
    });
  }

  // Contact Form Tests
  async testContactForms() {
    await this.runTest('CONTACTS', 'Submit Contact Form', async () => {
      const response = await makeRequest('POST', '/api/contacts', {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '0791234567',
        message: 'مرحبا، أريد الاستفسار عن الأراضي المتاحة',
        propertyId: 1
      });
      assert(response.status === 201, `Expected 201, got ${response.status}`);
    });

    await this.runTest('CONTACTS', 'Submit Newsletter Subscription', async () => {
      const response = await makeRequest('POST', '/api/newsletter', {
        email: 'newsletter@example.com'
      });
      assert(response.status === 201, `Expected 201, got ${response.status}`);
    });

    await this.runTest('CONTACTS', 'Submit Entrustment Request', async () => {
      const response = await makeRequest('POST', '/api/entrustments', {
        name: 'فاطمة علي',
        email: 'fatima@example.com',
        phone: '0791234568',
        propertyType: 'أرض سكنية',
        location: 'عمان',
        size: '500',
        price: '80000',
        description: 'أرض للبيع في موقع ممتاز'
      });
      assert(response.status === 201, `Expected 201, got ${response.status}`);
    });

    await this.runTest('CONTACTS', 'Submit Property Request', async () => {
      const response = await makeRequest('POST', '/api/property-requests', {
        name: 'محمد أحمد',
        email: 'mohammed@example.com',
        phone: '0791234569',
        propertyType: 'أرض زراعية',
        location: 'إربد',
        maxPrice: '100000',
        minSize: '1000',
        description: 'أبحث عن أرض زراعية في إربد'
      });
      assert(response.status === 201, `Expected 201, got ${response.status}`);
    });

    await this.runTest('CONTACTS', 'Get Admin Contacts', async () => {
      const response = await makeRequest('GET', '/api/admin/contacts');
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(Array.isArray(response.data), 'Should return array of contacts');
    });
  }

  // Site Settings Tests
  async testSiteSettings() {
    await this.runTest('SETTINGS', 'Get Site Settings', async () => {
      const response = await makeRequest('GET', '/api/site-settings');
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(Array.isArray(response.data), 'Should return array of settings');
    });

    await this.runTest('SETTINGS', 'Update Site Setting', async () => {
      const response = await makeRequest('PUT', '/api/admin/site-settings', {
        key: 'footer_company_name',
        value: 'شركة رند للاستثمار العقاري المحدثة'
      });
      assert(response.status === 200, `Expected 200, got ${response.status}`);
    });
  }

  // Data Flow Tests
  async testDataFlow() {
    await this.runTest('DATA_FLOW', 'Properties Include Location Names', async () => {
      const response = await makeRequest('GET', '/api/properties');
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      
      const propertiesWithLocations = response.data.filter(p => p.governorateName || p.directorateName);
      assert(propertiesWithLocations.length > 0, 'Properties should include location names');
    });

    await this.runTest('DATA_FLOW', 'Featured Properties Include Locations', async () => {
      const response = await makeRequest('GET', '/api/properties/featured');
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      
      if (response.data.length > 0) {
        const hasLocationData = response.data.some(p => p.governorateName || p.directorateName);
        assert(hasLocationData, 'Featured properties should include location names');
      }
    });
  }

  // Summary and Report
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('                    TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`Total Tests: ${this.results.passed + this.results.failed}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    console.log('\nBy Section:');
    Object.entries(this.results.sections).forEach(([section, results]) => {
      const total = results.passed + results.failed;
      const rate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
      console.log(`  ${section}: ${results.passed}/${total} (${rate}%)`);
    });
    
    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! The application is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the logs above for details.');
    }
  }

  // Main test runner
  async runAllTests() {
    console.log('Starting Comprehensive Test Suite for Haddadin Real Estate Website');
    console.log('='.repeat(80));
    
    try {
      await this.testAuthentication();
      await this.testLocationManagement();
      await this.testPropertyTypes();
      await this.testPropertyManagement();
      await this.testContactForms();
      await this.testSiteSettings();
      await this.testDataFlow();
    } catch (error) {
      log('SYSTEM', `Critical error: ${error.message}`, 'ERROR');
    }
    
    this.printSummary();
  }
}

// Run tests if called directly
const runner = new TestRunner();
runner.runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});

export default TestRunner;