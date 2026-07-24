import React, { useState, useRef, useEffect } from 'react';

interface GallerySectionProps {
  images: string[];
  productName: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (galleryRef.current) {
      const scrollLeft = galleryRef.current.scrollLeft;
      const width = galleryRef.current.clientWidth;
      if (width > 0) {
        const newIndex = Math.round(scrollLeft / width);
        setActiveIndex(newIndex);
      }
    }
  };

  const scrollToImage = (index: number) => {
    setActiveIndex(index);
    if (galleryRef.current) {
      const width = galleryRef.current.clientWidth;
      galleryRef.current.scrollTo({
        left: index * width,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    // Reset index if images change
    setActiveIndex(0);
  }, [images]);

  return (
    <section className="lg:col-span-7 relative group">
      <div
        ref={galleryRef}
        onScroll={handleScroll}
        className="gallery-container flex overflow-x-auto snap-x snap-mandatory h-[420px] sm:h-[500px] md:h-[600px] md:rounded-3xl shadow-lg bg-[#e0e0db] relative cursor-pointer"
      >
        {images.map((imgUrl, idx) => (
          <div
            key={idx}
            className="snap-center shrink-0 w-full h-full relative overflow-hidden"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              src={imgUrl}
              alt={`${productName} view ${idx + 1}`}
              className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute top-4 right-4 bg-black/40 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-sm">zoom_in</span>
              Expand
            </div>
          </div>
        ))}
      </div>

      {/* Swipe Dot Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToImage(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === activeIndex
                ? 'bg-[#735c00] w-6'
                : 'bg-white/60 hover:bg-white'
            }`}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>

      {/* Desktop Floating Thumbnails */}
      {images.length > 1 && (
        <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-10">
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => scrollToImage(idx)}
              className={`w-16 h-16 rounded-xl border-2 overflow-hidden shadow-md cursor-pointer transition-all ${
                idx === activeIndex
                  ? 'border-[#735c00] scale-105 ring-2 ring-[#735c00]/30'
                  : 'border-white opacity-60 hover:opacity-100 hover:scale-100'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-[#d4af37] p-2 rounded-full bg-white/10"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          <div className="max-w-4xl max-h-[80vh] relative">
            <img
              src={images[activeIndex]}
              alt={productName}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
          <div className="flex gap-2 mt-6">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${
                  idx === activeIndex ? 'border-[#d4af37]' : 'border-transparent opacity-50'
                }`}
              >
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
