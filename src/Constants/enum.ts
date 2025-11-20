export enum TicketStatus {
  PENDING = "pending", // ⏳ Chờ admin nhận
  ASSIGNED = "assigned", // ✅ Đã có admin xử lý
  CLOSED = "closed" // 🔒 Đóng ticket
}

export enum MessageType {
  TEXT = "text",
  FILE_TEXT = "file_text"
}
