import { apiRequest, handleApiError } from './api';

export const verifySiret = async (siret) => {
  try {
    const res = await apiRequest.post('/api/pro/verify-siret', { siret });
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: handleApiError(e) };
  }
};

export const updateProProfile = async (data) => {
  try {
    const res = await apiRequest.put('/api/pro/profile', data);
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: handleApiError(e) };
  }
};

export const updateSchedule = async (defaultSchedule) => {
  try {
    const res = await apiRequest.put('/api/pro/schedule', { defaultSchedule });
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: handleApiError(e) };
  }
};
