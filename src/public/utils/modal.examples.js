/**
 * Modal Examples - Ready-to-use modal functions for ELLA Room Booking System
 * These functions provide pre-configured modals for common operations.
 */

import { createFormModal } from './modal.js';
import API from '../api/api.js';
import { showSuccess, showError } from './toast.js';
import { translateError } from './translator.utils.js';

// ============================================
// Create User Modal
// ============================================
export function openCreateUserModal(onSuccess) {
  const modal = createFormModal({
    title: 'Skapa ny användare',
    description: 'Fyll i information om den nya användaren',
    maxWidth: '500px',
    fields: [
      {
        id: 'userName',
        name: 'name',
        label: 'Namn',
        type: 'text',
        required: true,
        placeholder: 'Förnamn Efternamn'
      },
      {
        id: 'userEmail',
        name: 'email',
        label: 'E-post',
        type: 'email',
        required: true,
        placeholder: 'namn@example.com'
      },
      {
        id: 'userPassword',
        name: 'password',
        label: 'Lösenord',
        type: 'password',
        required: true,
        placeholder: 'Minst 6 tecken'
      },
      {
        id: 'userRole',
        name: 'role',
        label: 'Roll',
        type: 'select',
        required: true,
        options: [
          { value: '', label: '-- Välj roll --' },
          { value: 'student', label: 'Student' },
          { value: 'teacher', label: 'Lärare' },
          { value: 'admin', label: 'Admin' }
        ]
      }
    ],
    submitText: 'Skapa',
    cancelText: 'Avbryt',
    onSubmit: async (data, modalInstance) => {
      try {
        if (data.password.length < 6) {
          showError('Lösenordet måste vara minst 6 tecken');
          modalInstance.nudge();
          return false; // Keep modal open
        }

        const userData = {
          display_name: data.name,
          email: data.email,
          password: data.password,
          role: data.role
        };

        await API.createUser(userData);
        showSuccess(`Användare ${data.name} skapad!`);

        if (onSuccess) onSuccess();
        return true; // Close modal
      } catch (error) {
        console.error('Failed to create user:', error);
        showError(`Kunde inte skapa användare: ${translateError(error.message)}`);
        return false; // Keep modal open
      }
    }
  });

  return modal;
}

// ============================================
// Edit User Modal
// ============================================
export async function openEditUserModal(userId, onSuccess) {
  try {
    const user = await API.getUserById(userId);

    const modal = createFormModal({
      title: 'Redigera användare',
      description: `Uppdatera information för ${user.display_name}`,
      maxWidth: '500px',
      fields: [
        {
          id: 'userName',
          name: 'name',
          label: 'Namn',
          type: 'text',
          required: true,
          value: user.display_name || user.name || ''
        },
        {
          id: 'userEmail',
          name: 'email',
          label: 'E-post',
          type: 'email',
          required: true,
          value: user.email || ''
        },
        {
          id: 'userPassword',
          name: 'password',
          label: 'Lösenord',
          type: 'password',
          required: false,
          placeholder: 'Lämna tomt för att behålla'
        },
        {
          id: 'userRole',
          name: 'role',
          label: 'Roll',
          type: 'select',
          required: true,
          value: user.role || '',
          options: [
            { value: '', label: '-- Välj roll --' },
            { value: 'student', label: 'Student' },
            { value: 'teacher', label: 'Lärare' },
            { value: 'admin', label: 'Admin' }
          ]
        }
      ],
      submitText: 'Uppdatera',
      cancelText: 'Avbryt',
      onSubmit: async (data, modalInstance) => {
        try {
          const userData = {
            display_name: data.name,
            email: data.email,
            role: data.role
          };

          // Only include password if provided
          if (data.password && data.password.trim().length > 0) {
            if (data.password.length < 6) {
              showError('Lösenordet måste vara minst 6 tecken');
              modalInstance.nudge();
              return false;
            }
            userData.password = data.password;
          }

          await API.updateUser(userId, userData);
          showSuccess('Användare uppdaterad!');

          if (onSuccess) onSuccess();
          return true;
        } catch (error) {
          console.error('Failed to update user:', error);
          showError(`Kunde inte uppdatera användare: ${translateError(error.message)}`);
          return false;
        }
      }
    });

    return modal;
  } catch (error) {
    console.error('Failed to load user:', error);
    showError('Kunde inte hämta användardata');
  }
}

