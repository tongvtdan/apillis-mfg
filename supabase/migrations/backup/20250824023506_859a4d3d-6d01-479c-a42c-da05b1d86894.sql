-- Clear all existing data and rebuild with proper schema
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE customers CASCADE;
DELETE FROM profiles WHERE role = 'Customer';

-- Create suppliers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.suppliers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    company text NOT NULL,
    email text,
    phone text,
    address text,
    country text DEFAULT 'USA',
    industry_type text,
    capabilities text[],
    quality_rating numeric(3,2) DEFAULT 4.0 CHECK (quality_rating >= 0 AND quality_rating <= 5),
    delivery_rating numeric(3,2) DEFAULT 4.0 CHECK (delivery_rating >= 0 AND delivery_rating <= 5),
    cost_rating numeric(3,2) DEFAULT 4.0 CHECK (cost_rating >= 0 AND cost_rating <= 5),
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on suppliers table
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for suppliers
CREATE POLICY "Management can manage all suppliers" 
ON public.suppliers FOR ALL 
USING (has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Procurement can manage suppliers" 
ON public.suppliers FOR ALL 
USING (has_role(auth.uid(), 'Procurement'::user_role));

CREATE POLICY "Users can view suppliers" 
ON public.suppliers FOR SELECT 
USING (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR has_role(auth.uid(), 'Engineering'::user_role));

-- Add supplier relationships to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id);

-- Create updated_at trigger for suppliers
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample customers
INSERT INTO public.customers (id, name, company, email, phone, address, country) VALUES
('11111111-1111-1111-1111-111111111001', 'Sarah Johnson', 'TechCorp Industries', 'sarah.johnson@techcorp.com', '+1-555-0123', '123 Tech Street, Silicon Valley, CA 94000', 'USA'),
('11111111-1111-1111-1111-111111111002', 'Michael Chen', 'AeroSpace Solutions', 'michael.chen@aerospace.com', '+1-555-0124', '456 Aviation Blvd, Seattle, WA 98101', 'USA'),
('11111111-1111-1111-1111-111111111003', 'Lisa Rodriguez', 'Industrial Equipment Corp', 'lisa.rodriguez@industrial.com', '+1-555-0125', '789 Industrial Way, Detroit, MI 48201', 'USA'),
('11111111-1111-1111-1111-111111111004', 'David Kim', 'Environmental Monitoring Systems', 'david.kim@monitoring.com', '+1-555-0126', '321 Green Tech Ave, Portland, OR 97201', 'USA'),
('11111111-1111-1111-1111-111111111005', 'Jennifer Walsh', 'AutoParts Manufacturing', 'jennifer.walsh@automotive.com', '+1-555-0127', '654 Motor City Blvd, Detroit, MI 48202', 'USA'),
('11111111-1111-1111-1111-111111111006', 'Robert Brown', 'MedDevice Innovations', 'robert.brown@meddevice.com', '+1-555-0128', '987 Healthcare Way, Boston, MA 02101', 'USA'),
('11111111-1111-1111-1111-111111111007', 'Emma Wilson', 'Precision Manufacturing Co', 'emma.wilson@precisionmfg.com', '+1-555-0129', '147 Manufacturing Blvd, Milwaukee, WI 53201', 'USA'),
('11111111-1111-1111-1111-111111111008', 'James Garcia', 'Quantum Systems Ltd', 'james.garcia@quantumsys.com', '+1-555-0130', '258 Innovation Drive, Austin, TX 78701', 'USA'),
('11111111-1111-1111-1111-111111111009', 'Maria Martinez', 'European Engineering GmbH', 'maria.martinez@euroeng.de', '+49-89-1234567', 'Münchener Str. 45, Munich, Germany', 'Germany'),
('11111111-1111-1111-1111-111111111010', 'Yuki Tanaka', 'Tokyo Precision Ltd', 'yuki.tanaka@tokyoprecision.jp', '+81-3-1234-5678', '1-2-3 Shibuya, Tokyo, Japan', 'Japan');

