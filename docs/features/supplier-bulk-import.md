# Supplier Bulk Import Feature

## Overview

The Supplier Bulk Import feature allows users to import multiple suppliers at once using an Excel or CSV file, significantly reducing the time needed to onboard suppliers compared to adding them one by one.

## How to Use

### Step 1: Access Bulk Import
1. Navigate to the Suppliers page (`/suppliers`)
2. Click the "Bulk Import" button in the top-right corner
3. The bulk import modal will open with a step-by-step wizard interface

### Step 2: Download Template
1. Click "Download Supplier Import Template" to get the Excel/CSV template
2. The template includes:
   - Sample data with 3 example suppliers
   - All required and optional fields
   - Proper formatting examples

### Step 3: Fill Out Template
Fill out the template with your supplier data:

#### Required Fields (marked with *)
- **Organization Name**: Company name
- **Primary Contact Name**: Main contact person
- **Email**: Primary contact email
- **Address**: Physical address
- **City**: City location
- **Country**: Country (must match predefined list)

#### Optional Fields
- **Phone**: Contact phone number
- **Website**: Company website
- **State**: State/province
- **Postal Code**: ZIP/postal code
- **Tax ID**: Tax identification number
- **Payment Terms**: e.g., "Net 30", "Net 45"
- **Currency**: e.g., "USD", "EUR"
- **Specialties**: Comma-separated capabilities (e.g., "machining,fabrication,welding")
- **Materials**: Comma-separated materials (e.g., "Aluminum,Steel,Plastic")
- **Certifications**: Comma-separated certifications (e.g., "ISO 9001,AS9100")
- **Notes**: Internal notes about the supplier
- **Tags**: Comma-separated tags for categorization

### Step 4: Upload and Import
1. Save your completed template as CSV or Excel file
2. Upload the file using the file picker or drag-and-drop
3. Review the import preview showing:
   - Total suppliers to be imported
   - Countries represented
   - Specialties covered
   - Breakdown by country and specialty
4. Click "Import X Suppliers" to start the process
5. Monitor the progress bar during import
6. Review the results showing successful and failed imports

## Template Structure

### Sample Data Included
The template comes with 3 sample suppliers:

1. **Precision Manufacturing Co** (USA) - Machining specialist
2. **Vietnam Casting Solutions** (Vietnam) - Casting services
3. **Malaysian Electronics Assembly** (Malaysia) - Electronics assembly

### Supported Countries
- United States
- Vietnam
- Malaysia
- China
- Canada
- Mexico
- Germany
- United Kingdom
- Japan
- South Korea
- Taiwan
- Singapore
- Thailand
- Philippines
- Indonesia
- India

### Available Specialties
- machining
- fabrication
- casting
- finishing
- injection_molding
- assembly
- 3d_printing
- prototyping
- coating
- painting
- welding
- sheet_metal
- electronics
- testing
- packaging

### Payment Terms Options
- Net 15, Net 30, Net 45, Net 60, Net 90
- 2/10 Net 30
- COD (Cash on Delivery)
- CIA (Cash in Advance)
- 50% Deposit

## Validation Rules

### File Requirements
- Maximum file size: 5MB
- Supported formats: CSV, Excel (.xlsx, .xls)
- Maximum 100 suppliers per import

### Data Validation
- **Email**: Must be valid email format
- **Website**: Must be valid URL format (optional)
- **Specialties**: Must match predefined specialty list
- **Country**: Must match supported countries list
- **Payment Terms**: Must match predefined options
- **Currency**: Must match supported currencies

### Duplicate Detection
- Checks for duplicates within the import file
- Checks against existing suppliers in the database
- Prevents importing suppliers that already exist

## Error Handling

### Common Errors
1. **Missing Required Fields**: Ensure all required fields are filled
2. **Invalid Email Format**: Check email addresses are properly formatted
3. **Invalid Specialties**: Use only predefined specialty values
4. **Duplicate Suppliers**: Remove duplicates from your file
5. **File Too Large**: Reduce file size or split into smaller batches

### Import Results
After import completion, you'll see:
- **Success Count**: Number of suppliers successfully imported
- **Failed Count**: Number of suppliers that failed to import
- **Error Details**: Specific errors for failed imports
- **Created Suppliers List**: Names and emails of successfully created suppliers

## Best Practices

### Data Preparation
1. **Clean Data**: Ensure data is accurate and complete
2. **Consistent Formatting**: Use consistent formats for phone numbers, addresses
3. **Valid Specialties**: Only use predefined specialty values
4. **Unique Suppliers**: Avoid duplicates within your import file

### Import Strategy
1. **Test with Small Batch**: Start with 5-10 suppliers to test the process
2. **Review Template**: Use the sample data as a formatting guide
3. **Validate Before Import**: Check the preview before starting import
4. **Monitor Progress**: Watch the import progress and results

### After Import
1. **Review Results**: Check the import summary for any failures
2. **Verify Data**: Spot-check imported suppliers for accuracy
3. **Update as Needed**: Use individual supplier editing for corrections
4. **Document Process**: Keep records of import batches for tracking

## Technical Details

### UI Components
- **Base Component**: `SupplierBulkImport.tsx` for standalone page integration
- **Modal Component**: `SupplierBulkImportModal.tsx` for popup integration
- **Step Wizard**: Visual progress indicator with four steps (Start → Upload → Import → Complete)
- **Nested Dialogs**: Preview modal within main modal for detailed import review

### Database Storage
- Suppliers are stored in the `contacts` table with `type: 'supplier'`
- Additional metadata stored in JSON fields
- Automatic timestamps and user tracking
- Integration with existing supplier management system

### Performance
- Imports process sequentially to avoid database conflicts
- Progress tracking with real-time updates
- Error handling with detailed feedback
- Automatic rollback on critical failures
- State management optimized for modal usage patterns

## Troubleshooting

### File Upload Issues
- **File not recognized**: Ensure file has .csv, .xlsx, or .xls extension
- **File too large**: Compress or split the file
- **Parsing errors**: Check for special characters or formatting issues

### Import Failures
- **Database errors**: Contact system administrator
- **Permission errors**: Ensure you have supplier management permissions
- **Network issues**: Check internet connection and retry

### Data Issues
- **Missing data**: Review required fields in template
- **Invalid formats**: Follow the sample data formatting
- **Duplicate detection**: Remove or modify duplicate entries

## Support

For additional help with bulk import:
1. Review the sample data in the template
2. Check validation error messages carefully
3. Contact your system administrator for technical issues
4. Refer to the main supplier management documentation