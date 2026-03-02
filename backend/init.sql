CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  client VARCHAR(255) NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'unpaid',
  invoice_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to invoices table
DROP TRIGGER IF EXISTS set_updated_at ON invoices;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();