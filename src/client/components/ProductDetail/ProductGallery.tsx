import React from 'react';
import { PlayCircle } from 'lucide-react';

interface ProductGalleryProps {
  activeImage: string;
  images: string[];
  onImageClick: (img: string) => void;
  productTitle: string;
  videoUrl?: string;
}

// Helper to convert any standard YouTube URL (watch, share, etc.) to an embeddable URL
const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;

  let videoId = '';
  // Regexp to match YouTube video IDs from various URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    videoId = match[2];
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const ProductGallery: React.FC<ProductGalleryProps> = ({
  activeImage,
  images,
  onImageClick,
  productTitle,
  videoUrl,
}) => {
  const isVideoActive = activeImage === 'video';
  const finalVideoUrl = videoUrl ? getEmbedUrl(videoUrl) : '';

  return (
    <div>
      <div 
        className="product-gallery-main" 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: 'var(--bg, #f1f5f9)', 
          borderRadius: '24px', 
          padding: '2rem',
          overflow: 'hidden', 
          minHeight: '450px', 
          position: 'relative',
          transition: 'background-color 0.3s ease'
        }}
      >
        {isVideoActive && finalVideoUrl ? (
          finalVideoUrl.includes('youtube.com') || finalVideoUrl.includes('youtu.be') ? (
            <iframe 
              style={{ width: '100%', height: '400px', border: 0 }}
              src={finalVideoUrl} 
              title="YouTube video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          ) : (
            <video 
              style={{ width: '100%', height: '400px', objectFit: 'contain', background: '#000' }} 
              src={finalVideoUrl} 
              controls 
              autoPlay
            />
          )
        ) : (
          <img 
            id="mainImg" 
            src={activeImage} 
            alt={productTitle} 
            style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', transition: 'all 0.3s' }} 
          />
        )}
      </div>
      <div 
        className="product-thumbnails" 
        style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {/* Video Thumbnail (CellphoneS/FPT Shop Style) */}
        {videoUrl && (
          <div 
            className={`thumb ${isVideoActive ? 'active' : ''}`} 
            style={{
              width: '76px',
              height: '76px',
              border: isVideoActive ? '2px solid var(--indigo, #4f46e5)' : '1px solid var(--border, #e2e8f0)',
              borderRadius: '12px',
              cursor: 'pointer',
              overflow: 'hidden',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isVideoActive ? '0 0 0 2px rgba(79,70,229,0.2)' : 'none'
            }}
            onClick={() => onImageClick('video')}
          >
            <PlayCircle size={28} color="var(--indigo, #4f46e5)" strokeWidth={1.5} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '4px', color: 'var(--indigo, #4f46e5)' }}>VIDEO</span>
          </div>
        )}

        {/* Regular Images */}
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className={`thumb ${activeImage === img ? 'active' : ''}`} 
            style={{
              width: '76px',
              height: '76px',
              border: activeImage === img ? '2px solid var(--indigo, #4f46e5)' : '1px solid var(--border, #e2e8f0)',
              borderRadius: '12px',
              cursor: 'pointer',
              overflow: 'hidden',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: activeImage === img ? '0 0 0 2px rgba(79,70,229,0.2)' : 'none',
              padding: '6px'
            }}
            onClick={() => onImageClick(img)}
          >
            <img
              src={img}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              loading="lazy"
              decoding="async"
              width={76}
              height={76}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
