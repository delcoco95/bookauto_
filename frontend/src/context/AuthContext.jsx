import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiRequest } from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('bookauto_token');
      const userData = localStorage.getItem('bookauto_user');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token }
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await apiRequest.post('/api/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data;

      // Save to localStorage
      localStorage.setItem('bookauto_token', token);
      localStorage.setItem('bookauto_user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await apiRequest.post('/api/auth/register', userData);
      const { user, token } = response.data;

      // Save to localStorage
      localStorage.setItem('bookauto_token', token);
      localStorage.setItem('bookauto_user', JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('bookauto_token');
    localStorage.removeItem('bookauto_user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update user data
  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('bookauto_user', JSON.stringify(updatedUser));
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Auth guards
  const requireAuth = () => {
    return state.isAuthenticated;
  };

  const requireRole = (role) => {
    return state.isAuthenticated && state.user?.role === role;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    requireAuth,
    requireRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
