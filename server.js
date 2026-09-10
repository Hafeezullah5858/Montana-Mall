const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;
const ONLINE_PAYMENT_TTL = 30 * 60 * 1000;
const PAYMENT_PROVIDER = String(process.env.PAYMENT_PROVIDER || 'safepay').toLowerCase();
const SAFEPAY_ENV = String(process.env.SAFEPAY_ENV || 'sandbox').toLowerCase() === 'production' ? 'production' : 'sandbox';
const SAFEPAY_MERCHANT_API_KEY = process.env.SAFEPAY_MERCHANT_API_KEY || '';
const SAFEPAY_MERCHANT_SECRET = process.env.SAFEPAY_MERCHANT_SECRET || '';
const SAFEPAY_WEBHOOK_SECRET = process.env.SAFEPAY_WEBHOOK_SECRET || '';

fs.mkdirSync(DATA_DIR, { recursive: true });

const seedProducts = [
  {id:'sp1',cat:'fashion',category:'Fashion',icon:'👗',name:'Premium Lawn 3-Piece Suit',price:1136,old:1619,badge:'SALE',stock:41,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'},
  {id:'sp2',cat:'fashion',category:'Fashion',icon:'👗',name:'Embroidered Party Dress',price:1273,old:1839,badge:'HOT',stock:42,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp3',cat:'fashion',category:'Fashion',icon:'👗',name:'Casual Cotton Kurti',price:1410,old:2059,badge:'-20%',stock:43,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'},
  {id:'sp4',cat:'fashion',category:'Fashion',icon:'👗',name:'Printed Summer Dress',price:1547,old:2279,badge:'NEW',stock:44,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'},
  {id:'sp5',cat:'fashion',category:'Fashion',icon:'👗',name:'Women Denim Jacket',price:1684,old:2499,badge:'SALE',stock:45,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80'},
  {id:'sp6',cat:'fashion',category:'Fashion',icon:'👗',name:'Elegant Abaya',price:1821,old:2719,badge:'HOT',stock:46,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80'},
  {id:'sp7',cat:'fashion',category:'Fashion',icon:'👗',name:'Chiffon Dupatta Set',price:1958,old:2939,badge:'-20%',stock:47,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80'},
  {id:'sp8',cat:'fashion',category:'Fashion',icon:'👗',name:'Classic Polo Shirt',price:2095,old:3159,badge:'NEW',stock:48,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80'},
  {id:'sp9',cat:'fashion',category:'Fashion',icon:'👗',name:'Men Casual Kurta',price:2232,old:3379,badge:'SALE',stock:49,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp10',cat:'fashion',category:'Fashion',icon:'👗',name:'Women Linen Co-Ord Set',price:2369,old:3599,badge:'HOT',stock:50,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'},
  {id:'sp11',cat:'fashion',category:'Fashion',icon:'👗',name:'Kids Festive Outfit',price:2506,old:3819,badge:'-20%',stock:51,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'},
  {id:'sp12',cat:'fashion',category:'Fashion',icon:'👗',name:'Winter Fleece Hoodie',price:2643,old:4039,badge:'NEW',stock:52,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp13',cat:'electronics',category:'Electronics',icon:'🎧',name:'Wireless Pro Headphones',price:2780,old:4259,badge:'SALE',stock:53,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80'},
  {id:'sp14',cat:'electronics',category:'Electronics',icon:'🎧',name:'Smart LED TV 43-inch',price:2917,old:4479,badge:'HOT',stock:54,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'},
  {id:'sp15',cat:'electronics',category:'Electronics',icon:'🎧',name:'Bluetooth Speaker Pro',price:3054,old:3499,badge:'-20%',stock:55,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'},
  {id:'sp16',cat:'electronics',category:'Electronics',icon:'🎧',name:'Noise Cancelling Earbuds',price:3191,old:3719,badge:'NEW',stock:56,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80'},
  {id:'sp17',cat:'electronics',category:'Electronics',icon:'🎧',name:'Portable Power Bank 20000mAh',price:3328,old:3939,badge:'SALE',stock:57,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp18',cat:'electronics',category:'Electronics',icon:'🎧',name:'Mechanical Gaming Keyboard',price:3465,old:4159,badge:'HOT',stock:58,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=900&q=80'},
  {id:'sp19',cat:'electronics',category:'Electronics',icon:'🎧',name:'Wireless Mouse Pro',price:3602,old:4379,badge:'-20%',stock:59,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1547887538-e3a2f1b798be?auto=format&fit=crop&w=900&q=80'},
  {id:'sp20',cat:'electronics',category:'Electronics',icon:'🎧',name:'USB-C Fast Charger',price:3739,old:4599,badge:'NEW',stock:60,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1601924928378-2b8e7d5a3f2d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp21',cat:'electronics',category:'Electronics',icon:'🎧',name:'Smart Home Camera',price:3876,old:4819,badge:'SALE',stock:61,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'},
  {id:'sp22',cat:'electronics',category:'Electronics',icon:'🎧',name:'Laptop Stand',price:4013,old:5039,badge:'HOT',stock:62,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp23',cat:'electronics',category:'Electronics',icon:'🎧',name:'Mini Projector',price:4150,old:5259,badge:'-20%',stock:63,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'},
  {id:'sp24',cat:'electronics',category:'Electronics',icon:'🎧',name:'Electric Kettle',price:4287,old:5479,badge:'NEW',stock:64,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'},
  {id:'sp25',cat:'beauty',category:'Beauty',icon:'💄',name:'Glow Beauty Skincare Set',price:4424,old:5699,badge:'SALE',stock:65,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80'},
  {id:'sp26',cat:'beauty',category:'Beauty',icon:'💄',name:'Vitamin C Face Serum',price:4561,old:5919,badge:'HOT',stock:66,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80'},
  {id:'sp27',cat:'beauty',category:'Beauty',icon:'💄',name:'Hydrating Moisturizer',price:4698,old:6139,badge:'-20%',stock:67,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80'},
  {id:'sp28',cat:'beauty',category:'Beauty',icon:'💄',name:'Matte Lip Collection',price:4835,old:6359,badge:'NEW',stock:68,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80'},
  {id:'sp29',cat:'beauty',category:'Beauty',icon:'💄',name:'Sunscreen SPF 50',price:4972,old:5379,badge:'SALE',stock:69,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp30',cat:'beauty',category:'Beauty',icon:'💄',name:'Hair Repair Mask',price:5109,old:5599,badge:'HOT',stock:70,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'},
  {id:'sp31',cat:'beauty',category:'Beauty',icon:'💄',name:'Perfume Gift Set',price:5246,old:5819,badge:'-20%',stock:71,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'},
  {id:'sp32',cat:'beauty',category:'Beauty',icon:'💄',name:'Aloe Vera Gel',price:5383,old:6039,badge:'NEW',stock:72,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp33',cat:'beauty',category:'Beauty',icon:'💄',name:'Makeup Brush Set',price:1020,old:1759,badge:'SALE',stock:73,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80'},
  {id:'sp34',cat:'beauty',category:'Beauty',icon:'💄',name:'Face Wash Gentle Cleanser',price:1157,old:1979,badge:'HOT',stock:74,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'},
  {id:'sp35',cat:'beauty',category:'Beauty',icon:'💄',name:'Body Lotion',price:1294,old:2199,badge:'-20%',stock:75,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'},
  {id:'sp36',cat:'beauty',category:'Beauty',icon:'💄',name:'Hair Styling Kit',price:1431,old:2419,badge:'NEW',stock:76,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80'},
  {id:'sp37',cat:'home',category:'Home & Living',icon:'🏠',name:'Modern Home Cushion Set',price:1568,old:2639,badge:'SALE',stock:77,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp38',cat:'home',category:'Home & Living',icon:'🏠',name:'Minimal Table Lamp',price:1705,old:2859,badge:'HOT',stock:78,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=900&q=80'},
  {id:'sp39',cat:'home',category:'Home & Living',icon:'🏠',name:'Cotton Bedsheet Set',price:1842,old:3079,badge:'-20%',stock:79,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1547887538-e3a2f1b798be?auto=format&fit=crop&w=900&q=80'},
  {id:'sp40',cat:'home',category:'Home & Living',icon:'🏠',name:'Nonstick Cookware Set',price:1979,old:3299,badge:'NEW',stock:80,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1601924928378-2b8e7d5a3f2d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp41',cat:'home',category:'Home & Living',icon:'🏠',name:'Ceramic Dinner Set',price:2116,old:3519,badge:'SALE',stock:81,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'},
  {id:'sp42',cat:'home',category:'Home & Living',icon:'🏠',name:'Storage Organizer Box',price:2253,old:3739,badge:'HOT',stock:82,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp43',cat:'home',category:'Home & Living',icon:'🏠',name:'Soft Bath Towel Set',price:2390,old:3959,badge:'-20%',stock:83,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'},
  {id:'sp44',cat:'home',category:'Home & Living',icon:'🏠',name:'Wall Mirror',price:2527,old:2979,badge:'NEW',stock:84,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'},
  {id:'sp45',cat:'home',category:'Home & Living',icon:'🏠',name:'Decorative Vase',price:2664,old:3199,badge:'SALE',stock:85,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80'},
  {id:'sp46',cat:'home',category:'Home & Living',icon:'🏠',name:'Kitchen Spice Rack',price:2801,old:3419,badge:'HOT',stock:86,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80'},
  {id:'sp47',cat:'home',category:'Home & Living',icon:'🏠',name:'Laundry Basket',price:2938,old:3639,badge:'-20%',stock:87,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80'},
  {id:'sp48',cat:'home',category:'Home & Living',icon:'🏠',name:'Artificial Plant Pot',price:3075,old:3859,badge:'NEW',stock:88,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80'},
  {id:'sp49',cat:'shoes',category:'Shoes',icon:'👟',name:'Men Running Shoes',price:3212,old:4079,badge:'SALE',stock:89,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp50',cat:'shoes',category:'Shoes',icon:'👟',name:'Women Walking Sneakers',price:3349,old:4299,badge:'HOT',stock:90,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'},
  {id:'sp51',cat:'shoes',category:'Shoes',icon:'👟',name:'Classic Leather Loafers',price:3486,old:4519,badge:'-20%',stock:91,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'},
  {id:'sp52',cat:'shoes',category:'Shoes',icon:'👟',name:'Casual Canvas Shoes',price:3623,old:4739,badge:'NEW',stock:92,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp53',cat:'shoes',category:'Shoes',icon:'👟',name:'Kids Sports Shoes',price:3760,old:4959,badge:'SALE',stock:93,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80'},
  {id:'sp54',cat:'shoes',category:'Shoes',icon:'👟',name:'Women Flat Sandals',price:3897,old:5179,badge:'HOT',stock:94,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'},
  {id:'sp55',cat:'shoes',category:'Shoes',icon:'👟',name:'Men Formal Shoes',price:4034,old:5399,badge:'-20%',stock:95,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'},
  {id:'sp56',cat:'shoes',category:'Shoes',icon:'👟',name:'Comfort Slides',price:4171,old:5619,badge:'NEW',stock:96,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80'},
  {id:'sp57',cat:'shoes',category:'Shoes',icon:'👟',name:'Trail Hiking Shoes',price:4308,old:5839,badge:'SALE',stock:97,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp58',cat:'shoes',category:'Shoes',icon:'👟',name:'Women Heels',price:4445,old:4859,badge:'HOT',stock:98,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=900&q=80'},
  {id:'sp59',cat:'shoes',category:'Shoes',icon:'👟',name:'Men Casual Sneakers',price:4582,old:5079,badge:'-20%',stock:99,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1547887538-e3a2f1b798be?auto=format&fit=crop&w=900&q=80'},
  {id:'sp60',cat:'shoes',category:'Shoes',icon:'👟',name:'Kids School Shoes',price:4719,old:5299,badge:'NEW',stock:100,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1601924928378-2b8e7d5a3f2d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp61',cat:'bags',category:'Bags',icon:'👜',name:'Ladies Handbag Classic',price:4856,old:5519,badge:'SALE',stock:101,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'},
  {id:'sp62',cat:'bags',category:'Bags',icon:'👜',name:'Leather Crossbody Bag',price:4993,old:5739,badge:'HOT',stock:102,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp63',cat:'bags',category:'Bags',icon:'👜',name:'Travel Duffel Bag',price:5130,old:5959,badge:'-20%',stock:103,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'},
  {id:'sp64',cat:'bags',category:'Bags',icon:'👜',name:'Laptop Backpack',price:5267,old:6179,badge:'NEW',stock:104,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'},
  {id:'sp65',cat:'bags',category:'Bags',icon:'👜',name:'School Backpack',price:5404,old:6399,badge:'SALE',stock:105,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80'},
  {id:'sp66',cat:'bags',category:'Bags',icon:'👜',name:'Mini Shoulder Bag',price:1041,old:2119,badge:'HOT',stock:106,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80'},
  {id:'sp67',cat:'bags',category:'Bags',icon:'👜',name:'Men Messenger Bag',price:1178,old:2339,badge:'-20%',stock:107,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80'},
  {id:'sp68',cat:'bags',category:'Bags',icon:'👜',name:'Canvas Tote Bag',price:1315,old:2559,badge:'NEW',stock:108,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80'},
  {id:'sp69',cat:'bags',category:'Bags',icon:'👜',name:'Wallet & Card Holder Set',price:1452,old:2779,badge:'SALE',stock:109,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp70',cat:'bags',category:'Bags',icon:'👜',name:'Gym Bag',price:1589,old:2999,badge:'HOT',stock:110,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'},
  {id:'sp71',cat:'bags',category:'Bags',icon:'👜',name:'Kids Cartoon Backpack',price:1726,old:3219,badge:'-20%',stock:111,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'},
  {id:'sp72',cat:'bags',category:'Bags',icon:'👜',name:'Weekend Travel Bag',price:1863,old:3439,badge:'NEW',stock:112,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp73',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Gold Plated Necklace',price:2000,old:2459,badge:'SALE',stock:113,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80'},
  {id:'sp74',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Classic Pearl Earrings',price:2137,old:2679,badge:'HOT',stock:114,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'},
  {id:'sp75',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Crystal Bracelet',price:2274,old:2899,badge:'-20%',stock:115,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'},
  {id:'sp76',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Elegant Ring Set',price:2411,old:3119,badge:'NEW',stock:116,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80'},
  {id:'sp77',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Statement Pendant',price:2548,old:3339,badge:'SALE',stock:117,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp78',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Fashion Bangles Set',price:2685,old:3559,badge:'HOT',stock:118,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=900&q=80'},
  {id:'sp79',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Silver Look Anklet',price:2822,old:3779,badge:'-20%',stock:119,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1547887538-e3a2f1b798be?auto=format&fit=crop&w=900&q=80'},
  {id:'sp80',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Heart Pendant Necklace',price:2959,old:3999,badge:'NEW',stock:40,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1601924928378-2b8e7d5a3f2d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp81',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Hoop Earrings',price:3096,old:4219,badge:'SALE',stock:41,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'},
  {id:'sp82',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Stone Stud Earrings',price:3233,old:4439,badge:'HOT',stock:42,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp83',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Charm Bracelet',price:3370,old:4659,badge:'-20%',stock:43,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'},
  {id:'sp84',cat:'jewellery',category:'Jewellery',icon:'💎',name:'Bridal Jewellery Set',price:3507,old:4879,badge:'NEW',stock:44,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'},
  {id:'sp85',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'Fast Charging Cable',price:3644,old:5099,badge:'SALE',stock:45,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80'},
  {id:'sp86',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'MagSafe Style Phone Stand',price:3781,old:5319,badge:'HOT',stock:46,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80'},
  {id:'sp87',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'Tempered Glass Protector',price:3918,old:4339,badge:'-20%',stock:47,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80'},
  {id:'sp88',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'Silicone Phone Case',price:4055,old:4559,badge:'NEW',stock:48,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80'},
  {id:'sp89',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'Wireless Charging Pad',price:4192,old:4779,badge:'SALE',stock:49,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp90',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'Car Phone Holder',price:4329,old:4999,badge:'HOT',stock:50,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'},
  {id:'sp91',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'Bluetooth Selfie Stick',price:4466,old:5219,badge:'-20%',stock:51,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'},
  {id:'sp92',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'USB-C Hub',price:4603,old:5439,badge:'NEW',stock:52,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp93',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'Phone Cleaning Kit',price:4740,old:5659,badge:'SALE',stock:53,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80'},
  {id:'sp94',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'Mobile Gaming Trigger',price:4877,old:5879,badge:'HOT',stock:54,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'},
  {id:'sp95',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'Earphone Carry Case',price:5014,old:6099,badge:'-20%',stock:55,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'},
  {id:'sp96',cat:'mobile',category:'Mobile & Accessories',icon:'📱',name:'Universal Phone Tripod',price:5151,old:6319,badge:'NEW',stock:56,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80'},
  {id:'sp97',cat:'grocery',category:'Grocery',icon:'🛒',name:'Premium Basmati Rice 5kg',price:5288,old:6539,badge:'SALE',stock:57,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp98',cat:'grocery',category:'Grocery',icon:'🛒',name:'Cooking Oil 1L',price:5425,old:6759,badge:'HOT',stock:58,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=900&q=80'},
  {id:'sp99',cat:'grocery',category:'Grocery',icon:'🛒',name:'Green Tea Pack',price:1062,old:2479,badge:'-20%',stock:59,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1547887538-e3a2f1b798be?auto=format&fit=crop&w=900&q=80'},
  {id:'sp100',cat:'grocery',category:'Grocery',icon:'🛒',name:'Mixed Nuts 500g',price:1199,old:2699,badge:'NEW',stock:60,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1601924928378-2b8e7d5a3f2d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp101',cat:'grocery',category:'Grocery',icon:'🛒',name:'Honey Jar 500g',price:1336,old:2919,badge:'SALE',stock:61,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'},
  {id:'sp102',cat:'grocery',category:'Grocery',icon:'🛒',name:'Breakfast Cereal',price:1473,old:1939,badge:'HOT',stock:62,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp103',cat:'grocery',category:'Grocery',icon:'🛒',name:'Pasta Family Pack',price:1610,old:2159,badge:'-20%',stock:63,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'},
  {id:'sp104',cat:'grocery',category:'Grocery',icon:'🛒',name:'Chocolate Assortment',price:1747,old:2379,badge:'NEW',stock:64,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'},
  {id:'sp105',cat:'grocery',category:'Grocery',icon:'🛒',name:'Coffee Beans 250g',price:1884,old:2599,badge:'SALE',stock:65,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80'},
  {id:'sp106',cat:'grocery',category:'Grocery',icon:'🛒',name:'Baking Essentials Box',price:2021,old:2819,badge:'HOT',stock:66,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80'},
  {id:'sp107',cat:'grocery',category:'Grocery',icon:'🛒',name:'Spice Gift Box',price:2158,old:3039,badge:'-20%',stock:67,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80'},
  {id:'sp108',cat:'grocery',category:'Grocery',icon:'🛒',name:'Dates Premium Pack',price:2295,old:3259,badge:'NEW',stock:68,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80'},
  {id:'sp109',cat:'sports',category:'Sports',icon:'⚽',name:'Football Pro Size 5',price:2432,old:3479,badge:'SALE',stock:69,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80'},
  {id:'sp110',cat:'sports',category:'Sports',icon:'⚽',name:'Cricket Bat Kashmir Willow',price:2569,old:3699,badge:'HOT',stock:70,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'},
  {id:'sp111',cat:'sports',category:'Sports',icon:'⚽',name:'Cricket Tennis Ball Pack',price:2706,old:3919,badge:'-20%',stock:71,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'},
  {id:'sp112',cat:'sports',category:'Sports',icon:'⚽',name:'Yoga Mat',price:2843,old:4139,badge:'NEW',stock:72,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp113',cat:'sports',category:'Sports',icon:'⚽',name:'Skipping Rope',price:2980,old:4359,badge:'SALE',stock:73,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80'},
  {id:'sp114',cat:'sports',category:'Sports',icon:'⚽',name:'Resistance Bands Set',price:3117,old:4579,badge:'HOT',stock:74,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80'},
  {id:'sp115',cat:'sports',category:'Sports',icon:'⚽',name:'Badminton Racket Pair',price:3254,old:4799,badge:'-20%',stock:75,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'},
  {id:'sp116',cat:'sports',category:'Sports',icon:'⚽',name:'Table Tennis Set',price:3391,old:3819,badge:'NEW',stock:76,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80'},
  {id:'sp117',cat:'sports',category:'Sports',icon:'⚽',name:'Sports Water Bottle',price:3528,old:4039,badge:'SALE',stock:77,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'},
  {id:'sp118',cat:'sports',category:'Sports',icon:'⚽',name:'Gym Gloves',price:3665,old:4259,badge:'HOT',stock:78,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=900&q=80'},
  {id:'sp119',cat:'sports',category:'Sports',icon:'⚽',name:'Basketball Size 7',price:3802,old:4479,badge:'-20%',stock:79,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1547887538-e3a2f1b798be?auto=format&fit=crop&w=900&q=80'},
  {id:'sp120',cat:'sports',category:'Sports',icon:'⚽',name:'Fitness Exercise Ball',price:3939,old:4699,badge:'NEW',stock:80,seller:'Muntaha Mall',description:'Sample marketplace product for Muntaha Mall demo catalogue.',image:'https://images.unsplash.com/photo-1601924928378-2b8e7d5a3f2d?auto=format&fit=crop&w=900&q=80'},
];

function loadDB(){
  if(fs.existsSync(DB_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(DB_FILE,'utf8'));
      existing.users ||= []; existing.products ||= []; existing.orders ||= []; existing.wishlists ||= {};
      return existing;
    } catch (e) { console.error('DB read failed, rebuilding:', e.message); }
  }
  const salt=crypto.randomBytes(16).toString('hex');
  const adminHash=`${salt}:${crypto.scryptSync(process.env.ADMIN_PASSWORD || 'Admin@12345',salt,64).toString('hex')}`;
  const fresh={users:[{id:'u_admin',name:'Muntaha Admin',email:(process.env.ADMIN_EMAIL||'admin@muntahamall.local').toLowerCase(),role:'admin',passwordHash:adminHash}],products:seedProducts,orders:[],wishlists:{}};
  fs.writeFileSync(DB_FILE,JSON.stringify(fresh,null,2));
  return fresh;
}
let db=loadDB();
function persist(){const tmp=DB_FILE+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db,null,2));fs.renameSync(tmp,DB_FILE);}

const sessions=new Map();
const rateBuckets=new Map();
function rateLimit(key,limit=60,windowMs=60_000){const now=Date.now();let b=rateBuckets.get(key);if(!b||now-b.start>=windowMs){b={start:now,count:0};rateBuckets.set(key,b);}b.count++;return b.count<=limit;}
setInterval(()=>{const now=Date.now();for(const [k,b] of rateBuckets)if(now-b.start>120000)rateBuckets.delete(k);for(const [k,s] of sessions)if(s.expires<Date.now())sessions.delete(k);expirePendingPayments();},120000).unref();

function hashPassword(password){return new Promise((resolve,reject)=>{const salt=crypto.randomBytes(16).toString('hex');crypto.scrypt(password,salt,64,(e,key)=>e?reject(e):resolve(`${salt}:${key.toString('hex')}`));});}
function verifyPassword(password,stored){return new Promise(resolve=>{try{const [salt,key]=String(stored).split(':');if(!salt||!key)return resolve(false);crypto.scrypt(password,salt,64,(e,k)=>{if(e)return resolve(false);const expected=Buffer.from(key,'hex');resolve(expected.length===k.length&&crypto.timingSafeEqual(expected,k));});}catch{return resolve(false);}});}
function sessionUser(req){const c=req.headers.cookie||'';const m=c.match(/(?:^|;\s*)mm_session=([^;]+)/);if(!m)return null;const s=sessions.get(m[1]);if(!s||s.expires<Date.now()){sessions.delete(m[1]);return null;}return db.users.find(u=>u.id===s.userId)||null;}
function setCookie(res,token,maxAge=SESSION_TTL){const secure=process.env.NODE_ENV==='production'?' Secure;':'';res.setHeader('Set-Cookie',`mm_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(maxAge/1000)};${secure}`);}
function clearCookie(res){res.setHeader('Set-Cookie','mm_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');}
function json(res,status,data,extra={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra});res.end(JSON.stringify(data));}
async function rawBody(req,max=1e6){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>max)throw Object.assign(new Error('Payload too large'),{status:413});chunks.push(chunk);}return Buffer.concat(chunks);}
async function body(req){const raw=await rawBody(req);if(!raw.length)return {};try{return JSON.parse(raw.toString('utf8'));}catch{throw Object.assign(new Error('Invalid JSON body'),{status:400});}}
function safeUser(u){return {id:u.id,name:u.name,email:u.email,role:u.role};}
function uid(prefix){return prefix+'_'+crypto.randomBytes(9).toString('hex');}
function safeUrl(value){const v=String(value||'').trim();if(!v)return '';try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?v.slice(0,500):'';}catch{return '';}}
function categoryPair(category){const c=String(category||'Fashion').trim();const map={'Home & Living':'home','Mobile & Accessories':'mobile'};return {category:c,cat:map[c]||c.toLowerCase().replace(/\s+/g,'-')};}
function cleanProduct(p){return {id:p.id,cat:p.cat||categoryPair(p.category||'').cat,category:p.category||p.cat||'',icon:p.icon||'🛍️',name:p.name,price:Number(p.price),old:p.old?Number(p.old):null,badge:p.badge||'SELLER',stock:Number(p.stock||0),seller:p.seller||'Muntaha Mall',description:p.description||p.desc||'',image:p.image||''};}
function sendFile(req,res){let file;try{file=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return json(res,400,{error:'Bad URL'});}if(file==='/'||file==='')file='/index.html';const full=path.resolve(ROOT,'.'+file);if(!(full===ROOT||full.startsWith(ROOT+path.sep))||!fs.existsSync(full)||fs.statSync(full).isDirectory())return json(res,404,{error:'Not found'});const ext=path.extname(full).toLowerCase();const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':ext==='.html'?'no-cache':'public, max-age=86400'});fs.createReadStream(full).pipe(res);}
function orderId(){return 'MM-'+Date.now().toString().slice(-8)+'-'+crypto.randomBytes(3).toString('hex');}
function getOrigin(req){const proto=(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();const host=req.headers.host;return `${proto}://${host}`;}
function paymentConfigured(){return PAYMENT_PROVIDER==='safepay' && !!SAFEPAY_MERCHANT_API_KEY && !!SAFEPAY_MERCHANT_SECRET;}
function safepayBase(){return SAFEPAY_ENV==='production'?'https://api.getsafepay.com':'https://sandbox.api.getsafepay.com';}
let safepayClient=null;
function getSafepayClient(){
  if(!paymentConfigured()) return null;
  if(!safepayClient){
    const Safepay=require('@sfpy/node-core');
    safepayClient=Safepay(SAFEPAY_MERCHANT_SECRET,{authType:'secret',host:safepayBase()});
  }
  return safepayClient;
}
function extractTracker(data){return data?.data?.tracker?.token||data?.tracker?.token||'';}
async function createSafepayCheckout(tracker,orderId,origin){
  const safepay=getSafepayClient();
  const auth=await safepay.auth.passport.create();
  const tbt=auth?.data?.data || auth?.data || '';
  if(!tbt) throw new Error('Safepay did not return a checkout authentication token.');
  const redirectUrl=`${origin}/?payment=success&orderId=${encodeURIComponent(orderId)}&tracker=${encodeURIComponent(tracker)}`;
  const cancelUrl=`${origin}/?payment=cancel&orderId=${encodeURIComponent(orderId)}`;
  let url='';
  if(safepay.checkout?.createCheckoutUrl){
    url=safepay.checkout.createCheckoutUrl({env:SAFEPAY_ENV,tracker,tbt,source:'hosted',redirect_url:redirectUrl,cancel_url:cancelUrl});
  } else if(safepay.checkouts?.payment?.create){
    const checkout=await safepay.checkouts.payment.create({tracker,tbt,environment:SAFEPAY_ENV,source:'hosted',redirect_url:redirectUrl,cancel_url:cancelUrl});
    url=checkout?.data?.url || checkout?.url || checkout?.data?.checkout_url || checkout?.checkout_url || '';
  }
  if(!url) throw new Error('Safepay did not return a checkout URL.');
  return url;
}
async function createOnlinePayment(order,origin){
  if(!paymentConfigured()) throw Object.assign(new Error('Online payment is not configured yet. Admin must add Safepay keys in Back4app Environment Variables.'),{status:503});
  const safepay=getSafepayClient();
  const amountMinor=Math.round(order.total*100);
  const session=await safepay.payments.session.setup({
    merchant_api_key:SAFEPAY_MERCHANT_API_KEY,
    intent:'CYBERSOURCE',
    mode:'payment',
    entry_mode:'raw',
    currency:'PKR',
    amount:amountMinor,
    metadata:{order_id:order.id},
    include_fees:false
  });
  const tracker=extractTracker(session);
  if(!tracker) throw new Error('Safepay did not return a payment tracker.');
  const checkoutUrl=await createSafepayCheckout(tracker,order.id,origin);
  return {tracker,checkoutUrl};
}
async function getOnlinePaymentStatus(tracker){
  if(!paymentConfigured()||!tracker)return null;
  try{return await getSafepayClient().reporter.payments.fetch(tracker);}
  catch(e){console.error('Payment status check:',e.message);return null;}
}
function markPayment(order,status,reference=''){if(!order)return false;const next=String(status||'').toLowerCase();if(next==='paid'||next==='completed'||next==='succeeded'){order.paymentStatus='Paid';order.paymentReference=reference||order.paymentReference||'';if(order.status==='Pending')order.status='Processing';return true;}if(next==='failed'||next==='cancelled'||next==='canceled'){if(order.paymentStatus!=='Paid'){if(order.paymentStatus!=='Cancelled')restockOrder(order);order.paymentStatus=next==='failed'?'Failed':'Cancelled';order.status='Cancelled';return true;}}return false;}
function restockOrder(order){if(order._restocked)return;for(const item of order.items||[]){const prod=db.products.find(x=>String(x.id)===String(item.id));if(prod)prod.stock+=Number(item.qty)||0;}order._restocked=true;}
function expirePendingPayments(){let changed=false;const cutoff=Date.now()-ONLINE_PAYMENT_TTL;for(const o of db.orders){if(o.payment==='online'&&o.paymentStatus==='Pending'&&new Date(o.date).getTime()<cutoff){restockOrder(o);o.paymentStatus='Cancelled';o.status='Cancelled';changed=true;}}if(changed)persist();}
function sanitizeOrderForClient(o){const x={...o};delete x._restocked;delete x.tracker;return x;}

function verifySafepayWebhook(raw,sig,timestamp){if(!SAFEPAY_WEBHOOK_SECRET||!sig)return false;const secretText=SAFEPAY_WEBHOOK_SECRET.trim();let key;try{key=Buffer.from(secretText,'base64');if(!key.length)throw new Error();}catch{key=Buffer.from(secretText,'utf8');}
  const candidates=[];
  if(timestamp)candidates.push('sha256='+crypto.createHmac('sha256',key).update(String(timestamp)+'.').update(raw).digest('hex'));
  candidates.push('sha256='+crypto.createHmac('sha256',key).update(raw).digest('hex'));
  candidates.push(crypto.createHmac('sha256',key).update(raw).digest('hex'));
  return candidates.some(expected=>expected.length===sig.length&&crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(sig)));
}
function findOrderFromWebhook(data){const root=data?.data||data;const n=root?.notification||root?.data||{};const metadata=n?.metadata||root?.metadata||{};const id=metadata.order_id||metadata.orderId||metadata.order||root?.order_id||root?.orderId;let order=id?db.orders.find(o=>String(o.id)===String(id)):null;if(!order){const tracker=n?.tracker||root?.tracker||root?.token||data?.tracker;order=db.orders.find(o=>o.tracker===tracker);}return {order,notification:n,root};}

async function api(req,res){
  const url=new URL(req.url,'http://localhost');const p=url.pathname;const method=req.method;const user=sessionUser(req);expirePendingPayments();
  try{
    if(method==='GET'&&p==='/api/health')return json(res,200,{ok:true,payment:{provider:PAYMENT_PROVIDER,configured:paymentConfigured(),environment:SAFEPAY_ENV}});
    if(method==='GET'&&p==='/api/products')return json(res,200,{products:db.products.map(cleanProduct)});
    if(method==='GET'&&p==='/api/auth/me')return json(res,200,{user:user?safeUser(user):null});
    if(method==='POST'&&p==='/api/auth/register'){
      const b=await body(req),email=String(b.email||'').trim().toLowerCase(),name=String(b.name||'').trim(),password=String(b.password||'');
      if(!/^\S+@\S+\.\S+$/.test(email)||name.length<2||password.length<8)return json(res,400,{error:'Enter a valid name, email and password (8+ characters).'});
      if(db.users.some(u=>u.email===email))return json(res,409,{error:'An account with this email already exists.'});
      const u={id:uid('u'),name,email,role:'customer',passwordHash:await hashPassword(password)};db.users.push(u);persist();const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{userId:u.id,expires:Date.now()+SESSION_TTL});setCookie(res,token);return json(res,201,{user:safeUser(u)});
    }
    if(method==='POST'&&p==='/api/auth/login'){
      const b=await body(req),email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');const u=db.users.find(x=>x.email===email);if(!u||!(await verifyPassword(password,u.passwordHash)))return json(res,401,{error:'Invalid email or password.'});const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{userId:u.id,expires:Date.now()+SESSION_TTL});setCookie(res,token);return json(res,200,{user:safeUser(u)});
    }
    if(method==='POST'&&p==='/api/auth/logout'){const c=req.headers.cookie||'',m=c.match(/(?:^|;\s*)mm_session=([^;]+)/);if(m)sessions.delete(m[1]);clearCookie(res);return json(res,200,{ok:true});}
    if(method==='GET'&&p==='/api/wishlist'){if(!user)return json(res,401,{error:'Login required'});return json(res,200,{ids:db.wishlists[user.id]||[]});}
    if(method==='PUT'&&p==='/api/wishlist'){if(!user)return json(res,401,{error:'Login required'});const b=await body(req),id=String(b.productId||'');if(!db.products.some(x=>String(x.id)===id))return json(res,404,{error:'Product not found'});let ids=db.wishlists[user.id]||[];if(b.active===false)ids=ids.filter(x=>String(x)!==id);else if(!ids.some(x=>String(x)===id))ids.push(id);db.wishlists[user.id]=ids;persist();return json(res,200,{ids});}
    if(method==='POST'&&p==='/api/seller/apply'){if(!user)return json(res,401,{error:'Login required'});if(user.role==='customer'){user.role='seller';persist();}return json(res,200,{user:safeUser(user)});}

    if(method==='POST'&&p==='/api/admin/products'){
      if(!user||user.role!=='admin')return json(res,403,{error:'Admin access required.'});const b=await body(req),name=String(b.name||'').trim(),price=Number(b.price),stock=Number(b.stock);if(name.length<2||!Number.isFinite(price)||price<=0||!Number.isInteger(stock)||stock<0)return json(res,400,{error:'Invalid product details.'});const cp=categoryPair(b.category);const prod={id:uid('p'),...cp,icon:String(b.icon||'🛍️').slice(0,8),name,price,stock,old:Number(b.old)>0?Number(b.old):null,badge:String(b.badge||'ADMIN').slice(0,30),seller:'Muntaha Mall',description:String(b.description||'').slice(0,2000),image:safeUrl(b.image)};db.products.push(prod);persist();return json(res,201,{product:cleanProduct(prod)});
    }
    if(method==='PATCH'&&/^\/api\/admin\/products\/[^/]+$/.test(p)){
      if(!user||user.role!=='admin')return json(res,403,{error:'Admin access required.'});const id=decodeURIComponent(p.split('/').pop()),prod=db.products.find(x=>String(x.id)===id);if(!prod)return json(res,404,{error:'Product not found.'});const b=await body(req);
      if(b.name!==undefined){const name=String(b.name).trim();if(name.length<2)return json(res,400,{error:'Product name is required.'});prod.name=name;}
      if(b.price!==undefined){const price=Number(b.price);if(!Number.isFinite(price)||price<=0)return json(res,400,{error:'Invalid price.'});prod.price=price;}
      if(b.stock!==undefined){const stock=Number(b.stock);if(!Number.isInteger(stock)||stock<0)return json(res,400,{error:'Invalid stock.'});prod.stock=stock;}
      if(b.category!==undefined){const cp=categoryPair(b.category);prod.category=cp.category;prod.cat=cp.cat;}
      if(b.old!==undefined)prod.old=Number(b.old)>0?Number(b.old):null;if(b.badge!==undefined)prod.badge=String(b.badge).slice(0,30);if(b.icon!==undefined)prod.icon=String(b.icon).slice(0,8);if(b.image!==undefined)prod.image=safeUrl(b.image);if(b.description!==undefined)prod.description=String(b.description).slice(0,2000);persist();return json(res,200,{product:cleanProduct(prod)});
    }
    if(method==='DELETE'&&/^\/api\/admin\/products\/[^/]+$/.test(p)){
      if(!user||user.role!=='admin')return json(res,403,{error:'Admin access required.'});const id=decodeURIComponent(p.split('/').pop()),idx=db.products.findIndex(x=>String(x.id)===id);if(idx<0)return json(res,404,{error:'Product not found.'});if(db.orders.some(o=>o.status!=='Cancelled'&&o.items.some(i=>String(i.id)===id)))return json(res,409,{error:'This product is linked to an active order and cannot be deleted.'});db.products.splice(idx,1);for(const uid of Object.keys(db.wishlists||{}))db.wishlists[uid]=(db.wishlists[uid]||[]).filter(x=>String(x)!==id);persist();return json(res,200,{ok:true});
    }

    if(method==='POST'&&p==='/api/seller/products'){
      if(!user||!['seller','admin'].includes(user.role))return json(res,403,{error:'Seller access required.'});const b=await body(req),name=String(b.name||'').trim(),price=Number(b.price),stock=Number(b.stock);if(name.length<2||!Number.isFinite(price)||price<=0||!Number.isInteger(stock)||stock<0)return json(res,400,{error:'Invalid product details.'});const cp=categoryPair(b.category);const prod={id:uid('p'),...cp,icon:'🛍️',name,price,stock,old:null,badge:'SELLER',seller:user.name,description:String(b.desc||'').slice(0,2000),image:safeUrl(b.image)};db.products.push(prod);persist();return json(res,201,{product:cleanProduct(prod)});
    }
    if(method==='GET'&&p==='/api/seller/dashboard'){
      if(!user||!['seller','admin'].includes(user.role))return json(res,403,{error:'Seller access required.'});const mine=db.products.filter(x=>x.seller===user.name);const items=db.orders.filter(o=>o.status!=='Cancelled'&&(o.payment!=='online'||o.paymentStatus==='Paid')).flatMap(o=>o.items).filter(i=>i.seller===user.name);return json(res,200,{products:mine.map(cleanProduct),orderItems:items.reduce((n,i)=>n+i.qty,0),grossSales:items.reduce((n,i)=>n+i.price*i.qty,0)});
    }

    if(method==='POST'&&p==='/api/orders'){
      const b=await body(req),items=Array.isArray(b.items)?b.items:[];if(!items.length)return json(res,400,{error:'Cart is empty.'});
      const name=String(b.name||user?.name||'').trim(),phone=String(b.phone||'').trim(),address=String(b.address||'').trim(),payment=b.payment==='online'?'online':'cod';if(!name||!/^03[0-9]{2}[- ]?[0-9]{7}$/.test(phone))return json(res,400,{error:'Enter a valid Pakistan mobile number (03XX XXXXXXX).'});if(address.length<8)return json(res,400,{error:'Please enter a complete delivery address.'});
      const final=[];for(const i of items){const prod=db.products.find(x=>String(x.id)===String(i.id));const qty=Math.max(1,Math.min(99,Number(i.qty)||1));if(!prod||prod.stock<qty)return json(res,400,{error:`${prod?.name||'A product'} is out of stock or unavailable.`});final.push({id:prod.id,name:prod.name,price:Number(prod.price),qty,seller:prod.seller,icon:prod.icon||'🛍️'});}
      const total=final.reduce((s,i)=>s+i.price*i.qty,0);const id=orderId();const o={id,date:new Date().toISOString(),customer:user?.email||null,guest:!user,name,phone,address,payment,items:final,total,status:'Pending',paymentStatus:payment==='online'?'Pending':'Not Required'};
      if(payment==='online'){
        try { const pay=await createOnlinePayment(o,getOrigin(req)); o.tracker=pay.tracker; final.forEach(i=>{const prod=db.products.find(x=>x.id===i.id);prod.stock-=i.qty;}); db.orders.unshift(o);persist();return json(res,201,{online:true,checkoutUrl:pay.checkoutUrl,order:sanitizeOrderForClient(o)}); }
        catch(e){return json(res,e.status||502,{error:e.message||'Unable to start online payment.'});}
      }
      final.forEach(i=>{const prod=db.products.find(x=>x.id===i.id);prod.stock-=i.qty;});db.orders.unshift(o);persist();return json(res,201,{online:false,order:sanitizeOrderForClient(o)});
    }
    if(method==='GET'&&p==='/api/orders'){if(!user)return json(res,401,{error:'Login required'});const mine=user.role==='admin'?db.orders:db.orders.filter(o=>o.customer===user.email);return json(res,200,{orders:mine.map(sanitizeOrderForClient)});}

    if(method==='GET'&&p==='/api/payments/status'){
      if(!user)return json(res,401,{error:'Login required'});const orderIdParam=url.searchParams.get('orderId')||'',tracker=url.searchParams.get('tracker')||'';const o=db.orders.find(x=>x.id===orderIdParam&& (user.role==='admin'||x.customer===user.email));if(!o)return json(res,404,{error:'Order not found.'});if(o.payment!=='online')return json(res,200,{order:sanitizeOrderForClient(o)});if(tracker&&o.tracker&&tracker!==o.tracker)return json(res,400,{error:'Invalid payment tracker.'});const remote=await getOnlinePaymentStatus(o.tracker);if(remote){const n=remote?.data?.notification||remote?.data||remote?.notification||remote;const state=String(n?.state||n?.status||remote?.state||'').toLowerCase();const reference=String(n?.reference||n?.payment_reference||'');if(markPayment(o,state,reference))persist();}return json(res,200,{order:sanitizeOrderForClient(o),configured:paymentConfigured()});
    }
    if(method==='POST'&&p==='/api/payments/safepay/webhook'){
      const raw=await rawBody(req);const sig=req.headers['x-sfpy-signature']||'';const ts=req.headers['x-sfpy-timestamp']||'';if(!verifySafepayWebhook(raw,String(sig),String(ts)))return json(res,401,{error:'Invalid webhook signature.'});let data;try{data=JSON.parse(raw.toString('utf8'));}catch{return json(res,400,{error:'Invalid webhook JSON.'});}const {order,notification,root}=findOrderFromWebhook(data);if(order){const state=String(notification?.state||notification?.status||root?.state||root?.status||root?.type||'').toLowerCase();const reference=String(notification?.reference||root?.reference||'');if(markPayment(order,state,reference))persist();}return json(res,200,{ok:true});
    }

    if(method==='POST'&&p==='/api/admin/password'){
      if(!user||user.role!=='admin')return json(res,403,{error:'Admin access is restricted.'});
      const b=await body(req),current=String(b.currentPassword||''),next=String(b.newPassword||'');
      if(next.length<8)return json(res,400,{error:'New password must be at least 8 characters.'});
      if(!(await verifyPassword(current,user.passwordHash)))return json(res,401,{error:'Current password is incorrect.'});
      user.passwordHash=await hashPassword(next); persist();
      for(const [token,s] of sessions){if(s.userId===user.id)sessions.delete(token);}
      const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{userId:user.id,expires:Date.now()+SESSION_TTL});setCookie(res,token);
      return json(res,200,{ok:true});
    }
    if(method==='POST'&&/^\/api\/admin\/users\/[^/]+\/reset-password$/.test(p)){
      if(!user||user.role!=='admin')return json(res,403,{error:'Admin access is restricted.'});
      const id=decodeURIComponent(p.split('/')[4]),target=db.users.find(x=>String(x.id)===id);if(!target)return json(res,404,{error:'User not found.'});
      const b=await body(req),next=String(b.newPassword||'');if(next.length<8)return json(res,400,{error:'Password must be at least 8 characters.'});
      target.passwordHash=await hashPassword(next);persist();
      for(const [token,s] of sessions){if(s.userId===target.id)sessions.delete(token);}
      return json(res,200,{ok:true});
    }
    if(method==='PATCH'&&/^\/api\/admin\/users\/[^/]+$/.test(p)){
      if(!user||user.role!=='admin')return json(res,403,{error:'Admin access is restricted.'});
      const id=decodeURIComponent(p.split('/').pop()),target=db.users.find(x=>String(x.id)===id);if(!target)return json(res,404,{error:'User not found.'});
      const b=await body(req);if(b.role!==undefined&&!['customer','seller','admin'].includes(String(b.role)))return json(res,400,{error:'Invalid role.'});
      if(target.id===user.id&&b.role&&b.role!=='admin')return json(res,400,{error:'You cannot remove your own admin access.'});
      if(b.role)target.role=String(b.role);if(b.name!==undefined){const n=String(b.name).trim();if(n.length<2)return json(res,400,{error:'Name is required.'});target.name=n;}
      persist();return json(res,200,{user:safeUser(target)});
    }
    if(method==='POST'&&p==='/api/admin/offers'){
      if(!user||user.role!=='admin')return json(res,403,{error:'Admin access is restricted.'});
      const b=await body(req),id=String(b.productId||''),percent=Number(b.percent),prod=db.products.find(x=>String(x.id)===id);
      if(!prod)return json(res,404,{error:'Product not found.'});if(!Number.isInteger(percent)||percent<1||percent>90)return json(res,400,{error:'Discount must be 1 to 90 percent.'});
      const regular=Number(prod.old)>Number(prod.price)?Number(prod.old):Number(prod.price);prod.old=regular;prod.price=Math.max(1,Math.round(regular*(1-percent/100)));prod.badge=String(b.badge||`${percent}% OFF`).slice(0,30);persist();return json(res,200,{product:cleanProduct(prod)});
    }
    if(method==='DELETE'&&/^\/api\/admin\/offers\/[^/]+$/.test(p)){
      if(!user||user.role!=='admin')return json(res,403,{error:'Admin access is restricted.'});
      const id=decodeURIComponent(p.split('/').pop()),prod=db.products.find(x=>String(x.id)===id);if(!prod)return json(res,404,{error:'Product not found.'});
      if(Number(prod.old)>Number(prod.price)){prod.price=Number(prod.old);prod.old=null;prod.badge='';persist();}
      return json(res,200,{ok:true,product:cleanProduct(prod)});
    }
    if(method==='GET'&&p==='/api/admin/dashboard'){
      if(!user||user.role!=='admin')return json(res,403,{error:'Admin access is restricted.'});const activeOrders=db.orders.filter(o=>o.status!=='Cancelled');const total=activeOrders.reduce((s,o)=>s+Number(o.total||0),0);return json(res,200,{users:db.users.map(safeUser),products:db.products.map(cleanProduct),orders:db.orders.map(sanitizeOrderForClient),gmv:total,payment:{provider:PAYMENT_PROVIDER,configured:paymentConfigured(),environment:SAFEPAY_ENV}});
    }
    const statusMatch=p.match(/^\/api\/admin\/orders\/([^/]+)$/);if(method==='PATCH'&&statusMatch){if(!user||user.role!=='admin')return json(res,403,{error:'Admin access is restricted.'});const o=db.orders.find(x=>x.id===decodeURIComponent(statusMatch[1]));if(!o)return json(res,404,{error:'Order not found'});const b=await body(req),allowed=['Pending','Processing','Shipped','Delivered','Cancelled'];if(!allowed.includes(b.status))return json(res,400,{error:'Invalid status'});if(o.payment==='online'&&o.paymentStatus!=='Paid'&&b.status!=='Cancelled')return json(res,400,{error:'Online order must be paid before processing.'});if(o.status!=='Cancelled'&&b.status==='Cancelled'){restockOrder(o);if(o.payment==='online'&&o.paymentStatus!=='Paid')o.paymentStatus='Cancelled';}if(o.status==='Cancelled'&&b.status!=='Cancelled'){for(const i of o.items){const prod=db.products.find(x=>x.id===i.id);if(!prod||prod.stock<i.qty)return json(res,400,{error:'Cannot reopen order: insufficient stock.'});}for(const i of o.items){const prod=db.products.find(x=>x.id===i.id);prod.stock-=i.qty;}o._restocked=false;}o.status=b.status;persist();return json(res,200,{order:sanitizeOrderForClient(o)});}
    return json(res,404,{error:'API route not found'});
  }catch(e){console.error(e);return json(res,e.status||500,{error:e.status?e.message:'Server error'});}
}

const server=http.createServer((req,res)=>{
  res.setHeader('X-Frame-Options','SAMEORIGIN');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy','same-origin');
  if(req.url.startsWith('/api/')){const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').split(',')[0].trim();const limit=req.method==='POST'||req.method==='PATCH'||req.method==='PUT'?60:180;if(!rateLimit(ip+':'+req.method,limit))return json(res,429,{error:'Too many requests. Please try again shortly.'});return api(req,res);}
  return sendFile(req,res);
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Muntaha Mall running on port ${PORT}`));
