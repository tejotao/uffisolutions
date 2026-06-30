export function calculateBaseFee(weight) {
  if (weight <= 1) return 3.70;
  if (weight <= 2) return 4.70;
  if (weight <= 5) return 7.00;
  return 10.00;
}

export function calculateStorageFee(receivedDate, status) {
  if (status !== 'Em Espera') return 0;
  
  const received = new Date(receivedDate);
  const now = new Date();
  const daysDiff = Math.floor((now - received) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 30) return 0;
  
  const storageDays = daysDiff - 30;
  return storageDays * 0.25;
}

export const EXTRA_SERVICES = [
  { name: 'Consolidação', price: 5.00 },
  { name: 'Inspeção Detalhada', price: 3.00 },
  { name: 'Embalagem Especial', price: 7.00 }
];