-- Create Purchase Orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  project_id UUID REFERENCES public.projects(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'sent', 'acknowledged', 'delivered', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  total_amount NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  due_date TIMESTAMP WITH TIME ZONE,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Purchase Order Items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  unit TEXT DEFAULT 'each',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Inventory table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code TEXT NOT NULL UNIQUE,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit TEXT DEFAULT 'each',
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  max_stock_level INTEGER DEFAULT 1000,
  unit_cost NUMERIC(10,2),
  location TEXT,
  supplier_id UUID REFERENCES public.suppliers(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  last_restocked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Production Orders table
CREATE TABLE public.production_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_number TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  planned_start_date TIMESTAMP WITH TIME ZONE,
  planned_end_date TIMESTAMP WITH TIME ZONE,
  actual_start_date TIMESTAMP WITH TIME ZONE,
  actual_end_date TIMESTAMP WITH TIME ZONE,
  quantity INTEGER NOT NULL DEFAULT 1,
  completed_quantity INTEGER DEFAULT 0,
  assigned_to UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Purchase Orders
CREATE POLICY "Management can manage all purchase orders"
ON public.purchase_orders
FOR ALL
USING (has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Procurement can manage purchase orders"
ON public.purchase_orders
FOR ALL
USING (has_role(auth.uid(), 'Procurement'::user_role));

CREATE POLICY "Users can view purchase orders"
ON public.purchase_orders
FOR SELECT
USING (
  has_role(auth.uid(), 'Management'::user_role) OR 
  has_role(auth.uid(), 'Procurement'::user_role) OR 
  has_role(auth.uid(), 'Engineering'::user_role)
);

-- Create RLS policies for Purchase Order Items
CREATE POLICY "Management can manage all purchase order items"
ON public.purchase_order_items
FOR ALL
USING (has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Procurement can manage purchase order items"
ON public.purchase_order_items
FOR ALL
USING (has_role(auth.uid(), 'Procurement'::user_role));

CREATE POLICY "Users can view purchase order items"
ON public.purchase_order_items
FOR SELECT
USING (
  has_role(auth.uid(), 'Management'::user_role) OR 
  has_role(auth.uid(), 'Procurement'::user_role) OR 
  has_role(auth.uid(), 'Engineering'::user_role)
);

-- Create RLS policies for Inventory
CREATE POLICY "Management can manage all inventory items"
ON public.inventory_items
FOR ALL
USING (has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Procurement can manage inventory items"
ON public.inventory_items
FOR ALL
USING (has_role(auth.uid(), 'Procurement'::user_role));

CREATE POLICY "Users can view inventory items"
ON public.inventory_items
FOR SELECT
USING (
  has_role(auth.uid(), 'Management'::user_role) OR 
  has_role(auth.uid(), 'Procurement'::user_role) OR 
  has_role(auth.uid(), 'Engineering'::user_role) OR
  has_role(auth.uid(), 'Production'::user_role)
);

-- Create RLS policies for Production Orders
CREATE POLICY "Management can manage all production orders"
ON public.production_orders
FOR ALL
USING (has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Production can manage production orders"
ON public.production_orders
FOR ALL
USING (has_role(auth.uid(), 'Production'::user_role));

CREATE POLICY "Users can view production orders"
ON public.production_orders
FOR SELECT
USING (
  has_role(auth.uid(), 'Management'::user_role) OR 
  has_role(auth.uid(), 'Procurement'::user_role) OR 
  has_role(auth.uid(), 'Engineering'::user_role) OR
  has_role(auth.uid(), 'Production'::user_role) OR
  assigned_to = auth.uid()
);

-- Create triggers for updated_at columns
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_orders_updated_at
  BEFORE UPDATE ON public.production_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for Purchase Orders
INSERT INTO public.purchase_orders (po_number, supplier_id, status, priority, total_amount, due_date, order_date, notes) 
SELECT 
  'PO-2025-' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
  s.id,
  CASE 
    WHEN random() < 0.3 THEN 'pending'
    WHEN random() < 0.5 THEN 'approved' 
    WHEN random() < 0.7 THEN 'sent'
    WHEN random() < 0.9 THEN 'acknowledged'
    ELSE 'delivered'
  END,
  CASE 
    WHEN random() < 0.2 THEN 'urgent'
    WHEN random() < 0.4 THEN 'high'
    WHEN random() < 0.8 THEN 'medium'
    ELSE 'low'
  END,
  (random() * 50000 + 1000)::NUMERIC(10,2),
  now() + (random() * 30 || ' days')::INTERVAL,
  now() - (random() * 15 || ' days')::INTERVAL,
  'Sample purchase order for ' || s.company
FROM (SELECT id, company FROM public.suppliers ORDER BY random() LIMIT 15) s;

-- Insert sample data for Inventory Items
INSERT INTO public.inventory_items (item_code, item_name, description, category, current_stock, min_stock_level, max_stock_level, unit_cost, location, status)
VALUES 
  ('STL-001', 'Steel Plate 1/4"', 'Hot rolled steel plate, 1/4 inch thickness', 'Raw Materials', 45, 20, 200, 25.50, 'Warehouse A-1', 'active'),
  ('STL-002', 'Steel Rod 1/2"', 'Round steel rod, 1/2 inch diameter', 'Raw Materials', 8, 15, 150, 18.75, 'Warehouse A-2', 'active'),
  ('ALU-001', 'Aluminum Sheet 1/8"', 'Aluminum sheet, 1/8 inch thickness', 'Raw Materials', 12, 25, 300, 32.00, 'Warehouse B-1', 'active'),
  ('BOLT-001', 'M8 Hex Bolts', 'M8 x 25mm hex head bolts', 'Fasteners', 250, 100, 1000, 0.85, 'Storage C-1', 'active'),
  ('BOLT-002', 'M10 Hex Bolts', 'M10 x 30mm hex head bolts', 'Fasteners', 5, 50, 500, 1.25, 'Storage C-1', 'active'),
  ('WIRE-001', 'Copper Wire 12AWG', '12 AWG copper electrical wire', 'Electrical', 180, 100, 500, 2.45, 'Storage D-1', 'active'),
  ('PAINT-001', 'Industrial Primer', 'Anti-corrosion primer paint', 'Consumables', 25, 10, 100, 45.00, 'Chemical Storage', 'active'),
  ('WELD-001', 'Welding Rods E7018', '3.2mm welding electrodes', 'Consumables', 3, 20, 200, 8.50, 'Welding Shop', 'active'),
  ('SEAL-001', 'O-Ring Seals 25mm', 'Rubber O-ring seals, 25mm diameter', 'Seals & Gaskets', 75, 50, 300, 3.20, 'Parts Storage', 'active'),
  ('BEAR-001', 'Ball Bearings 6205', 'Deep groove ball bearings 6205', 'Mechanical Parts', 15, 20, 100, 12.80, 'Parts Storage', 'active');

-- Insert sample data for Production Orders (simpler version)
INSERT INTO public.production_orders (production_number, status, priority, planned_start_date, planned_end_date, quantity, notes)
VALUES 
  ('PROD-2025-001', 'in_progress', 'high', now() - interval '2 days', now() + interval '5 days', 5, 'Custom fabrication project'),
  ('PROD-2025-002', 'planned', 'medium', now() + interval '1 day', now() + interval '10 days', 3, 'Manufacturing assembly'),
  ('PROD-2025-003', 'completed', 'low', now() - interval '10 days', now() - interval '2 days', 2, 'System build project'),
  ('PROD-2025-004', 'in_progress', 'urgent', now() - interval '1 day', now() + interval '3 days', 1, 'Rush order fabrication'),
  ('PROD-2025-005', 'on_hold', 'medium', now() + interval '3 days', now() + interval '12 days', 4, 'Waiting for materials'),
  ('PROD-2025-006', 'planned', 'high', now() + interval '2 days', now() + interval '8 days', 6, 'Multi-part assembly'),
  ('PROD-2025-007', 'completed', 'medium', now() - interval '15 days', now() - interval '5 days', 8, 'Bulk production run'),
  ('PROD-2025-008', 'in_progress', 'high', now() - interval '3 days', now() + interval '4 days', 2, 'Critical component manufacturing');