const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '../orders.json');
const LIMIT = 50;

function seed() {
    console.log('--- Sundays: Sold-Out Seeder ---');
    
    let orders = [];
    if (fs.existsSync(ORDERS_FILE)) {
        try {
            orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        } catch (e) {
            orders = [];
        }
    }

    const currentCount = orders.length;
    if (currentCount >= LIMIT) {
        console.log(`Already at capacity (${currentCount} orders). No seeding needed.`);
        return;
    }

    const needed = LIMIT - currentCount;
    console.log(`Seeding ${needed} test orders to reach the capacity of ${LIMIT}...`);

    for (let i = 0; i < needed; i++) {
        const orderNum = currentCount + i + 1;
        const fakeOrder = {
            orderNumber: `TEST-DRP01-${String(orderNum).padStart(3, '0')}`,
            customer: {
                firstName: `TEST CUSTOMER ${orderNum}`,
                email: `test${orderNum}@sundays.test`,
                whatsapp: `+91 00000 00000`,
                addressHouse: `Test House ${orderNum}`,
                addressLocality: `Test Locality`,
                addressCity: `Test City`,
                addressState: `Test State`,
                addressPincode: `000000`,
                addressLandmark: `Test Landmark`
            },
            items: [
                { id: 'salted-noir', name: 'Salted Noir (TEST)', price: 220, quantity: 1 }
            ],
            subtotal: 220,
            delivery: 50,
            total: 270,
            timestamp: new Date().toISOString()
        };
        orders.push(fakeOrder);
    }

    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    console.log(`Success: Seeded ${needed} test orders. Total is now ${orders.length}.`);
    console.log('Refresh the browser to see the Sold Out state.');
}

seed();
