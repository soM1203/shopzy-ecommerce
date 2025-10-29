// In ProductGrid.js, update the addToCart function to handle sync better
const addToCart = async (product) => {
  try {
    const response = await fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1
      })
    });

    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }

    // After successful backend operation, sync with backend
    const cartResponse = await fetch('http://localhost:5000/api/cart');
    if (cartResponse.ok) {
      const cartData = await cartResponse.json();
      setCart(cartData.items); // Always sync with backend truth
    }

  } catch (error) {
    console.error('Error adding to cart:', error);
    // Fallback to local state if API fails
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  }
};