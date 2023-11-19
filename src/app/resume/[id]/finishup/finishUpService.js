// finishUpService.js
import axiosInstance from '../../../utils/axiosInstance';
import { mockData } from './mockData';

export const getFinishUp = async cvId => {
  try {
    const response = await axiosInstance.get(`/user/cv/${cvId}/finish-up`);
    // return mockData.data.resume;
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAudit = async cvId => {
  try {
    const userId =
      typeof document !== 'undefined'
        ? document.cookie
            .split('; ')
            .find(row => row.startsWith('userId'))
            .split('=')[1]
        : null;

    if (!userId) {
      throw new Error('User ID not found.');
    }

    const response = await axiosInstance.get(`/user/${userId}/cv/${cvId}/evaluate`);
    // return mockData.data.resume;
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const syncUp = async cvId => {
  try {
    const response = await axiosInstance.get(`/cv/synchUp/${cvId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
