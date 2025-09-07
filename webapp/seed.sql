-- Sample data for HMPI App
-- Insert default admin user (password: admin123 - should be changed in production)
INSERT OR IGNORE INTO admin_users (username, email, password_hash, role) VALUES 
  ('admin', 'admin@hmpi.com', '$2b$10$K7L/8rZLIZrKJ1K7L8rZLOy.8rZLIZrKJ1K7L8rZLOy.8rZLIZrK', 'super_admin'),
  ('researcher', 'researcher@hmpi.com', '$2b$10$K7L/8rZLIZrKJ1K7L8rZLOy.8rZLIZrKJ1K7L8rZLOy.8rZLIZrK', 'admin');

-- Insert WHO regulatory standards
INSERT OR IGNORE INTO regulatory_standards (standard_name, metal_symbol, permissible_limit, unit, health_weight) VALUES 
  ('WHO', 'As', 0.01, 'mg/L', 10.0),
  ('WHO', 'Pb', 0.01, 'mg/L', 8.0),
  ('WHO', 'Cd', 0.003, 'mg/L', 9.0),
  ('WHO', 'Cr', 0.05, 'mg/L', 6.0),
  ('WHO', 'Hg', 0.006, 'mg/L', 9.5),
  ('WHO', 'Ni', 0.07, 'mg/L', 5.0),
  ('WHO', 'Cu', 2.0, 'mg/L', 3.0),
  ('WHO', 'Zn', 3.0, 'mg/L', 2.0),
  ('WHO', 'Fe', 0.3, 'mg/L', 2.5),
  ('WHO', 'Mn', 0.4, 'mg/L', 3.5);

-- Insert EPA standards
INSERT OR IGNORE INTO regulatory_standards (standard_name, metal_symbol, permissible_limit, unit, health_weight) VALUES 
  ('EPA', 'As', 0.01, 'mg/L', 10.0),
  ('EPA', 'Pb', 0.015, 'mg/L', 8.0),
  ('EPA', 'Cd', 0.005, 'mg/L', 9.0),
  ('EPA', 'Cr', 0.1, 'mg/L', 6.0),
  ('EPA', 'Hg', 0.002, 'mg/L', 9.5),
  ('EPA', 'Ni', 0.1, 'mg/L', 5.0),
  ('EPA', 'Cu', 1.3, 'mg/L', 3.0);

-- Sample water quality data (realistic Indian groundwater data)
INSERT OR IGNORE INTO water_samples (sample_id, latitude, longitude, sampling_date, location_name, depth_meters, lab_id, uploaded_by) VALUES 
  ('GW001', 28.6139, 77.2090, '2025-01-15', 'Delhi - Connaught Place', 45.5, 'LAB001', 1),
  ('GW002', 19.0760, 72.8777, '2025-01-16', 'Mumbai - Bandra', 32.0, 'LAB001', 1),
  ('GW003', 13.0827, 80.2707, '2025-01-17', 'Chennai - Anna Nagar', 28.5, 'LAB002', 1),
  ('GW004', 22.5726, 88.3639, '2025-01-18', 'Kolkata - Salt Lake', 35.2, 'LAB002', 1),
  ('GW005', 12.9716, 77.5946, '2025-01-19', 'Bangalore - Whitefield', 42.8, 'LAB003', 1),
  ('GW006', 23.0225, 72.5714, '2025-01-20', 'Ahmedabad - Satellite', 38.5, 'LAB003', 1),
  ('GW007', 26.9124, 75.7873, '2025-01-21', 'Jaipur - Civil Lines', 55.0, 'LAB004', 1),
  ('GW008', 17.3850, 78.4867, '2025-01-22', 'Hyderabad - HITEC City', 40.2, 'LAB004', 1);

-- Sample metal concentrations (mix of safe and concerning levels)
-- GW001 - Delhi (moderate pollution)
INSERT OR IGNORE INTO metal_concentrations (sample_id, metal_symbol, concentration, unit, detection_limit) VALUES 
  (1, 'As', 0.015, 'mg/L', 0.001),
  (1, 'Pb', 0.025, 'mg/L', 0.005),
  (1, 'Cd', 0.004, 'mg/L', 0.0005),
  (1, 'Cr', 0.035, 'mg/L', 0.005),
  (1, 'Hg', 0.003, 'mg/L', 0.0001),
  (1, 'Ni', 0.045, 'mg/L', 0.01);

