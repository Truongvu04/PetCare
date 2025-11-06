export const mapUtils = {
  createMarkerElement: (clinic) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.cssText = `
      width: 40px;
      height: 40px;
      background: #22c55e;
      border: 3px solid white;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-size: 18px;
      color: white;
      transition: transform 0.2s ease;
    `;
    
    el.innerHTML = '🏥';
    
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });
    
    return el;
  },

  formatDistance: (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance}km`;
  },

  createPopupContent: (clinic) => {
    return `
      <div class="vet-popup">
        <div class="popup-header">
          <img src="${clinic.image}" alt="${clinic.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${clinic.name}</h3>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
            <span style="color: #f59e0b;">⭐</span>
            <span style="font-weight: 600; color: #1f2937;">${clinic.rating}</span>
            <span style="color: #6b7280;">(${clinic.reviews} đánh giá)</span>
          </div>
        </div>
        
        <div class="popup-content">
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.4;">${clinic.address}</p>
          
          <div style="margin: 8px 0; display: flex; align-items: center; gap: 8px;">
            <span style="color: #059669;">📞</span>
            <span style="color: #1f2937; font-size: 14px;">${clinic.phone}</span>
          </div>
          
          <div style="margin: 8px 0; display: flex; align-items: center; gap: 8px;">
            <span style="color: #059669;">🕒</span>
            <span style="color: ${clinic.isOpen ? '#059669' : '#dc2626'}; font-size: 14px; font-weight: 500;">
              ${clinic.isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'} - ${clinic.openingHours}
            </span>
          </div>
          
          ${clinic.distance ? `
            <div style="margin: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #059669;">📍</span>
              <span style="color: #1f2937; font-size: 14px;">Cách ${mapUtils.formatDistance(clinic.distance)}</span>
            </div>
          ` : ''}
          
          <div style="margin: 12px 0 8px 0;">
            <strong style="color: #1f2937; font-size: 14px;">Dịch vụ:</strong>
            <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px;">
              ${clinic.services.slice(0, 3).map(service => 
                `<span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${service}</span>`
              ).join('')}
              ${clinic.services.length > 3 ? `<span style="color: #6b7280; font-size: 12px;">+${clinic.services.length - 3} khác</span>` : ''}
            </div>
          </div>
        </div>
        
        <div class="popup-footer" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <button 
            onclick="window.open('tel:${clinic.phone}', '_self')"
            style="width: 100%; background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; font-size: 14px;"
          >
            Gọi ngay
          </button>
        </div>
      </div>
    `;
  },

  defaultCenter: {
    lat: 10.7769,
    lng: 106.7009
  },

  defaultZoom: 12
};
