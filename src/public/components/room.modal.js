import API from "../api/api.js";
import { showError, showSuccess } from "../utils/toast.js";

export class RoomModal {
  constructor(modalId, formId, onSuccess) {
    this.modal = document.getElementById(modalId);
    this.form = document. getElementById(formId);
    this.onSuccess = onSuccess; // Callback to reload rooms
    this.editingRoomId = null;

    this.init();
  }

  init() {
    if (! this.modal || !this.form) return;

    // Close button
    const closeBtn = this.modal.querySelector('add-room-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Submit
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  openForCreate() {
    this.editingRoomId = null;
    this.form.reset();
    this.modal.querySelector('h2').textContent = 'Skapa nytt rum';
    this.modal.showModal();
  }

  async openForEdit(roomId) {
    try {
      const rooms = await API.getRooms(true);
      const room = rooms. find(r => r.id === parseInt(roomId));
      
      if (!room) throw new Error('Rum hittades inte');

      this.editingRoomId = roomId;

      // Populate form
      document.getElementById('roomName').value = room.room_number || '';
      document.getElementById('roomType').value = room.type || '';
      document.getElementById('roomCapacity').value = room.capacity || '';
      document.getElementById('roomLocation').value = room.location || '';
      document.getElementById('roomFloor').value = room.floor_number || '';

      this.modal.querySelector('h2').textContent = 'Redigera rum';
      this.modal.showModal();
    } catch (error) {
      console.error(error);
      showError('Kunde inte hämta rumsdata');
    }
  }

  close() {
    this.modal.close();
    this.form.reset();
    this.editingRoomId = null;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.form);

    const roomData = {
      room_number: formData.get('name'),
      type: formData. get('type'),
      capacity: parseInt(formData.get('capacity')) || null,
      location: formData. get('location') || null,
      floor_number: parseInt(formData.get('floor')) || null
    };

    try {
      if (this.editingRoomId) {
        await API.updateRoom(this.editingRoomId, roomData);
        showSuccess('Rum uppdaterat');
      } else {
        await API. createRoom(roomData);
        showSuccess(`Rum ${roomData.room_number} skapat! `);
      }

      this.close();
      if (this.onSuccess) this.onSuccess();
    } catch (error) {
      console.error(error);
      showError(`Operation misslyckades: ${error.message}`);
    }
  }
}