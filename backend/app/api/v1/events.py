from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.models import Event
from app.schemas.schemas import EventCreate, EventRead

router = APIRouter(prefix="/events", tags=["events"])

@router.get("", response_model=List[EventRead])
def get_all_events(session: Session = Depends(get_session)):
    """Obtiene todos los eventos activos de la base de datos."""
    events = session.exec(select(Event).where(Event.active == True).order_by(Event.id.desc())).all()
    # Si la base de datos no tiene eventos aún, inicializar "Día Prestige"
    if not events:
        prestige = Event(
            name="Día Prestige",
            price_per_person=500.0,
            event_date="2026-11-15",
            event_time="20:00",
            active=True,
            created_at=datetime.utcnow()
        )
        session.add(prestige)
        session.commit()
        session.refresh(prestige)
        return [prestige]
    return events

@router.post("", response_model=EventRead)
def create_event(payload: EventCreate, session: Session = Depends(get_session)):
    """Registra un nuevo evento en PostgreSQL."""
    event = Event(
        name=payload.name,
        price_per_person=payload.price_per_person,
        event_date=payload.event_date,
        event_time=payload.event_time or "20:00",
        active=True,
        created_at=datetime.utcnow()
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event

@router.delete("/{event_id}")
def delete_event(event_id: int, session: Session = Depends(get_session)):
    """Desactiva o elimina un evento de la base de datos."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    event.active = False
    session.add(event)
    session.commit()
    return {"message": "Evento eliminado correctamente", "id": event_id}
