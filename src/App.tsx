import React, { useState, useEffect } from 'react';
import { JewelryProduct, ViewMode, AuditRecord } from './types';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import { Navbar } from './components/Navbar';
import { GallerySection } from './components/GallerySection';
import { ProductSpecs } from './components/ProductSpecs';
import { ActionBar } from './components/ActionBar';
import { ProductCatalog } from './components/ProductCatalog';
import { EditProductModal } from './components/EditProductModal';
import { ShareModal } from './components/ShareModal';
import { AuditLogModal } from './components/AuditLogModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { useAdmin } from './contexts/AdminContext';
import {
  subscribeToProducts,
  subscribeToCategories,
  saveProductRemote,
  saveProductsRemote,
  saveCategoriesRemote,
  deleteProductRemote,
  seedIfEmpty,
} from './services/catalogStore';

const DEFAULT_CATEGORIES = ['Кольца', 'Колье и Цепи', 'Серьги', 'Браслеты', 'Жесткие браслеты'];

export default function App() {
  const { isAdmin, adminEmail } = useAdmin();
  const [products, setProducts] = useState<JewelryProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<JewelryProduct | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Connect to the shared Firestore catalog: seed it once if it's brand new,
  // then subscribe so every manager's screen updates in realtime.
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
      (remoteCategories) => setCategories(remoteCategories),
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
      saveCategoriesRemote(updated).catch((e) => setConnectionError(String(e)));
    }
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (!isAdmin) return;
    const updatedCategories = categories.filter((c) => c !== catToDelete);
    setCategories(updatedCategories);
    saveCategoriesRemote(updatedCategories).catch((e) => setConnectionError(String(e)));

    // Reassign products in deleted category to "Другое"
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

  const handleAddAuditRecord = (record: AuditRecord) => {
    if (!isAdmin || !selectedProduct) return;
    const updated = {
      ...selectedProduct,
      lastAudit: record.date,
      status: record.status,
      auditHistory: [record, ...selectedProduct.auditHistory],
    };
    setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? updated : p)));
    saveProductRemote(updated).catch((e) => setConnectionError(String(e)));
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
      <div className="min-h-screen bg-[#fcf8fb] flex items-center justify-center">
        <p className="text-[#1b1b1d]/60">Загрузка каталога…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8fb] text-[#1b1b1d] font-sans antialiased flex flex-col selection:bg-[#735c00]/20">
      {connectionError && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-red-600 text-white text-sm text-center py-2 px-4">
          Проблема с подключением к базе данных: {connectionError}
        </div>
      )}
      {/* Top Header Navbar */}
      <Navbar
        currentView={viewMode}
        onViewChange={setViewMode}
        selectedProduct={selectedProduct ?? null}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenAuditLog={() => setIsAuditModalOpen(true)}
        productCount={products.length}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pt-16 pb-32">
        {viewMode === 'detail' && selectedProduct ? (
          <div className="max-w-screen-xl mx-auto md:px-8 py-4 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Image Gallery */}
              <GallerySection
                images={selectedProduct.images}
                productName={selectedProduct.name}
              />

              {/* Specs & Info */}
              <ProductSpecs
                product={selectedProduct}
                onUpdateNotes={handleUpdateNotes}
                onOpenAuditHistory={() => setIsAuditModalOpen(true)}
              />
            </div>
          </div>
        ) : (
          <ProductCatalog
            products={products}
            categories={categories}
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

      {/* Fixed Action Bar (Only shown on detail view, admins only) */}
      {viewMode === 'detail' && selectedProduct && isAdmin && (
        <ActionBar
          onEditProduct={handleOpenEditProductModal}
          isFavorite={selectedProduct.isFavorite}
          onToggleFavorite={() => handleToggleFavorite(selectedProduct.id)}
        />
      )}

      {/* Modals */}
      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      {selectedProduct && (
        <ShareModal
          product={selectedProduct}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {selectedProduct && (
        <AuditLogModal
          product={selectedProduct}
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          onAddAuditRecord={handleAddAuditRecord}
        />
      )}

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        products={products}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
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
