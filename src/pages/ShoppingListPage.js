// src/pages/ShoppingListPage.js
import React from 'react';
import UserItemManager from '../components/UserItemManager';
import { getShoppingList, addShoppingListItem, deleteShoppingListItem, updateShoppingListItem } from '../api/api';

function ShoppingListPage() {
  return (
    <UserItemManager 
      title="我的购物清单"
      getItems={getShoppingList}
      addItem={addShoppingListItem}
      deleteItem={deleteShoppingListItem}
      updateItem={updateShoppingListItem}
      showPurchaseStatus={true}
    />
  );
}

export default ShoppingListPage;