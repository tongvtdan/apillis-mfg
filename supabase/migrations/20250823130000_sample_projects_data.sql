-- Sample Projects Data Migration
-- This migration creates comprehensive sample data to demonstrate project types, statuses, and workflow

-- First, insert sample customers
INSERT INTO public.customers (id, name, company, email, phone, address, country) VALUES
-- Technology Companies
('01234567-1234-1234-1234-123456789001', 'Sarah Johnson', 'TechCorp Industries', 'sarah.johnson@techcorp.com', '+1-555-0101', '123 Innovation Drive, Austin, TX 78701', 'USA'),
('01234567-1234-1234-1234-123456789002', 'Michael Chen', 'Quantum Systems Ltd', 'michael.chen@quantumsys.com', '+1-555-0102', '456 Silicon Valley Blvd, San Jose, CA 95110', 'USA'),
('01234567-1234-1234-1234-123456789003', 'Emma Rodriguez', 'BioTech Solutions', 'emma.rodriguez@biotechsol.com', '+1-555-0103', '789 Research Park Dr, Cambridge, MA 02139', 'USA'),

-- Manufacturing Companies
('01234567-1234-1234-1234-123456789004', 'James Wilson', 'Precision Manufacturing Co', 'james.wilson@precisionmfg.com', '+1-555-0104', '321 Industrial Way, Detroit, MI 48201', 'USA'),
('01234567-1234-1234-1234-123456789005', 'Lisa Thompson', 'Global Assembly Corp', 'lisa.thompson@globalassembly.com', '+1-555-0105', '654 Factory Lane, Cleveland, OH 44114', 'USA'),
('01234567-1234-1234-1234-123456789006', 'David Kim', 'Advanced Automation Inc', 'david.kim@advancedauto.com', '+1-555-0106', '987 Automation Blvd, Pittsburgh, PA 15201', 'USA'),

-- Healthcare & Medical
('01234567-1234-1234-1234-123456789007', 'Dr. Maria Garcia', 'MedDevice Innovations', 'maria.garcia@meddevice.com', '+1-555-0107', '159 Medical Center Dr, Houston, TX 77030', 'USA'),
('01234567-1234-1234-1234-123456789008', 'Robert Brown', 'Healthcare Systems LLC', 'robert.brown@healthsys.com', '+1-555-0108', '753 Hospital Ave, Minneapolis, MN 55401', 'USA'),

-- International Clients
('01234567-1234-1234-1234-123456789009', 'Hans Mueller', 'European Engineering GmbH', 'hans.mueller@euroeng.de', '+49-30-12345678', 'Berliner Str. 123, 10115 Berlin', 'Germany'),
('01234567-1234-1234-1234-123456789010', 'Yuki Tanaka', 'Tokyo Precision Ltd', 'yuki.tanaka@tokyoprecision.co.jp', '+81-3-1234-5678', '1-2-3 Shibuya, Tokyo 150-0002', 'Japan'),

-- Startups & Small Companies
('01234567-1234-1234-1234-123456789011', 'Alex Rivera', 'Innovation Startup', 'alex.rivera@innovationstartup.com', '+1-555-0111', '246 Startup Alley, San Francisco, CA 94102', 'USA'),
('01234567-1234-1234-1234-123456789012', 'Sophie Martin', 'Green Energy Solutions', 'sophie.martin@greenenergy.com', '+1-555-0112', '135 Renewable Way, Portland, OR 97201', 'USA');

-- Insert sample projects with diverse types, statuses, and priorities
INSERT INTO public.projects (
  id, project_id, title, description, customer_id, status, priority, priority_score, 
  estimated_value, due_date, days_in_stage, stage_entered_at, contact_name, contact_email, 
  contact_phone, tags, notes, project_type
) VALUES

-- High Priority & Urgent Projects (Recently Created)
('11111111-1111-1111-1111-111111111001', 'P-25082301', 'Advanced IoT Sensor System', 
'Complete IoT sensor system with wireless communication, data logging, and cloud integration for smart factory monitoring.',
'01234567-1234-1234-1234-123456789001', 'inquiry_received', 'urgent', 95,
750000, '2025-12-15', 2, '2025-08-21 10:00:00+00',
'Sarah Johnson', 'sarah.johnson@techcorp.com', '+1-555-0101',
ARRAY['IoT', 'Sensors', 'Wireless', 'Cloud'], 'Rush order for Q4 deployment', 'system_build'),

('11111111-1111-1111-1111-111111111002', 'P-25082302', 'Precision CNC Machined Parts',
'High-precision CNC machined components for aerospace application with tight tolerances ±0.001".',
'01234567-1234-1234-1234-123456789004', 'technical_review', 'high', 85,
125000, '2025-10-30', 5, '2025-08-18 14:30:00+00',
'James Wilson', 'james.wilson@precisionmfg.com', '+1-555-0104',
ARRAY['CNC', 'Aerospace', 'Precision'], 'Critical components for aircraft assembly', 'fabrication'),

