

export const formatINR = (amount: number | undefined | null): string => {
  const numeric = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `₹${numeric.toLocaleString('en-IN')}`;
};

export const formatINRNumber = (amount: number | undefined | null): string => {
  const numeric = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return numeric.toLocaleString('en-IN');
};
