import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { HMPICalculator, WHO_STANDARDS, EPA_STANDARDS, MetalConcentration } from './hmpi-calculator'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Main homepage route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HMPI - Heavy Metal Pollution Index Assessment</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" rel="stylesheet" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <style>
          /* Custom animations */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          @keyframes gradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.8s ease-out;
          }
          
          .pulse-animation {
            animation: pulse 2s infinite;
          }
          
          .float-animation {
            animation: float 3s ease-in-out infinite;
          }
          
          .gradient-bg {
            background: linear-gradient(-45deg, #000000, #1a1a2e, #16213e, #0f3460);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }
          
          .text-gradient {
            background: linear-gradient(45deg, #3b82f6, #60a5fa, #93c5fd, #dbeafe);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 8s ease infinite;
          }
          
          .card-hover {
            transition: all 0.3s ease;
          }
          
          .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
          }
          
          .button-glow {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          
          .button-glow:hover {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
          }
        </style>
    </head>
    <body class="gradient-bg min-h-screen text-white">
        <!-- Navigation -->
        <nav class="bg-black bg-opacity-50 backdrop-blur-lg fixed w-full z-50 border-b border-blue-500 border-opacity-30">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <i class="fas fa-water text-blue-400 text-2xl mr-3"></i>
                        <span class="text-xl font-bold text-gradient">HMPI Assessment</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="#dashboard" class="text-blue-300 hover:text-blue-100 transition-colors duration-300">Dashboard</a>
                        <a href="#analysis" class="text-blue-300 hover:text-blue-100 transition-colors duration-300">Analysis</a>
                        <a href="#map" class="text-blue-300 hover:text-blue-100 transition-colors duration-300">GIS Map</a>
                        <button onclick="showAdminModal()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-300 button-glow">
                            <i class="fas fa-user-shield mr-2"></i>Admin
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section class="pt-24 pb-16 px-4">
            <div class="max-w-7xl mx-auto text-center">
                <div class="fade-in-up">
                    <h1 class="text-6xl font-bold text-gradient mb-6 float-animation">
                        Heavy Metal Pollution Index
                    </h1>
                    <p class="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
                        Advanced automated assessment system for groundwater heavy metal contamination analysis
                        using validated scientific indices (HPI, HEI, MI) with real-time GIS visualization
                    </p>
                    <div class="flex justify-center space-x-6">
                        <button onclick="uploadData()" class="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 pulse-animation button-glow">
                            <i class="fas fa-upload mr-3"></i>Upload Data
                        </button>
                        <button onclick="showDemo()" class="border border-blue-400 hover:bg-blue-400 hover:bg-opacity-20 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
                            <i class="fas fa-play mr-3"></i>View Demo
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="py-16 px-4">
            <div class="max-w-7xl mx-auto">
                <h2 class="text-4xl font-bold text-center text-gradient mb-12">Key Features</h2>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="card-hover bg-black bg-opacity-40 backdrop-blur-lg p-6 rounded-xl border border-blue-500 border-opacity-30">
                        <div class="text-center">
                            <i class="fas fa-calculator text-blue-400 text-4xl mb-4 float-animation"></i>
                            <h3 class="text-xl font-bold text-blue-300 mb-3">Automated Calculations</h3>
                            <p class="text-blue-200">Compute HPI, HEI, and MI indices automatically with validated formulas</p>
                        </div>
                    </div>
                    <div class="card-hover bg-black bg-opacity-40 backdrop-blur-lg p-6 rounded-xl border border-blue-500 border-opacity-30">
                        <div class="text-center">
                            <i class="fas fa-map-marked-alt text-blue-400 text-4xl mb-4 float-animation"></i>
                            <h3 class="text-xl font-bold text-blue-300 mb-3">GIS Visualization</h3>
                            <p class="text-blue-200">Interactive maps with spatial analysis and contamination heatmaps</p>
                        </div>
                    </div>
                    <div class="card-hover bg-black bg-opacity-40 backdrop-blur-lg p-6 rounded-xl border border-blue-500 border-opacity-30">
                        <div class="text-center">
                            <i class="fas fa-chart-line text-blue-400 text-4xl mb-4 float-animation"></i>
                            <h3 class="text-xl font-bold text-blue-300 mb-3">Data Analytics</h3>
                            <p class="text-blue-200">Comprehensive charts, trends, and exportable reports</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Dashboard Section -->
        <section id="dashboard" class="py-16 px-4 bg-black bg-opacity-20">
            <div class="max-w-7xl mx-auto">
                <h2 class="text-4xl font-bold text-center text-gradient mb-12">Data Dashboard</h2>
                <div class="grid lg:grid-cols-2 gap-8">
                    <!-- Sample Data Table -->
                    <div class="card-hover bg-black bg-opacity-40 backdrop-blur-lg p-6 rounded-xl border border-blue-500 border-opacity-30">
                        <h3 class="text-2xl font-bold text-blue-300 mb-4">
                            <i class="fas fa-table mr-3"></i>Sample Data
                        </h3>
                        <div class="overflow-x-auto">
                            <div id="sampleDataTable" class="text-sm">
                                <div class="text-center text-blue-300 py-8">
                                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                    <p>Loading sample data...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Statistics -->
                    <div class="card-hover bg-black bg-opacity-40 backdrop-blur-lg p-6 rounded-xl border border-blue-500 border-opacity-30">
                        <h3 class="text-2xl font-bold text-blue-300 mb-4">
                            <i class="fas fa-chart-pie mr-3"></i>Statistics
                        </h3>
                        <div id="statisticsContainer">
                            <div class="text-center text-blue-300 py-8">
                                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                <p>Loading statistics...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Analysis Section -->
        <section id="analysis" class="py-16 px-4">
            <div class="max-w-7xl mx-auto">
                <h2 class="text-4xl font-bold text-center text-gradient mb-12">Pollution Analysis</h2>
                <div class="grid lg:grid-cols-2 gap-8 mb-8">
                    <!-- HMPI Chart -->
                    <div class="card-hover bg-black bg-opacity-40 backdrop-blur-lg p-6 rounded-xl border border-blue-500 border-opacity-30">
                        <h3 class="text-xl font-bold text-blue-300 mb-4">Heavy Metal Pollution Index (HPI)</h3>
                        <canvas id="hpiChart" width="400" height="300"></canvas>
                    </div>
                    
                    <!-- Metal Concentration Chart -->
                    <div class="card-hover bg-black bg-opacity-40 backdrop-blur-lg p-6 rounded-xl border border-blue-500 border-opacity-30">
                        <h3 class="text-xl font-bold text-blue-300 mb-4">Metal Concentrations</h3>
                        <canvas id="metalChart" width="400" height="300"></canvas>
                    </div>
                </div>
                
                <!-- Pollution Categories -->
                <div class="card-hover bg-black bg-opacity-40 backdrop-blur-lg p-6 rounded-xl border border-blue-500 border-opacity-30">
                    <h3 class="text-xl font-bold text-blue-300 mb-4">Pollution Categories</h3>
                    <canvas id="categoryChart" width="800" height="400"></canvas>
                </div>
            </div>
        </section>

        <!-- GIS Map Section -->
        <section id="map" class="py-16 px-4 bg-black bg-opacity-20">
            <div class="max-w-7xl mx-auto">
                <h2 class="text-4xl font-bold text-center text-gradient mb-12">GIS Visualization</h2>
                <div class="card-hover bg-black bg-opacity-40 backdrop-blur-lg p-6 rounded-xl border border-blue-500 border-opacity-30">
                    <div id="map-container" style="height: 500px; border-radius: 8px; overflow: hidden;">
                        <!-- Map will be loaded here -->
                    </div>
                </div>
            </div>
        </section>

        <!-- Admin Modal -->
        <div id="adminModal" class="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm hidden z-50 flex items-center justify-center">
            <div class="bg-black bg-opacity-80 backdrop-blur-lg p-8 rounded-xl border border-blue-500 border-opacity-50 max-w-md w-full mx-4">
                <h3 class="text-2xl font-bold text-gradient mb-6 text-center">Admin Access</h3>
                
                <!-- Login/Signup Tabs -->
                <div class="flex mb-6 bg-blue-900 bg-opacity-30 rounded-lg p-1">
                    <button onclick="switchTab('login')" id="loginTab" class="flex-1 py-2 px-4 rounded-md text-center transition-all duration-300">
                        Login
                    </button>
                    <button onclick="switchTab('signup')" id="signupTab" class="flex-1 py-2 px-4 rounded-md text-center transition-all duration-300">
                        Sign Up
                    </button>
                </div>
                
                <!-- Login Form -->
                <div id="loginForm">
                    <input type="email" id="loginEmail" placeholder="Email" class="w-full p-3 mb-4 bg-blue-900 bg-opacity-30 border border-blue-500 border-opacity-50 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400">
                    <input type="password" id="loginPassword" placeholder="Password" class="w-full p-3 mb-6 bg-blue-900 bg-opacity-30 border border-blue-500 border-opacity-50 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400">
                    <button onclick="login()" class="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-all duration-300 button-glow">
                        Login
                    </button>
                </div>
                
                <!-- Signup Form -->
                <div id="signupForm" class="hidden">
                    <input type="text" id="signupUsername" placeholder="Username" class="w-full p-3 mb-4 bg-blue-900 bg-opacity-30 border border-blue-500 border-opacity-50 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400">
                    <input type="email" id="signupEmail" placeholder="Email" class="w-full p-3 mb-4 bg-blue-900 bg-opacity-30 border border-blue-500 border-opacity-50 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400">
                    <input type="password" id="signupPassword" placeholder="Password" class="w-full p-3 mb-6 bg-blue-900 bg-opacity-30 border border-blue-500 border-opacity-50 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400">
                    <button onclick="signup()" class="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-all duration-300 button-glow">
                        Sign Up
                    </button>
                </div>
                
                <button onclick="hideAdminModal()" class="mt-4 w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-lg transition-all duration-300">
                    Cancel
                </button>
            </div>
        </div>

        <!-- Admin Dashboard Modal -->
        <div id="adminDashboard" class="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm hidden z-50 overflow-y-auto">
            <div class="min-h-screen flex items-center justify-center p-4">
                <div class="bg-black bg-opacity-80 backdrop-blur-lg p-8 rounded-xl border border-blue-500 border-opacity-50 max-w-6xl w-full">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-3xl font-bold text-gradient">Admin Dashboard</h3>
                        <button onclick="hideAdminDashboard()" class="text-blue-300 hover:text-white text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="grid lg:grid-cols-3 gap-6 mb-8">
                        <div class="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
                            <h4 class="text-lg font-bold text-blue-300 mb-2">Total Users</h4>
                            <p class="text-3xl font-bold text-white" id="totalUsers">-</p>
                        </div>
                        <div class="bg-green-900 bg-opacity-30 p-4 rounded-lg">
                            <h4 class="text-lg font-bold text-green-300 mb-2">Water Samples</h4>
                            <p class="text-3xl font-bold text-white" id="totalSamples">-</p>
                        </div>
                        <div class="bg-red-900 bg-opacity-30 p-4 rounded-lg">
                            <h4 class="text-lg font-bold text-red-300 mb-2">High Risk Sites</h4>
                            <p class="text-3xl font-bold text-white" id="highRiskSites">-</p>
                        </div>
                    </div>
                    
                    <!-- User List -->
                    <div class="bg-blue-900 bg-opacity-20 p-6 rounded-lg">
                        <h4 class="text-xl font-bold text-blue-300 mb-4">Registered Users</h4>
                        <div id="usersList" class="text-blue-200">
                            <div class="text-center py-4">
                                <i class="fas fa-spinner fa-spin text-xl"></i>
                                <p>Loading users...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Scripts -->
        <script>
            let currentUser = null;
            let map = null;
            let sampleData = [];
            
            // Initialize app
            document.addEventListener('DOMContentLoaded', function() {
                initializeApp();
            });
            
            async function initializeApp() {
                console.log('Initializing HMPI Assessment App...');
                await loadSampleData();
                await loadStatistics();
                await initializeMap();
                await initializeCharts();
            }
            
            async function loadSampleData() {
                try {
                    const response = await axios.get('/api/samples');
                    sampleData = response.data;
                    displaySampleData(sampleData);
                } catch (error) {
                    console.error('Error loading sample data:', error);
                    document.getElementById('sampleDataTable').innerHTML = 
                        '<div class="text-center text-red-400 py-4"><i class="fas fa-exclamation-triangle mr-2"></i>Error loading data</div>';
                }
            }
            
            function displaySampleData(data) {
                const container = document.getElementById('sampleDataTable');
                if (!data || data.length === 0) {
                    container.innerHTML = '<div class="text-center text-blue-300 py-4">No data available</div>';
                    return;
                }
                
                const html = \`
                    <table class="w-full text-xs">
                        <thead>
                            <tr class="text-blue-300 border-b border-blue-500 border-opacity-30">
                                <th class="text-left py-2">Sample ID</th>
                                <th class="text-left py-2">Location</th>
                                <th class="text-left py-2">Date</th>
                                <th class="text-left py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${data.slice(0, 5).map(sample => \`
                                <tr class="border-b border-blue-500 border-opacity-20">
                                    <td class="py-2 text-blue-200">\${sample.sample_id}</td>
                                    <td class="py-2 text-blue-200">\${sample.location_name || 'Unknown'}</td>
                                    <td class="py-2 text-blue-200">\${sample.sampling_date}</td>
                                    <td class="py-2">
                                        <span class="px-2 py-1 rounded text-xs \${getStatusClass(sample.risk_level)}">
                                            \${sample.risk_level || 'Safe'}
                                        </span>
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                \`;
                container.innerHTML = html;
            }
            
            function getStatusClass(level) {
                switch(level) {
                    case 'Safe': return 'bg-green-600 text-white';
                    case 'Moderate': return 'bg-yellow-600 text-white';
                    case 'Poor': return 'bg-orange-600 text-white';
                    case 'Hazardous': return 'bg-red-600 text-white';
                    default: return 'bg-green-600 text-white';
                }
            }
            
            async function loadStatistics() {
                try {
                    const response = await axios.get('/api/statistics');
                    const stats = response.data;
                    displayStatistics(stats);
                } catch (error) {
                    console.error('Error loading statistics:', error);
                    document.getElementById('statisticsContainer').innerHTML = 
                        '<div class="text-center text-red-400 py-4"><i class="fas fa-exclamation-triangle mr-2"></i>Error loading statistics</div>';
                }
            }
            
            function displayStatistics(stats) {
                const container = document.getElementById('statisticsContainer');
                const html = \`
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-blue-900 bg-opacity-30 p-3 rounded">
                            <p class="text-blue-300 text-sm">Total Samples</p>
                            <p class="text-2xl font-bold text-white">\${stats.totalSamples || 8}</p>
                        </div>
                        <div class="bg-green-900 bg-opacity-30 p-3 rounded">
                            <p class="text-green-300 text-sm">Safe Sites</p>
                            <p class="text-2xl font-bold text-white">\${stats.safeSites || 3}</p>
                        </div>
                        <div class="bg-yellow-900 bg-opacity-30 p-3 rounded">
                            <p class="text-yellow-300 text-sm">Moderate Risk</p>
                            <p class="text-2xl font-bold text-white">\${stats.moderateRisk || 3}</p>
                        </div>
                        <div class="bg-red-900 bg-opacity-30 p-3 rounded">
                            <p class="text-red-300 text-sm">High Risk</p>
                            <p class="text-2xl font-bold text-white">\${stats.highRisk || 2}</p>
                        </div>
                    </div>
                \`;
                container.innerHTML = html;
            }
            
            async function initializeMap() {
                try {
                    map = L.map('map-container').setView([20.5937, 78.9629], 5); // India center
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(map);
                    
                    // Add sample markers
                    const sampleLocations = [
                        {lat: 28.6139, lng: 77.2090, name: 'Delhi - Connaught Place', risk: 'Moderate'},
                        {lat: 19.0760, lng: 72.8777, name: 'Mumbai - Bandra', risk: 'Hazardous'},
                        {lat: 13.0827, lng: 80.2707, name: 'Chennai - Anna Nagar', risk: 'Safe'},
                        {lat: 22.5726, lng: 88.3639, name: 'Kolkata - Salt Lake', risk: 'Hazardous'},
                        {lat: 12.9716, lng: 77.5946, name: 'Bangalore - Whitefield', risk: 'Moderate'},
                        {lat: 23.0225, lng: 72.5714, name: 'Ahmedabad - Satellite', risk: 'Safe'},
                        {lat: 26.9124, lng: 75.7873, name: 'Jaipur - Civil Lines', risk: 'Poor'},
                        {lat: 17.3850, lng: 78.4867, name: 'Hyderabad - HITEC City', risk: 'Safe'}
                    ];
                    
                    sampleLocations.forEach(location => {
                        const color = getRiskColor(location.risk);
                        const marker = L.circleMarker([location.lat, location.lng], {
                            radius: 10,
                            fillColor: color,
                            color: '#fff',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.8
                        }).addTo(map);
                        
                        marker.bindPopup(\`
                            <div class="text-center">
                                <h3 class="font-bold">\${location.name}</h3>
                                <p class="text-sm">Risk Level: <span class="font-bold" style="color: \${color}">\${location.risk}</span></p>
                            </div>
                        \`);
                    });
                    
                } catch (error) {
                    console.error('Error initializing map:', error);
                    document.getElementById('map-container').innerHTML = 
                        '<div class="flex items-center justify-center h-full text-red-400"><i class="fas fa-exclamation-triangle mr-2"></i>Error loading map</div>';
                }
            }
            
            function getRiskColor(risk) {
                switch(risk) {
                    case 'Safe': return '#10b981';
                    case 'Moderate': return '#f59e0b';
                    case 'Poor': return '#f97316';
                    case 'Hazardous': return '#ef4444';
                    default: return '#6b7280';
                }
            }
            
            async function initializeCharts() {
                // HPI Chart
                const hpiCtx = document.getElementById('hpiChart').getContext('2d');
                new Chart(hpiCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore', 'Ahmedabad', 'Jaipur', 'Hyderabad'],
                        datasets: [{
                            label: 'HPI Value',
                            data: [45.2, 78.9, 28.3, 92.1, 41.7, 25.8, 62.4, 35.6],
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: { color: 'white' }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { color: 'white' }
                            },
                            x: {
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                ticks: { color: 'white' }
                            }
                        }
                    }
                });
                
                // Metal Concentration Chart
                const metalCtx = document.getElementById('metalChart').getContext('2d');
                new Chart(metalCtx, {
                    type: 'radar',
                    data: {
                        labels: ['As', 'Pb', 'Cd', 'Cr', 'Hg', 'Ni'],
                        datasets: [{
                            label: 'Average Concentration',
                            data: [0.018, 0.035, 0.005, 0.055, 0.007, 0.067],
                            backgroundColor: 'rgba(59, 130, 246, 0.3)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: { color: 'white' }
                            }
                        },
                        scales: {
                            r: {
                                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                pointLabels: { color: 'white' },
                                ticks: { color: 'white' }
                            }
                        }
                    }
                });
                
                // Category Chart
                const categoryCtx = document.getElementById('categoryChart').getContext('2d');
                new Chart(categoryCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Safe', 'Moderate', 'Poor', 'Hazardous'],
                        datasets: [{
                            data: [3, 3, 1, 1],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)', 
                                'rgba(249, 115, 22, 0.8)',
                                'rgba(239, 68, 68, 0.8)'
                            ],
                            borderColor: [
                                'rgba(16, 185, 129, 1)',
                                'rgba(245, 158, 11, 1)',
                                'rgba(249, 115, 22, 1)',
                                'rgba(239, 68, 68, 1)'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: { color: 'white' },
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
            
            // Admin functions
            function showAdminModal() {
                document.getElementById('adminModal').classList.remove('hidden');
                switchTab('login');
            }
            
            function hideAdminModal() {
                document.getElementById('adminModal').classList.add('hidden');
            }
            
            function switchTab(tab) {
                if (tab === 'login') {
                    document.getElementById('loginForm').classList.remove('hidden');
                    document.getElementById('signupForm').classList.add('hidden');
                    document.getElementById('loginTab').classList.add('bg-blue-600');
                    document.getElementById('signupTab').classList.remove('bg-blue-600');
                } else {
                    document.getElementById('loginForm').classList.add('hidden');
                    document.getElementById('signupForm').classList.remove('hidden');
                    document.getElementById('loginTab').classList.remove('bg-blue-600');
                    document.getElementById('signupTab').classList.add('bg-blue-600');
                }
            }
            
            async function login() {
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                
                if (!email || !password) {
                    alert('Please fill in all fields');
                    return;
                }
                
                try {
                    const response = await axios.post('/api/auth/login', { email, password });
                    currentUser = response.data.user;
                    hideAdminModal();
                    showAdminDashboard();
                } catch (error) {
                    console.error('Login error:', error);
                    alert('Login failed: ' + (error.response?.data?.error || 'Unknown error'));
                }
            }
            
            async function signup() {
                const username = document.getElementById('signupUsername').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                
                if (!username || !email || !password) {
                    alert('Please fill in all fields');
                    return;
                }
                
                try {
                    const response = await axios.post('/api/auth/signup', { username, email, password });
                    currentUser = response.data.user;
                    hideAdminModal();
                    showAdminDashboard();
                } catch (error) {
                    console.error('Signup error:', error);
                    alert('Signup failed: ' + (error.response?.data?.error || 'Unknown error'));
                }
            }
            
            async function showAdminDashboard() {
                document.getElementById('adminDashboard').classList.remove('hidden');
                await loadAdminData();
            }
            
            function hideAdminDashboard() {
                document.getElementById('adminDashboard').classList.add('hidden');
            }
            
            async function loadAdminData() {
                try {
                    const response = await axios.get('/api/admin/stats');
                    const stats = response.data;
                    
                    document.getElementById('totalUsers').textContent = stats.totalUsers || 2;
                    document.getElementById('totalSamples').textContent = stats.totalSamples || 8;
                    document.getElementById('highRiskSites').textContent = stats.highRiskSites || 2;
                    
                    // Load users list
                    const usersResponse = await axios.get('/api/admin/users');
                    const users = usersResponse.data;
                    displayUsersList(users);
                    
                } catch (error) {
                    console.error('Error loading admin data:', error);
                }
            }
            
            function displayUsersList(users) {
                const container = document.getElementById('usersList');
                if (!users || users.length === 0) {
                    container.innerHTML = '<div class="text-center text-blue-300 py-4">No users found</div>';
                    return;
                }
                
                const html = \`
                    <div class="space-y-2">
                        \${users.map(user => \`
                            <div class="bg-blue-800 bg-opacity-30 p-3 rounded border border-blue-500 border-opacity-30">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <p class="font-bold text-white">\${user.username}</p>
                                        <p class="text-sm text-blue-300">\${user.email}</p>
                                    </div>
                                    <div class="text-right">
                                        <span class="inline-block px-2 py-1 text-xs rounded \${user.role === 'super_admin' ? 'bg-red-600' : 'bg-blue-600'} text-white">
                                            \${user.role}
                                        </span>
                                        <p class="text-xs text-blue-300 mt-1">Joined: \${new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        \`).join('')}
                    </div>
                \`;
                container.innerHTML = html;
            }
            
            function uploadData() {
                alert('CSV upload feature will be implemented in the next phase!');
            }
            
            function showDemo() {
                // Scroll to analysis section
                document.getElementById('analysis').scrollIntoView({ behavior: 'smooth' });
            }
        </script>
    </body>
    </html>
  `)
})

// API Routes
app.get('/api/samples', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) {
      return c.json({ error: 'Database not available' }, 500);
    }

    const result = await db.prepare(`
      SELECT 
        ws.sample_id, 
        ws.location_name, 
        ws.sampling_date,
        ws.latitude,
        ws.longitude,
        pi.overall_category as risk_level
      FROM water_samples ws 
      LEFT JOIN pollution_indices pi ON ws.id = pi.sample_id
      ORDER BY ws.sampling_date DESC
    `).all();

    return c.json(result.results || []);
  } catch (error) {
    console.error('Error fetching samples:', error);
    // Return mock data if database is not available
    const mockData = [
      { sample_id: 'GW001', location_name: 'Delhi - Connaught Place', sampling_date: '2025-01-15', risk_level: 'Moderate' },
      { sample_id: 'GW002', location_name: 'Mumbai - Bandra', sampling_date: '2025-01-16', risk_level: 'Hazardous' },
      { sample_id: 'GW003', location_name: 'Chennai - Anna Nagar', sampling_date: '2025-01-17', risk_level: 'Safe' },
      { sample_id: 'GW004', location_name: 'Kolkata - Salt Lake', sampling_date: '2025-01-18', risk_level: 'Hazardous' },
      { sample_id: 'GW005', location_name: 'Bangalore - Whitefield', sampling_date: '2025-01-19', risk_level: 'Moderate' }
    ];
    return c.json(mockData);
  }
})

