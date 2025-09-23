# Supplier Sample Data Generator

**Date:** 2025-01-17  
**Purpose:** Generate realistic sample data for supplier intake form testing  
**Location:** `src/utils/supplierSampleData.ts`

## Overview

The Supplier Sample Data Generator provides realistic, randomized sample data for testing the supplier intake form. It generates comprehensive supplier information including company details, contact information, capabilities, certifications, and business terms.

## Features

### 🏢 Company Information
- **Realistic Company Names**: Industry-specific company names based on supplier specialties
- **Contact Details**: Generated names, emails, phone numbers, and job titles
- **Location Data**: Real cities and countries with proper address formatting
- **Website URLs**: Auto-generated based on company names

### 🔧 Capabilities & Materials
- **Specialties**: Random selection of 2-5 supplier specialties
- **Materials**: Relevant materials based on industry (3-8 materials)
- **Certifications**: Industry-standard certifications (2-6 certifications)

### 💰 Business Information
- **Financial Terms**: Realistic credit limits, payment terms, currencies
- **Performance Metrics**: Quality ratings, delivery performance, responsiveness
- **Commercial Terms**: Incoterms, payment terms, currencies

### 📊 Metadata
- **Tags**: Industry-relevant tags for categorization
- **Internal Notes**: Realistic notes about supplier relationships and capabilities

## Usage

### Basic Usage
```typescript
import { generateSupplierSampleData } from '@/utils/supplierSampleData';

// Generate a single sample supplier
const sampleData = generateSupplierSampleData();
console.log(sampleData);
```

### Multiple Samples
```typescript
import { generateMultipleSupplierSamples } from '@/utils/supplierSampleData';

// Generate 5 sample suppliers
const samples = generateMultipleSupplierSamples(5);
```

### Specialty-Specific Samples
```typescript
import { generateSupplierSampleForSpecialty } from '@/utils/supplierSampleData';

// Generate sample for specific specialty
const machiningSample = generateSupplierSampleForSpecialty('machining');
```

### Form Integration
```typescript
// In SupplierIntakeForm component
const handleFillSampleData = () => {
    const sampleData = generateSupplierSampleData();
    
    setFormData({
        name: sampleData.name,
        email: sampleData.email,
        phone: sampleData.phone,
        // ... other fields
    });
    
    toast({
        title: "Sample Data Loaded",
        description: "Form has been filled with sample supplier data.",
    });
};
```

## Sample Data Structure

```typescript
interface SupplierSampleData {
    // Organization info
    name: string;                    // "Precision Machining Solutions LLC"
    email: string;                   // "john.smith@precisionmachining.com"
    phone: string;                   // "+1-555-123-4567"
    website: string;                 // "www.precisionmachining.com"
    address: string;                 // "1234 Industrial Blvd"
    city: string;                    // "Los Angeles"
    state: string;                   // "CA"
    country: string;                 // "United States"
    postalCode: string;              // "90210"

    // Capabilities
    specialties: SupplierSpecialty[]; // ["machining", "fabrication"]
    materials: string[];             // ["Aluminum", "Steel", "Titanium"]

    // Compliance
    certifications: string[];        // ["ISO 9001", "AS9100"]
    paymentTerms: string;           // "Net 30"
    currency: string;               // "USD"
    creditLimit: string;            // "250000"
    incoterms: string;             // "FOB Origin"

    // Metadata
    tags: string[];                // ["Aerospace", "High Priority"]
    internalNotes: string;         // "Met at IMTS 2024. Strong in 5-axis..."
}
```

## Data Sources

