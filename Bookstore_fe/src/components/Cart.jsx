import { use, useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [bookDetails, setBookDetails] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // Handle image loading errors
  const handleImageError = (bookId) => {
    setImageErrors(prev => ({
      ...prev,
      [bookId]: true
    }));
  };
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const token = Cookies.get('token');
    
    if (!token) {
      alert('Please login to place an order');
      return;
    }
    
    try {
      if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
      }
      
      
      const totalAmount = parseFloat(getCartTotal());
      
      // Create order first to get the order_id
      const orderResponse = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_amount: totalAmount
        })
      });
      
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({ detail: 'Could not parse error response' }));
        console.error('Server error response:', errorData);
        alert(`Error: ${errorData.detail || 'Unknown server error'}`);
        return;
      }
      
      const orderData = await orderResponse.json();
      const orderId = orderData.order_id;
      
      // Now create order item using the order_id
      const orderItemPromises = cartItems.map( item =>
        fetch('http://localhost:8000/api/order_items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            order_id: orderId,
            book_id: item.id,
            quantity: item.quantity,
            price: item.price
          })
        })

      )
      const orderItemResponse = await Promise.all(orderItemPromises);
      const failedResponses = orderItemResponse.filter(response => !response.ok);

       
      
      if (failedResponses.length > 0) {
        // Get the first error message
        const firstErrorResponse = failedResponses[0];
        const errorData = await firstErrorResponse.json().catch(() => ({ detail: 'Could not parse error response' }));
        console.error('Server error response for order item:', errorData);
        alert(`Error adding items to order: ${errorData.detail || 'Unknown server error'}`);
        return;
      }
      
      alert(`Order created successfully! Order ID: ${orderId}`);
      
      // Clear cart after successful order
      // localStorage.removeItem('cart');
      // setCartItems([]);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Error creating order: ${error.message}`);
    }
  };

  useEffect(() => {
    // Fetch user ID first
    const fetchUserData = async () => {
      const token = Cookies.get('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setUserId(userData.id);
        
        // Now load cart data
        loadCartData(userData.id);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const loadCartData = async (currentUserId) => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        const userCart = parsedCart[currentUserId] || {};
        
        // Fetch book details for each book in cart
        const bookIds = Object.keys(userCart);
        const bookDetailsMap = {};
        
        // Use Promise.all to fetch all book details in parallel
        await Promise.all(
          bookIds.map(async (bookId) => {
            try {
              const response = await axios.get(`http://localhost:8000/api/books/${bookId}`);
              bookDetailsMap[bookId] = response.data;
            } catch (error) {
              console.error(`Error fetching details for book ${bookId}:`, error);
            }
          })
        );
        
        setBookDetails(bookDetailsMap);
        
        // Transform cart data into array format for rendering
        const cartItemsArray = bookIds.map(bookId => {
          const book = bookDetailsMap[bookId];
          const cartItem = userCart[bookId];
          console.log(
            {
              id: bookId,
              title: book?.book_title || 'Unknown Book',
              author: cartItem.author,
              price: book?.discounts?.[0]?.discount_price || book?.book_price || 0,
              quantity: cartItem.quantity,
              image: book?.book_cover_photo || ''
            }
          );
          
          return {
            id: bookId,
            title: book?.book_title || 'Unknown Book',
            author: cartItem.author,
            price: book?.discounts?.[0]?.discount_price || book?.book_price || 0,
            quantity: cartItem.quantity,
            image: book?.book_cover_photo || ''
          };
        });
        
        setCartItems(cartItemsArray);
      }
    } catch (error) {
      console.error('Error parsing cart data from localStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity > 8) return;
    if (newQuantity <= 0)
    {
      setCartItems(cartItems.filter(item => item.id != id))

      const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
      if (storedCart[userId] && storedCart[userId][id]) {
        delete storedCart[userId][id];
        localStorage.setItem('cart', JSON.stringify(storedCart));
      }
      return;
    }
      
    
    // Update state for UI
    setCartItems(cartItems.map(item => 
      item.id === id ? {...item, quantity: newQuantity} : item
    ));
    
    // Update localStorage
    const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
    if (storedCart[userId] && storedCart[userId][id]) {
      storedCart[userId][id].quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(storedCart));
    }
  };

  const getTotal = (price, quantity) => {
    return (price * quantity).toFixed(2);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  if (loading) {
    return <div className="max-w-6xl w-full mx-auto p-6 mt-40 text-center">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return <div className="max-w-6xl w-full mx-auto p-6 mt-40 text-center">Your cart is empty</div>;
  }

  return (
    <div className="max-w-6xl w-full mx-auto p-6 mt-40">
      <h2 className="text-xl font-medium mb-6">Your cart: {cartItems.length} items</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-grow bg-white border rounded-md overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 text-sm">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-right p-4">Price</th>
                <th className="text-center p-4">Quantity</th>
                <th className="text-right p-4">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cartItems.map((item) => (
                <tr key={item.id} className="text-sm">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-24 h-28 bg-gray-200 flex-shrink-0 mr-6 flex items-center justify-center">
                        {imageErrors[item.id] ? (
                          <div className="text-gray-500 text-center text-xs p-2">
                            No image available
                          </div>
                        ) : (
                          <img 
                            src={item.image}
                            alt={item.title} 
                            className="w-full h-full object-contain" 
                            onError={() => handleImageError(item.id)}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-base">{item.title}</p>
                        <p className="text-gray-500 text-sm">{item.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div>
                      <p className="text-base">${item.price}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-gray-200 p-2 rounded"
                      >
                        {/* Minus Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                      </button>
                      <span className="mx-4 w-8 text-center text-base">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-gray-200 p-2 rounded"
                      >
                        {/* Plus Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-right text-base">${getTotal(item.price, item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="w-full md:w-80 h-fit bg-white border rounded-md p-6 shadow-sm">
          <h3 className="text-center mb-6 font-medium text-lg">Cart Totals</h3>
          <div className="text-center">
            <p className="text-3xl font-bold mb-8">${getCartTotal()}</p>
            <button onClick={handlePlaceOrder} className="w-full bg-gray-200 py-3 px-6 rounded hover:bg-gray-300 transition-colors text-base font-medium">
              Place order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
