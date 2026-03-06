"""
BizGen AI - SQLAlchemy Models
Matches Prisma schema exactly for shared SQLite database
"""
from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
import uuid

from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "User"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    avatarUrl = Column(String, nullable=True)
    locale = Column(String, default="fr")
    role = Column(String, default="USER")
    passwordHash = Column(String, nullable=True)
    resetToken = Column(String, nullable=True)
    resetTokenExpires = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    exports = relationship("Export", back_populates="user", cascade="all, delete-orphan")
    chatSessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="user", cascade="all, delete-orphan")
    auditLogs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "Project"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    sector = Column(String, default="AUTRE")
    subSector = Column(String, nullable=True)
    country = Column(String, default="CM")
    status = Column(String, default="DRAFT")
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
    completedAt = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="projects")
    formInputs = relationship("FormInput", back_populates="project", cascade="all, delete-orphan")
    generatedDoc = relationship("GeneratedDocument", back_populates="project", uselist=False, cascade="all, delete-orphan")
    chatSessions = relationship("ChatSession", back_populates="project", cascade="all, delete-orphan")


class FormInput(Base):
    __tablename__ = "FormInput"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    projectId = Column(String, ForeignKey("Project.id", ondelete="CASCADE"), nullable=False)
    stepNumber = Column(Integer, default=1)
    questionKey = Column(String, nullable=False)
    answerValue = Column(Text, nullable=True)
    answerType = Column(String, default="TEXT")
    createdAt = Column(DateTime, server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="formInputs")


class GeneratedDocument(Base):
    __tablename__ = "GeneratedDocument"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    projectId = Column(String, ForeignKey("Project.id", ondelete="CASCADE"), unique=True, nullable=False)
    type = Column(String, default="FULL")
    status = Column(String, default="PENDING")
    version = Column(Integer, default=1)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
    rawContent = Column(Text, nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="generatedDoc")
    canvases = relationship("CanvasData", back_populates="document", cascade="all, delete-orphan")
    exports = relationship("Export", back_populates="document", cascade="all, delete-orphan")


class CanvasData(Base):
    __tablename__ = "CanvasData"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    docId = Column(String, ForeignKey("GeneratedDocument.id", ondelete="CASCADE"), nullable=False)
    canvasType = Column(String, nullable=False)
    blocks = Column(Text, nullable=True)
    rawContent = Column(Text, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    document = relationship("GeneratedDocument", back_populates="canvases")


class Subscription(Base):
    __tablename__ = "Subscription"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), unique=True, nullable=False)
    stripeCustomerId = Column(String, nullable=True, unique=True)
    stripeSubId = Column(String, nullable=True, unique=True)
    status = Column(String, default="INACTIVE")
    plan = Column(String, default="FREE")
    currentPeriodStart = Column(DateTime, nullable=True)
    currentPeriodEnd = Column(DateTime, nullable=True)
    projectsUsed = Column(Integer, default=0)
    exportsUsed = Column(Integer, default=0)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="subscription")


class Export(Base):
    __tablename__ = "Export"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    docId = Column(String, ForeignKey("GeneratedDocument.id", ondelete="CASCADE"), nullable=False)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    format = Column(String, nullable=False)
    fileUrl = Column(String, nullable=True)
    fileSize = Column(Integer, default=0)
    downloadedAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    
    # Relationships
    document = relationship("GeneratedDocument", back_populates="exports")
    user = relationship("User", back_populates="exports")


class ChatSession(Base):
    __tablename__ = "ChatSession"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    projectId = Column(String, ForeignKey("Project.id", ondelete="SET NULL"), nullable=True)
    messages = Column(Text, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chatSessions")
    project = relationship("Project", back_populates="chatSessions")


class Ticket(Base):
    __tablename__ = "Ticket"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String, nullable=False)
    status = Column(String, default="OPEN")
    priority = Column(String, default="MEDIUM")
    messages = Column(Text, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
    resolvedAt = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="tickets")


class AuditLog(Base):
    __tablename__ = "AuditLog"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    userId = Column(String, ForeignKey("User.id", ondelete="SET NULL"), nullable=True)
    action = Column(String, nullable=False)
    entityType = Column(String, nullable=False)
    entityId = Column(String, nullable=False)
    # Use extraData instead of metadata (metadata is reserved in SQLAlchemy)
    extraData = Column("metadata", Text, nullable=True)
    ipAddress = Column(String, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="auditLogs")


class FormTemplate(Base):
    __tablename__ = "FormTemplate"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    sector = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    questions = Column(Text, nullable=True)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Template(Base):
    __tablename__ = "Template"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    type = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    # Use extraData instead of metadata (metadata is reserved in SQLAlchemy)
    extraData = Column("metadata", Text, nullable=True)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())


class SharedDocument(Base):
    __tablename__ = "SharedDocument"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    shareId = Column(String, unique=True, nullable=False)
    docId = Column(String, nullable=False)
    expiresAt = Column(DateTime, nullable=True)
    isPasswordProtected = Column(Boolean, default=False)
    passwordHash = Column(String, nullable=True)
    allowDownload = Column(Boolean, default=True)
    views = Column(Integer, default=0)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Notification(Base):
    __tablename__ = "Notification"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    userId = Column(String, nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    isRead = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())


class AnalyticsEvent(Base):
    __tablename__ = "AnalyticsEvent"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    userId = Column(String, nullable=True)
    eventType = Column(String, nullable=False)
    entity = Column(String, nullable=True)
    entityId = Column(String, nullable=True)
    # Use extraData instead of metadata (metadata is reserved in SQLAlchemy)
    extraData = Column("metadata", Text, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())


class PaymentHistory(Base):
    __tablename__ = "PaymentHistory"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    subscriptionId = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String, default="EUR")
    provider = Column(String, nullable=False)
    providerRef = Column(String, nullable=False)
    status = Column(String, nullable=False)
    createdAt = Column(DateTime, server_default=func.now())
