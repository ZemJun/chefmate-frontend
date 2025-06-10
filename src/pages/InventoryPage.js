// src/pages/InventoryPage.js
import React from 'react';
import UserItemManager from '../components/UserItemManager';
import { getInventory, addInventoryItem, deleteInventoryItem } from '../api/api';

function InventoryPage() {
  return (
    <UserItemManager 
      title="我的食材库存"
      getItems={getInventory}
      addItem={addInventoryItem}
      deleteItem={deleteInventoryItem}
    />
  );
}

export default InventoryPage;