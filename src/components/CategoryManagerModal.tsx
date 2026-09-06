import React, { useRef, useState } from 'react';
import { JewelryProduct } from '../types';
import { CategoryCovers } from '../services/catalogStore';
import { isVideoSrc } from '../utils/format';
import { readVideoFile, resizeImageFile } from '../utils/media';
import { MediaFrame } from './MediaFrame';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  covers: CategoryCovers;
  products: JewelryProduct[];
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onSetCategoryCover: (categoryName: string, coverSrc: string | null) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  covers,
  products,
  onAddCategory,
  onDeleteCategory,
  onSetCategoryCover,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [busyCat, setBusyCat] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const photoRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const videoRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Категория с таким названием уже существует');
      return;
    }

    onAddCategory(trimmed);
    setNewCategoryName('');
    setErrorMsg('');
  };

  const getProductCount = (categoryName: string) =>
    products.filter((p) => p.category === categoryName).length;

  const handlePhoto = async (cat: string, file: File | undefined) => {
    if (!file) return;
    setMediaError(null);
    setBusyCat(cat);
    try {
      const src = await resizeImageFile(file, 1000, 0.82);
      onSetCategoryCover(cat, src);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyCat(null);
    }
  };

  const handleVideo = async (cat: string, file: File | undefined) => {
    if (!file) return;
    setMediaError(null);
    setBusyCat(cat);
    try {
      const src = await readVideoFile(file);
      onSetCategoryCover(cat, src);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyCat(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#f7f3eb] shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border border-[#c9a227]/30">
        <div className="px-6 py-5 border-b border-[#c9a227]/20 flex justify-between items-center">
          <div>
            <p className="brand-mark text-sm text-[#9a7b1a] tracking-[0.22em]">AiAi Gold</p>
            <h2 className="font-brand text-2xl text-[#1a1a1a] mt-1">Категории</h2>
            <p className="text-xs text-[#6b6356] mt-1">
              Названия, превью-фото или короткое видео (как у Tiffany)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#efe8da] text-[#6b6356]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#6b6356]">
              Новая категория
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Например, Кольца или Серьги..."
                className="flex-1 px-4 py-2.5 bg-white border border-[#c9a227]/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#c9a227]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#9a7b1a] text-white text-xs font-medium uppercase tracking-wider hover:bg-[#7a6214]"
              >
                Создать
              </button>
            </div>
            {errorMsg && <p className="text-xs text-[#ba1a1a]">{errorMsg}</p>}
          </form>

          {mediaError && (
            <p className="text-xs text-[#ba1a1a] bg-[#ba1a1a]/5 px-3 py-2">{mediaError}</p>
          )}

          <div className="space-y-3">
            <label className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#6b6356]">
              Список ({categories.length})
            </label>

            {categories.length === 0 ? (
              <p className="text-sm text-[#6b6356] py-4 text-center border border-dashed border-[#c9a227]/40">
                Пока пусто — создайте первую категорию выше
              </p>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => {
                  const count = getProductCount(cat);
                  const cover = covers[cat];
                  const busy = busyCat === cat;

                  return (
                    <div
                      key={cat}
                      className="bg-white border border-[#c9a227]/20 p-3 flex gap-3"
                    >
                      <div className="w-20 h-24 shrink-0 bg-[#efe8da] overflow-hidden relative">
                        {cover ? (
                          <MediaFrame
                            src={cover}
                            alt={cat}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#c9a227]">
                            <span className="material-symbols-outlined text-2xl">image</span>
                          </div>
                        )}
                        {cover && isVideoSrc(cover) && (
                          <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
                            video
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-[#1a1a1a]">{cat}</p>
                            <p className="text-[11px] text-[#6b6356]">
                              {count}{' '}
                              {count === 1 ? 'изделие' : count >= 2 && count <= 4 ? 'изделия' : 'изделий'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                count > 0 &&
                                !window.confirm(
                                  `В «${cat}» ${count} изделий. Категория станет «Другое». Удалить?`
                                )
                              ) {
                                return;
                              }
                              onDeleteCategory(cat);
                            }}
                            className="p-1.5 text-[#6b6356] hover:text-[#ba1a1a]"
                            title="Удалить"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <input
                            ref={(el) => {
                              photoRefs.current[cat] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handlePhoto(cat, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                          <input
                            ref={(el) => {
                              videoRefs.current[cat] = el;
                            }}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              handleVideo(cat, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => photoRefs.current[cat]?.click()}
                            className="px-3 py-1.5 text-[10px] uppercase tracking-wider border border-[#c9a227]/40 text-[#9a7b1a] hover:bg-[#efe8da] disabled:opacity-50"
                          >
                            {busy ? '…' : 'Фото'}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => videoRefs.current[cat]?.click()}
                            className="px-3 py-1.5 text-[10px] uppercase tracking-wider border border-[#c9a227]/40 text-[#9a7b1a] hover:bg-[#efe8da] disabled:opacity-50"
                          >
                            Видео
                          </button>
                          {cover && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => onSetCategoryCover(cat, null)}
                              className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#6b6356] hover:text-[#ba1a1a]"
                            >
                              Убрать
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#c9a227]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#9a7b1a] text-white text-xs font-medium uppercase tracking-[0.16em] hover:bg-[#7a6214]"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
