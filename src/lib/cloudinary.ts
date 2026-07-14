/** Resize Cloudinary URLs without upscaling past the original asset. */
export function optimizeCloudinaryUrl(url: string, width = 640): string {
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  if (url.includes('c_limit') || url.includes('w_')) {
    return url;
  }

  return url.replace('/upload/', `/upload/c_limit,w_${width},q_auto,f_auto/`);
}
