-- HMPI App Database Schema
-- Heavy Metal Pollution Index Assessment System

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK(role IN ('admin', 'super_admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active INTEGER DEFAULT 1
);

-- Water quality sampling data
CREATE TABLE IF NOT EXISTS water_samples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sample_id TEXT UNIQUE NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  sampling_date DATE NOT NULL,
  location_name TEXT,
  depth_meters REAL,
  lab_id TEXT,
  notes TEXT,
  uploaded_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES admin_users(id)
);

-- Heavy metal concentrations
CREATE TABLE IF NOT EXISTS metal_concentrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sample_id INTEGER NOT NULL,
  metal_symbol TEXT NOT NULL CHECK(metal_symbol IN ('As', 'Pb', 'Cd', 'Cr', 'Hg', 'Ni', 'Cu', 'Zn', 'Fe', 'Mn')),
  concentration REAL,
  unit TEXT DEFAULT 'mg/L' CHECK(unit IN ('mg/L', 'ug/L', 'ppb', 'ppm')),
  detection_limit REAL,
  is_non_detect INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sample_id) REFERENCES water_samples(id)
);

-- Calculated pollution indices
CREATE TABLE IF NOT EXISTS pollution_indices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sample_id INTEGER NOT NULL,
  hpi_value REAL,
  hei_value REAL,
  mi_value REAL,
  overall_category TEXT CHECK(overall_category IN ('Safe', 'Moderate', 'Poor', 'Hazardous')),
  calculation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  calculation_parameters TEXT, -- JSON string with parameters used
  FOREIGN KEY (sample_id) REFERENCES water_samples(id)
);

-- Regulatory standards (configurable limits)
CREATE TABLE IF NOT EXISTS regulatory_standards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  standard_name TEXT NOT NULL, -- WHO, EPA, IS_10500, Custom
  metal_symbol TEXT NOT NULL,
  permissible_limit REAL NOT NULL,
  unit TEXT DEFAULT 'mg/L',
  health_weight REAL DEFAULT 1.0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Data upload sessions
CREATE TABLE IF NOT EXISTS upload_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  uploaded_by INTEGER NOT NULL,
  total_samples INTEGER,
  processed_samples INTEGER,
  failed_samples INTEGER,
  status TEXT DEFAULT 'processing' CHECK(status IN ('processing', 'completed', 'failed')),
  error_log TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES admin_users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_water_samples_location ON water_samples(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_water_samples_date ON water_samples(sampling_date);
CREATE INDEX IF NOT EXISTS idx_metal_concentrations_sample ON metal_concentrations(sample_id);
CREATE INDEX IF NOT EXISTS idx_metal_concentrations_metal ON metal_concentrations(metal_symbol);
CREATE INDEX IF NOT EXISTS idx_pollution_indices_sample ON pollution_indices(sample_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_user ON upload_sessions(uploaded_by);