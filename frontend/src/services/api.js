const API_BASE = '/api';

export async function fetchTables(eventId = null, eventName = null) {
  let url = `${API_BASE}/tables`;
  const params = new URLSearchParams();
  if (eventId) params.append('event_id', eventId);
  if (eventName) params.append('event_name', eventName);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar mesas');
  return res.json();
}

export async function fetchReservations(activeOnly = true) {
  const res = await fetch(`${API_BASE}/reservations?active_only=${activeOnly}`);
  if (!res.ok) throw new Error('Error al cargar historial de reservaciones');
  return res.json();
}

export async function mergeTables(tableIds) {
  const res = await fetch(`${API_BASE}/tables/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_ids: tableIds })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al fusionar mesas');
  }
  return res.json();
}

export async function unmergeTables(tableIds) {
  const res = await fetch(`${API_BASE}/tables/unmerge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_ids: tableIds })
  });
  if (!res.ok) throw new Error('Error al separar mesas');
  return res.json();
}

export async function updateTablePosition(tableId, posX, posY) {
  const res = await fetch(`${API_BASE}/tables/${tableId}/position`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pos_x: posX, pos_y: posY })
  });
  if (!res.ok) throw new Error('Error al actualizar posición de la mesa');
  return res.json();
}

export async function updateTableStatus(tableId, status) {
  const res = await fetch(`${API_BASE}/tables/${tableId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Error al actualizar estado de la mesa');
  return res.json();
}

export async function createReservation(data) {
  const res = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al procesar reservación');
  }
  return res.json();
}

export async function fetchLatestTicket() {
  const res = await fetch(`${API_BASE}/reservations/latest-ticket`);
  if (!res.ok) throw new Error('No hay tickets disponibles para reimpresión');
  return res.json();
}

export async function fetchAnalytics(startDate, endDate) {
  let url = `${API_BASE}/analytics`;
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (params.toString()) url += `?${params.toString()}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener datos de analítica');
  return res.json();
}