### Company Names by Industry
- **Machining**: "Precision Machining Solutions LLC", "Advanced CNC Manufacturing Inc"
- **Fabrication**: "Metal Fabrication Experts", "Steel Works Manufacturing"
- **Casting**: "Precision Casting Foundry", "Investment Casting Solutions"
- **Finishing**: "Surface Finishing Experts", "Anodizing Solutions Inc"
- **Injection Molding**: "Plastic Injection Molding Co", "Precision Molding Solutions"
- **Assembly**: "Electronics Assembly Solutions", "Precision Assembly Services"
- **3D Printing**: "3D Printing Solutions Inc", "Rapid Prototyping Services"
- **Prototyping**: "Rapid Prototyping Solutions", "Prototype Development Inc"
- **Coating**: "Coating Solutions Inc", "Advanced Coating Technologies"
- **Painting**: "Industrial Painting Services", "Powder Coating Solutions"
- **Welding**: "Welding Solutions Inc", "Precision Welding Services"
- **Sheet Metal**: "Sheet Metal Solutions Inc", "Precision Sheet Metal Works"
- **Electronics**: "Electronics Manufacturing Inc", "PCB Assembly Solutions"
- **Testing**: "Testing & Validation Services", "Quality Testing Solutions"
- **Packaging**: "Packaging Solutions Inc", "Custom Packaging Services"

### Geographic Data
- **Countries**: United States, China, Vietnam, Malaysia, Germany, Japan, South Korea, India
- **Cities**: Major cities in each country (10 cities per country)
- **Addresses**: Realistic industrial addresses with proper formatting

### Contact Information
- **Names**: 25 realistic contact names
- **Job Titles**: Sales Manager, Business Development Manager, Account Manager, etc.
- **Emails**: Auto-generated based on name and company
- **Phone Numbers**: Realistic US phone number format

### Materials & Certifications
- **Materials**: 20+ common manufacturing materials
- **Certifications**: 18 industry-standard certifications (ISO, AS9100, etc.)

### Business Terms
- **Payment Terms**: Net 15, Net 30, Net 45, Net 60, Net 90, 2/10 Net 30, COD, CIA, 50% Deposit
- **Currencies**: USD, EUR, GBP, CNY, JPY, CAD, MXN, AUD, CHF, SEK
- **Incoterms**: EXW, FCA, CPT, CIP, DAT, DAP, DDP, FAS, FOB, CFR, CIF

## Form Integration

The sample data generator is integrated into the SupplierIntakeForm with:

1. **Import**: `import { generateSupplierSampleData } from '@/utils/supplierSampleData';`
2. **Button**: "Fill Sample Data" button in the form header
3. **Handler**: `handleFillSampleData()` function that populates all form fields
4. **Feedback**: Toast notification confirming data has been loaded

## Benefits

1. **Testing**: Quickly populate forms for testing and development
2. **Demo**: Create realistic demos with varied supplier data
3. **Validation**: Test form validation with different data combinations
4. **UX**: Improve user experience by reducing manual data entry
5. **Consistency**: Ensure realistic and consistent test data

## Customization

The generator can be easily customized by:

1. **Adding Company Names**: Extend the `COMPANY_NAMES` object
2. **Adding Locations**: Extend the `LOCATIONS` array
3. **Adding Materials**: Extend the `MATERIALS` array
4. **Adding Certifications**: Extend the `CERTIFICATIONS` array
5. **Modifying Ranges**: Adjust the random number ranges for credit limits, ratings, etc.

## Example Output

```json
{
  "name": "Precision Machining Solutions LLC",
  "email": "john.smith@precisionmachining.com",
  "phone": "+1-555-123-4567",
  "website": "www.precisionmachining.com",
  "address": "1234 Industrial Blvd",
  "city": "Los Angeles",
  "state": "CA",
  "country": "United States",
  "postalCode": "90210",
  "specialties": ["machining", "fabrication", "finishing"],
  "materials": ["Aluminum", "Steel", "Titanium", "Copper"],
  "certifications": ["ISO 9001", "AS9100", "ISO 14001"],
  "paymentTerms": "Net 30",
  "currency": "USD",
  "creditLimit": "250000",
  "incoterms": "FOB Origin",
  "tags": ["Aerospace", "High Priority", "Quality Focused"],
  "internalNotes": "Met at IMTS 2024. Strong in 5-axis titanium work. Pricing competitive."
}
```

This comprehensive sample data generator makes testing and development much more efficient while providing realistic, varied data for the supplier intake form.
