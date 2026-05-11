import { useQuery } from '@tanstack/react-query';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { familyService } from '@/pages/families/services/families.service';
import type { FamilyMember, Family } from '@/pages/families/types/family.types';

interface CurrentPerson {
  person: FamilyMember | null;
  family: Family | null;
  familyId: string;
  personId: string;
  allMembers: FamilyMember[];
}

export function useCurrentPerson() {
  return useQuery<CurrentPerson>({
    queryKey: ['current-person'],
    queryFn: async () => {
      const [attributes, families] = await Promise.all([
        fetchUserAttributes(),
        familyService.list(),
      ]);

      const email = attributes.email?.toLowerCase() || '';
      const family = families[0] ?? null;
      const members: FamilyMember[] = family?.members ?? [];

      // Match by email first, then by userId (sub), then fall back to first member
      const sub = attributes.sub || '';
      const person =
        members.find((m) => m.email?.toLowerCase() === email) ||
        members.find((m) => m.userId === sub) ||
        members[0] ||
        null;

      return {
        person,
        family,
        familyId: family?.id ?? '',
        personId: person?.id ?? '',
        allMembers: members,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