-- Insert sample suppliers
INSERT INTO public.suppliers (id, name, company, email, phone, address, country, industry_type, capabilities, quality_rating, delivery_rating, cost_rating) VALUES
('22222222-2222-2222-2222-222222222001', 'John Smith', 'Precision CNC Services', 'john.smith@precisioncnc.com', '+1-555-0201', '100 Manufacturing Row, Cleveland, OH 44101', 'USA', 'CNC Machining', ARRAY['CNC Milling', 'CNC Turning', 'Precision Machining'], 4.8, 4.5, 4.2),
('22222222-2222-2222-2222-222222222002', 'Anna Lee', 'SteelWorks Fabrication', 'anna.lee@steelworks.com', '+1-555-0202', '200 Steel Ave, Pittsburgh, PA 15201', 'USA', 'Metal Fabrication', ARRAY['Steel Fabrication', 'Welding', 'Sheet Metal'], 4.6, 4.7, 4.0),
('22222222-2222-2222-2222-222222222003', 'Carlos Rodriguez', 'ElectroTech Assembly', 'carlos.rodriguez@electrotech.com', '+1-555-0203', '300 Electronics Way, San Jose, CA 95101', 'USA', 'Electronics', ARRAY['PCB Assembly', 'Electronic Testing', 'Enclosure Manufacturing'], 4.9, 4.3, 3.8),
('22222222-2222-2222-2222-222222222004', 'Linda Wang', 'AutoMold Industries', 'linda.wang@automold.com', '+1-555-0204', '400 Injection Dr, Grand Rapids, MI 49501', 'USA', 'Injection Molding', ARRAY['Injection Molding', 'Tooling', 'High Volume Production'], 4.4, 4.6, 4.5),
('22222222-2222-2222-2222-222222222005', 'Ahmed Hassan', 'Global Supply Chain Ltd', 'ahmed.hassan@globalsupply.com', '+1-555-0205', '500 Logistics Blvd, Memphis, TN 38101', 'USA', 'Supply Chain', ARRAY['Procurement', 'Logistics', 'Quality Control'], 4.7, 4.8, 4.1),
('22222222-2222-2222-2222-222222222006', 'Sophie Dubois', 'Euro Precision Manufacturing', 'sophie.dubois@europrecision.fr', '+33-1-4567-8901', '15 Rue de la Fabrication, Lyon, France', 'France', 'Precision Manufacturing', ARRAY['High Precision Machining', 'Quality Systems', 'Aerospace Components'], 4.9, 4.2, 3.9),
('22222222-2222-2222-2222-222222222007', 'Raj Patel', 'Advanced Materials Corp', 'raj.patel@advmaterials.com', '+1-555-0207', '700 Materials Science Way, Akron, OH 44301', 'USA', 'Advanced Materials', ARRAY['Composite Materials', 'Material Testing', 'R&D'], 4.8, 4.4, 4.0),
('22222222-2222-2222-2222-222222222008', 'Tom Anderson', 'Pacific Coast Manufacturing', 'tom.anderson@pacificcoast.com', '+1-555-0208', '800 Coastal Industrial Dr, Long Beach, CA 90801', 'USA', 'General Manufacturing', ARRAY['Assembly', 'Testing', 'Packaging'], 4.3, 4.5, 4.3),
('22222222-2222-2222-2222-222222222009', 'Hiroshi Yamamoto', 'Nippon Quality Systems', 'hiroshi.yamamoto@nipponquality.jp', '+81-6-2345-6789', '2-5-10 Osaka Industrial, Osaka, Japan', 'Japan', 'Quality Systems', ARRAY['Quality Control', 'Inspection', 'Certification'], 4.9, 4.7, 4.1),
('22222222-2222-2222-2222-222222222010', 'Maria Gonzalez', 'MexTech Solutions', 'maria.gonzalez@mextech.mx', '+52-55-1234-5678', 'Av. Industrial 123, Mexico City, Mexico', 'Mexico', 'Technical Solutions', ARRAY['Technical Design', 'Prototyping', 'Small Batch Production'], 4.5, 4.2, 4.6);

