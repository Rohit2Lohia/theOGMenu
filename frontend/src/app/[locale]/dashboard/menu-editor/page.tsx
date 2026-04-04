'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import styles from './page.module.css';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import FoodTypeIcon, { FoodType } from '@/components/FoodTypeIcon';
import FoodTypeSelect from '@/components/FoodTypeSelect';

export default function MenuEditorPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<string, any[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [error, setError] = useState('');

  const [newMenuName, setNewMenuName] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  const [newCatName, setNewCatName] = useState('');
  const [activeNewItemCat, setActiveNewItemCat] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', desc: '', type: 'veg' });

  // Editing State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Modal State for Deletions
  const [modal, setModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const token = getAccessToken();
    if (!token) return;

    try {
      setLoading(true);
      // 1. Get or Create Restaurant
      let rests = await api.getMyRestaurants(token);
      let activeRest = rests[0];
      if (!activeRest) {
        activeRest = await api.createRestaurant(token, {
          name: 'My Demo Restaurant',
          slug: 'demo-rest-' + Math.floor(Math.random() * 1000)
        });
      }
      setRestaurant(activeRest);

      // 2. Get Menus
      let fetchedMenus = await api.getMenus(token, activeRest.id);
      if (fetchedMenus.length === 0) {
        const firstMenu = await api.createMenu(token, activeRest.id, {
          name: 'Main Menu',
          is_default: true,
          is_active: true
        });
        fetchedMenus = [firstMenu];
      }
      setMenus(fetchedMenus);

      // 3. Set Active Menu
      const defaultMenu = fetchedMenus.find(m => m.is_default) || fetchedMenus[0];
      setActiveMenuId(defaultMenu.id);
      
      // 4. Load Active Menu Content
      await loadMenuContent(token, defaultMenu.id);

    } catch (err: any) {
      setError(err.message || 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  }

  async function loadMenuContent(token: string, menuId: string) {
    try {
      setLoadingMenu(true);
      
      // Load Categories
      let cats = await api.getCategories(token, menuId);
      setCategories(cats);

      // Load items for each category
      let itemsObj: Record<string, any[]> = {};
      for (const cat of cats) {
        const catItems = await api.getItems(token, cat.id);
        itemsObj[cat.id] = catItems;
      }
      setItemsMap(itemsObj);
    } catch (err: any) {
      alert('Failed to load menu content: ' + err.message);
    } finally {
      setLoadingMenu(false);
    }
  }

  async function handleSwitchMenu(menuId: string) {
    if (menuId === activeMenuId) return;
    const token = getAccessToken();
    if (!token) return;
    
    setActiveMenuId(menuId);
    await loadMenuContent(token, menuId);
  }

  async function handleAddMenu(e: React.FormEvent) {
    e.preventDefault();
    if (!newMenuName.trim() || !restaurant) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      const created = await api.createMenu(token, restaurant.id, { name: newMenuName.trim() });
      setMenus([...menus, created]);
      setNewMenuName('');
      setShowAddMenu(false);
      
      // Automatically switch to the new menu
      setActiveMenuId(created.id);
      await loadMenuContent(token, created.id);
      setToast({ message: `Menu "${created.name}" created!`, type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Failed to create menu: ' + err.message, type: 'error' });
    }
  }

  async function handleDeleteMenu() {
    if (!activeMenuId || menus.length <= 1) {
      setToast({ message: "Cannot delete the only menu.", type: 'info' });
      return;
    }
    
    setModal({
      isOpen: true,
      title: 'Delete Menu?',
      message: 'Are you sure you want to delete this entire menu? All categories and items within it will be permanently removed.',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) return;
        try {
          await api.deleteMenu(token, activeMenuId);
          const remainingMenus = menus.filter(m => m.id !== activeMenuId);
          setMenus(remainingMenus);
          
          const nextMenu = remainingMenus[0];
          setActiveMenuId(nextMenu.id);
          await loadMenuContent(token, nextMenu.id);
          setToast({ message: 'Menu deleted successfully', type: 'success' });
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          setToast({ message: 'Failed to delete menu: ' + err.message, type: 'error' });
          setModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim() || !activeMenuId) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      const newCat = await api.createCategory(token, activeMenuId, { name: newCatName });
      setCategories([...categories, newCat]);
      setItemsMap({ ...itemsMap, [newCat.id]: [] });
      setNewCatName('');
      setToast({ message: `Category "${newCat.name}" added!`, type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Failed to add category: ' + err.message, type: 'error' });
    }
  }

  async function handleUpdateCategory(e: React.FormEvent, catId: string) {
    e.preventDefault();
    if (!editingCatName.trim()) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      const updated = await api.updateCategory(token, catId, { name: editingCatName.trim() });
      setCategories(categories.map(c => c.id === catId ? updated : c));
      setEditingCatId(null);
      setToast({ message: 'Category updated!', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Failed to update category: ' + err.message, type: 'error' });
    }
  }

  async function handleDeleteCategory(catId: string) {
    setModal({
      isOpen: true,
      title: 'Delete Category?',
      message: 'Are you sure you want to delete this category and all items inside it? This action cannot be undone.',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) return;
        try {
          await api.deleteCategory(token, catId);
          setCategories(categories.filter(c => c.id !== catId));
          const newItemsMap = { ...itemsMap };
          delete newItemsMap[catId];
          setItemsMap(newItemsMap);
          setToast({ message: 'Category deleted', type: 'success' });
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          setToast({ message: 'Failed to delete category: ' + err.message, type: 'error' });
          setModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  }

  async function handleAddItem(e: React.FormEvent, catId: string) {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.price) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      const added = await api.createItem(token, catId, {
        name: newItem.name,
        price: parseFloat(newItem.price),
        description: newItem.desc,
        food_type: newItem.type,
        is_available: true
      });
      setItemsMap({ ...itemsMap, [catId]: [...(itemsMap[catId] || []), added] });
      setActiveNewItemCat(null);
      setNewItem({ name: '', price: '', desc: '', type: 'veg' });
      setToast({ message: `Item "${added.name}" added!`, type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Failed to add item: ' + err.message, type: 'error' });
    }
  }

  async function handleUpdateItem(e: React.FormEvent, catId: string) {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.price || !editingItemId) return;
    const token = getAccessToken();
    if (!token) return;

    try {
      const updated = await api.updateItem(token, editingItemId, {
        name: newItem.name,
        price: parseFloat(newItem.price),
        description: newItem.desc,
        food_type: newItem.type
      });
      setItemsMap({
        ...itemsMap,
        [catId]: itemsMap[catId].map(i => i.id === editingItemId ? updated : i)
      });
      setEditingItemId(null);
      setNewItem({ name: '', price: '', desc: '', type: 'veg' });
      setToast({ message: `Item "${updated.name}" updated!`, type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Failed to update item: ' + err.message, type: 'error' });
    }
  }

  async function handleDeleteItem(itemId: string, catId: string) {
    setModal({
      isOpen: true,
      title: 'Delete Item?',
      message: 'Are you sure you want to delete this menu item? This action cannot be undone.',
      onConfirm: async () => {
        const token = getAccessToken();
        if (!token) return;
        try {
          await api.deleteItem(token, itemId);
          setItemsMap({
            ...itemsMap,
            [catId]: itemsMap[catId].filter(i => i.id !== itemId)
          });
          setToast({ message: 'Item deleted', type: 'success' });
          setModal(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          setToast({ message: 'Failed to delete item: ' + err.message, type: 'error' });
          setModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  }

  function startEditItem(item: any, catId: string) {
    // Note: We no longer set activeNewItemCat for editing, as it is now inline
    setEditingItemId(item.id);
    setNewItem({
      name: item.name,
      price: item.price.toString(),
      desc: item.description || '',
      type: item.food_type
    });
  }

  async function handleToggle(itemId: string, catId: string) {
    const token = getAccessToken();
    if (!token) return;
    try {
      const updated = await api.toggleItemAvailability(token, itemId);
      setItemsMap({
        ...itemsMap,
        [catId]: itemsMap[catId].map(i => i.id === itemId ? updated : i)
      });
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading menu data...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  const currentMenu = menus.find(m => m.id === activeMenuId);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Menu Switcher Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginRight: '1rem' }}>Menus:</h2>
        {menus.map(m => (
          <button
            key={m.id}
            onClick={() => handleSwitchMenu(m.id)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: m.id === activeMenuId ? 'var(--color-primary)' : 'var(--color-gray-100)',
              color: m.id === activeMenuId ? 'var(--color-white)' : 'var(--color-gray-700)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: m.id === activeMenuId ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            {m.name} {m.is_default && '⭐'}
          </button>
        ))}
        <button 
          onClick={() => setShowAddMenu(true)} 
          className="btn btn-outline btn-sm" 
          style={{ borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}
        >
          ➕ New Menu
        </button>
      </div>

      {showAddMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <form onSubmit={handleAddMenu} className="card" style={{ padding: '2rem', width: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Menu</h3>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. Lunch Menu, Special Occasion..." 
              value={newMenuName} 
              onChange={e => setNewMenuName(e.target.value)}
              autoFocus
              required 
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Menu</button>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddMenu(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loadingMenu ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--color-gray-500)' }}>Loading categories & items...</p>
        </div>
      ) : (
        <>
          <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
                {currentMenu?.name} 
                {currentMenu?.is_default && <span style={{ fontSize: 'var(--text-sm)', marginLeft: '1rem', fontWeight: 500, color: 'var(--color-primary)', background: 'var(--color-primary-50)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>Linked to QR</span>}
              </h1>
              <p style={{ color: 'var(--color-gray-500)' }}>Manage your categories and menu items below.</p>
            </div>
            {menus.length > 1 && (
              <button onClick={handleDeleteMenu} className="btn btn-outline btn-sm" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-200)' }}>
                🗑️ Delete Menu
              </button>
            )}
          </header>

          {/* Categories List */}
          <div className="categories-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {categories.map(cat => (
              <div key={cat.id} className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
                <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1rem', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: '0.5rem', color: 'var(--color-gray-800)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {editingCatId === cat.id ? (
                    <form onSubmit={(e) => handleUpdateCategory(e, cat.id)} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                      <input 
                        type="text" 
                        className="input sm" 
                        value={editingCatName} 
                        onChange={e => setEditingCatName(e.target.value)} 
                        autoFocus 
                        style={{ height: '2.5rem' }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm">Save</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingCatId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {cat.name}
                        <button 
                          onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-gray-400)', padding: '0.2rem' }}
                          title="Rename Category"
                        >
                          ✏️
                        </button>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--color-gray-300)', transition: 'color 0.2s' }}
                        onMouseOver={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                        onMouseOut={e => (e.currentTarget.style.color = 'var(--color-gray-300)')}
                        title="Delete Category"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </h2>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                  {itemsMap[cat.id]?.length === 0 ? (
                    <p style={{ color: 'var(--color-gray-400)', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}>No items in this category yet.</p>
                  ) : (
                    itemsMap[cat.id]?.map(item => (
                      editingItemId === item.id ? (
                        /* Inline Edit Form */
                        <form 
                          key={item.id}
                          onSubmit={(e) => handleUpdateItem(e, cat.id)} 
                          className="card" 
                          style={{ padding: '1.25rem', background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)' }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <input type="text" className="input sm" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                            <input type="number" className="input sm" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <FoodTypeSelect 
                              value={newItem.type as FoodType} 
                              onChange={(val) => setNewItem({...newItem, type: val})} 
                            />
                            <input type="text" placeholder="Short description..." className="input sm" value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} />
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-primary btn-sm">Update Item</button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEditingItemId(null); setNewItem({ name: '', price: '', desc: '', type: 'veg' }); }}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        /* Standard Item Row */
                        <div key={item.id} className="hover-effect" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)', border: '1px solid transparent', transition: 'all 0.2s' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FoodTypeIcon type={item.food_type} />
                              <strong style={{ fontSize: 'var(--text-base)' }}>{item.name}</strong>
                            </div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginTop: '0.25rem' }}>₹{item.price}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button 
                              onClick={() => handleToggle(item.id, cat.id)}
                              className={`badge ${item.is_available ? 'badge-veg' : 'badge-non-veg'}`}
                              style={{ cursor: 'pointer', border: 'none', padding: '0.5rem 1rem', fontWeight: 600 }}
                            >
                              {item.is_available ? 'Available' : 'Unavailable'}
                            </button>
                            
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button 
                                onClick={() => startEditItem(item, cat.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0.3rem' }}
                                title="Edit Item"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDeleteItem(item.id, cat.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '0.3rem' }}
                                title="Delete Item"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    ))
                  )}
                </div>

                {/* Add Item Form (Only for adding) */}
                {activeNewItemCat === cat.id ? (
                  <form 
                    onSubmit={(e) => handleAddItem(e, cat.id)} 
                    className="card" 
                    style={{ padding: '1.5rem', background: 'var(--color-white)', border: '1px solid var(--color-primary-100)' }}
                  >
                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                      ➕ Add New Item
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '1rem', marginBottom: '1rem' }}>
                      <input type="text" placeholder="Item Name (e.g. Butter Chicken)" className="input" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                      <input type="number" placeholder="₹ Price" className="input" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <FoodTypeSelect 
                        value={newItem.type as FoodType} 
                        onChange={(val) => setNewItem({...newItem, type: val})} 
                      />
                      <input type="text" placeholder="Short description..." className="input" value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn btn-primary">Add Item</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setActiveNewItemCat(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => { setActiveNewItemCat(cat.id); setEditingItemId(null); }}
                    className="btn btn-outline btn-sm" 
                    style={{ color: 'var(--color-primary)', background: 'var(--color-primary-50)', border: 'none' }}
                  >
                    ➕ Add Item to {cat.name}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Category Form */}
          <form onSubmit={handleAddCategory} className="card" style={{ marginTop: '2.5rem', padding: '2rem', border: '1px dashed var(--color-primary-200)', background: 'var(--color-white)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '1.25rem', color: 'var(--color-gray-800)' }}>📁 Add New Category to {currentMenu?.name}</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="e.g. Starters, Main Course, Beverages..." 
                className="input" 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!newCatName.trim()}>Create Category</button>
            </div>
          </form>
        </>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
