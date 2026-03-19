export const STORAGE_KEYS = {
  DB: 'master_dc_db',
  NAME: 'master_dc',
  EXPIRY: 'master_dc_expiry'
} as const;

export const isMasterDataExpired = (): boolean => {
  const expiryDateStr = localStorage.getItem(STORAGE_KEYS.EXPIRY);
  if (!expiryDateStr) return true;

  const now = new Date();
  const expiryDate = new Date(expiryDateStr);

  const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const expiryAtMidnight = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate()).getTime();

  return todayAtMidnight > expiryAtMidnight;
};

export const clearMasterStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};
