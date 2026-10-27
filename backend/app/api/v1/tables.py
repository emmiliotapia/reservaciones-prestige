import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.models import TableNode, TableStatus
from app.schemas.schemas import TableNodeRead, TableMergeRequest, TablePositionUpdate, TableStatusUpdate, TableOrientationUpdate

router = APIRouter(prefix="/tables", tags=["tables"])

@router.get("", response_model=List[TableNodeRead])
def get_all_tables(session: Session = Depends(get_session)):
    """Retorna el lienzo completo con coordenadas relativas y estados actuales."""
    tables = session.exec(select(TableNode).order_by(TableNode.id)).all()
    return tables

@router.post("/merge", response_model=List[TableNodeRead])
def merge_tables(payload: TableMergeRequest, session: Session = Depends(get_session)):
    """Recibe un array de IDs de mesas y les inyecta un group_id unificado para tratarlas como una sola entidad operativa."""
    if not payload.table_ids:
        raise HTTPException(status_code=400, detail="Debe proporcionar al menos un ID de mesa")
    
    tables = session.exec(select(TableNode).where(TableNode.id.in_(payload.table_ids))).all()
    if len(tables) != len(payload.table_ids):
        raise HTTPException(status_code=404, detail="Una o más mesas especificadas no existen")
    
    # Check for concurrency collision / occupied status
    for t in tables:
        if t.status == TableStatus.OCUPADA:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Conflicto de concurrencia: La mesa {t.label} ya está ocupada por otra operación."
            )

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
        table.group_id = None
        
    table.updated_at = datetime.utcnow()
    session.add(table)
    session.commit()
    session.refresh(table)
    return table
