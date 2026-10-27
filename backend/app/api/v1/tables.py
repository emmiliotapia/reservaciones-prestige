import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.models import TableNode, TableStatus
from app.schemas.schemas import TableNodeRead, TableMergeRequest, TablePositionUpdate, TableStatusUpdate, TableOrientationUpdate

router = APIRouter(prefix="/tables", tags=["tables"])

@router.get("", response_model=List[TableNodeRead])
def get_all_tables(
    event_id: Optional[int] = None,
    event_name: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Retorna el lienzo completo con coordenadas relativas, estados y clientes de reservaciones activas para el evento solicitado."""
    from app.models.models import Reservation
    tables = session.exec(select(TableNode).order_by(TableNode.id)).all()
    
    # Obtener mapa de reservaciones activas (filtrado opcional por evento)
    stmt = select(Reservation).where(Reservation.active == True)
    if event_id is not None:
        stmt = stmt.where(Reservation.event_id == event_id)
    elif event_name:
        stmt = stmt.where(Reservation.event_name == event_name)
        
    active_reservations = session.exec(stmt).all()
    res_by_id = {r.id: r for r in active_reservations}
    res_by_group = {r.group_id: r for r in active_reservations if r.group_id}

    results = []
    for t in tables:
        t_dict = t.dict()
        res = None
        if t.current_reservation_id and t.current_reservation_id in res_by_id:
            res = res_by_id[t.current_reservation_id]
        elif t.group_id and t.group_id in res_by_group:
            res = res_by_group[t.group_id]

        if res:
            t_dict["status"] = t.status
            t_dict["group_id"] = t.group_id
            t_dict["customer_name"] = res.customer_name
            t_dict["phone"] = res.phone
            t_dict["total_paid"] = res.total_paid
            t_dict["party_size"] = res.party_size
            t_dict["event_id"] = res.event_id
            t_dict["event_name"] = res.event_name
        else:
            # Si se está filtrando por evento y no tiene reserva activa en este evento:
            if event_id is not None or event_name is not None:
                t_dict["status"] = TableStatus.DISPONIBLE
            else:
                t_dict["status"] = t.status
            # MANTENER el group_id físico de la mesa para que no se separen
            t_dict["group_id"] = t.group_id
            t_dict["customer_name"] = None
            t_dict["phone"] = None
            t_dict["total_paid"] = None
            t_dict["party_size"] = t.capacity
            t_dict["event_id"] = None
            t_dict["event_name"] = None

        results.append(TableNodeRead(**t_dict))

    return results

@router.post("/merge", response_model=List[TableNodeRead])
def merge_tables(payload: TableMergeRequest, session: Session = Depends(get_session)):
    """Recibe un array de IDs de mesas y les inyecta un group_id unificado para tratarlas como una sola entidad operativa."""
    if not payload.table_ids:
        raise HTTPException(status_code=400, detail="Debe proporcionar al menos un ID de mesa")
    
    tables = session.exec(select(TableNode).where(TableNode.id.in_(payload.table_ids))).all()
    if len(tables) != len(payload.table_ids):
        raise HTTPException(status_code=404, detail="Una o más mesas especificadas no existen")
    
    # Generate unified group_id
    new_group_id = uuid.uuid4()
    for t in tables:
        t.group_id = new_group_id
        t.updated_at = datetime.utcnow()
        session.add(t)
    
    session.commit()
    for t in tables:
        session.refresh(t)
        
    return tables

@router.patch("/{table_id}/orientation", response_model=TableNodeRead)
def update_table_orientation(table_id: int, payload: TableOrientationUpdate, session: Session = Depends(get_session)):
    """Alterna la orientación de la mesa fusionada (horizontal | vertical)."""
    table = session.get(TableNode, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    
    table.orientation = payload.orientation
    table.updated_at = datetime.utcnow()
    session.add(table)

    # Si comparte group_id con otras mesas, sincronizar su orientación
    if table.group_id:
        group_tables = session.exec(select(TableNode).where(TableNode.group_id == table.group_id)).all()
        for gt in group_tables:
            gt.orientation = payload.orientation
            gt.updated_at = datetime.utcnow()
            session.add(gt)

    session.commit()
    session.refresh(table)
    return table

@router.post("/unmerge", response_model=List[TableNodeRead])
def unmerge_tables(payload: TableMergeRequest, session: Session = Depends(get_session)):
    """Separa las mesas seleccionadas eliminando su group_id y restaurando orientación horizontal."""
    tables = session.exec(select(TableNode).where(TableNode.id.in_(payload.table_ids))).all()
    for t in tables:
        t.group_id = None
        t.orientation = "horizontal"
        t.updated_at = datetime.utcnow()
        session.add(t)
    session.commit()
    for t in tables:
        session.refresh(t)
    return tables

@router.patch("/{table_id}/position", response_model=TableNodeRead)
def update_table_position(table_id: int, pos: TablePositionUpdate, session: Session = Depends(get_session)):
    """Permite ajustar interactivamente las coordenadas de una mesa."""
    table = session.get(TableNode, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    table.pos_x = pos.pos_x
    table.pos_y = pos.pos_y
    table.updated_at = datetime.utcnow()
    session.add(table)
    session.commit()
    session.refresh(table)
    return table

@router.patch("/{table_id}/status", response_model=TableNodeRead)
def update_table_status(table_id: int, payload: TableStatusUpdate, session: Session = Depends(get_session)):
    """Actualiza el estado operativo de la mesa (disponible, reservada, ocupada, limpieza)."""
    table = session.get(TableNode, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    
    table.status = payload.status
    if payload.status == TableStatus.DISPONIBLE:
        table.current_reservation_id = None
        
    table.updated_at = datetime.utcnow()
    session.add(table)
    session.commit()
    session.refresh(table)
    return table
