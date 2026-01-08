import API from "../api/api.js";
import { showError, showSuccess } from "../utils/toast.js";

export class RoomModal {
  constructor(modalId, formId, onSuccess) {
    this.modal = document.getElementById(modalId);
    this.form = document.getElementById(formId);
    this.modalContent = this.modal?.querySelector('.modal-content');
    this.onSuccess = onSuccess; // Callback to reload rooms
    this.editingRoomId = null;

    this.init();
  }

  init() {
    if (!this.modal || !this.form) return;

    // Close button
    const closeBtn = this.modal.querySelector('.btn-secondary');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.open) this.close();
    });

    // Nudge on background click (prevent accidental close)
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal && this.modalContent) {
        this.nudge();
      }
    });

    // Prevent clicks inside content from closing
    this.modalContent?.addEventListener('click', (e) => e.stopPropagation());

    // Submit
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  nudge() {
    if (!this.modalContent) return;
    this.modalContent.classList.remove('nudge');
    void this.modalContent.offsetWidth;
    this.modalContent.classList.add('nudge');
    setTimeout(() => this.modalContent.classList.remove('nudge'), 300);
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

      this.editingRoomId = Number(roomId);

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
      type: formData.get('type'),
      capacity: parseInt(formData.get('capacity')) || null,
      location: formData.get('location') || null,
      floor_number: parseInt(formData.get('floor')) || null
    };

   // ✅ Extract assets from form (comma-separated string)
    const assetsInput = formData.get('assets');
    const assets = assetsInput 
      ? assetsInput.split(',').map(a => a.trim()).filter(a => a. length > 0)
      : [];

    try {
      let roomId = this.editingRoomId ? Number(this.editingRoomId) : null;

      if (this.editingRoomId) {
        // UPDATE existing room
        await API.updateRoom(this.editingRoomId, roomData);
         const existingRooms = await API.getRooms(true);
      const room = existingRooms.find(r => r.id === roomId);
      
      if (room && room.assets) {
        for (const asset of room.assets) {
          try {
            await API.deleteRoomAsset(asset.id);
          } catch (err) {
            console.error(`Failed to delete old asset: `, err);
          }
        }
      }
      
      showSuccess('Rum uppdaterat');
    } else {
      // CREATE new room
      const newRoom = await API.createRoom(roomData);
      
      if (newRoom && newRoom.id) {
        roomId = newRoom.id;
      }
      
      showSuccess(`Rum ${roomData.location} skapat!`);
    }

      // ✅ Add assets if provided
      if (roomId && assets.length > 0) {
        for (const asset of assets) {
          try {
            await API.createRoomAsset(roomId, asset);
          } catch (err) {
            showError((`Kunde inte lägga till utrustning: ${asset}`));
            console.error(`Failed to add asset "${asset}": `, err);
          }
        }
      }

      this.close();
      if (this.onSuccess) this.onSuccess();
    } catch (error) {
      console.error(error);
      showError(`Operation misslyckades: ${error.message}`);
    }
  }
}