-- GW002 - Mumbai (high pollution)
INSERT OR IGNORE INTO metal_concentrations (sample_id, metal_symbol, concentration, unit, detection_limit) VALUES 
  (2, 'As', 0.035, 'mg/L', 0.001),
  (2, 'Pb', 0.055, 'mg/L', 0.005),
  (2, 'Cd', 0.008, 'mg/L', 0.0005),
  (2, 'Cr', 0.085, 'mg/L', 0.005),
  (2, 'Hg', 0.012, 'mg/L', 0.0001),
  (2, 'Ni', 0.095, 'mg/L', 0.01);

-- GW003 - Chennai (low pollution)
INSERT OR IGNORE INTO metal_concentrations (sample_id, metal_symbol, concentration, unit, detection_limit) VALUES 
  (3, 'As', 0.005, 'mg/L', 0.001),
  (3, 'Pb', 0.008, 'mg/L', 0.005),
  (3, 'Cd', 0.001, 'mg/L', 0.0005),
  (3, 'Cr', 0.025, 'mg/L', 0.005),
  (3, 'Hg', 0.001, 'mg/L', 0.0001),
  (3, 'Ni', 0.035, 'mg/L', 0.01);

-- GW004 - Kolkata (severe pollution)
INSERT OR IGNORE INTO metal_concentrations (sample_id, metal_symbol, concentration, unit, detection_limit) VALUES 
  (4, 'As', 0.065, 'mg/L', 0.001),
  (4, 'Pb', 0.085, 'mg/L', 0.005),
  (4, 'Cd', 0.012, 'mg/L', 0.0005),
  (4, 'Cr', 0.125, 'mg/L', 0.005),
  (4, 'Hg', 0.018, 'mg/L', 0.0001),
  (4, 'Ni', 0.155, 'mg/L', 0.01);

-- GW005 - Bangalore (moderate pollution)
INSERT OR IGNORE INTO metal_concentrations (sample_id, metal_symbol, concentration, unit, detection_limit) VALUES 
  (5, 'As', 0.012, 'mg/L', 0.001),
  (5, 'Pb', 0.018, 'mg/L', 0.005),
  (5, 'Cd', 0.003, 'mg/L', 0.0005),
  (5, 'Cr', 0.042, 'mg/L', 0.005),
  (5, 'Hg', 0.004, 'mg/L', 0.0001),
  (5, 'Ni', 0.055, 'mg/L', 0.01);

-- GW006 - Ahmedabad (low pollution)
INSERT OR IGNORE INTO metal_concentrations (sample_id, metal_symbol, concentration, unit, detection_limit) VALUES 
  (6, 'As', 0.007, 'mg/L', 0.001),
  (6, 'Pb', 0.009, 'mg/L', 0.005),
  (6, 'Cd', 0.002, 'mg/L', 0.0005),
  (6, 'Cr', 0.028, 'mg/L', 0.005),
  (6, 'Hg', 0.002, 'mg/L', 0.0001),
  (6, 'Ni', 0.038, 'mg/L', 0.01);

-- GW007 - Jaipur (moderate-high pollution)
INSERT OR IGNORE INTO metal_concentrations (sample_id, metal_symbol, concentration, unit, detection_limit) VALUES 
  (7, 'As', 0.028, 'mg/L', 0.001),
  (7, 'Pb', 0.045, 'mg/L', 0.005),
  (7, 'Cd', 0.007, 'mg/L', 0.0005),
  (7, 'Cr', 0.065, 'mg/L', 0.005),
  (7, 'Hg', 0.009, 'mg/L', 0.0001),
  (7, 'Ni', 0.085, 'mg/L', 0.01);

-- GW008 - Hyderabad (low-moderate pollution)
INSERT OR IGNORE INTO metal_concentrations (sample_id, metal_symbol, concentration, unit, detection_limit) VALUES 
  (8, 'As', 0.009, 'mg/L', 0.001),
  (8, 'Pb', 0.012, 'mg/L', 0.005),
  (8, 'Cd', 0.002, 'mg/L', 0.0005),
  (8, 'Cr', 0.032, 'mg/L', 0.005),
  (8, 'Hg', 0.003, 'mg/L', 0.0001),
  (8, 'Ni', 0.048, 'mg/L', 0.01);