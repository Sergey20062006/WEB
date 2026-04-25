
let feedersChart = null; 
let eventHistory = [];   
let simulationInterval = null; 
let isRunning = true;

// ДЛЯ СТВОРЕННЯ ГРАФІКА
function initChart() {
    const ctx = document.getElementById('feedersChart').getContext('2d');
    
    // Створюємо новий графік
    feedersChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Фідер 1 (МВт)',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.3
                },
                {
                    label: 'Фідер 2 (МВт)',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Навантаження (МВт)' }
                },
                x: {
                    title: { display: true, text: 'Час' }
                }
            }
        }
    });
}


// СИМУЛЯЦІЯ СЕРВЕРА (Генератор випадкових даних)
function generateMockData() {
    const f1Load = 40 + Math.random() * 20; // від 40 до 60 
    const f2Load = 30 + Math.random() * 15; // від 30 до 45

    const data = {
        timestamp: Date.now(),
        totalLoad: f1Load + f2Load,
        lineLosses: 2 + Math.random() * 3,
        cosPhi: 0.9 + Math.random() * 0.08,
        thd: 1 + Math.random() * 4,
        feeder1Load: f1Load,
        feeder2Load: f2Load,
        // Імовірність аварії: у 5% випадків генеруємо повідомлення
        event: Math.random() > 0.73 ? "Зниження напруги на Фідері 2!" : null
    };

    updateDashboard(data);
}


// ОНОВЛЕННЯ ІНТЕРФЕЙСУ
function updateDashboard(data) {
    // Оновлюємо верхні картки 
    document.getElementById('totalLoad').textContent = data.totalLoad.toFixed(2) + ' МВт';
    document.getElementById('lineLosses').textContent = data.lineLosses.toFixed(2) + ' %';
    document.getElementById('cosPhi').textContent = data.cosPhi.toFixed(3);
    document.getElementById('thd').textContent = data.thd.toFixed(1) + ' %';
    
    // Робимо статус зеленим
    document.getElementById('systemStatus').textContent = 'В роботі';
    document.getElementById('systemStatus').className = 'text-success fw-bold';

    // Оновлюємо графік
    const timeString = new Date(data.timestamp).toLocaleTimeString();
    feedersChart.data.labels.push(timeString); // Додаємо час знизу
    feedersChart.data.datasets[0].data.push(data.feeder1Load); // Точка для Фідера 1
    feedersChart.data.datasets[1].data.push(data.feeder2Load); // Точка для Фідера 2

    // Тримаємо на графіку лише останні 15 точок старі видаляємо
    if (feedersChart.data.labels.length > 15) {
        feedersChart.data.labels.shift();
        feedersChart.data.datasets[0].data.shift();
        feedersChart.data.datasets[1].data.shift();
    }
    feedersChart.update();

    // Оновлюємо таблицю подій (якщо трапилася якась подія)
    if (data.event) {
        eventHistory.unshift(`<strong>${timeString}</strong>: <span class="text-danger">${data.event}</span>`);
        
        if (eventHistory.length > 5) eventHistory.pop();
        
        document.getElementById('eventLogTable').innerHTML = eventHistory.join('<hr class="my-1">');
    }
}

// КЕРУВАННЯ СИМУЛЯЦІЄЮ
function toggleSimulation() {
    const btn = document.getElementById('toggleBtn');
    
    if (isRunning) {
        // Якщо система працює -> зупиняємо її
        clearInterval(simulationInterval); // Ця команда вбиває таймер
        isRunning = false;
        
        // Міняємо вигляд кнопки на "Запустити" (робимо її зеленою)
        btn.textContent = 'Запустити симуляцію';
        btn.classList.replace('btn-danger', 'btn-success');
        
        // Змінюємо статус у верхній картці
        document.getElementById('systemStatus').textContent = 'Зупинено роботу';
        document.getElementById('systemStatus').className = 'text-danger fw-bold';
    } else {
        // Якщо система стоїть -> запускаємо її знову
        simulationInterval = setInterval(generateMockData, 3000); 
        isRunning = true;
        
        // Міняємо вигляд кнопки 
        btn.textContent = 'Зупинити симуляцію';
        btn.classList.replace('btn-success', 'btn-danger');
        
        document.getElementById('systemStatus').textContent = 'В роботі';
        document.getElementById('systemStatus').className = 'text-success fw-bold';
    }
}

// ГОЛОВНИЙ ЗАПУСК
document.addEventListener('DOMContentLoaded', () => {
    initChart();

    document.getElementById('toggleBtn').addEventListener('click', toggleSimulation);

    simulationInterval = setInterval(generateMockData, 3000); 
});