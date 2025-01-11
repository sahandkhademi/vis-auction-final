export const convertToWebP = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new file with .webp extension
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.webp'),
              { type: 'image/webp' }
            );
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        0.9
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const generateWebPUrl = (url: string): string => {
  if (!url) return '';
  return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

export const generateSrcSet = (url: string): string => {
  const webpUrl = generateWebPUrl(url);
  return `${webpUrl} 1x, ${webpUrl.replace(/\.(webp)$/i, '@2x.$1')} 2x, ${webpUrl.replace(/\.(webp)$/i, '@3x.$1')} 3x`;
};