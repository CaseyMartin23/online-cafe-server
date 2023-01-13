export const makeAnArray = (items: any | any[]): any[] => {
  return Array.isArray(items) ? items : [items];
}