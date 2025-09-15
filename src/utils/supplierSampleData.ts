// Factory Pulse - Supplier Sample Data Generator
// Generates realistic sample data for supplier intake form testing

import { SupplierSpecialty } from '@/types/supplier';

// Sample company names by industry
const COMPANY_NAMES = {
    machining: [
        'Precision Machining Solutions LLC',
        'Advanced CNC Manufacturing Inc',
        'Titanium Precision Works',
        'Aerospace Machining Corp',
        'Precision Tool & Die Co',
        'High-Tech Machining Services',
        'Precision Components Ltd',
        'Advanced Manufacturing Solutions'
    ],
    fabrication: [
        'Metal Fabrication Experts',
        'Steel Works Manufacturing',
        'Custom Metal Solutions Inc',
        'Industrial Fabrication Co',
        'Precision Welding Services',
        'Metal Craft Industries',
        'Advanced Fabrication Works',
        'Structural Steel Solutions'
    ],
    casting: [
        'Precision Casting Foundry',
        'Investment Casting Solutions',
        'Die Casting Specialists',
        'Sand Casting Works',
        'Metal Casting Industries',
        'Precision Foundry Services',
        'Advanced Casting Technologies',
        'Custom Casting Solutions'
    ],
    finishing: [
        'Surface Finishing Experts',
        'Anodizing Solutions Inc',
        'Powder Coating Works',
        'Electroplating Services',
        'Surface Treatment Co',
        'Finishing Technologies',
        'Advanced Surface Solutions',
        'Precision Finishing Inc'
    ],
    injection_molding: [
        'Plastic Injection Molding Co',
        'Precision Molding Solutions',
        'Advanced Plastics Manufacturing',
        'Injection Molding Experts',
        'Custom Plastic Solutions',
        'Molding Technologies Inc',
        'Plastic Manufacturing Works',
        'Injection Molding Specialists'
    ],
    assembly: [
        'Electronics Assembly Solutions',
        'Precision Assembly Services',
        'Contract Manufacturing Inc',
        'Assembly Technologies',
        'Electronic Manufacturing Services',
        'Precision Assembly Works',
        'Advanced Assembly Solutions',
        'Custom Assembly Services'
    ],
    '3d_printing': [
        '3D Printing Solutions Inc',
        'Rapid Prototyping Services',
        'Additive Manufacturing Co',
        '3D Printing Technologies',
        'Prototype Solutions',
        'Advanced 3D Printing',
        'Rapid Manufacturing Inc',
        '3D Printing Experts'
    ],
    prototyping: [
        'Rapid Prototyping Solutions',
        'Prototype Development Inc',
        'Quick Turn Prototyping',
        'Prototype Manufacturing Co',
        'Rapid Development Services',
        'Prototyping Technologies',
        'Advanced Prototype Solutions',
        'Custom Prototype Works'
    ],
    coating: [
        'Coating Solutions Inc',
        'Advanced Coating Technologies',
        'Protective Coating Services',
        'Industrial Coating Works',
        'Coating Applications Inc',
        'Surface Coating Solutions',
        'Specialty Coating Services',
        'Precision Coating Technologies'
    ],
    painting: [
        'Industrial Painting Services',
        'Powder Coating Solutions',
        'Custom Painting Works',
        'Automotive Painting Co',
        'Industrial Finishing Inc',
        'Painting Technologies',
        'Advanced Painting Solutions',
        'Precision Painting Services'
    ],
    welding: [
        'Welding Solutions Inc',
        'Precision Welding Services',
        'Industrial Welding Co',
        'Advanced Welding Technologies',
        'Custom Welding Solutions',
        'Welding Manufacturing Inc',
        'Specialty Welding Services',
        'Professional Welding Works'
    ],
    sheet_metal: [
        'Sheet Metal Solutions Inc',
        'Precision Sheet Metal Works',
        'Custom Sheet Metal Co',
        'Sheet Metal Manufacturing',
        'Metal Forming Solutions',
        'Sheet Metal Technologies',
        'Advanced Sheet Metal Works',
        'Precision Metal Forming'
    ],
    electronics: [
        'Electronics Manufacturing Inc',
        'PCB Assembly Solutions',
        'Electronic Components Co',
        'Circuit Board Technologies',
        'Electronics Assembly Works',
        'Advanced Electronics Solutions',
        'Precision Electronics Inc',
        'Electronic Manufacturing Services'
    ],
    testing: [
        'Testing & Validation Services',
        'Quality Testing Solutions',
        'Inspection Services Inc',
        'Testing Technologies',
        'Quality Assurance Co',
        'Testing & Certification',
        'Advanced Testing Solutions',
        'Precision Testing Services'
    ],
    packaging: [
        'Packaging Solutions Inc',
        'Custom Packaging Services',
        'Packaging Technologies',
        'Industrial Packaging Co',
        'Advanced Packaging Solutions',
        'Packaging Manufacturing',
        'Specialty Packaging Services',
        'Packaging Design Works'
    ]
};

