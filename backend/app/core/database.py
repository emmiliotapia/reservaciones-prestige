from sqlmodel import SQLModel, create_engine, Session, select
from app.core.config import settings

engine = create_engine(
    settings.sync_database_url,
    echo=False,
    pool_pre_ping=True
)

def get_session():
    with Session(engine) as session:
        yield session

def get_architectural_seed_layout():
    """
    Coordenadas exactas calcadas sobre el plano arquitectónico original del casino
    en escala 590px x 964px (Canvas 2.2x ratio de 268x438).
    18 mesas en diamante con 4 comensales cada una.
    """
    return [
        # Fila 1 (Bajo barra de restaurante): M-1, M-2, M-3, M-4
        {"label": "M-1", "pos_x": 48,  "pos_y": 305, "capacity": 4},
        {"label": "M-2", "pos_x": 195, "pos_y": 305, "capacity": 4},
        {"label": "M-3", "pos_x": 340, "pos_y": 305, "capacity": 4},
        {"label": "M-4", "pos_x": 480, "pos_y": 305, "capacity": 4},

        # Fila 2: M-5, M-6, M-7, M-8
        {"label": "M-5", "pos_x": 48,  "pos_y": 435, "capacity": 4},
        {"label": "M-6", "pos_x": 195, "pos_y": 435, "capacity": 4},
        {"label": "M-7", "pos_x": 340, "pos_y": 435, "capacity": 4},
        {"label": "M-8", "pos_x": 480, "pos_y": 435, "capacity": 4},

        # Fila 3: M-9, M-10, M-11, M-12
        {"label": "M-9",  "pos_x": 48,  "pos_y": 565, "capacity": 4},
        {"label": "M-10", "pos_x": 195, "pos_y": 565, "capacity": 4},
        {"label": "M-11", "pos_x": 340, "pos_y": 565, "capacity": 4},
        {"label": "M-12", "pos_x": 480, "pos_y": 565, "capacity": 4},

        # Fila 4 (Diagonal inferior derecha): M-13
        {"label": "M-13", "pos_x": 460, "pos_y": 680, "capacity": 4},

        # Fila 5 (Frente a sillón VIP y acceso inferior): M-14, M-15
        {"label": "M-14", "pos_x": 220, "pos_y": 750, "capacity": 4},
        {"label": "M-15", "pos_x": 350, "pos_y": 750, "capacity": 4},

        # Mesas reservadas / premium adicionales para completar las 18 mesas:
        {"label": "M-16", "pos_x": 48,  "pos_y": 690, "capacity": 4},
        {"label": "M-17", "pos_x": 195, "pos_y": 680, "capacity": 4},
        {"label": "M-18", "pos_x": 340, "pos_y": 680, "capacity": 4},
    ]

def init_db():
    SQLModel.metadata.create_all(engine)
    from app.models.models import TableNode, TableStatus
    from datetime import datetime
    
    with Session(engine) as session:
        existing = session.exec(select(TableNode)).all()
        if not existing:
            for t_data in get_architectural_seed_layout():
                table = TableNode(
                    label=t_data["label"],
                    pos_x=t_data["pos_x"],
                    pos_y=t_data["pos_y"],
                    capacity=t_data["capacity"],
                    status=TableStatus.DISPONIBLE,
                    updated_at=datetime.utcnow()
                )
                session.add(table)
            session.commit()
