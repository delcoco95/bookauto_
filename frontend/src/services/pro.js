import { apiRequest, handleApiError } from './api';

export const verifySiret = async (siret) => {
  try {
    // Sanitize: remove all spaces and non-numeric chars
    const cleanSiret = siret.replace(/\D/g, '');
    const res = await apiRequest.post('/api/siret/verify', { siret: cleanSiret });
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
