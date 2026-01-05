import API from "../api/api.js";
import { showSuccess, showError } from "../utils/toast.js";

export class BookingModal {
  constructor(modalId = "booking-modal", formId = "booking-form") {
    this.modal = document.getElementById(modalId);
    this.form = document.getElementById(formId);
    this.modalContent = this.modal?.querySelector(".modal-content");
    this.closeBtn = this.modal?.querySelector("#modal-close");
    this.roomLabel = document.getElementById("modal-room-label");

    this.currentRoom = null;
    this.currentUser = null;
    this.onBookingSuccess = null; // Callback

    this.init();
  }

  init() {
    if (!this.modal || !this.form) return;

    // Close on X
    this.closeBtn?.addEventListener("click", () => this.close());

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modal.hidden) this.close();
    });

    // Close/Nudge on background click
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        // Optional: Nudge animation if clicking outside
        if (this.modalContent) {
          this.modalContent.classList.remove("nudge");
          void this.modalContent.offsetWidth; // Trigger reflow
          this.modalContent.classList.add("nudge");
          setTimeout(() => this.modalContent.classList.remove("nudge"), 300);
        }
        this.close();
      }
    });

    // Prevent clicks inside content from closing
    this.modalContent?.addEventListener("click", (e) => e.stopPropagation());

    // Handle Submit
    this.form.addEventListener("submit", (e) => this.handleBooking(e));
  }

  setUser(user) {
    this.currentUser = user;
  }

  open(room) {
    this.currentRoom = room;
    if (this.roomLabel) {
      this.roomLabel.textContent = `Rum ${room.room_number || room.number} - ${
        room.location
      }`;
    }

    this.modal.removeAttribute("hidden");
    this.modal.classList.add("open");

    // Pop-in animation
    if (this.modalContent) {
      this.modalContent.classList.remove("pop-in");
      void this.modalContent.offsetWidth;
      this.modalContent.classList.add("pop-in");
      setTimeout(() => this.modalContent.classList.remove("pop-in"), 350);
    }
  }

  close() {
    this.modal.setAttribute("hidden", "");
    this.modal.classList.remove("open");
    this.form.reset();
    this.currentRoom = null;
  }

  async handleBooking(event) {
    event.preventDefault();
    if (!this.currentRoom || !this.currentUser) {
      showError("Du måste vara inloggad för att boka.");
      return;
    }

    const formData = new FormData(this.form);
    const bookingData = {
      room_id: this.currentRoom.id,
      user_id: this.currentUser.id,
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time"),
      notes: formData.get("notes"),
    };

    if (!bookingData.start_time || !bookingData.end_time) {
      showError("Vänligen fyll i tiderna.");
      return;
    }

    try {
      await API.createBooking(bookingData);
      showSuccess(
        `Bokat rum ${this.currentRoom.room_number || this.currentRoom.number}!`
      );
      this.close();

      if (this.onBookingSuccess) {
        this.onBookingSuccess();
      }
    } catch (err) {
      console.error(err);
      showError(err.message || "Bokning misslyckades");
    }
  }
}
