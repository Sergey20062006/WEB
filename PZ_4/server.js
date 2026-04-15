const express = require('express'); 
const app = express();
const PORT = 3000;

app.use(express.json());

let chargingStations = [
  {
    id: 1,
    name: "ЕЗС Центр",
    location: "вул. Хрещатик, 22",
    chargerCount: 4,
    maxPower: 150,
    availableChargers: 2,
    currentSessions: 2,
    totalEnergy: 450.5,
    status: "available"
  },
  {
    id: 2,
    name: "ЕЗС ТРЦ",
    location: "пр. Перемоги, 3",
    chargerCount: 10,
    maxPower: 50,
    availableChargers: 0,
    currentSessions: 10,
    totalEnergy: 1200.0,
    status: "busy"
  }
];


app.get('/api/charging-stations', (req, res) => {
  res.json(chargingStations);
});

app.get('/api/charging-stations/:id', (req, res) => {

  const stationId = parseInt(req.params.id);

  const station = chargingStations.find(s => s.id === stationId);

  if (!station) {
    return res.status(404).json({ error: 'Станцію не знайдено' });
  }

  res.json(station);
});

app.post('/api/charging-stations/:id/start-session', (req, res) => {
  const stationId = parseInt(req.params.id);
  const station = chargingStations.find(s => s.id === stationId);

  if (!station) {
    return res.status(404).json({ error: 'Зарядну станцію не знайдено' });
  }

  if (station.availableChargers <= 0) {
    return res.status(400).json({ error: 'Немає вільних зарядних пристроїв на цій станції' });
  }

  station.availableChargers -= 1;
  station.currentSessions += 1;
  
  if (station.availableChargers === 0) {
    station.status = 'busy';
  }

  res.status(200).json({
    message: 'Зарядна сесія успішно розпочата',
    station: station
  });
});


app.post('/api/charging-stations/:id/stop-session', (req, res) => {
  const stationId = parseInt(req.params.id);
  const station = chargingStations.find(s => s.id === stationId);

  if (!station) {
    return res.status(404).json({ error: 'Зарядну станцію не знайдено' });
  }

  if (station.currentSessions <= 0) {
    return res.status(400).json({ error: 'На цій станції немає активних сесій' });
  }

  station.currentSessions -= 1;
  station.availableChargers += 1;
  
  station.totalEnergy += 15.5; 

  if (station.availableChargers > 0) {
    station.status = 'available';
  }

  res.status(200).json({
    message: 'Зарядна сесія успішно завершена',
    station: station
  });
});


app.get('/api/charging-stations/:id/chargers', (req, res) => {
  const stationId = parseInt(req.params.id);
  const station = chargingStations.find(s => s.id === stationId);

  if (!station) {
    return res.status(404).json({ error: 'Зарядну станцію не знайдено' });
  }

  res.json({
    stationName: station.name,
    totalChargers: station.chargerCount,
    available: station.availableChargers,
    busy: station.chargerCount - station.availableChargers
  });
});


app.put('/api/charging-stations/:id', (req, res) => {
  const stationId = parseInt(req.params.id);
  
  const index = chargingStations.findIndex(s => s.id === stationId);

  if (index === -1) {
    return res.status(404).json({ error: 'Зарядну станцію не знайдено' });
  }

  chargingStations[index] = {
    ...chargingStations[index],
    ...req.body,
    id: stationId
  };

  res.json(chargingStations[index]);
});


app.listen(PORT, () => {
  console.log(`Сервер успішно запущено! http://localhost:${PORT}`);
});