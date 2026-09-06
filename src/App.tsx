import React, { useState, useEffect } from 'react';
import { JewelryProduct, ViewMode } from './types';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { GallerySection } from './components/GallerySection';
import { ProductSpecs } from './components/ProductSpecs';
import { ActionBar } from './components/ActionBar';
import { CartDrawer } from './components/CartDrawer';
import { ProductCatalog } from './components/ProductCatalog';
import { EditProductModal } from './components/EditProductModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { useAdmin } from './contexts/AdminContext';
import { useLanguage } from './contexts/LanguageContext';
import { useClientFavorites } from './contexts/ClientFavoritesContext';
import {
  subscribeToProducts,
  subscribeToCategories,
  saveProductRemote,
  saveProductsRemote,
  saveCategoriesRemote,
  saveCategoryCoverRemote,
  deleteProductRemote,
  seedIfEmpty,
  type CategoryCovers,
} from './services/catalogStore';

const DEFAULT_CATEGORIES = ['Кольца', 'Колье и Цепи', 'Серьги', 'Браслеты', 'Жесткие браслеты'];

export default function App() {
  const { isAdmin, adminEmail } = useAdmin();
  const { favoriteIds, clearFavorites, toggleFavorite } = useClientFavorites();
  const { t } = useLanguage();
  const [products, setProducts] = useState<JewelryProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [categoryCovers, setCategoryCovers] = useState<CategoryCovers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<JewelryProduct | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    seedIfEmpty(INITIAL_PRODUCTS, DEFAULT_CATEGORIES).catch((e) => {
      if (!cancelled) setConnectionError(String(e));
    });

    const unsubProducts = subscribeToProducts(
      (remoteProducts) => {
        setProducts(remoteProducts);
        setIsLoading(false);
      },
      (e) => setConnectionError(String(e))
    );

    const unsubCategories = subscribeToCategories(
      (data) => {
        setCategories(data.names);
        setCategoryCovers(data.covers);
      },
      DEFAULT_CATEGORIES,
      (e) => setConnectionError(String(e))
    );

    return () => {
      cancelled = true;
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const handleAddCategory = (newCat: string) => {
    if (!isAdmin) return;
    const trimmed = newCat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      saveCategoriesRemote(updated, categoryCovers).catch((e) => setConnectionError(String(e)));
    }
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (!isAdmin) return;
    const updatedCategories = categories.filter((c) => c !== catToDelete);
    const nextCovers = { ...categoryCovers };
    delete nextCovers[catToDelete];
    setCategories(updatedCategories);
    setCategoryCovers(nextCovers);
    saveCategoriesRemote(updatedCategories, nextCovers).catch((e) => setConnectionError(String(e)));

    const affected = products
      .filter((p) => p.category === catToDelete)
      .map((p) => ({ ...p, category: 'Другое' }));
    if (affected.length > 0) {
      setProducts((prev) =>
        prev.map((p) => (p.category === catToDelete ? { ...p, category: 'Другое' } : p))
      );
      saveProductsRemote(affected).catch((e) => setConnectionError(String(e)));
    }
  };

  const handleSetCategoryCover = (categoryName: string, coverSrc: string | null) => {
    if (!isAdmin) return;
    const next = { ...categoryCovers };
    if (coverSrc) next[categoryName] = coverSrc;
    else delete next[categoryName];
    setCategoryCovers(next);
    saveCategoryCoverRemote(categoryName, coverSrc, categories, categoryCovers).catch((e) =>
      setConnectionError(String(e))
    );
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleUpdateNotes = (newNotes: string) => {
    if (!isAdmin || !selectedProduct) return;
    const updated = { ...selectedProduct, internalNotes: newNotes };
    setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? updated : p)));
    saveProductRemote(updated).catch((e) => setConnectionError(String(e)));
  };

  const handleToggleFavorite = (productId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) return;
    const idToToggle = productId || selectedProduct?.id;
    if (!idToToggle) return;
    const target = products.find((p) => p.id === idToToggle);
    if (!target) return;
    const updated = { ...target, isFavorite: !target.isFavorite };
    setProducts((prev) => prev.map((p) => (p.id === idToToggle ? updated : p)));
    saveProductRemote(updated).catch((e2) => setConnectionError(String(e2)));
  };

  const handleSaveProduct = (updatedProduct: JewelryProduct) => {
    if (!isAdmin) return;
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updatedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      }
      return [updatedProduct, ...prev];
    });
    saveProductRemote(updatedProduct).catch((e) => setConnectionError(String(e)));
    setSelectedProductId(updatedProduct.id);
    setViewMode('detail');
  };

  const handleDeleteProduct = (productId: string) => {
    if (!isAdmin) return;
    setProducts((prev) => {
      const remaining = prev.filter((p) => p.id !== productId);
      if (selectedProductId === productId) {
        setSelectedProductId(remaining[0]?.id ?? '');
        setViewMode('catalog');
      }
      return remaining;
    });
    deleteProductRemote(productId).catch((e) => setConnectionError(String(e)));
  };

  const handleOpenNewProductModal = () => {
    if (!isAdmin) return;
    setEditingProduct(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditProductModal = () => {
    if (!isAdmin || !selectedProduct) return;
    setEditingProduct(selectedProduct);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3eb] flex items-center justify-center">
        <p className="brand-mark text-[#9a7b1a] tracking-[0.3em] text-lg">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#1a1a1a] font-sans antialiased flex flex-col selection:bg-[#c9a227]/25">
      {connectionError && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-red-600 text-white text-sm text-center py-2 px-4">
          Проблема с подключением к базе данных: {connectionError}
        </div>
      )}

      <Navbar
        currentView={viewMode}
        onViewChange={setViewMode}
        productCount={products.length}
        cartCount={favoriteIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      <main className={viewMode === 'home' ? 'flex-1 pt-[5.5rem] sm:pt-24 md:pt-28 lg:pt-32' : 'flex-1 pt-[5.5rem] sm:pt-24 md:pt-28 lg:pt-32 pb-24'}>
        {viewMode === 'home' ? (
          <HomePage
            products={products}
            categories={categories}
            categoryCovers={categoryCovers}
            onShopNow={() => setViewMode('catalog')}
            onSelectCategory={(cat) => {
              setPendingCategory(cat);
              setViewMode('catalog');
            }}
            onSelectProduct={(p) => {
              setSelectedProductId(p.id);
              setViewMode('detail');
            }}
          />
        ) : viewMode === 'detail' && selectedProduct ? (
          <div className="max-w-screen-xl mx-auto md:px-8 py-4 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <GallerySection
                images={selectedProduct.images}
                productName={selectedProduct.name}
              />
              <ProductSpecs
                product={selectedProduct}
                onUpdateNotes={handleUpdateNotes}
              />
            </div>
          </div>
        ) : (
          <ProductCatalog
            products={products}
            categories={categories}
            initialCategory={pendingCategory || undefined}
            onSelectProduct={(p) => {
              setSelectedProductId(p.id);
              setViewMode('detail');
            }}
            onAddNewProduct={handleOpenNewProductModal}
            onToggleFavorite={(id, e) => handleToggleFavorite(id, e)}
            onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
          />
        )}
      </main>

      {viewMode === 'detail' && selectedProduct && isAdmin && (
        <ActionBar
          onEditProduct={handleOpenEditProductModal}
          isFavorite={selectedProduct.isFavorite}
          onToggleFavorite={() => handleToggleFavorite(selectedProduct.id)}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        products={products}
        favoriteIds={favoriteIds}
        onClearFavorites={clearFavorites}
        onRemoveFavorite={(id) => {
          if (favoriteIds.includes(id)) toggleFavorite(id);
        }}
        onSelectProduct={(p) => {
          setSelectedProductId(p.id);
          setViewMode('detail');
        }}
      />

      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        covers={categoryCovers}
        products={products}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onSetCategoryCover={handleSetCategoryCover}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        adminEmail={adminEmail}
      />
    </div>
  );
}

