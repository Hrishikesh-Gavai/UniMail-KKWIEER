// utils/notifications.js



export const showNotification = (message, type = 'info', duration = 5000) => {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  });



  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-glass ${type}`;
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'polite');



  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };



  const typeLabels = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information'
  };



  notification.innerHTML = `
    <div class="notification-icon">${icons[type] || icons.info}</div>
    <div class="notification-content">
      <div class="notification-title">${typeLabels[type] || typeLabels.info}</div>
      <div class="notification-message">${message}</div>
    </div>
  `;



  // Add to body
  document.body.appendChild(notification);



  // Auto remove after duration
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.animation = 'slideOutRight 0.3s ease-in-out forwards';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, duration);



  // Add glassmorphism styles with increased opacity
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .notification-glass {
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(0, 0, 0, 0) !important;
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 1) !important;
    }
    
    /* Success - Green Glass - More Visible */
    .notification-glass.success {
      background: rgba(16, 185, 129, 0.5) !important;
      border-left: 5px solid #10b981 !important;
    }
    
    .notification-glass.success .notification-icon {
      background: rgba(16, 185, 129, 0.6) !important;
      color: #064e3b !important;
      font-weight: 800 !important;
      font-size: 1.1rem !important;
    }
    
    .notification-glass.success .notification-title {
      color: #064e3b !important;
      font-weight: 800 !important;
    }
    
    .notification-glass.success .notification-message {
      color: #065f46 !important;
      font-weight: 600 !important;
    }
    
    /* Error - Red Glass - More Visible */
    .notification-glass.error {
      background: rgba(239, 68, 68, 0.5) !important;
      border-left: 5px solid #ef4444 !important;
    }
    
    .notification-glass.error .notification-icon {
      background: rgba(239, 68, 68, 0.6) !important;
      color: #7f1d1d !important;
      font-weight: 800 !important;
      font-size: 1.1rem !important;
    }
    
    .notification-glass.error .notification-title {
      color: #7f1d1d !important;
      font-weight: 800 !important;
    }
    
    .notification-glass.error .notification-message {
      color: #991b1b !important;
      font-weight: 600 !important;
    }
    
    /* Warning - Yellow Glass - More Visible */
    .notification-glass.warning {
      background: rgba(245, 158, 11, 0.5) !important;
      border-left: 5px solid #f59e0b !important;
    }
    
    .notification-glass.warning .notification-icon {
      background: rgba(245, 158, 11, 0.6) !important;
      color: #78350f !important;
      font-weight: 800 !important;
      font-size: 1.1rem !important;
    }
    
    .notification-glass.warning .notification-title {
      color: #78350f !important;
      font-weight: 800 !important;
    }
    
    .notification-glass.warning .notification-message {
      color: #92400e !important;
      font-weight: 600 !important;
    }
    
    /* Info - Blue Glass - More Visible */
    .notification-glass.info {
      background: rgba(59, 130, 246, 0.5) !important;
      border-left: 5px solid #3b82f6 !important;
    }
    
    .notification-glass.info .notification-icon {
      background: rgba(59, 130, 246, 0.6) !important;
      color: #1e3a8a !important;
      font-weight: 800 !important;
      font-size: 1.1rem !important;
    }
    
    .notification-glass.info .notification-title {
      color: #1e3a8a !important;
      font-weight: 800 !important;
    }
    
    .notification-glass.info .notification-message {
      color: #1e40af !important;
      font-weight: 600 !important;
    }
  `;
  if (!document.querySelector('#notification-animations')) {
    style.id = 'notification-animations';
    document.head.appendChild(style);
  }
};



// Promise-based notification for async operations
export const showPromiseNotification = async (
  promise,
  messages = {
    loading: 'Processing...',
    success: 'Operation completed successfully!',
    error: 'Operation failed'
  }
) => {
  // Show loading notification
  showNotification(messages.loading, 'info', 999999);



  try {
    const result = await promise;
    showNotification(messages.success, 'success');
    return result;
  } catch (error) {
    showNotification(messages.error, 'error');
    throw error;
  }
};



// Export both functions
export default {
  showNotification,
  showPromiseNotification
};
