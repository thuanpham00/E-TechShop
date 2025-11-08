import { v4 as uuidv4 } from "uuid"

export class GuestCartHelper {
  private readonly STORAGE_KEY = "guest_cart_id"

  /**
   * Get hoặc generate guest ID
   */
  getGuestId(): string {
    let guestId = localStorage.getItem(this.STORAGE_KEY)

    if (!guestId) {
      guestId = `guest_${uuidv4()}`
      localStorage.setItem(this.STORAGE_KEY, guestId)
    }

    return guestId
  }

  /**
   * Clear guest ID (sau khi login)
   */
  clearGuestId(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Check if ID is guest
   */
  isGuestId(id: string): boolean {
    return Boolean(id && id.startsWith("guest_"))
  }

  /**
   * Check if guest ID exists in localStorage
   */
  hasGuestId(): boolean {
    return Boolean(localStorage.getItem(this.STORAGE_KEY))
  }
}

export const guestCartHelper = new GuestCartHelper()
