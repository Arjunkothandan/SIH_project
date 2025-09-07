# HMPI - Heavy Metal Pollution Index Assessment System

## Project Overview
- **Name**: Heavy Metal Pollution Index Assessment System
- **Goal**: Automated groundwater heavy metal contamination analysis using validated scientific indices
- **Tech Stack**: Hono + TypeScript + TailwindCSS + Cloudflare Pages + D1 Database

## Live Application
- **Production**: https://3000-ie32aq5ysqgo0i0173v9t-6532622b.e2b.dev
- **GitHub**: (Will be set up during deployment phase)

## Features Implemented ✅

### 🎨 User Interface
- **Animated Homepage**: Beautiful black background with blue gradient fonts
- **Responsive Design**: Works on desktop, tablet, and mobile devices  
- **Interactive Navigation**: Smooth scrolling between sections
- **Modern Animations**: Floating elements, pulse effects, gradient animations

### 🔐 Admin System
- **User Authentication**: Sign up and login functionality
- **Admin Dashboard**: User management and system statistics
- **Role-based Access**: Super admin and admin roles
- **Session Management**: Secure authentication with password protection

### 📊 Data Analysis & Visualization
- **Interactive Charts**: HPI values, metal concentrations, pollution categories
- **Real-time Statistics**: Sample counts, risk assessments, site status
- **Data Tables**: Sortable and filterable sample data display
- **Export Features**: CSV download capabilities

### 🗺️ GIS Integration
- **Interactive Map**: Leaflet-powered mapping with OpenStreetMap tiles
- **Sample Locations**: Color-coded markers based on risk levels
- **Popup Information**: Detailed site information on marker click
- **India-focused**: Centered on Indian subcontinent with major cities

### ⚗️ HMPI Calculation Engine
- **Multiple Indices**: HPI (Heavy Metal Pollution Index), HEI (Heavy Metal Evaluation Index), MI (Metal Index)
- **Regulatory Standards**: WHO and EPA compliance checks
- **Metal Analysis**: As, Pb, Cd, Cr, Hg, Ni, Cu, Zn, Fe, Mn
- **Non-detect Handling**: Smart handling of below-detection-limit values
- **Batch Processing**: Multiple sample analysis capabilities

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Data Management  
- `GET /api/samples` - Retrieve water quality samples
- `GET /api/statistics` - Get system statistics
- `GET /api/admin/users` - List registered users (admin only)
- `GET /api/admin/stats` - Admin dashboard statistics

### HMPI Calculations
- `POST /api/calculate/hmpi` - Calculate indices for single sample
- `POST /api/calculate/batch` - Batch calculation for multiple samples
- `GET /api/standards/WHO` - Get WHO regulatory standards
- `GET /api/standards/EPA` - Get EPA regulatory standards

### Data Processing
- `POST /api/upload/csv` - Upload and process CSV files
- `POST /api/export/csv` - Export results as CSV

## Sample Data Included

The system includes realistic sample data from 8 major Indian cities:
- **Delhi** (Connaught Place) - Moderate pollution
- **Mumbai** (Bandra) - High pollution  
- **Chennai** (Anna Nagar) - Low pollution
- **Kolkata** (Salt Lake) - Severe pollution
- **Bangalore** (Whitefield) - Moderate pollution
- **Ahmedabad** (Satellite) - Low pollution
- **Jaipur** (Civil Lines) - Moderate-high pollution
- **Hyderabad** (HITEC City) - Low-moderate pollution

## Data Models & Storage

### Database Schema (Cloudflare D1)
- **admin_users**: User authentication and role management
- **water_samples**: Groundwater sampling locations and metadata
- **metal_concentrations**: Heavy metal concentration data by sample
- **pollution_indices**: Calculated HPI, HEI, MI values
- **regulatory_standards**: Configurable WHO/EPA/IS standards
- **upload_sessions**: CSV upload tracking and error logging

### CSV Input Format
```csv
sample_id,date,latitude,longitude,As,Pb,Cd,Cr,Hg,Ni,unit,LOD_As,LOD_Pb
GW001,2025-01-15,28.6139,77.2090,0.012,0.05,0.002,mg/L,0.001,0.005
GW002,2025-01-16,19.0760,72.8777,ND,0.08,ND,mg/L,0.001,0.005
```

## User Guide

### For Researchers & Scientists
1. **Upload Data**: Use CSV upload to import groundwater sampling data
2. **View Results**: Automatically calculated HMPI, HEI, MI indices  
3. **Analyze Maps**: Identify contamination hotspots using GIS visualization
4. **Export Reports**: Download results as CSV for further analysis
5. **Compare Standards**: Switch between WHO and EPA regulatory limits

### For Policy Makers
1. **Dashboard Overview**: Quick statistics on pollution levels across regions
2. **Risk Assessment**: Color-coded risk categories (Safe/Moderate/Poor/Hazardous)
3. **Spatial Analysis**: Geographic distribution of contamination
4. **Regulatory Compliance**: Automatic flagging of exceeded limits

## Technical Details

### HMPI Calculation Formulas
- **HPI**: `Σ(Wi × Qi) / Σ(Wi)` where Wi = health weight, Qi = sub-index
- **HEI**: `Σ(Ci / Li)` where Ci = concentration, Li = permissible limit  
- **MI**: `HEI / n` where n = number of metals analyzed

### Risk Categories
- **Safe**: HPI < 15, HEI < 10
- **Moderate**: HPI 15-30, HEI 10-20
- **Poor**: HPI 30-70, HEI 20-40  
- **Hazardous**: HPI > 70, HEI > 40

## Development & Deployment

### Local Development
```bash
npm install
npm run build
npm run dev:sandbox
```

### Production Deployment
```bash
npm run deploy:prod
```

### Database Management
```bash
npm run db:migrate:local  # Apply migrations locally
npm run db:seed          # Load sample data
npm run db:reset         # Reset local database
```

## Status & Next Steps

### ✅ Completed Features
- Animated UI with black/blue theme
- Admin authentication system
- HMPI calculation engine (HPI, HEI, MI)
- GIS mapping with Leaflet
- Interactive data visualizations
- Sample data from Indian cities
- CSV processing capabilities
- Database schema and migrations

### 🚧 In Progress
- CSV upload functionality (API complete, UI integration needed)
- Cloudflare D1 database deployment
- Production deployment to Cloudflare Pages

### 📋 Recommended Next Steps
1. **CSV Upload UI**: Add drag-and-drop file upload interface
2. **Real-time Calculations**: Live HMPI calculation as data is entered
3. **Advanced Mapping**: Heatmap overlays and interpolation
4. **Report Generation**: PDF report generation with charts
5. **Data Validation**: Enhanced error checking and data quality flags
6. **Mobile App**: React Native mobile application
7. **API Integration**: Connect to external laboratory data sources

## Security Features
- Password-protected admin access  
- Role-based permissions (admin/super_admin)
- Input validation and sanitization
- Secure session management
- SQL injection prevention

## Performance Optimizations
- Lightweight Hono framework (~50KB)
- CDN-based frontend libraries
- Cloudflare edge deployment
- Efficient D1 database queries
- Compressed static assets

---

**Last Updated**: September 7, 2025  
**Version**: 1.0.0  
**License**: MIT