const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('Починаємо тестування REST API\n');
  try {
    // 1. GET - всі станції
    console.log('№1 GET /api/charging-stations');
    console.log('Всі станції\n');
    let response = await fetch(`${BASE_URL}/charging-stations`);
    let data = await response.json();
    console.log('Відповідь:', data);
    console.log('\n\n');

    // 2. GET - одна станція
    console.log('№2 GET /api/charging-stations/1');
    console.log('Одна станція (ID - 1)\n');
    response = await fetch(`${BASE_URL}/charging-stations/1`);
    data = await response.json();
    console.log('Відповідь:', data);
    console.log('\n\n');

    // 3. GET - статус зарядок
    console.log('№3 GET /api/charging-stations/1/chargers');
    console.log('Статус зарядок станції (ID - 1)\n');
    response = await fetch(`${BASE_URL}/charging-stations/1/chargers`);
    data = await response.json();
    console.log('Відповідь:', data);
    console.log('\n\n');

    // 4. POST - почати сесію
    console.log('№4 POST /api/charging-stations/1/start-session');
    console.log('Почати сесію на станції (ID - 1)\n');
    response = await fetch(`${BASE_URL}/charging-stations/1/start-session`, { method: 'POST' });
    data = await response.json();
    console.log('Відповідь:', data);
    console.log('\n\n');

    // 5. POST - закінчити сесію
    console.log('№5 POST /api/charging-stations/1/stop-session');
    console.log('Закінчити сесію на станції (ID - 1)\n');
    response = await fetch(`${BASE_URL}/charging-stations/1/stop-session`, { method: 'POST' });
    data = await response.json();
    console.log('Відповідь:', data);
    console.log('\n\n');

    // 6. PUT - оновити назву станції
    console.log(`№6 PUT /api/charging-stations/1`);
    console.log('Оновити назву станції (ID - 1)\n');
    const updateData = { name: "ЕЗС Центр (Оновлено після тесту)" };
    response = await fetch(`${BASE_URL}/charging-stations/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    data = await response.json();
    console.log('Відповідь:', data);
    console.log('\n\n');

    console.log('Тестування завершено успішно!');

  } catch (error) {
    console.error('Помилка:', error.message);
  }
}

testAPI();