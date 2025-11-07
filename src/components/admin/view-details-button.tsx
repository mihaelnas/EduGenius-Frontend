
'use client';

import { useRouter } from 'next/navigation';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

type ViewDetailsButtonProps = {
  userId: string;
};

export function ViewDetailsButton({ userId }: ViewDetailsButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/profile/${userId}`);
  };

  return (
    <DropdownMenuItem onClick={handleClick}>
      Voir les détails
    </DropdownMenuItem>
  );
}