// ============================================
// Create Room Modal
// ============================================
export function openCreateRoomModal(onSuccess) {
  const modal = createFormModal({
    title: 'Skapa nytt rum',
    description: 'Fyll i information om det nya rummet',
    maxWidth: '550px',
    fields: [
      {
        id: 'roomLocation',
        name: 'location',
        label: 'Rumsnamn',
        type: 'text',
        required: false,
        placeholder: 'Kontor på övervåningen'
      },
      {
        id: 'roomNumber',
        name: 'number',
        label: 'Rumsnummer',
        type: 'text',
        required: true,
        placeholder: 'A101'
      },
      {
        id: 'roomType',
        name: 'type',
        label: 'Typ',
        type: 'select',
        required: true,
        options: [
          { value: '', label: '-- Välj typ --' },
          { value: 'classroom', label: 'Klassrum' },
          { value: 'lab', label: 'Lab' },
          { value: 'publicarea', label: 'Allmän yta' }
        ]
      },
      {
        id: 'roomCapacity',
        name: 'capacity',
        label: 'Kapacitet',
        type: 'number',
        required: true,
        min: '1',
        placeholder: '20'
      },
      {
        id: 'roomAssets',
        name: 'assets',
        label: 'Utrustning i lokalen',
        type: 'text',
        required: false,
        placeholder: 'Projektor, Whiteboard, Datorer'
      },
      {
        id: 'roomFloor',
        name: 'floor',
        label: 'Våning',
        type: 'number',
        required: false,
        placeholder: '1'
      }
    ],
    submitText: 'Skapa rum',
    cancelText: 'Avbryt',
    onSubmit: async (data) => {
      try {
        const roomData = {
          room_number: data.number,
          type: data.type,
          capacity: parseInt(data.capacity) || null,
          location: data.location || null,
          floor_number: data.floor ? parseInt(data.floor) : null
        };

        const newRoom = await API.createRoom(roomData);

        // Add assets if provided
        if (data.assets && newRoom && newRoom.id) {
          const assets = data.assets
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0);

          for (const asset of assets) {
            try {
              await API.createRoomAsset(newRoom.id, asset);
            } catch (err) {
              console.error(`Failed to add asset "${asset}":`, err);
              showError(`Kunde inte lägga till utrustning: ${asset}`);
            }
          }
        }

        showSuccess(`Rum ${roomData.room_number} skapat!`);

        if (onSuccess) onSuccess();
        return true;
      } catch (error) {
        console.error('Failed to create room:', error);
        showError(`Kunde inte skapa rum: ${translateError(error.message)}`);
        return false;
      }
    }
  });

  return modal;
}

// ============================================
// Edit Room Modal
// ============================================
export async function openEditRoomModal(roomId, onSuccess) {
  try {
    const rooms = await API.getRooms(true);
    const room = rooms.find(r => r.id === parseInt(roomId));

    if (!room) {
      showError('Rum hittades inte');
      return;
    }

    // Get existing assets as comma-separated string
    const existingAssets = room.assets ? room.assets.map(a => a.name || a.asset).join(', ') : '';

    const modal = createFormModal({
      title: 'Redigera rum',
      description: `Uppdatera information för rum ${room.room_number}`,
      maxWidth: '550px',
      fields: [
        {
          id: 'roomLocation',
          name: 'location',
          label: 'Rumsnamn',
          type: 'text',
          value: room.location || '',
          placeholder: 'Kontor på övervåningen'
        },
        {
          id: 'roomNumber',
          name: 'number',
          label: 'Rumsnummer',
          type: 'text',
          required: true,
          value: room.room_number || ''
        },
        {
          id: 'roomType',
          name: 'type',
          label: 'Typ',
          type: 'select',
          required: true,
          value: room.type || '',
          options: [
            { value: '', label: '-- Välj typ --' },
            { value: 'classroom', label: 'Klassrum' },
            { value: 'lab', label: 'Lab' },
            { value: 'publicarea', label: 'Allmän yta' }
          ]
        },
        {
          id: 'roomCapacity',
          name: 'capacity',
          label: 'Kapacitet',
          type: 'number',
          required: true,
          min: '1',
          value: room.capacity || ''
        },
        {
          id: 'roomAssets',
          name: 'assets',
          label: 'Utrustning i lokalen',
          type: 'text',
          value: existingAssets,
          placeholder: 'Projektor, Whiteboard, Datorer'
        },
        {
          id: 'roomFloor',
          name: 'floor',
          label: 'Våning',
          type: 'number',
          value: room.floor_number || '',
          placeholder: '1'
        }
      ],
      submitText: 'Uppdatera',
      cancelText: 'Avbryt',
      onSubmit: async (data) => {
        try {
          const roomData = {
            room_number: data.number,
            type: data.type,
            capacity: parseInt(data.capacity) || null,
            location: data.location || null,
            floor_number: data.floor ? parseInt(data.floor) : null
          };

          await API.updateRoom(roomId, roomData);

          // Delete old assets
          if (room.assets) {
            for (const asset of room.assets) {
              try {
                await API.deleteRoomAsset(asset.id);
              } catch (err) {
                console.error('Failed to delete old asset:', err);
              }
            }
          }

          // Add new assets if provided
          if (data.assets) {
            const assets = data.assets
              .split(',')
              .map(a => a.trim())
              .filter(a => a.length > 0);

            for (const asset of assets) {
              try {
                await API.createRoomAsset(roomId, asset);
              } catch (err) {
                console.error(`Failed to add asset "${asset}":`, err);
              }
            }
          }

          showSuccess('Rum uppdaterat!');

          if (onSuccess) onSuccess();
          return true;
        } catch (error) {
          console.error('Failed to update room:', error);
          showError(`Kunde inte uppdatera rum: ${translateError(error.message)}`);
          return false;
        }
      }
    });

    return modal;
  } catch (error) {
    console.error('Failed to load room:', error);
    showError('Kunde inte hämta rumsdata');
  }
}

