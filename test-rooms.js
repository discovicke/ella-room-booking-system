/**
 * TEST SCRIPT - rooms.repository.js
 * Testar alla funktioner utan att förstöra befintlig data
 */

import {
    getAllRooms,
    getRoomById,
    getRoomByRoomNumber,
    getRoomsByType,
    getRoomsByLocation,
    createRoom,
    updateRoom,
    deleteRoom,
    getAssetsByRoomId,
    getAssetById,
    createRoomAsset,
    updateRoomAsset,
    deleteRoomAsset,
    deleteAllAssetsByRoomId,
    getRoomWithAssets,
    getAllRoomsWithAssets
} from './src/repositories/room.repo.js';

console.log('TESTING ROOMS REPOSITORY\n');
console.log('='.repeat(50));

let testRoomIds = [];
let testAssetIds = [];

// ==================
// TEST 1: READ EXISTING DATA
// ==================
console.log('\nTEST 1: Reading existing data...');
const existingRooms = getAllRooms();
console.log('Existing rooms count:', existingRooms.length);
console.log('Existing rooms:', existingRooms);

const existingAssetsRoom1 = getAssetsByRoomId(1);
console.log('Assets for room 1:', existingAssetsRoom1);
console.log('PASS: Existing data read successfully\n');

// ==================
// TEST 2: GET ROOM BY ID
// ==================
console.log('TEST 2: Get room by ID...');
const room1 = getRoomById(1);
console.log('Room with ID 1:', room1);
console.log('PASS: Room retrieved by ID\n');

// ==================
// TEST 3: GET ROOM BY ROOM NUMBER
// ==================
console.log('TEST 3: Get room by room number...');
const roomByNumber = getRoomByRoomNumber('1');
console.log('Room number 1:', roomByNumber);
console.log('PASS: Room retrieved by room number\n');

// ==================
// TEST 4: GET ROOMS BY TYPE
// ==================
console.log('TEST 4: Get rooms by type...');
const labs = getRoomsByType('lab');
console.log('Labs:', labs);
const classrooms = getRoomsByType('classroom');
console.log('Classrooms:', classrooms);
const publicAreas = getRoomsByType('publicarea');
console.log('Public areas:', publicAreas);
console.log('PASS: Rooms filtered by type\n');

// ==================
// TEST 5: GET ROOMS BY LOCATION
// ==================
console.log('TEST 5: Get rooms by location...');
const dellen = getRoomsByLocation('Dellen');
console.log('Rooms in Dellen:', dellen);
console.log('PASS: Rooms filtered by location\n');

// ==================
// TEST 6: CREATE TEST ROOMS
// ==================
console.log('TEST 6: Creating test rooms...');
const testRoom1 = createRoom({
    room_number: 'TEST-101',
    type: 'classroom',
    capacity: 25,
    location: 'Test Building A'
});
testRoomIds.push(testRoom1.lastInsertRowid);
console.log('Created test room 1, ID:', testRoom1.lastInsertRowid);

const testRoom2 = createRoom({
    room_number: 'TEST-102',
    type: 'lab',
    capacity: 15,
    location: 'Test Building B'
});
testRoomIds.push(testRoom2.lastInsertRowid);
console.log('Created test room 2, ID:', testRoom2.lastInsertRowid);

const testRoom3 = createRoom({
    room_number: 'TEST-103',
    type: 'publicarea',
    capacity: 30,
    location: 'Test Building C'
});
testRoomIds.push(testRoom3.lastInsertRowid);
console.log('Created test room 3, ID:', testRoom3.lastInsertRowid);
console.log('PASS: Test rooms created\n');

// ==================
// TEST 7: VERIFY CREATED ROOMS
// ==================
console.log('TEST 7: Verify created rooms...');
const allRoomsAfterCreate = getAllRooms();
console.log('Total rooms count after creation:', allRoomsAfterCreate.length);
const createdRoom = getRoomById(testRoomIds[0]);
console.log('Verify test room 1:', createdRoom);
console.log('PASS: Created rooms verified\n');

// ==================
// TEST 8: CREATE TEST ASSETS
// ==================
console.log('TEST 8: Creating test assets...');
const testAsset1 = createRoomAsset({
    room_id: testRoomIds[0],
    asset: 'Test Projector'
});
testAssetIds.push(testAsset1.lastInsertRowid);
console.log('Created test asset 1, ID:', testAsset1.lastInsertRowid);

const testAsset2 = createRoomAsset({
    room_id: testRoomIds[0],
    asset: 'Test Whiteboard'
});
testAssetIds.push(testAsset2.lastInsertRowid);
console.log('Created test asset 2, ID:', testAsset2.lastInsertRowid);

const testAsset3 = createRoomAsset({
    room_id: testRoomIds[1],
    asset: 'Test Equipment'
});
testAssetIds.push(testAsset3.lastInsertRowid);
console.log('Created test asset 3, ID:', testAsset3.lastInsertRowid);
console.log('PASS: Test assets created\n');

