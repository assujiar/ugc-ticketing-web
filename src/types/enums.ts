// Enums matching database schema

export enum TicketType {
  RFQ = "RFQ",
  GEN = "GEN",
}

export enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  PENDING = "pending",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum QuoteStatus {
  DRAFT = "draft",
  SENT = "sent",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export enum CargoCategory {
  DG = "DG",
  GENCO = "Genco",
}

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
}