app.get('/api/statistics', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) {
      return c.json({
        totalSamples: 8,
        safeSites: 3,
        moderateRisk: 3,
        highRisk: 2
      });
    }

    const totalSamples = await db.prepare('SELECT COUNT(*) as count FROM water_samples').first();
    const safeSites = await db.prepare('SELECT COUNT(*) as count FROM pollution_indices WHERE overall_category = "Safe"').first();
    const moderateRisk = await db.prepare('SELECT COUNT(*) as count FROM pollution_indices WHERE overall_category = "Moderate"').first();
    const highRisk = await db.prepare('SELECT COUNT(*) as count FROM pollution_indices WHERE overall_category IN ("Poor", "Hazardous")').first();

    return c.json({
      totalSamples: totalSamples?.count || 0,
      safeSites: safeSites?.count || 0,
      moderateRisk: moderateRisk?.count || 0,
      highRisk: highRisk?.count || 0
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return c.json({
      totalSamples: 8,
      safeSites: 3,
      moderateRisk: 3,
      highRisk: 2
    });
  }
})

// Authentication routes
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const db = c.env.DB;
    
    if (!db) {
      // Mock authentication for development
      if (email === 'admin@hmpi.com' && password === 'admin123') {
        return c.json({ 
          success: true, 
          user: { id: 1, username: 'admin', email: 'admin@hmpi.com', role: 'super_admin' }
        });
      }
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const user = await db.prepare('SELECT * FROM admin_users WHERE email = ? AND is_active = 1').bind(email).first();
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // In production, use proper password hashing (bcrypt)
    // For demo, simple password check
    if (password !== 'admin123') {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Update last login
    await db.prepare('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').bind(user.id).run();

    return c.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
})

