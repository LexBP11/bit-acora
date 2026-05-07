import api from '../api/axiosConfig';
import type { SocialRankingUser } from '../interfaces';
import { handleApiError } from '../utils/apiErrorHandler';

export const socialService = {
  getRanking: async (): Promise<SocialRankingUser[]> => {
    try {
      const response = await api.get('/social/ranking');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};
