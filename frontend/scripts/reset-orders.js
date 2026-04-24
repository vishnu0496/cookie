const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '../orders.json');

function reset() {
    console.log('--- Sundays: Order Reset ---');
    
    if (fs.existsSync(ORDERS_FILE)) {
        try {
            const data = fs.readFileSync(ORDERS_FILE, 'utf8');
            const orders = JSON.parse(data);
            
            // Only keep non-TEST orders if any exist
            const realOrders = orders.filter(o => !o.orderNumber.startsWith('TEST-'));
            
            if (realOrders.length === 0) {
                fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
                console.log('Success: All test and real orders cleared.');
            } else {
                fs.writeFileSync(ORDERS_FILE, JSON.stringify(realOrders, null, 2), 'utf8');
                console.log(`Success: Cleared test data. Preserved ${realOrders.length} real orders.`);
            }
        } catch (e) {
            fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
            console.log('Success: Reset orders.json to empty list.');
        }
    } else {
        fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
        console.log('Success: Reset orders.json to empty list.');
    }
    
    console.log('Refresh the browser to see the Live state.');
}

reset();
