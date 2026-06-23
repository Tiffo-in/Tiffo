import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ImageUpload from '../../components/ImageUpload';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MyTiffinsMenu = ({
  menuTiffins,
  setMenuTiffins,
  menuTiffinsLoading,
  selectedMenuTiffin,
  setSelectedMenuTiffin,
  draftMenuItems,
  newMenuItem,
  setNewMenuItem,
  handleAddDraftItem,
  handleRemoveDraftItem,
  handleSaveMenu,
  menuSaving,
  loadMenuTiffins,
}) => {
  const selectedTiffin = menuTiffins.find((t) => t._id === selectedMenuTiffin);
  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden">
        <div className="bg-gradient-to-r from-neutral-50 to-white px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Menu Manager</h2>
            <p className="text-sm text-neutral-500">
              Add dishes to each of your tiffin listings — customers see these on the detail page.
            </p>
          </div>
          <button
            type="button"
            onClick={loadMenuTiffins}
            className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
          >
            🔄 Refresh
          </button>
        </div>

        {menuTiffinsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-500">Loading your tiffins...</p>
            </div>
          </div>
        ) : menuTiffins.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🍱</div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No tiffins yet</h3>
            <p className="text-neutral-500">
              Create a tiffin listing first from the Partner Dashboard, then come back here to add
              menu items.
            </p>
          </div>
        ) : (
          <div className="p-6">
            {/* Tiffin selector */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-neutral-700 mb-3">
                Select a Tiffin to Edit Menu
              </p>
              <div className="flex flex-wrap gap-3">
                {menuTiffins.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setSelectedMenuTiffin(t._id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      selectedMenuTiffin === t._id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-600 hover:border-primary-300'
                    }`}
                  >
                    <span>🍱</span>
                    <span>{t.title}</span>
                    <span className="text-xs opacity-60 capitalize">({t.mealType})</span>
                    {t.menuItems?.length > 0 && (
                      <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">
                        {t.menuItems.length} items
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedMenuTiffin && (
              <div className="space-y-6">
                {/* Tiffin Cover Poster */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
                  <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    🖼️ Tiffin Cover Poster / Banner
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    Upload a high-quality poster or banner image for this tiffin plan. This will be
                    displayed as the hero banner on the tiffin detail page.
                  </p>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:w-64 h-36 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 relative shrink-0">
                      {selectedTiffin?.images?.[0] ? (
                        <img
                          src={selectedTiffin.images[0]}
                          alt="Tiffin Cover Poster"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex flex-col items-center justify-center">
                          <span className="text-4xl mb-1">🍱</span>
                          <span className="text-xs text-neutral-400">No poster uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <ImageUpload
                        label="Upload Poster Image"
                        value={selectedTiffin?.images?.[0] || ''}
                        onChange={async (url) => {
                          try {
                            const updatedImages = url ? [url] : [];
                            // Update local menuTiffins state
                            setMenuTiffins((prev) =>
                              prev.map((t) =>
                                t._id === selectedMenuTiffin ? { ...t, images: updatedImages } : t
                              )
                            );
                            // Update on the backend
                            await api.put(`/tiffins/${selectedMenuTiffin}`, {
                              images: updatedImages,
                            });
                            toast.success(
                              url ? 'Poster uploaded successfully!' : 'Poster removed successfully!'
                            );
                          } catch (err) {
                            toast.error('Failed to update tiffin poster');
                          }
                        }}
                        context="tiffin"
                      />
                    </div>
                  </div>
                </div>

                {/* Add new item form */}
                <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200">
                  <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5 text-primary-500" />
                    Add a Dish
                  </h3>
                  <form onSubmit={handleAddDraftItem} className="space-y-4">
                    {/* Dish image upload */}
                    <ImageUpload
                      label="Dish Photo"
                      value={newMenuItem.image}
                      onChange={(url) => setNewMenuItem((p) => ({ ...p, image: url }))}
                      context="menu"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                          Dish Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newMenuItem.name}
                          onChange={(e) => setNewMenuItem((p) => ({ ...p, name: e.target.value }))}
                          className="input-field"
                          placeholder="Dal Tadka, Roti, Salad…"
                        />
                      </div>
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                          Category
                        </label>
                        <select
                          value={newMenuItem.category}
                          onChange={(e) =>
                            setNewMenuItem((p) => ({ ...p, category: e.target.value }))
                          }
                          className="input-field"
                        >
                          <option value="main">Main Course</option>
                          <option value="side">Side Dish</option>
                          <option value="bread">Bread / Roti</option>
                          <option value="rice">Rice</option>
                          <option value="dal">Dal / Curry</option>
                          <option value="vegetable">Vegetable</option>
                          <option value="pickle">Pickle / Chutney</option>
                          <option value="sweet">Sweet / Dessert</option>
                          <option value="beverage">Beverage</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                          Description (optional)
                        </label>
                        <input
                          type="text"
                          value={newMenuItem.description}
                          onChange={(e) =>
                            setNewMenuItem((p) => ({ ...p, description: e.target.value }))
                          }
                          className="input-field"
                          placeholder="Short description shown to customers"
                        />
                      </div>
                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                          Tags (comma-separated, optional)
                        </label>
                        <input
                          type="text"
                          value={newMenuItem.tags}
                          onChange={(e) => setNewMenuItem((p) => ({ ...p, tags: e.target.value }))}
                          className="input-field"
                          placeholder="veg, protein, spicy"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="btn-primary flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" /> Add Dish
                    </motion.button>
                  </form>
                </div>

                {/* Draft items list */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <h3 className="font-bold text-neutral-900">
                      Menu Items
                      <span className="ml-2 text-sm font-normal text-neutral-500">
                        ({draftMenuItems.length} items)
                      </span>
                    </h3>
                    <div className="flex items-center gap-3">
                      {draftMenuItems.length > 0 && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                          ⚠️ Unsaved changes — click Save
                        </span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleSaveMenu}
                        disabled={menuSaving}
                        className="btn-primary py-2 px-4 text-sm disabled:opacity-60"
                      >
                        {menuSaving ? '⏳ Saving…' : '💾 Save Menu'}
                      </motion.button>
                    </div>
                  </div>

                  {draftMenuItems.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400">
                      <div className="text-5xl mb-3">🍽️</div>
                      <p className="font-medium">No items yet</p>
                      <p className="text-sm mt-1">Use the form above to add dishes</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {draftMenuItems.map((item, idx) => (
                        <motion.div
                          key={idx}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 p-4 hover:bg-neutral-50 transition-colors"
                        >
                          {/* Dish image or placeholder */}
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-2xl">🍽️</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-neutral-900">{item.name}</span>
                              <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full capitalize">
                                {item.category}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-neutral-500 mt-0.5 truncate">
                                {item.description}
                              </p>
                            )}
                            {item.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.map((tag, ti) => (
                                  <span
                                    key={ti}
                                    className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => handleRemoveDraftItem(idx)}
                            className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Save footer */}
                  {draftMenuItems.length > 0 && (
                    <div className="px-5 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleSaveMenu}
                        disabled={menuSaving}
                        className="btn-primary disabled:opacity-60"
                      >
                        {menuSaving
                          ? '⏳ Saving…'
                          : `💾 Save ${draftMenuItems.length} item${draftMenuItems.length !== 1 ? 's' : ''} to Database`}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyTiffinsMenu;