('11111111-1111-1111-1111-111111111003', 'P-25082303', 'Medical Device Assembly Line',
'Automated assembly line for medical device manufacturing with FDA compliance requirements.',
'01234567-1234-1234-1234-123456789007', 'supplier_rfq_sent', 'urgent', 90,
2500000, '2025-11-20', 8, '2025-08-15 09:15:00+00',
'Dr. Maria Garcia', 'maria.garcia@meddevice.com', '+1-555-0107',
ARRAY['Medical', 'Assembly', 'FDA', 'Automation'], 'FDA validation required', 'manufacturing'),

-- Medium Priority Projects (Various Stages)
('11111111-1111-1111-1111-111111111004', 'P-25082304', 'Quantum Computing Enclosure',
'Custom enclosure system for quantum computing hardware with thermal management and EMI shielding.',
'01234567-1234-1234-1234-123456789002', 'quoted', 'high', 80,
450000, '2025-12-01', 12, '2025-08-11 16:45:00+00',
'Michael Chen', 'michael.chen@quantumsys.com', '+1-555-0102',
ARRAY['Quantum', 'Enclosure', 'Thermal', 'EMI'], 'Specialized cooling requirements', 'system_build'),

('11111111-1111-1111-1111-111111111005', 'P-25082305', 'Laboratory Equipment Fabrication',
'Custom laboratory equipment fabrication including fume hoods, lab benches, and ventilation systems.',
'01234567-1234-1234-1234-123456789003', 'order_confirmed', 'medium', 65,
185000, '2025-09-15', 18, '2025-08-05 11:20:00+00',
'Emma Rodriguez', 'emma.rodriguez@biotechsol.com', '+1-555-0103',
ARRAY['Laboratory', 'Fume Hood', 'Ventilation'], 'Chemical resistant materials required', 'fabrication'),

('11111111-1111-1111-1111-111111111006', 'P-25082306', 'Automotive Parts Manufacturing',
'High-volume manufacturing of automotive components using injection molding and secondary operations.',
'01234567-1234-1234-1234-123456789005', 'procurement_planning', 'medium', 70,
850000, '2025-10-15', 22, '2025-08-01 13:10:00+00',
'Lisa Thompson', 'lisa.thompson@globalassembly.com', '+1-555-0105',
ARRAY['Automotive', 'Injection Molding', 'High Volume'], 'Annual contract potential', 'manufacturing'),

-- Projects in Production Phase
('11111111-1111-1111-1111-111111111007', 'P-25082307', 'Robotic Arm Integration System',
'Complete robotic arm integration with vision system and PLC controls for automated packaging.',
'01234567-1234-1234-1234-123456789006', 'in_production', 'high', 75,
320000, '2025-09-30', 35, '2025-07-19 08:30:00+00',
'David Kim', 'david.kim@advancedauto.com', '+1-555-0106',
ARRAY['Robotics', 'Vision', 'PLC', 'Packaging'], 'Integration testing in progress', 'system_build'),

('11111111-1111-1111-1111-111111111008', 'P-25082308', 'Healthcare Monitoring Device',
'Portable healthcare monitoring device with wireless connectivity and mobile app integration.',
'01234567-1234-1234-1234-123456789008', 'in_production', 'medium', 60,
95000, '2025-08-30', 28, '2025-07-26 15:45:00+00',
'Robert Brown', 'robert.brown@healthsys.com', '+1-555-0108',
ARRAY['Healthcare', 'Monitoring', 'Wireless', 'Mobile'], 'Final testing phase', 'system_build'),

-- International Projects
('11111111-1111-1111-1111-111111111009', 'P-25082309', 'Industrial Automation System',
'Complete industrial automation system for European manufacturing facility with CE marking.',
'01234567-1234-1234-1234-123456789009', 'technical_review', 'high', 85,
1750000, '2025-11-30', 15, '2025-08-08 12:00:00+00',
'Hans Mueller', 'hans.mueller@euroeng.de', '+49-30-12345678',
ARRAY['Automation', 'CE Mark', 'Industrial', 'European'], 'CE compliance documentation needed', 'system_build'),

('11111111-1111-1111-1111-111111111010', 'P-25082310', 'Precision Optical Components',
'Ultra-precision optical components for laser systems with nanometer-level accuracy requirements.',
'01234567-1234-1234-1234-123456789010', 'supplier_rfq_sent', 'urgent', 92,
680000, '2025-10-20', 6, '2025-08-17 07:15:00+00',
'Yuki Tanaka', 'yuki.tanaka@tokyoprecision.co.jp', '+81-3-1234-5678',
ARRAY['Optical', 'Precision', 'Laser', 'Nanometer'], 'Cleanroom fabrication required', 'fabrication'),

-- Completed Projects
('11111111-1111-1111-1111-111111111011', 'P-25082311', 'Solar Panel Testing Equipment',
'Automated testing equipment for solar panel quality control and performance validation.',
'01234567-1111-1111-1111-111111111012', 'shipped_closed', 'medium', 55,
145000, '2025-07-15', 0, '2025-07-15 16:30:00+00',
'Sophie Martin', 'sophie.martin@greenenergy.com', '+1-555-0112',
ARRAY['Solar', 'Testing', 'Automation', 'QC'], 'Successfully delivered and commissioned', 'system_build'),

