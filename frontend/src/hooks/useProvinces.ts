// useProvinces.ts
import { useQuery } from '@tanstack/react-query';
import { locationAPI } from '../services/api';

// ===== TYPES ===== //
import { Province, District, Ward } from '@/types';

// ===== HOOKS ===== //
export const useProvinces = (enabled: boolean = false) => {
  return useQuery<Province[], Error>({
    queryKey: ['provinces'],
    queryFn: async () => {
      const data = await locationAPI.getProvinces();
      return data || [];
    },
    enabled,
  });
};

export const useDistricts = (provinceId: string | null, enabled: boolean = false) => {
  return useQuery<District[], Error>({
    queryKey: ['districts', provinceId],
    queryFn: async () => {
      if (!provinceId) return [];
      const data = await locationAPI.getDistricts(provinceId);
      return data || [];
    },
    enabled: Boolean(enabled && provinceId),
  });
};

export const useWards = (districtId: string | number | null, enabled: boolean = false) => {
  return useQuery<Ward[], Error>({
    queryKey: ['wards', districtId],
    queryFn: async () => {
      if (districtId === null) return [];
      const data = await locationAPI.getWards(districtId);
      return data || [];
    },
    enabled: Boolean(enabled && districtId !== null),
  });
};
