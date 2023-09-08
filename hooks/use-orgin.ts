import { useEffect, useState } from 'react';

export const useOrgin = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const orgin =
    typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';

  if (!mounted) return '';
  return orgin;
};
