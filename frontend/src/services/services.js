import { apiRequest, handleApiError } from './api';

// Search professionals/services
export const searchServices = async (params) => {
  try {
    const res = await apiRequest.get('/api/services', { params });
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: handleApiError(e) };
  }
};

// Pro: list own services
export const listMyServices = async () => {
  try {
    const res = await apiRequest.get('/api/services/manage/mine');
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: handleApiError(e) };
  }
};

export const createService = async (payload) => {
  try {
    const res = await apiRequest.post('/api/services/manage', payload);
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: handleApiError(e) };
  }
};

export const updateService = async (id, payload) => {
  try {
    const res = await apiRequest.put(`/api/services/manage/${id}`, payload);
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: handleApiError(e) };
  }
};

export const deleteService = async (id) => {
  try {
    const res = await apiRequest.delete(`/api/services/manage/${id}`);
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: handleApiError(e) };
  }
};