// Sample contact names
const CONTACT_NAMES = [
    'John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim',
    'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'Christopher Lee',
    'Amanda Wilson', 'James Brown', 'Michelle Garcia', 'Daniel Thompson',
    'Ashley Davis', 'Matthew White', 'Jessica Miller', 'Andrew Jackson',
    'Stephanie Harris', 'Kevin Martin', 'Nicole Clark', 'Ryan Lewis',
    'Rachel Walker', 'Brandon Hall', 'Samantha Young', 'Tyler King'
];

// Sample job titles
const JOB_TITLES = [
    'Sales Manager', 'Business Development Manager', 'Account Manager',
    'Sales Director', 'Regional Sales Manager', 'Key Account Manager',
    'Sales Representative', 'Business Development Director', 'Sales Executive',
    'Account Executive', 'Sales Coordinator', 'Business Development Executive'
];

// Sample industries
const INDUSTRIES = [
    'Manufacturing', 'Aerospace', 'Automotive', 'Electronics', 'Medical Devices',
    'Defense', 'Energy', 'Telecommunications', 'Consumer Goods', 'Industrial Equipment',
    'Construction', 'Marine', 'Railway', 'Oil & Gas', 'Renewable Energy'
];

// Sample countries with cities
const LOCATIONS = [
    { country: 'United States', cities: ['Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin'] },
    { country: 'China', cities: ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Tianjin', 'Wuhan', 'Chengdu', 'Nanjing', 'Hangzhou', 'Suzhou'] },
    { country: 'Vietnam', cities: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong', 'Can Tho', 'Bien Hoa', 'Hue', 'Nha Trang', 'Vung Tau', 'Quy Nhon'] },
    { country: 'Malaysia', cities: ['Kuala Lumpur', 'George Town', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Klang', 'Johor Bahru', 'Subang Jaya', 'Kuching', 'Kota Kinabalu'] },
    { country: 'Germany', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'] },
    { country: 'Japan', cities: ['Tokyo', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Yokohama', 'Kawasaki', 'Saitama'] },
    { country: 'South Korea', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang'] },
    { country: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'] }
];

// Sample materials
const MATERIALS = [
    'Aluminum', 'Steel', 'Stainless Steel', 'Titanium', 'Copper', 'Brass', 'Bronze',
    'Plastic', 'ABS', 'Polycarbonate', 'Nylon', 'PVC', 'Ceramic', 'Composite',
    'Carbon Fiber', 'Fiberglass', 'Rubber', 'Silicone', 'Wood', 'Glass'
];

// Sample certifications
const CERTIFICATIONS = [
    'ISO 9001', 'ISO 14001', 'AS9100', 'IATF 16949', 'ISO 13485', 'TL 9000',
    'OHSAS 18001', 'SA8000', 'ISO 22000', 'FSSC 22000', 'BRCGS', 'SQF',
    'HACCP', 'ITAR Registered', 'EAR99', 'RoHS Compliant', 'REACH Compliant',
    'Conflict Minerals Compliant'
];

// Sample payment terms
const PAYMENT_TERMS = [
    'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', '2/10 Net 30',
    'COD', 'CIA', '50% Deposit'
];

// Sample currencies
const CURRENCIES = [
    'USD', 'EUR', 'GBP', 'CNY', 'JPY', 'CAD', 'MXN', 'AUD', 'CHF', 'SEK', 'VND'
];

// Sample incoterms
const INCOTERMS = [
    'EXW', 'FCA', 'CPT', 'CIP', 'DAT', 'DAP', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'
];

// Sample tags
const TAGS = [
    'Aerospace', 'High Priority', 'Preferred Supplier', 'New Vendor',
    'Quality Focused', 'Cost Competitive', 'Fast Delivery', 'Innovation Leader',
    'Reliable Partner', 'Technology Advanced', 'Environmentally Conscious',
    'Small Business', 'Local Supplier', 'International', 'Certified'
];

// Sample internal notes
const INTERNAL_NOTES = [
    'Met at IMTS 2024. Strong in 5-axis titanium work. Pricing competitive.',
    'Excellent quality record. Quick turnaround times. Recommended by engineering team.',
    'New supplier with innovative processes. Worth evaluating for future projects.',
    'Established relationship. Consistent performance. Good communication.',
    'Specializes in complex geometries. Advanced equipment. Competitive pricing.',
    'Reliable delivery performance. Good quality control. Responsive to requirements.',
    'Innovative solutions provider. Strong technical support. Flexible manufacturing.',
    'Cost-effective supplier. Good quality. Suitable for high-volume production.',
    'Specialized in precision components. Excellent surface finish capabilities.',
    'Strong engineering support. Quick prototyping. Good for development projects.'
];

// Utility functions
function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
}

function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number, decimals: number = 2): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateEmail(name: string, companyName: string): string {
    const firstName = name.split(' ')[0].toLowerCase();
    const lastName = name.split(' ')[1]?.toLowerCase() || '';
    const domain = companyName.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 15) + '.com';

    return `${firstName}${lastName ? '.' + lastName : ''}@${domain}`;
}

function generatePhoneNumber(): string {
    const areaCode = getRandomNumber(200, 999);
    const exchange = getRandomNumber(200, 999);
    const number = getRandomNumber(1000, 9999);
    return `+1-${areaCode}-${exchange}-${number}`;
}

function generateWebsite(companyName: string): string {
    const domain = companyName.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);

    // Ensure we have a valid domain
    if (domain.length < 3) {
        return `https://www.${domain}company.com`;
    }

    return `https://www.${domain}.com`;
}

function generateAddress(): string {
    const streetNumbers = getRandomNumber(100, 9999);
    const streetNames = [
        'Industrial Blvd', 'Manufacturing Way', 'Commerce St', 'Business Ave',
        'Technology Dr', 'Innovation Rd', 'Production St', 'Factory Ave',
        'Industrial Park', 'Business Center', 'Manufacturing Pl', 'Commerce Blvd'
    ];
    return `${streetNumbers} ${getRandomElement(streetNames)}`;
}

function generatePostalCode(): string {
    return getRandomNumber(10000, 99999).toString();
}

// Main function to generate sample supplier data
export function generateSupplierSampleData() {
    // Select a random specialty to base the company name on
    const specialty = getRandomElement(Object.keys(COMPANY_NAMES)) as SupplierSpecialty;
    const companyName = getRandomElement(COMPANY_NAMES[specialty]);

    // Generate contact information
    const contactName = getRandomElement(CONTACT_NAMES);
    const jobTitle = getRandomElement(JOB_TITLES);
    const email = generateEmail(contactName, companyName);
    const phone = generatePhoneNumber();
    const website = generateWebsite(companyName);

    // Generate location
    const location = getRandomElement(LOCATIONS);
    const city = getRandomElement(location.cities);
    const state = location.country === 'United States' ? getRandomElement(['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI']) : '';

    // Generate capabilities and materials
    const specialties = getRandomElements(Object.keys(COMPANY_NAMES), getRandomNumber(2, 5)) as SupplierSpecialty[];
    const materials = getRandomElements(MATERIALS, getRandomNumber(3, 8));
    const certifications = getRandomElements(CERTIFICATIONS, getRandomNumber(2, 6));

    // Generate financial information
    const paymentTerms = getRandomElement(PAYMENT_TERMS);
    const currency = getRandomElement(CURRENCIES);
    const incoterms = getRandomElement(INCOTERMS);

    // Generate performance metrics
    const onTimeDelivery = getRandomFloat(85, 98);
    const qualityRating = getRandomFloat(3.5, 5.0);
    const responsiveness = getRandomFloat(3.0, 5.0);

    // Generate tags and notes
    const tags = getRandomElements(TAGS, getRandomNumber(2, 4));
    const internalNotes = getRandomElement(INTERNAL_NOTES);

    return {
        // Organization info
        name: companyName,
        email: email,
        phone: phone,
        website: Math.random() > 0.1 ? website : '', // 90% chance of having website
        address: generateAddress(),
        city: city,
        state: state,
        country: location.country,
        postalCode: generatePostalCode(),

        // Capabilities
        specialties: specialties,
        materials: materials,

        // Compliance
        certifications: certifications,
        paymentTerms: paymentTerms,
        currency: currency,
        incoterms: incoterms,

        // Metadata
        tags: tags,
        internalNotes: internalNotes,
    };
}

// Function to generate multiple sample suppliers for testing
export function generateMultipleSupplierSamples(count: number = 5) {
    return Array.from({ length: count }, () => generateSupplierSampleData());
}

// Function to generate sample data for specific specialty
export function generateSupplierSampleForSpecialty(specialty: SupplierSpecialty) {
    const companyName = getRandomElement(COMPANY_NAMES[specialty]);
    const contactName = getRandomElement(CONTACT_NAMES);
    const jobTitle = getRandomElement(JOB_TITLES);
    const email = generateEmail(contactName, companyName);
    const phone = generatePhoneNumber();
    const website = generateWebsite(companyName);

    const location = getRandomElement(LOCATIONS);
    const city = getRandomElement(location.cities);
    const state = location.country === 'United States' ? getRandomElement(['CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI']) : '';

    const materials = getRandomElements(MATERIALS, getRandomNumber(3, 8));
    const certifications = getRandomElements(CERTIFICATIONS, getRandomNumber(2, 6));

    return {
        name: companyName,
        email: email,
        phone: phone,
        website: Math.random() > 0.1 ? website : '', // 90% chance of having website
        address: generateAddress(),
        city: city,
        state: state,
        country: location.country,
        postalCode: generatePostalCode(),
        specialties: [specialty],
        materials: materials,
        certifications: certifications,
        paymentTerms: getRandomElement(PAYMENT_TERMS),
        currency: getRandomElement(CURRENCIES),
        incoterms: getRandomElement(INCOTERMS),
        tags: getRandomElements(TAGS, getRandomNumber(2, 4)),
        internalNotes: getRandomElement(INTERNAL_NOTES),
    };
}
