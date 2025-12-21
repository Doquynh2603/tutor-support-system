import { useEffect } from 'react';

export const useSessionFilter = (storageKey: string, setFilter: (value: any) => void) => {
  useEffect(() => {
    const value = sessionStorage.getItem(storageKey);
    if (value) {
      console.log(`✅ Đọc ${storageKey} từ sessionStorage:`, value);
      setFilter(value);
      sessionStorage.removeItem(storageKey);
      console.log(`🗑️ Đã xóa ${storageKey} khỏi sessionStorage`);
    }
  }, [storageKey, setFilter]);
};
export default useSessionFilter;
