import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { tutorClassesQueryKeys } from './useTutorClasses';

//hook rút đơn ứng tuyển

export default function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, reason }) =>
      api.put(`/applications/${applicationId}/withdraw`, { reason }),
    onSuccess: () => {
      // Invalidate tutor-related queries so UI updates
      queryClient.invalidateQueries({ queryKey: tutorClassesQueryKeys.all });
      // also invalidate any generic applications key just in case
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
