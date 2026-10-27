from enum import Enum
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import NaiveDatetime
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSONB

class TableStatus(str, Enum):
    DISPONIBLE = "disponible"
    RESERVADA = "reservada"
    OCUPADA = "ocupada"
    LIMPIEZA = "limpieza"

class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False)
    price_per_person: float = Field(default=500.0) # Precio por persona
    event_date: str = Field(default="2026-11-15") # Fecha del evento YYYY-MM-DD
    event_time: Optional[str] = Field(default="20:00") # Hora del evento HH:MM
    active: bool = Field(default=True)
    created_at: NaiveDatetime = Field(default_factory=datetime.utcnow)

class TableNode(SQLModel, table=True):
    __tablename__ = "table_nodes"

    id: Optional[int] = Field(default=None, primary_key=True)
    label: str = Field(index=True, unique=True, nullable=False) # e.g. M-1 to M-18
    pos_x: float = Field(default=0.0)
    pos_y: float = Field(default=0.0)
    capacity: int = Field(default=4)
    group_id: Optional[uuid.UUID] = Field(default=None, index=True) # UUID for logical clustering
    orientation: str = Field(default="horizontal") # horizontal | vertical for merged tables
    status: TableStatus = Field(default=TableStatus.DISPONIBLE, index=True)
    current_reservation_id: Optional[int] = Field(default=None, index=True)
    updated_at: NaiveDatetime = Field(default_factory=datetime.utcnow)

class Reservation(SQLModel, table=True):
    __tablename__ = "reservations"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_name: str = Field(index=True, nullable=False)
    phone: str = Field(nullable=False)
    time_scheduled: NaiveDatetime = Field(index=True, nullable=False)
    party_size: int = Field(default=4)
    price_per_person: float = Field(default=500.0)
    total_paid: float = Field(default=2000.0) # party_size * price_per_person
    event_id: Optional[int] = Field(default=None, index=True)
    event_name: Optional[str] = Field(default="Torneo Blackjack & Lounge")
    group_id: uuid.UUID = Field(index=True, nullable=False) # Maps to one or multiple tables
    notes: Optional[str] = None
    created_at: NaiveDatetime = Field(default_factory=datetime.utcnow)
    active: bool = Field(default=True)

class TicketLog(SQLModel, table=True):
    __tablename__ = "tickets_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    reservation_id: int = Field(index=True, nullable=False)
    created_at: NaiveDatetime = Field(default_factory=datetime.utcnow)
    payload_snapshot: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
