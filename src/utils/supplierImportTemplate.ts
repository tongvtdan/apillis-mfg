// Supplier Import Template Generator
// Creates Excel template for bulk supplier import

export interface SupplierImportRow {
    // Basic Information (Required)
    organizationName: string;
    primaryContactName: string;
    email: string;

    // Contact Information
    phone?: string;
    website?: string;

    // Address Information (Required)
    address: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;

    // Business Information
    taxId?: string;
    paymentTerms?: string;
    currency?: string;

    // Capabilities (comma-separated)
    specialties?: string; // e.g., "machining,fabrication,welding"
    materials?: string;   // e.g., "Aluminum,Steel,Plastic"
    certifications?: string; // e.g., "ISO 9001,AS9100"

    // Additional Information
    notes?: string;
    tags?: string; // comma-separated
}

export const SUPPLIER_IMPORT_TEMPLATE_HEADERS = [
    // Required fields
    'Organization Name*',
    'Primary Contact Name*',
    'Email*',
    'Address*',
    'City*',
    'Country*',

    // Optional contact info
    'Phone',
    'Website',
    'State',
    'Postal Code',

    // Business info
    'Tax ID',
    'Payment Terms',
    'Currency',

    // Capabilities (comma-separated values)
    'Specialties',
    'Materials',
    'Certifications',

    // Additional
    'Notes',
    'Tags'
];

export const SUPPLIER_IMPORT_SAMPLE_DATA: SupplierImportRow[] = [
    {
        organizationName: "Precision Manufacturing Co",
        primaryContactName: "John Smith",
        email: "john.smith@precision-mfg.com",
        phone: "+1-555-123-4567",
        website: "www.precision-mfg.com",
        address: "123 Industrial Blvd",
        city: "Los Angeles",
        state: "CA",
        country: "United States",
        postalCode: "90210",
        taxId: "12-3456789",
        paymentTerms: "Net 30",
        currency: "USD",
        specialties: "machining,fabrication,finishing",
        materials: "Aluminum,Steel,Stainless Steel",
        certifications: "ISO 9001,AS9100",
        notes: "High-precision CNC machining specialist",
        tags: "aerospace,automotive,precision"
    },
    {
        organizationName: "Vietnam Casting Solutions",
        primaryContactName: "Nguyen Van A",
        email: "sales@vn-casting.com",
        phone: "+84-28-1234-5678",
        website: "www.vn-casting.com",
        address: "456 Industrial Zone",
        city: "Ho Chi Minh City",
        country: "Vietnam",
        postalCode: "70000",
        paymentTerms: "Net 45",
        currency: "USD",
        specialties: "casting,finishing,assembly",
        materials: "Aluminum,Bronze,Cast Iron",
        certifications: "ISO 9001,ISO 14001",
        notes: "Cost-effective casting solutions",
        tags: "casting,cost-effective,asia"
    },
    {
        organizationName: "Malaysian Electronics Assembly",
        primaryContactName: "Ahmad Rahman",
        email: "ahmad@my-electronics.com",
        phone: "+60-3-1234-5678",
        website: "www.my-electronics.com",
        address: "789 Tech Park",
        city: "Kuala Lumpur",
        country: "Malaysia",
        postalCode: "50000",
        paymentTerms: "Net 30",
        currency: "USD",
        specialties: "electronics,assembly,testing",
        materials: "PCB,Components,Plastic",
        certifications: "ISO 9001,IPC-A-610,RoHS",
        notes: "Electronics assembly and testing services",
        tags: "electronics,pcb,testing"
    }
];

// Available options for dropdowns
export const SUPPLIER_IMPORT_OPTIONS = {
    countries: [
        'United States',
        'Vietnam',
        'Malaysia',
        'China',
        'Canada',
        'Mexico',
        'Germany',
        'United Kingdom',
        'Japan',
        'South Korea',
        'Taiwan',
        'Singapore',
        'Thailand',
        'Philippines',
        'Indonesia',
        'India'
    ],

    paymentTerms: [
        'Net 15',
        'Net 30',
        'Net 45',
        'Net 60',
        'Net 90',
        '2/10 Net 30',
        'COD',
        'CIA',
        '50% Deposit'
    ],

    currencies: [
        'USD',
        'EUR',
        'GBP',
        'CNY',
        'JPY',
        'CAD',
        'MXN',
        'VND',
        'MYR',
        'SGD'
    ],

    specialties: [
        'machining',
        'fabrication',
        'casting',
        'finishing',
        'injection_molding',
        'assembly',
        '3d_printing',
        'prototyping',
        'coating',
        'painting',
        'welding',
        'sheet_metal',
        'electronics',
        'testing',
        'packaging'
    ],

    commonMaterials: [
        'Aluminum',
        'Steel',
        'Stainless Steel',
        'Titanium',
        'Copper',
        'Brass',
        'Bronze',
        'Plastic',
        'ABS',
        'Polycarbonate',
        'Nylon',
        'PVC',
        'Ceramic',
        'Composite',
        'Carbon Fiber',
        'Rubber',
        'Silicone'
    ],

    commonCertifications: [
        'ISO 9001',
        'ISO 14001',
        'AS9100',
        'IATF 16949',
        'ISO 13485',
        'TL 9000',
        'OHSAS 18001',
        'SA8000',
        'ISO 22000',
        'FSSC 22000',
        'BRCGS',
        'SQF',
        'HACCP',
        'ITAR Registered',
        'EAR99',
        'RoHS Compliant',
        'REACH Compliant',
        'Conflict Minerals Compliant'
    ]
};

// Validation rules for import
export const SUPPLIER_IMPORT_VALIDATION = {
    required: ['organizationName', 'primaryContactName', 'email', 'address', 'city', 'country'],
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    website: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    maxLengths: {
        organizationName: 100,
        primaryContactName: 100,
        email: 100,
        phone: 20,
        website: 200,
        address: 200,
        city: 50,
        state: 50,
        country: 50,
        postalCode: 20,
        taxId: 50,
        notes: 1000
    }
};