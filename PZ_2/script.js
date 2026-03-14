let autoInterval = null;
let isAutoEnabled = false;

// Змінні для графіка та історії
let chart;
let historyData = {
    labels: [],
    data330: []
};

// Межі для параметрів
const limits = {
    voltage330: { min: 315, max: 345, normal: [325, 335] },
    voltage110: { min: 105, max: 115, normal: [108, 112] },
    current330: { min: 100, max: 800, normal: [200, 600] },
    frequency: { min: 49.8, max: 50.2, normal: [49.9, 50.1] }
};

// Допоміжна функція для випадкових чисел
function getRandom(min, max, decimals) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

//Генерація даних
function generateSensorData() {
    return {
        voltage330: getRandom(limits.voltage330.min - 5, limits.voltage330.max + 5, 1),
        voltage110: getRandom(limits.voltage110.min, limits.voltage110.max, 1),
        current330: getRandom(limits.current330.min, limits.current330.max, 0),
        frequency: getRandom(limits.frequency.min, limits.frequency.max, 2),
        sf6: getRandom(0.4, 0.6, 2),
        rpn: Math.floor(Math.random() * 19) + 1,
        disconnectors: Math.random() > 0.1 ? "Увімкнено" : "Вимкнено"
    };
}

//Визначення статусу
function checkStatus(value, limits) {
    if (value >= limits.normal[0] && value <= limits.normal[1]) {
        return 'normal';
    }
    if (value >= limits.min && value <= limits.max) {
        return 'warning';
    }
    return 'critical'; 
}

//Форматування дати/часу
function formatTimestamp() {
    return new Date().toLocaleTimeString('uk-UA');
}

//Оновлення відображення
function updateDisplay(data) {
    document.getElementById('param0').textContent = data.voltage330;
    document.getElementById('param1').textContent = data.voltage110;
    document.getElementById('param2').textContent = data.current330;
    document.getElementById('param3').textContent = data.frequency;

    document.getElementById('param-sf6').textContent = data.sf6;
    document.getElementById('param-rpn').textContent = data.rpn;
    
    const discElem = document.getElementById('param-disconnectors');
    discElem.textContent = data.disconnectors;
    discElem.style.color = data.disconnectors === "Увімкнено" ? "#2ecc71" : "#e74c3c";

    // Оновлюємо статуси (переводимо 'critical' у клас 'status-danger' для CSS)
    const statusMap = { 'normal': 'status-normal', 'warning': 'status-warning', 'critical': 'status-danger' };

    document.getElementById('status0').className = 'status-indicator ' + statusMap[checkStatus(data.voltage330, limits.voltage330)];
    document.getElementById('status1').className = 'status-indicator ' + statusMap[checkStatus(data.voltage110, limits.voltage110)];
    document.getElementById('status2').className = 'status-indicator ' + statusMap[checkStatus(data.current330, limits.current330)];
    document.getElementById('status3').className = 'status-indicator ' + statusMap[checkStatus(data.frequency, limits.frequency)];

    document.getElementById('lastUpdate').textContent = formatTimestamp();
}

//Збереження в localStorage
function saveData(data) {
    const timestamp = formatTimestamp();
    
    if (chart) {
        chart.data.labels.push(timestamp);
        chart.data.datasets[0].data.push(data.voltage330);

        // Обмеження до 20 точок
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        
        chart.update();

        historyData.labels = chart.data.labels;
        historyData.data330 = chart.data.datasets[0].data;
    } else {
        historyData.labels.push(timestamp);
        historyData.data330.push(data.voltage330);
    }

    // Зберігаємо оновлену історію
    localStorage.setItem('substationHistory', JSON.stringify(historyData));
}

//Ручне оновлення
function manualUpdate() {
    const newData = generateSensorData();
    updateDisplay(newData);
    saveData(newData);
}

//Автоматичне оновлення
function toggleAutoUpdate() {
    // Вмикає/вимикає таймер
    const btn = document.getElementById('autoUpdateBtn');

    if (!isAutoEnabled) {
        autoInterval = setInterval(manualUpdate, 3000);
        isAutoEnabled = true;
        btn.textContent = 'Зупинити';
        btn.className = 'btn btn-danger';
    } else {
        clearInterval(autoInterval);
        isAutoEnabled = false;
        btn.textContent = 'Автооновлення';
        btn.className = 'btn btn-success';
    }
}

//Ініціалізація графіка 
function initChart() {
    const savedData = localStorage.getItem('substationHistory');
    if (savedData) {
        historyData = JSON.parse(savedData);
    }

    const ctx = document.getElementById('historyChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historyData.labels,
            datasets: [{
                label: 'Напруга 330 кВ',
                data: historyData.data330,
                borderColor: 'rgb(219, 141, 52)',
                tension: 0.1
            },
            {
                label: 'Верхня межа норми',
                data: historyData.labels.map(() => limits.voltage330.normal[1]),
                borderColor: 'rgba(46, 204, 113, 0.5)',
                pointReadius: 0
            },
            {
                label: 'Нижня межа норми',
                data: historyData.labels.map(() => limits.voltage330.normal[0]),
                borderColor: 'rgba(204, 46, 46, 0.5)',
                pointReadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { min: 310, max: 350 } }
        }
    });
}

//Очищення історії
function clearHistory() {
    // Видаляємо дані з пам'яті браузера
    localStorage.removeItem('substationHistory');
    
    // Очищаємо дані в об'єкті графіка
    if (chart) {
        chart.data.labels.length = 0;
        chart.data.datasets[0].data.length = 0;
        chart.update();
    }

    // Очищаємо допоміжні масиви
    historyData.labels = [];
    historyData.data330 = [];
}

// Запуск після завантаження сторінки
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    manualUpdate(); // Генеруємо перші дані при вході
    
    document.getElementById('updateBtn').addEventListener('click', manualUpdate);
    document.getElementById('autoUpdateBtn').addEventListener('click', toggleAutoUpdate);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
});
