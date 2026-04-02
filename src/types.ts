export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'Starters' | 'Main Dishes' | 'Drinks' | 'Desserts';
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
