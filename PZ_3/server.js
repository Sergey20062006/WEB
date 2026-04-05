const express = require('express');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv'); 

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data', 'substations.json');

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }

        const data = fs.readFileSync(DATA_FILE, 'utf8');

        return JSON.parse(data);
    } catch (error) {
        console.error('Помилка читання даних:', error);
        return [];
    }
}

function writeData(data) {
    try {
        const dir = path.dirname(DATA_FILE);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        
        return true;
    } catch (error) {
        console.error('Помилка запису даних:', error);
        return false;
    }
}

app.get('/api/substations', (req, res) => {
    let substations = readData();

    const searchQuery = req.query.search; 
    const statusFilter = req.query.status;

    if (searchQuery) {
        substations = substations.filter(sub => 
            sub.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (statusFilter && statusFilter !== 'Всі') {

        substations = substations.filter(sub => sub.repairStatus === statusFilter);
    }

    res.json(substations);
});

app.post('/api/substations', (req, res) => {
    try {
        const newSubstation = {
            id: Date.now().toString(),
            address: req.body.address,
            type: req.body.type,
            apartments: req.body.apartments,
            power: req.body.power,
            load: req.body.load,
            repairStatus: req.body.repairStatus,
            repairDate: req.body.repairDate || '',
            registrationDate: new Date().toLocaleString()
        };

        const substations = readData();
        substations.push(newSubstation);

        if (writeData(substations)) {
            res.status(201).json({
                success: true,
                message: 'Підстанцію успішно зареєстровано',
                data: newSubstation
            });
        } else {
            throw new Error('Помилка запису даних');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Помилка реєстрації підстанції',
            error: error.message
        });
    }
});

app.delete('/api/substations/:id', (req, res) => {
    try {
        const substations = readData();

        const filtered = substations.filter(sub => sub.id !== req.params.id);

        if (writeData(filtered)) {
            res.json({ success: true, message: 'Підстанцію видалено' });
        } else {
            throw new Error('Помилка запису даних');
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Помилка видалення' });
    }
});

app.get('/api/substations/export', (req, res) => {
    try {
        const substations = readData();

        if (substations.length === 0) {
            return res.status(404).send('Немає даних для експорту');
        }

        const fields = [
            { label: 'Адреса підстанції', value: 'address' },
            { label: 'Тип підстанції', value: 'type' },
            { label: 'Кількість квартир', value: 'apartments' },
            { label: 'Потужність (кВА)', value: 'power' },
            { label: 'Навантаження (%)', value: 'load' },
            { label: 'Стан', value: 'repairStatus' },
            { label: 'Дата ремонту', value: 'repairDate' },
            { label: 'Зареєстровано', value: 'registrationDate' }
        ];

        const opts = { 
            fields: fields,
            delimiter: ';',
            withBOM: true
        };
        const json2csvParser = new Parser(opts);
        const csv = json2csvParser.parse(substations);

        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('tp_report.csv');

        return res.send(csv);
    } catch (error) {
        console.error('Помилка експорту:', error);
        res.status(500).json({ success: false, message: 'Помилка експорту даних' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер успішно запущено! Відкрий в браузері: http://localhost:${PORT}`);
});
