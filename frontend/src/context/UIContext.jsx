import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  isMobileMenuOpen: false,
  notifications: [],
  modal: {
    isOpen: false,
    component: null,
    props: {},
  },
  loading: {
    global: false,
    actions: {}, // Track loading state for specific actions
  },
  toast: {
    isVisible: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
  },
};

// UI actions
const UI_ACTIONS = {
  TOGGLE_MOBILE_MENU: 'TOGGLE_MOBILE_MENU',
  CLOSE_MOBILE_MENU: 'CLOSE_MOBILE_MENU',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  SET_GLOBAL_LOADING: 'SET_GLOBAL_LOADING',
  SET_ACTION_LOADING: 'SET_ACTION_LOADING',
  SHOW_TOAST: 'SHOW_TOAST',
  HIDE_TOAST: 'HIDE_TOAST',
};

// UI reducer
const uiReducer = (state, action) => {
  switch (action.type) {
    case UI_ACTIONS.TOGGLE_MOBILE_MENU:
      return {
        ...state,
        isMobileMenuOpen: !state.isMobileMenuOpen,
      };
    
    case UI_ACTIONS.CLOSE_MOBILE_MENU:
      return {
        ...state,
        isMobileMenuOpen: false,
      };
    
    case UI_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    
    case UI_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    
    case UI_ACTIONS.OPEN_MODAL:
      return {
        ...state,
        modal: {
          isOpen: true,
          component: action.payload.component,
          props: action.payload.props || {},
        },
      };
    
    case UI_ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        modal: {
          isOpen: false,
          component: null,
          props: {},
        },
      };
    
    case UI_ACTIONS.SET_GLOBAL_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          global: action.payload,
        },
      };
    
    case UI_ACTIONS.SET_ACTION_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          actions: {
            ...state.loading.actions,
            [action.payload.action]: action.payload.isLoading,
          },
        },
      };
    
    case UI_ACTIONS.SHOW_TOAST:
      return {
        ...state,
        toast: {
          isVisible: true,
          message: action.payload.message,
          type: action.payload.type || 'info',
        },
      };
    
    case UI_ACTIONS.HIDE_TOAST:
      return {
        ...state,
        toast: {
          ...state.toast,
          isVisible: false,
        },
      };
    
    default:
      return state;
  }
};

// Create context
const UIContext = createContext();

// UI provider component
export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Mobile menu actions
  const toggleMobileMenu = () => {
    dispatch({ type: UI_ACTIONS.TOGGLE_MOBILE_MENU });
  };

  const closeMobileMenu = () => {
    dispatch({ type: UI_ACTIONS.CLOSE_MOBILE_MENU });
  };

  // Notification actions
  const addNotification = (notification) => {
    const id = Date.now().toString();
    dispatch({
      type: UI_ACTIONS.ADD_NOTIFICATION,
      payload: { ...notification, id },
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
    
    return id;
  };

  const removeNotification = (id) => {
    dispatch({ type: UI_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  };

  // Modal actions
  const openModal = (component, props = {}) => {
    dispatch({
      type: UI_ACTIONS.OPEN_MODAL,
      payload: { component, props },
    });
  };

  const closeModal = () => {
    dispatch({ type: UI_ACTIONS.CLOSE_MODAL });
  };

  // Loading actions
  const setGlobalLoading = (isLoading) => {
    dispatch({ type: UI_ACTIONS.SET_GLOBAL_LOADING, payload: isLoading });
  };

  const setActionLoading = (action, isLoading) => {
    dispatch({
      type: UI_ACTIONS.SET_ACTION_LOADING,
      payload: { action, isLoading },
    });
  };

  const isActionLoading = (action) => {
    return state.loading.actions[action] || false;
  };

  // Toast actions
  const showToast = (message, type = 'info') => {
    dispatch({
      type: UI_ACTIONS.SHOW_TOAST,
      payload: { message, type },
    });
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      hideToast();
    }, 4000);
  };

  const hideToast = () => {
    dispatch({ type: UI_ACTIONS.HIDE_TOAST });
  };

  const value = {
    ...state,
    toggleMobileMenu,
    closeMobileMenu,
    addNotification,
    removeNotification,
    openModal,
    closeModal,
    setGlobalLoading,
    setActionLoading,
    isActionLoading,
    showToast,
    hideToast,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

// Custom hook to use UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export default UIContext;
