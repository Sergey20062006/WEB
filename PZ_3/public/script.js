const form = document.getElementById('substationForm');
const messageDiv = document.getElementById('message');
const substationsList = document.getElementById('substationsList');

const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const exportBtn = document.getElementById('exportBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/api/substations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('success', result.message);
            form.reset();
            loadSubstations();
        } else {
            showMessage('error', result.message);
        }
    } catch (error) {
        showMessage('error', 'Помилка з\'єднання з сервером');
        console.error('Помилка:', error);
    }
});

function showMessage(type, text) {
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 4000);
}

async function loadSubstations() {
    try {
        const searchText = searchInput.value;
        const statusValue = statusFilter.value;

        const params = new URLSearchParams({
            search: searchText,
            status: statusValue
        });

        const response = await fetch(`/api/substations?${params.toString()}`);
        const substations = await response.json();

        displaySubstations(substations);
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
    }
}
function displaySubstations(substations) {
    if (substations.length === 0) {
        substationsList.innerHTML = '<p style="color: #777; text-align: center; padding: 20px;">Не знайдено жодної підстанції</p>';
        return;
    }

    const htmlCards = substations.map(sub => {

        let statusClass = 'status-good';
        if (sub.repairStatus === 'Потребує ремонту') statusClass = 'status-danger';
        if (sub.repairStatus === 'В ремонті') statusClass = 'status-warning';

        let formattedDate = sub.repairDate ? new Date(sub.repairDate).toLocaleDateString('uk-UA') : 'Не вказано';

        return `
            <div class="card ${statusClass}">
                <h3>${sub.address}</h3>
                <p><strong>Тип:</strong> ${sub.type}</p>
                <p><strong>Обслуговує квартир:</strong> ${sub.apartments}</p>
                <p><strong>Потужність:</strong> ${sub.power} кВА</p>
                <p><strong>Навантаження:</strong> ${sub.load}%</p>
                <p><strong>Стан:</strong> ${sub.repairStatus}</p>
                <p><strong>Дата ремонту:</strong> ${formattedDate}</p>
                
                <button class="btn btn-delete" onclick="deleteSubstation('${sub.id}')">Видалити</button>
            </div>
        `;
    }).join('');

    substationsList.innerHTML = htmlCards;
}

window.deleteSubstation = async function(id) {
    if (!confirm('Ви впевнені, що хочете видалити цей об\'єкт?')) {
        return;
    }

    try {
        const response = await fetch(`/api/substations/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            showMessage('success', result.message);
            loadSubstations();
        } else {
            showMessage('error', 'Помилка видалення');
        }
    } catch (error) {
        console.error('Помилка:', error);
    }
};

searchInput.addEventListener('input', loadSubstations);
statusFilter.addEventListener('change', loadSubstations);

exportBtn.addEventListener('click', () => {
    window.location.href = '/api/substations/export';
});

document.addEventListener('DOMContentLoaded', loadSubstations);