-- Insert sample projects with relationships to customers and suppliers
INSERT INTO public.projects (id, project_id, title, description, status, priority, project_type, estimated_value, due_date, customer_id, supplier_id, contact_name, contact_email, contact_phone, notes, priority_score, days_in_stage, stage_entered_at, tags) VALUES
('33333333-3333-3333-3333-333333333001', 'P-25082401', 'Advanced IoT Sensor System', 'Complete IoT sensor system with wireless communication, data logging, and cloud integration for smart factory monitoring.', 'inquiry', 'urgent', 'system_build', 750000, '2025-12-15', '11111111-1111-1111-1111-111111111001', '22222222-2222-2222-2222-222222222003', 'Sarah Johnson', 'sarah.johnson@techcorp.com', '+1-555-0123', 'Rush order for Q4 deployment. Customer requires high precision and reliability.', 95, 3, now() - interval '3 days', ARRAY['IoT', 'Sensors', 'Wireless', 'Industrial']),
('33333333-3333-3333-3333-333333333002', 'P-25082402', 'Precision CNC Machined Components', 'High-precision aluminum components for aerospace applications with tight tolerances.', 'review', 'high', 'fabrication', 125000, '2025-11-30', '11111111-1111-1111-1111-111111111002', '22222222-2222-2222-2222-222222222001', 'Michael Chen', 'michael.chen@aerospace.com', '+1-555-0124', 'Aerospace grade materials required. AS9100 certification needed.', 85, 5, now() - interval '5 days', ARRAY['CNC', 'Aerospace', 'Aluminum', 'Precision']),
('33333333-3333-3333-3333-333333333003', 'P-25082403', 'Custom Steel Fabrication', 'Structural steel fabrication for industrial equipment housing.', 'quoted', 'medium', 'fabrication', 85000, '2025-10-15', '11111111-1111-1111-1111-111111111003', '22222222-2222-2222-2222-222222222002', 'Lisa Rodriguez', 'lisa.rodriguez@industrial.com', '+1-555-0125', 'Standard structural steel. Powder coating finish required.', 65, 2, now() - interval '2 days', ARRAY['Steel', 'Fabrication', 'Industrial', 'Coating']),
('33333333-3333-3333-3333-333333333004', 'P-25082404', 'Electronic Enclosure Assembly', 'Weather-resistant electronic enclosures for outdoor monitoring systems.', 'won', 'high', 'system_build', 95000, '2025-09-30', '11111111-1111-1111-1111-111111111004', '22222222-2222-2222-2222-222222222003', 'David Kim', 'david.kim@monitoring.com', '+1-555-0126', 'IP67 rating required. UV-resistant materials.', 80, 1, now() - interval '1 day', ARRAY['Electronics', 'Enclosure', 'Weather-resistant', 'IP67']),
('33333333-3333-3333-3333-333333333005', 'P-25082405', 'Automotive Bracket Manufacturing', 'High-volume production of automotive mounting brackets.', 'production', 'medium', 'manufacturing', 180000, '2025-08-30', '11111111-1111-1111-1111-111111111005', '22222222-2222-2222-2222-222222222004', 'Jennifer Walsh', 'jennifer.walsh@automotive.com', '+1-555-0127', 'TS16949 certification required. High volume production run.', 70, 7, now() - interval '7 days', ARRAY['Automotive', 'High-volume', 'Brackets', 'TS16949']),
('33333333-3333-3333-3333-333333333006', 'P-25082406', 'Medical Device Assembly Line', 'FDA-compliant assembly line for medical device manufacturing.', 'completed', 'urgent', 'system_build', 2500000, '2025-09-15', '11111111-1111-1111-1111-111111111006', '22222222-2222-2222-2222-222222222005', 'Robert Brown', 'robert.brown@meddevice.com', '+1-555-0128', 'FDA validation required. GMP compliance essential.', 98, 0, now() - interval '30 days', ARRAY['Medical', 'FDA', 'Assembly Line', 'GMP']),
('33333333-3333-3333-3333-333333333007', 'P-25082407', 'Precision Optical Components', 'Ultra-high precision optical components for laser systems.', 'inquiry', 'high', 'fabrication', 320000, '2025-11-01', '11111111-1111-1111-1111-111111111007', '22222222-2222-2222-2222-222222222006', 'Emma Wilson', 'emma.wilson@precisionmfg.com', '+1-555-0129', 'Nanometer-level precision required. Clean room environment.', 88, 1, now() - interval '1 day', ARRAY['Optics', 'Laser', 'Precision', 'Clean Room']),
('33333333-3333-3333-3333-333333333008', 'P-25082408', 'Quantum Computing Enclosure', 'Specialized enclosure for quantum computing hardware with thermal management.', 'review', 'urgent', 'system_build', 480000, '2025-10-30', '11111111-1111-1111-1111-111111111008', '22222222-2222-2222-2222-222222222007', 'James Garcia', 'james.garcia@quantumsys.com', '+1-555-0130', 'Extreme thermal stability required. EMI shielding critical.', 92, 8, now() - interval '8 days', ARRAY['Quantum', 'Thermal Management', 'EMI Shielding']),
('33333333-3333-3333-3333-333333333009', 'P-25082409', 'Industrial Automation System', 'Complete automation system for European manufacturing facility.', 'quoted', 'high', 'system_build', 1750000, '2025-12-31', '11111111-1111-1111-1111-111111111009', '22222222-2222-2222-2222-222222222008', 'Maria Martinez', 'maria.martinez@euroeng.de', '+49-89-1234567', 'CE marking required. European safety standards compliance.', 87, 4, now() - interval '4 days', ARRAY['Automation', 'CE Marking', 'European Standards']),
('33333333-3333-3333-3333-333333333010', 'P-25082410', 'High-Volume Injection Molding', 'Large-scale injection molding production for consumer products.', 'production', 'medium', 'manufacturing', 640000, '2025-09-20', '11111111-1111-1111-1111-111111111010', '22222222-2222-2222-2222-222222222009', 'Yuki Tanaka', 'yuki.tanaka@tokyoprecision.jp', '+81-3-1234-5678', 'High volume production. Quality consistency critical.', 75, 12, now() - interval '12 days', ARRAY['Injection Molding', 'High Volume', 'Consumer Products']);