-- Startup Projects (Lower Priority but Innovative)
('11111111-1111-1111-1111-111111111012', 'P-25082312', 'Prototype Development Platform',
'Rapid prototyping platform for hardware startups with modular design and quick-turn capabilities.',
'01234567-1234-1234-1234-123456789011', 'inquiry_received', 'low', 30,
45000, '2025-09-30', 1, '2025-08-22 14:20:00+00',
'Alex Rivera', 'alex.rivera@innovationstartup.com', '+1-555-0111',
ARRAY['Prototype', 'Startup', 'Modular', 'Quick-turn'], 'Potential for larger orders', 'fabrication'),

-- Bottleneck Projects (Long time in stage)
('11111111-1111-1111-1111-111111111013', 'P-25082313', 'Complex Multi-System Integration',
'Integration of multiple subsystems including mechanical, electrical, and software components.',
'01234567-1234-1234-1234-123456789001', 'technical_review', 'medium', 68,
980000, '2025-12-30', 21, '2025-08-02 10:45:00+00',
'Sarah Johnson', 'sarah.johnson@techcorp.com', '+1-555-0101',
ARRAY['Integration', 'Multi-system', 'Complex'], 'Waiting for customer clarifications', 'system_build'),

('11111111-1111-1111-1111-111111111014', 'P-25082314', 'Custom Tooling and Fixtures',
'Specialized tooling and fixtures for unique manufacturing process with custom geometries.',
'01234567-1234-1234-1234-123456789004', 'supplier_rfq_sent', 'low', 45,
78000, '2025-09-20', 16, '2025-08-07 09:30:00+00',
'James Wilson', 'james.wilson@precisionmfg.com', '+1-555-0104',
ARRAY['Tooling', 'Fixtures', 'Custom'], 'Supplier capacity constraints', 'fabrication'),

-- High-Value Projects
('11111111-1111-1111-1111-111111111015', 'P-25082315', 'Pharmaceutical Production Line',
'Complete pharmaceutical production line with clean room requirements and GMP compliance.',
'01234567-1234-1234-1234-123456789007', 'quoted', 'urgent', 88,
4200000, '2026-02-28', 9, '2025-08-14 11:15:00+00',
'Dr. Maria Garcia', 'maria.garcia@meddevice.com', '+1-555-0107',
ARRAY['Pharmaceutical', 'GMP', 'Clean Room', 'Production'], 'Major pharmaceutical client', 'manufacturing');

-- Update the project type column in projects table to include the new field
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_type') THEN
    -- Add project_type enum if it doesn't exist
    CREATE TYPE project_type AS ENUM ('system_build', 'fabrication', 'manufacturing');
    
    -- Add project_type column to projects table
    ALTER TABLE public.projects ADD COLUMN project_type project_type DEFAULT 'system_build';
  END IF;
END $$;

-- Update project status enum to match the frontend types
DO $$
BEGIN
  -- First create the new enum with updated values
  CREATE TYPE new_project_status AS ENUM (
    'inquiry_received', 'technical_review', 'supplier_rfq_sent', 'quoted', 
    'order_confirmed', 'procurement_planning', 'in_production', 'shipped_closed'
  );
  
  -- Update the column type
  ALTER TABLE public.projects ALTER COLUMN status TYPE new_project_status USING status::text::new_project_status;
  
  -- Drop the old enum and rename the new one
  DROP TYPE project_status;
  ALTER TYPE new_project_status RENAME TO project_status;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON public.projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON public.projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON public.projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_days_in_stage ON public.projects(days_in_stage);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);

-- Update timestamps to ensure realistic data
UPDATE public.projects SET 
  created_at = stage_entered_at - INTERVAL '1 day' * days_in_stage,
  updated_at = stage_entered_at + INTERVAL '1 hour';

-- Add some project activities for recent projects
INSERT INTO public.project_activities (project_id, activity_type, description, created_at) VALUES
('11111111-1111-1111-1111-111111111001', 'status_change', 'Project created and moved to Inquiry Received', '2025-08-21 10:00:00+00'),
('11111111-1111-1111-1111-111111111002', 'status_change', 'Moved to Technical Review stage', '2025-08-18 14:30:00+00'),
('11111111-1111-1111-1111-111111111003', 'status_change', 'RFQ sent to suppliers', '2025-08-15 09:15:00+00'),
('11111111-1111-1111-1111-111111111004', 'status_change', 'Quote submitted to customer', '2025-08-11 16:45:00+00'),
('11111111-1111-1111-1111-111111111005', 'status_change', 'Order confirmed by customer', '2025-08-05 11:20:00+00'),
('11111111-1111-1111-1111-111111111007', 'status_change', 'Production started', '2025-07-19 08:30:00+00'),
('11111111-1111-1111-1111-111111111011', 'status_change', 'Project completed and shipped', '2025-07-15 16:30:00+00');