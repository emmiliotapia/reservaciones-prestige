import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.models import TableNode, TableStatus, Reservation, TicketLog
from app.schemas.schemas import ReservationCreate, ReservationResponse, TicketPayloadSnapshot

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("", response_model=ReservationResponse)
def create_reservation(payload: ReservationCreate, session: Session = Depends(get_session)):
    """
    Inserta los datos del cliente, cambia el estado de los nodos afectados a reservado/ocupado
    y retorna el payload estructurado para el ticket de impresión QZ Tray.
    """
    if not payload.table_ids:
        raise HTTPException(status_code=400, detail="Debe especificar al menos una mesa")

    tables = session.exec(select(TableNode).where(TableNode.id.in_(payload.table_ids))).all()
    if len(tables) != len(payload.table_ids):
        raise HTTPException(status_code=404, detail="Una o más mesas no fueron encontradas")

    scheduled_time = payload.time_scheduled or datetime.utcnow()

    # If tables already share a group_id, reuse it; otherwise create a unified group_id
    existing_group_ids = {t.group_id for t in tables if t.group_id is not None}
    if len(existing_group_ids) == 1:
        group_id = existing_group_ids.pop()
    else:
        group_id = uuid.uuid4()

    # Create Reservation record
    reservation = Reservation(
        customer_name=payload.customer_name,
        phone=payload.phone,
        time_scheduled=scheduled_time,
        party_size=payload.party_size,
        total_paid=payload.total_paid,
        event_id=payload.event_id,
        event_name=payload.event_name or "Día Prestige",
        group_id=group_id,
        notes=payload.notes,
        created_at=datetime.utcnow(),
        active=True
    )
    session.add(reservation)
    session.commit()
    session.refresh(reservation)

    # Update TableNodes to ocupada
    table_labels = []
    for t in tables:
        t.status = TableStatus.OCUPADA
        t.group_id = group_id
        t.current_reservation_id = reservation.id
        t.updated_at = datetime.utcnow()
        session.add(t)
        table_labels.append(t.label)
    
    session.commit()

    # Generate Structured Ticket Payload Snapshot
    ticket_snapshot = TicketPayloadSnapshot(
        ticket_id=f"TKT-{reservation.id:05d}",
        group_id=str(group_id),
        tables=table_labels,
        customer_name=payload.customer_name,
        phone=payload.phone,
        time_scheduled=scheduled_time.strftime("%Y-%m-%d %H:%M"),
        party_size=payload.party_size,
        total_paid=payload.total_paid,
        event_name=payload.event_name or "Noche de Casino VIP",
        notes=payload.notes,
        printed_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    )

    # Store in tickets_log for audit and reprints
    ticket_log = TicketLog(
        reservation_id=reservation.id,
        created_at=datetime.utcnow(),
        payload_snapshot=ticket_snapshot.dict()
    )
    session.add(ticket_log)
    session.commit()

    return ReservationResponse(
        reservation_id=reservation.id,
        group_id=group_id,
        customer_name=reservation.customer_name,
        phone=reservation.phone,
        time_scheduled=reservation.time_scheduled,
        party_size=reservation.party_size,
        table_ids=[t.id for t in tables],
        table_labels=table_labels,
        ticket_payload=ticket_snapshot
    )

@router.get("/latest-ticket", response_model=TicketPayloadSnapshot)
def get_latest_ticket(session: Session = Depends(get_session)):
    """Obtiene el último ticket generado para reimpresión manual rápida (Atajo P)."""
    ticket = session.exec(select(TicketLog).order_by(TicketLog.id.desc())).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="No hay tickets registrados")
    return TicketPayloadSnapshot(**ticket.payload_snapshot)

@router.get("", response_model=List[Reservation])
def list_reservations(active_only: bool = True, session: Session = Depends(get_session)):
    stmt = select(Reservation)
    if active_only:
        stmt = stmt.where(Reservation.active == True)
    return session.exec(stmt.order_by(Reservation.time_scheduled.desc())).all()

@router.delete("/{reservation_id}")
def delete_reservation(reservation_id: int, session: Session = Depends(get_session)):
    """Elimina o cancela una reservación registrada y libera las mesas asociadas."""
    res = session.get(Reservation, reservation_id)
    if not res:
        raise HTTPException(status_code=404, detail="Reservación no encontrada")
    
    # Liberar las mesas asociadas a esta reservación
    tables = session.exec(
        select(TableNode).where(
            (TableNode.current_reservation_id == reservation_id) |
            (TableNode.group_id == res.group_id)
        )
    ).all()

    for t in tables:
        t.status = TableStatus.DISPONIBLE
        t.current_reservation_id = None
        t.updated_at = datetime.utcnow()
        session.add(t)

    res.active = False
    session.add(res)
    session.commit()
    return {"message": "Reservación eliminada y mesas liberadas correctamente", "id": reservation_id}
