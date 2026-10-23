from datetime import datetime, timedelta
from typing import Optional, Dict
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func
from app.core.database import get_session
from app.models.models import TableNode, TableStatus, Reservation, TicketLog
from app.schemas.schemas import AnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("", response_model=AnalyticsSummary)
def get_analytics(
    start_date: Optional[datetime] = Query(None, description="Fecha de inicio para el análisis"),
    end_date: Optional[datetime] = Query(None, description="Fecha de fin para el análisis"),
    session: Session = Depends(get_session)
):
    """
    Endpoint de filtrado por rango de fechas para generar reportes de ocupación,
    tiempos muertos y cortes operativos del evento.
    """
    now = datetime.utcnow()
    if not start_date:
        start_date = now - timedelta(days=7)
    if not end_date:
        end_date = now + timedelta(days=1)

    # 1. Tables occupancy
    tables = session.exec(select(TableNode)).all()
    total_tables = len(tables) if tables else 18
    status_breakdown: Dict[str, int] = {
        TableStatus.DISPONIBLE.value: 0,
        TableStatus.RESERVADA.value: 0,
        TableStatus.OCUPADA.value: 0,
        TableStatus.LIMPIEZA.value: 0
    }
    occupied_count = 0
    for t in tables:
        status_breakdown[t.status.value] = status_breakdown.get(t.status.value, 0) + 1
        if t.status in [TableStatus.RESERVADA, TableStatus.OCUPADA]:
            occupied_count += 1

    occupancy_rate = round((occupied_count / total_tables) * 100, 2) if total_tables > 0 else 0.0

    # 2. Reservations within date range
    reservations = session.exec(
        select(Reservation).where(
            Reservation.time_scheduled >= start_date,
            Reservation.time_scheduled <= end_date
        )
    ).all()

    total_reservations = len(reservations)
    active_reservations = sum(1 for r in reservations if r.active)

    # Hourly distribution
    hourly_distribution: Dict[str, int] = {}
    for r in reservations:
        hour_key = f"{r.time_scheduled.hour:02d}:00"
        hourly_distribution[hour_key] = hourly_distribution.get(hour_key, 0) + 1

    # 3. Recent tickets log
    recent_tickets_entities = session.exec(
        select(TicketLog).order_by(TicketLog.id.desc()).limit(10)
    ).all()
    recent_tickets = [t.payload_snapshot for t in recent_tickets_entities if t.payload_snapshot]

    return AnalyticsSummary(
        total_reservations=total_reservations,
        active_reservations=active_reservations,
        table_occupancy_rate=occupancy_rate,
        status_breakdown=status_breakdown,
        hourly_distribution=hourly_distribution,
        recent_tickets=recent_tickets
    )
