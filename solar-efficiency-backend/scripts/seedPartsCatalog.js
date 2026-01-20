require('dotenv').config();
const mongoose = require('mongoose');
const PartsCatalog = require('../src/models/PartsCatalog.model');

const essentialParts = [
  // Panel Parts
  {
    name: 'Solar Panel Glass',
    description: 'Tempered glass replacement for solar panel surface',
    category: 'panel',
    partNumber: 'SP-GLASS-001',
    price: 2500,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 25,
    minStockLevel: 5,
    supplier: 'SolarTech India',
    isActive: true
  },
  {
    name: 'Junction Box',
    description: 'Weatherproof junction box for solar panel connections',
    category: 'panel',
    partNumber: 'SP-JB-002',
    price: 450,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 50,
    minStockLevel: 10,
    supplier: 'ElectroComponents Ltd',
    isActive: true
  },
  {
    name: 'Bypass Diode',
    description: 'Schottky bypass diode for solar panel protection',
    category: 'panel',
    partNumber: 'SP-DIODE-003',
    price: 85,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 100,
    minStockLevel: 20,
    supplier: 'ElectroComponents Ltd',
    isActive: true
  },
  {
    name: 'Solar Panel Frame',
    description: 'Aluminum frame for solar panel mounting',
    category: 'panel',
    partNumber: 'SP-FRAME-004',
    price: 1800,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 15,
    minStockLevel: 5,
    supplier: 'MetalWorks India',
    isActive: true
  },

  // Inverter Parts
  {
    name: 'String Inverter 5kW',
    description: '5kW grid-tied string inverter with MPPT',
    category: 'inverter',
    partNumber: 'INV-STR-5K',
    price: 45000,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 8,
    minStockLevel: 2,
    supplier: 'PowerTech Solutions',
    isActive: true
  },
  {
    name: 'Micro Inverter 300W',
    description: 'Micro inverter for individual panel optimization',
    category: 'inverter',
    partNumber: 'INV-MICRO-300',
    price: 8500,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 30,
    minStockLevel: 10,
    supplier: 'PowerTech Solutions',
    isActive: true
  },
  {
    name: 'Inverter Cooling Fan',
    description: 'Replacement cooling fan for inverters',
    category: 'inverter',
    partNumber: 'INV-FAN-001',
    price: 650,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 20,
    minStockLevel: 5,
    supplier: 'CoolTech Parts',
    isActive: true
  },
  {
    name: 'Inverter Display Panel',
    description: 'LCD display panel for inverter monitoring',
    category: 'inverter',
    partNumber: 'INV-LCD-002',
    price: 1200,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 12,
    minStockLevel: 3,
    supplier: 'DisplayTech India',
    isActive: true
  },

  // Wiring & Cables
  {
    name: 'Solar DC Cable 4mm',
    description: 'UV resistant solar DC cable 4mm² (per meter)',
    category: 'wiring',
    partNumber: 'CABLE-DC-4MM',
    price: 45,
    currency: 'INR',
    unit: 'meter',
    stockQuantity: 500,
    minStockLevel: 100,
    supplier: 'CablePro India',
    isActive: true
  },
  {
    name: 'Solar DC Cable 6mm',
    description: 'UV resistant solar DC cable 6mm² (per meter)',
    category: 'wiring',
    partNumber: 'CABLE-DC-6MM',
    price: 65,
    currency: 'INR',
    unit: 'meter',
    stockQuantity: 300,
    minStockLevel: 50,
    supplier: 'CablePro India',
    isActive: true
  },
  {
    name: 'MC4 Connectors (Pair)',
    description: 'Waterproof MC4 male/female connector pair',
    category: 'wiring',
    partNumber: 'CONN-MC4-PAIR',
    price: 120,
    currency: 'INR',
    unit: 'pair',
    stockQuantity: 100,
    minStockLevel: 20,
    supplier: 'ConnectorHub',
    isActive: true
  },
  {
    name: 'Cable Ties UV Resistant',
    description: 'UV resistant cable ties for outdoor use (pack of 100)',
    category: 'wiring',
    partNumber: 'TIES-UV-100',
    price: 180,
    currency: 'INR',
    unit: 'pack',
    stockQuantity: 40,
    minStockLevel: 10,
    supplier: 'FastenPro',
    isActive: true
  },
  {
    name: 'Conduit Pipe PVC 25mm',
    description: 'PVC conduit pipe for cable protection (per meter)',
    category: 'wiring',
    partNumber: 'CONDUIT-25MM',
    price: 35,
    currency: 'INR',
    unit: 'meter',
    stockQuantity: 200,
    minStockLevel: 50,
    supplier: 'PipeWorks India',
    isActive: true
  },

  // Mounting Hardware
  {
    name: 'Roof Mounting Rails',
    description: 'Aluminum mounting rails for rooftop installation (per meter)',
    category: 'mounting',
    partNumber: 'MOUNT-RAIL-AL',
    price: 280,
    currency: 'INR',
    unit: 'meter',
    stockQuantity: 100,
    minStockLevel: 20,
    supplier: 'MountTech Systems',
    isActive: true
  },
  {
    name: 'L-Foot Brackets',
    description: 'Stainless steel L-foot mounting brackets',
    category: 'mounting',
    partNumber: 'MOUNT-LFOOT',
    price: 145,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 80,
    minStockLevel: 20,
    supplier: 'MountTech Systems',
    isActive: true
  },
  {
    name: 'Mid Clamps',
    description: 'Mid clamps for securing solar panels',
    category: 'mounting',
    partNumber: 'MOUNT-MIDCLAMP',
    price: 85,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 150,
    minStockLevel: 30,
    supplier: 'MountTech Systems',
    isActive: true
  },
  {
    name: 'End Clamps',
    description: 'End clamps for securing solar panels',
    category: 'mounting',
    partNumber: 'MOUNT-ENDCLAMP',
    price: 95,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 120,
    minStockLevel: 25,
    supplier: 'MountTech Systems',
    isActive: true
  },
  {
    name: 'Stainless Steel Bolts M8',
    description: 'Stainless steel bolts M8 for mounting (pack of 50)',
    category: 'mounting',
    partNumber: 'BOLT-SS-M8-50',
    price: 320,
    currency: 'INR',
    unit: 'pack',
    stockQuantity: 30,
    minStockLevel: 10,
    supplier: 'BoltMart',
    isActive: true
  },

  // Cleaning Supplies
  {
    name: 'Solar Panel Cleaning Solution',
    description: 'Non-abrasive cleaning solution for solar panels (5 liters)',
    category: 'cleaning',
    partNumber: 'CLEAN-SOL-5L',
    price: 850,
    currency: 'INR',
    unit: 'bottle',
    stockQuantity: 25,
    minStockLevel: 5,
    supplier: 'CleanTech Solutions',
    isActive: true
  },
  {
    name: 'Soft Bristle Brush',
    description: 'Soft bristle brush for panel cleaning',
    category: 'cleaning',
    partNumber: 'CLEAN-BRUSH-SOFT',
    price: 450,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 20,
    minStockLevel: 5,
    supplier: 'CleanTech Solutions',
    isActive: true
  },
  {
    name: 'Microfiber Cloth Pack',
    description: 'Lint-free microfiber cloths (pack of 10)',
    category: 'cleaning',
    partNumber: 'CLEAN-CLOTH-10',
    price: 280,
    currency: 'INR',
    unit: 'pack',
    stockQuantity: 35,
    minStockLevel: 10,
    supplier: 'CleanTech Solutions',
    isActive: true
  },
  {
    name: 'Water Fed Pole Extension',
    description: 'Telescopic pole for high panel cleaning',
    category: 'cleaning',
    partNumber: 'CLEAN-POLE-TELE',
    price: 3200,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 8,
    minStockLevel: 2,
    supplier: 'CleanTech Solutions',
    isActive: true
  },

  // Tools
  {
    name: 'Solar Multimeter',
    description: 'Digital multimeter for solar system testing',
    category: 'tools',
    partNumber: 'TOOL-METER-SOLAR',
    price: 2800,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 10,
    minStockLevel: 3,
    supplier: 'ToolTech Pro',
    isActive: true
  },
  {
    name: 'MC4 Crimping Tool',
    description: 'Professional MC4 connector crimping tool',
    category: 'tools',
    partNumber: 'TOOL-CRIMP-MC4',
    price: 1850,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 12,
    minStockLevel: 3,
    supplier: 'ToolTech Pro',
    isActive: true
  },
  {
    name: 'Solar Irradiance Meter',
    description: 'Handheld solar irradiance meter',
    category: 'tools',
    partNumber: 'TOOL-IRRAD-METER',
    price: 8500,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 5,
    minStockLevel: 2,
    supplier: 'MeasureTech India',
    isActive: true
  },
  {
    name: 'Torque Wrench Set',
    description: 'Torque wrench set for proper bolt tightening',
    category: 'tools',
    partNumber: 'TOOL-TORQUE-SET',
    price: 4200,
    currency: 'INR',
    unit: 'set',
    stockQuantity: 8,
    minStockLevel: 2,
    supplier: 'ToolTech Pro',
    isActive: true
  },

  // Safety Equipment
  {
    name: 'Safety Harness',
    description: 'Full body safety harness for rooftop work',
    category: 'safety',
    partNumber: 'SAFE-HARNESS-FB',
    price: 3800,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 15,
    minStockLevel: 5,
    supplier: 'SafetyFirst India',
    isActive: true
  },
  {
    name: 'Insulated Gloves',
    description: 'Electrical insulated gloves 1000V rated',
    category: 'safety',
    partNumber: 'SAFE-GLOVES-1KV',
    price: 850,
    currency: 'INR',
    unit: 'pair',
    stockQuantity: 25,
    minStockLevel: 10,
    supplier: 'SafetyFirst India',
    isActive: true
  },
  {
    name: 'Safety Helmet',
    description: 'Industrial safety helmet with chin strap',
    category: 'safety',
    partNumber: 'SAFE-HELMET',
    price: 420,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 30,
    minStockLevel: 10,
    supplier: 'SafetyFirst India',
    isActive: true
  },
  {
    name: 'Safety Goggles',
    description: 'UV protection safety goggles',
    category: 'safety',
    partNumber: 'SAFE-GOGGLES-UV',
    price: 180,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 40,
    minStockLevel: 15,
    supplier: 'SafetyFirst India',
    isActive: true
  },

  // Other Essential Items
  {
    name: 'Weatherproof Sealant',
    description: 'Silicone sealant for waterproofing',
    category: 'other',
    partNumber: 'SEAL-WEATHER-SI',
    price: 320,
    currency: 'INR',
    unit: 'tube',
    stockQuantity: 45,
    minStockLevel: 15,
    supplier: 'SealTech India',
    isActive: true
  },
  {
    name: 'Anti-Corrosion Spray',
    description: 'Protective anti-corrosion spray for metal parts',
    category: 'other',
    partNumber: 'SPRAY-ANTICOR',
    price: 280,
    currency: 'INR',
    unit: 'can',
    stockQuantity: 30,
    minStockLevel: 10,
    supplier: 'ProtectPro',
    isActive: true
  },
  {
    name: 'Cable Labels',
    description: 'Waterproof cable identification labels (pack of 100)',
    category: 'other',
    partNumber: 'LABEL-CABLE-100',
    price: 220,
    currency: 'INR',
    unit: 'pack',
    stockQuantity: 25,
    minStockLevel: 10,
    supplier: 'LabelMart',
    isActive: true
  },
  {
    name: 'Fuse 15A DC',
    description: 'DC fuse 15A for solar system protection',
    category: 'other',
    partNumber: 'FUSE-DC-15A',
    price: 95,
    currency: 'INR',
    unit: 'piece',
    stockQuantity: 60,
    minStockLevel: 20,
    supplier: 'ElectroComponents Ltd',
    isActive: true
  }
];

async function seedPartsCatalog() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing parts catalog
    const deleteResult = await PartsCatalog.deleteMany({});
    console.log(`🗑️  Removed ${deleteResult.deletedCount} existing parts`);

    // Insert essential parts
    const result = await PartsCatalog.insertMany(essentialParts);
    console.log(`✅ Successfully added ${result.length} essential parts to catalog`);

    // Display summary by category
    const categories = {};
    essentialParts.forEach(part => {
      categories[part.category] = (categories[part.category] || 0) + 1;
    });

    console.log('\n📦 Parts Summary by Category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} items`);
    });

    console.log('\n💰 Total Inventory Value:', 
      essentialParts.reduce((sum, part) => sum + (part.price * part.stockQuantity), 0).toLocaleString('en-IN'),
      'INR'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding parts catalog:', error);
    process.exit(1);
  }
}

seedPartsCatalog();
