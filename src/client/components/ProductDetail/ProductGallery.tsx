import React from 'react';

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
          background: '#fff', 
          borderRadius: 'var(--radius)', 
          overflow: 'hidden', 
          minHeight: '400px', 
          border: '1px solid var(--border)',
          position: 'relative'
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
              width: '70px',
              height: '70px',
              border: isVideoActive ? '2px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              overflow: 'hidden',
              background: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onClick={() => onImageClick('video')}
          >
            <i className="bi bi-play-circle-fill" style={{ fontSize: '1.6rem', color: 'var(--accent)' }}></i>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '2px', color: 'var(--dark)' }}>VIDEO</span>
          </div>
        )}

        {/* Regular Images */}
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className={`thumb ${activeImage === img ? 'active' : ''}`} 
            style={{
              width: '70px',
              height: '70px',
              border: activeImage === img ? '2px solid var(--dark)' : '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              overflow: 'hidden',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => onImageClick(img)}
          >
            <img src={img} alt="" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