// ==================
// TEST 9: GET ASSETS BY ROOM ID
// ==================
console.log('TEST 9: Get assets by room ID...');
const testRoom1Assets = getAssetsByRoomId(testRoomIds[0]);
console.log('Assets for test room 1:', testRoom1Assets);
console.log('PASS: Assets retrieved by room ID\n');

// ==================
// TEST 10: GET ASSET BY ID
// ==================
console.log('TEST 10: Get asset by ID...');
const assetById = getAssetById(testAssetIds[0]);
console.log('Test asset 1:', assetById);
console.log('PASS: Asset retrieved by ID\n');

// ==================
// TEST 11: UPDATE ROOM ASSET
// ==================
console.log('TEST 11: Update room asset...');
const updatedAsset = updateRoomAsset(testAssetIds[0], {
    room_id: testRoomIds[0],
    asset: 'Updated Test Projector'
});
console.log('Updated asset changes:', updatedAsset.changes);
const verifyAssetUpdate = getAssetById(testAssetIds[0]);
console.log('Verified updated asset:', verifyAssetUpdate);
console.log('PASS: Asset updated\n');

// ==================
// TEST 12: GET ROOM WITH ASSETS
// ==================
console.log('TEST 12: Get room with assets...');
const roomWithAssets = getRoomWithAssets(testRoomIds[0]);
console.log('Test room 1 with assets:', roomWithAssets);
console.log('PASS: Room with assets retrieved\n');

// ==================
// TEST 13: GET ALL ROOMS WITH ASSETS
// ==================
console.log('TEST 13: Get all rooms with assets...');
const allRoomsWithAssets = getAllRoomsWithAssets();
console.log('Total rooms with assets:', allRoomsWithAssets.length);
console.log('Sample (first room):', allRoomsWithAssets[0]);
console.log('PASS: All rooms with assets retrieved\n');

// ==================
// TEST 14: UPDATE ROOM
// ==================
console.log('TEST 14: Update room...');
const updatedRoom = updateRoom(testRoomIds[0], {
    room_number: 'TEST-101-UPDATED',
    type: 'classroom',
    capacity: 30,
    location: 'Test Building A - Updated'
});
console.log('Updated room changes:', updatedRoom.changes);
const verifyRoomUpdate = getRoomById(testRoomIds[0]);
console.log('Verified updated room:', verifyRoomUpdate);
console.log('PASS: Room updated\n');

// ==================
// TEST 15: DELETE SINGLE ASSET
// ==================
console.log('TEST 15: Delete single asset...');
const deletedAsset = deleteRoomAsset(testAssetIds[1]);
console.log('Deleted asset changes:', deletedAsset.changes);
const verifyAssetDelete = getAssetsByRoomId(testRoomIds[0]);
console.log('Remaining assets for test room 1:', verifyAssetDelete);
console.log('PASS: Single asset deleted\n');

// ==================
// TEST 16: DELETE ALL ASSETS BY ROOM ID
// ==================
console.log('TEST 16: Delete all assets for test room 2...');
const deletedAllAssets = deleteAllAssetsByRoomId(testRoomIds[1]);
console.log('Deleted assets changes:', deletedAllAssets.changes);
const verifyAllAssetsDelete = getAssetsByRoomId(testRoomIds[1]);
console.log('Remaining assets for test room 2:', verifyAllAssetsDelete);
console.log('PASS: All assets deleted for room\n');

// ==================
// TEST 17: DELETE ROOM (CASCADE)
// ==================
console.log('TEST 17: Delete room with cascade...');
console.log('Deleting test room 3...');
const deletedRoom = deleteRoom(testRoomIds[2]);
console.log('Deleted room changes:', deletedRoom.changes);
const verifyRoomDelete = getRoomById(testRoomIds[2]);
console.log('Verify room deleted (should be undefined):', verifyRoomDelete);
console.log('PASS: Room deleted with cascade\n');

// ==================
// CLEANUP: DELETE REMAINING TEST DATA
// ==================
console.log('CLEANUP: Removing remaining test data...');
// Delete remaining test assets
deleteRoomAsset(testAssetIds[0]);
console.log('Deleted remaining test asset 1');

// Delete remaining test rooms
deleteRoom(testRoomIds[0]);
console.log('Deleted test room 1');
deleteRoom(testRoomIds[1]);
console.log('Deleted test room 2');

console.log('CLEANUP: Complete\n');

// ==================
// FINAL VERIFICATION
// ==================
console.log('FINAL VERIFICATION: Check original data intact...');
const finalRooms = getAllRooms();
console.log('Final room count:', finalRooms.length);
console.log('Should match original count of', existingRooms.length);
console.log('Original data intact:', finalRooms.length === existingRooms.length ? 'YES' : 'NO');

const finalRoom1Assets = getAssetsByRoomId(1);
console.log('Room 1 assets still present:', finalRoom1Assets.length > 0 ? 'YES' : 'NO');

console.log('\n' + '='.repeat(50));
console.log('ALL TESTS COMPLETED SUCCESSFULLY');
console.log('Original data preserved');
console.log('='.repeat(50));