import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.models import TableStatus

# Table Schemas
class TableNodeRead(BaseModel):
    id: int
    label: str
    pos_x: float
    pos_y: float
    capacity: int
    group_id: Optional[uuid.UUID] = None
    orientation: str = "horizontal"
    status: TableStatus
    current_reservation_id: Optional[int] = None
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    total_paid: Optional[float] = None
    party_size: Optional[int] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class TableMergeRequest(BaseModel):
    table_ids: List[int] = Field(..., min_length=1, description="Array of table IDs to group together")

class TableOrientationUpdate(BaseModel):
    orientation: str = Field(..., pattern="^(horizontal|vertical)$")

class TablePositionUpdate(BaseModel):
    pos_x: float
    pos_y: float

class TableStatusUpdate(BaseModel):
    status: TableStatus

# Reservation Schemas
class ReservationCreate(BaseModel):
    customer_name: str
    phone: str
    time_scheduled: Optional[datetime] = None
    party_size: int = 4
    total_paid: float = 500.0
    event_name: Optional[str] = "Noche de Casino VIP"
    table_ids: List[int] = Field(..., min_length=1, description="Tables to reserve under this reservation")
    notes: Optional[str] = None

class TicketPayloadSnapshot(BaseModel):
    ticket_id: str
    group_id: str
    tables: List[str]
    customer_name: str
    phone: str
    time_scheduled: str
    party_size: int
    total_paid: float
    event_name: str
    notes: Optional[str] = None
    printed_at: str

class ReservationResponse(BaseModel):
    reservation_id: int
    group_id: uuid.UUID
    customer_name: str
    phone: str
    time_scheduled: datetime
    party_size: int
    total_paid: float
    event_name: str
    table_ids: List[int]
    table_labels: List[str]
    ticket_payload: TicketPayloadSnapshot

# Analytics Schemas
class AnalyticsSummary(BaseModel):
    total_reservations: int
    active_reservations: int
    table_occupancy_rate: float
    status_breakdown: Dict[str, int]
    hourly_distribution: Dict[str, int]
    recent_tickets: List[Dict[str, Any]]