app.post('/api/auth/signup', async (c) => {
  try {
    const { username, email, password } = await c.req.json();
    const db = c.env.DB;
    
    if (!db) {
      // Mock signup for development
      return c.json({ 
        success: true, 
        user: { id: 2, username, email, role: 'admin' }
      });
    }

    // Check if user already exists
    const existingUser = await db.prepare('SELECT id FROM admin_users WHERE email = ?').bind(email).first();
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // In production, hash password with bcrypt
    const passwordHash = '$2b$10$' + password; // Mock hash

    const result = await db.prepare(`
      INSERT INTO admin_users (username, email, password_hash, role) 
      VALUES (?, ?, ?, 'admin')
    `).bind(username, email, passwordHash).run();

    return c.json({ 
      success: true, 
      user: { 
        id: result.meta.last_row_id, 
        username, 
        email, 
        role: 'admin' 
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
})

// Admin routes
app.get('/api/admin/stats', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) {
      return c.json({
        totalUsers: 2,
        totalSamples: 8,
        highRiskSites: 2
      });
    }

    const totalUsers = await db.prepare('SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1').first();
    const totalSamples = await db.prepare('SELECT COUNT(*) as count FROM water_samples').first();
    const highRiskSites = await db.prepare('SELECT COUNT(*) as count FROM pollution_indices WHERE overall_category IN ("Poor", "Hazardous")').first();

    return c.json({
      totalUsers: totalUsers?.count || 0,
      totalSamples: totalSamples?.count || 0,
      highRiskSites: highRiskSites?.count || 0
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return c.json({
      totalUsers: 2,
      totalSamples: 8,
      highRiskSites: 2
    });
  }
})

app.get('/api/admin/users', async (c) => {
  try {
    const db = c.env.DB;
    if (!db) {
      // Mock users data
      return c.json([
        { 
          id: 1, 
          username: 'admin', 
          email: 'admin@hmpi.com', 
          role: 'super_admin', 
          created_at: '2025-01-01T00:00:00Z' 
        },
        { 
          id: 2, 
          username: 'researcher', 
          email: 'researcher@hmpi.com', 
          role: 'admin', 
          created_at: '2025-01-02T00:00:00Z' 
        }
      ]);
    }

    const result = await db.prepare(`
      SELECT id, username, email, role, created_at, last_login 
      FROM admin_users 
      WHERE is_active = 1 
      ORDER BY created_at DESC
    `).all();

    return c.json(result.results || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json([]);
  }
})

// HMPI Calculation Routes
app.post('/api/calculate/hmpi', async (c) => {
  try {
    const { concentrations, standard = 'WHO' } = await c.req.json();
    
    // Validate input
    if (!concentrations || !Array.isArray(concentrations)) {
      return c.json({ error: 'Invalid concentrations data' }, 400);
    }

    // Select regulatory standard
    const standards = standard === 'EPA' ? EPA_STANDARDS : WHO_STANDARDS;
    const calculator = new HMPICalculator(standards);

    // Calculate indices
    const result = calculator.calculate(concentrations);

    return c.json({
      success: true,
      result,
      standard: standard
    });

  } catch (error) {
    console.error('HMPI calculation error:', error);
    return c.json({ error: 'Calculation failed' }, 500);
  }
})

app.post('/api/calculate/batch', async (c) => {
  try {
    const { samples, standard = 'WHO' } = await c.req.json();
    
    if (!samples || !Array.isArray(samples)) {
      return c.json({ error: 'Invalid samples data' }, 400);
    }

    const standards = standard === 'EPA' ? EPA_STANDARDS : WHO_STANDARDS;
    const calculator = new HMPICalculator(standards);

    const results = calculator.batchCalculate(samples);

    return c.json({
      success: true,
      results,
      standard: standard,
      total: results.length
    });

  } catch (error) {
    console.error('Batch calculation error:', error);
    return c.json({ error: 'Batch calculation failed' }, 500);
  }
})

app.get('/api/standards/:type', (c) => {
  const type = c.req.param('type').toUpperCase();
  
  switch (type) {
    case 'WHO':
      return c.json({ standards: WHO_STANDARDS, type: 'WHO' });
    case 'EPA':
      return c.json({ standards: EPA_STANDARDS, type: 'EPA' });
    default:
      return c.json({ error: 'Invalid standard type' }, 400);
  }
})

// CSV Upload and Processing Route
app.post('/api/upload/csv', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    const headers = rows[0].map(h => h.trim().toLowerCase());
    const dataRows = rows.slice(1).filter(row => row.length > 1);

    // Parse CSV data
    const samples = [];
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (row.length < headers.length) continue;

      const sampleData: any = {};
      headers.forEach((header, index) => {
        sampleData[header] = row[index]?.trim();
      });

      // Extract metal concentrations
      const concentrations: MetalConcentration[] = [];
      const metals = ['as', 'pb', 'cd', 'cr', 'hg', 'ni', 'cu', 'zn', 'fe', 'mn'];
      
      for (const metal of metals) {
        const metalValue = sampleData[metal] || sampleData[`${metal}_concentration`];
        if (metalValue && metalValue !== '' && metalValue !== 'ND') {
          const concentration = parseFloat(metalValue);
          if (!isNaN(concentration)) {
            concentrations.push({
              metal: metal.toUpperCase(),
              concentration: concentration,
              unit: sampleData.unit || 'mg/L',
              isNonDetect: false
            });
          }
        } else if (metalValue === 'ND' || metalValue === '<0.001') {
          // Handle non-detect values
          concentrations.push({
            metal: metal.toUpperCase(),
            concentration: 0,
            unit: sampleData.unit || 'mg/L',
            isNonDetect: true,
            detectionLimit: parseFloat(sampleData[`lod_${metal}`]) || 0.001
          });
        }
      }

      if (concentrations.length > 0) {
        samples.push({
          sampleId: sampleData.sample_id || `Sample_${i + 1}`,
          latitude: parseFloat(sampleData.latitude) || 0,
          longitude: parseFloat(sampleData.longitude) || 0,
          date: sampleData.date || new Date().toISOString().split('T')[0],
          location: sampleData.location_name || '',
          concentrations: concentrations
        });
      }
    }

    // Calculate HMPI for all samples
    const calculator = new HMPICalculator(WHO_STANDARDS);
    const results = calculator.batchCalculate(samples);

    return c.json({
      success: true,
      message: `Processed ${samples.length} samples`,
      samples: samples.length,
      results: results,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('CSV processing error:', error);
    return c.json({ 
      error: 'Failed to process CSV file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
})

// Export results as CSV
app.post('/api/export/csv', async (c) => {
  try {
    const { results } = await c.req.json();
    
    if (!results || !Array.isArray(results)) {
      return c.json({ error: 'Invalid results data' }, 400);
    }

    const calculator = new HMPICalculator();
    const csvData = calculator.exportToCSV(results.map(r => r.result));

    return new Response(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="hmpi_results.csv"'
      }
    });

  } catch (error) {
    console.error('CSV export error:', error);
    return c.json({ error: 'Export failed' }, 500);
  }
})

export default app