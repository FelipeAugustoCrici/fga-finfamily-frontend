import { useQuery } from '@tanstack/react-query';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { api } from '@/services/api.service';

type UserInfo = {
  name: string;
  email: string;
  initials: string;
};

type Family = {
  id: string;
  name: string;
};

export function useUserInfo() {
  return useQuery({
    queryKey: ['user-info'],
    queryFn: async (): Promise<UserInfo> => {
      const attributes = await fetchUserAttributes();
      const name = attributes.name || attributes.email || 'Usuário';

      const nameParts = name.split(' ');
      const initials =
        nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : name.substring(0, 2).toUpperCase();

      return {
        name,
        email: attributes.email || '',
        initials,
      };
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useUserFamily() {
  return useQuery({
    queryKey: ['user-family'],
    queryFn: async (): Promise<Family | null> => {
      try {
        const { data } = await api.get('/finance/families');
        if (data && data.length > 0) {
          return {
            id: data[0].id,
            name: data[0].name,
          };
        }
        return null;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
