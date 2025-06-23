"""
ORM models for chatbot deployment schema.

Defines:
- Chatbot: Chatbot related dataset entries.
- 

Use `Base.metadata.create_all(engine)` to initialize tables.
"""
import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, TIMESTAMP, Enum as SQLAlchemyEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class StatusEnum(enum.Enum):
    """
    Enum representing the source or strategy used to generate a question prompt.

    This enum is used to categorize prompts in the Dataset table. It ensures
    consistent labeling of how the question-answer pair was generated or synthesized.

    Members:
        ACTIVE: 
        INACTIVE:
    """
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRAINED = "trained"

class Chatbots(Base):
    """
    Represents metadata of chatbots trained and hosted

    This table stores high-level information about a collection of chatbot history entries
    (e.g., for a specific benchmark, experiment, or version).

    Attributes:
        id (UUID): Primary key indentifier
        name (str): Descriptive name for the chatbot deployed
        description (str): Optional text explaining what the chatbot is for
        deployment_url (str): Link of the chatbot
        created_at (timestamp): When the chatbot was created
        last_trained_at (timestamp): When the chatbot was last trained
        status (enum): Chatbot Status
    """
    __tablename__  = "chatbots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    deployment_url = Column(String, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    last_trained_at = Column(
        TIMESTAMP(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    status = Column(SQLAlchemyEnum(StatusEnum, name="status_enum"), nullable=False)

    def to_dict(self):
        """
        Convert the Chatbot ORM object to a serializable dictionary.

        Returns:
            dict: A dictionary representation of the chatbot instance, including:
                - id (str)
                - name (str)
                - description (str or None)
                - deployment_url (str or None)
                - created_at (str in ISO format or None)
                - last_trained_at (str in ISO format or None)
                - status (str)
        """
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "deployment_url": self.deployment_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_trained_at": self.last_trained_at.isoformat() if self.last_trained_at else None,
            "status": self.status.value
        }
