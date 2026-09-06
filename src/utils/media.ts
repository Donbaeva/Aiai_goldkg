/** Shared media helpers for admin uploads (products + category covers). */

export const MAX_VIDEO_BYTES = 450_000;

export function readVideoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_VIDEO_BYTES) {
      reject(
        new Error(
          'Видео слишком большое. Снимите короче (2–3 сек) или в меньшем качестве и попробуйте снова.'
        )
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Не удалось загрузить видео'));
    reader.readAsDataURL(file);
  });
}

export function resizeImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Не удалось прочитать изображение'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}
