import { toast } from 'react-toastify';

const defaultConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showSuccess = (message) => {
  toast.success(message, {
    ...defaultConfig,
    icon: "✅",
  });
};

export const showError = (message) => {
  toast.error(message, {
    ...defaultConfig,
    autoClose: 5000,
    icon: "❌",
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    ...defaultConfig,
    autoClose: 6000,
    icon: "⚠️",
  });
};

export const showBudgetAlert = (message, type = 'warning') => {
  const config = {
    ...defaultConfig,
    autoClose: 8000,
    style: {
      fontSize: '14px',
      fontWeight: '500',
    }
  };

  if (type === 'exceeded') {
    toast.error(message, {
      ...config,
      icon: "🚨",
    });
  } else {
    toast.warning(message, {
      ...config,
      icon: "💰",
    });
  }
};

export const showInfo = (message) => {
  toast.info(message, {
    ...defaultConfig,
    icon: "ℹ️",
  });
};

export const showConfirm = (message, onConfirm) => {
  const ConfirmToast = () => (
    <div>
      <p style={{ marginBottom: '10px', color: '#1b1b1b' }}>{message}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            onConfirm();
            toast.dismiss();
          }}
          style={{
            padding: '6px 12px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss()}
          style={{
            padding: '6px 12px',
            background: '#F44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  toast(<ConfirmToast />, {
    position: "top-center",
    autoClose: false,
    closeButton: false,
    draggable: false,
  });
};