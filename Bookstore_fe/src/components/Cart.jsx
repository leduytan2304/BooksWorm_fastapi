import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import LoginPopup from './LoginPopup';
import Notification from './Notification'; // Import the Notification component

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [bookDetails, setBookDetails] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  // Add confirmation state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemTitle, setItemTitle] = useState('');
  
  // Add notification state
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });

  // Show notification helper function
  const showNotification = (message, type = 'success') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  // Close notification helper function
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

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
      console.log("User not logged in, showing login popup");
      setShowLoginPopup(true);
      return;
    }
    
    try {
      if (cartItems.length === 0) {
        showNotification('Your cart is empty', 'error');
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
        showNotification(`Error: ${errorData.detail || 'Unknown server error'}`, 'error');
        return;
      }
      
      const orderData = await orderResponse.json();
      const orderId = orderData.order_id;
      
      // Now create order item using the order_id
      const orderItemPromises = cartItems.map(item =>
        fetch('http://localhost:8000/api/order-items', {
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
      );
      
      const orderItemResponse = await Promise.all(orderItemPromises);
      const failedResponses = orderItemResponse.filter(response => !response.ok);

      if (failedResponses.length > 0) {
        // Get the first error message
        const firstErrorResponse = failedResponses[0];
        const errorData = await firstErrorResponse.json().catch(() => ({ detail: 'Could not parse error response' }));
        console.error('Server error response for order item:', errorData);
        showNotification(`Error adding items to order: ${errorData.detail || 'Unknown server error'}`, 'error');
        return;
      }
      
      // Show success notification for 10 seconds
      showNotification(`Order placed successfully! Order ID: ${orderId}`, 'success');
      
      // Clear cart after successful order
      if (userId) {
        // Get current cart data
        const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
        
        // Remove this user's cart items
        if (storedCart[userId]) {
          delete storedCart[userId];
          localStorage.setItem('cart', JSON.stringify(storedCart));
        }
        
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Wait for notification to be visible for the full 10 seconds before redirecting to home page
        setTimeout(() => {
          window.location.href = '/'; // Redirect to home page
        }, 10000); // Match the notification duration (10 seconds)
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showNotification(`Error creating order: ${error.message}`, 'error');
    }
  };

  // Handle successful login
  const handleSuccessfulLogin = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        // Fetch user data
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
        
        // Merge guest cart with user cart
        const guestCartData = JSON.parse(localStorage.getItem('guestCart') || '{}');
        if (Object.keys(guestCartData).length > 0) {
          // Get existing user cart
          let cartData = JSON.parse(localStorage.getItem('cart') || '{}');
          
          // Initialize user's cart if it doesn't exist
          if (!cartData[userData.id]) {
            cartData[userData.id] = {};
          }
          
          // Merge guest cart items into user cart
          for (const [bookId, item] of Object.entries(guestCartData)) {
            if (cartData[userData.id][bookId]) {
              // If book already in user cart, add quantities (up to max 8)
              const newQuantity = Math.min(cartData[userData.id][bookId].quantity + item.quantity, 8);
              cartData[userData.id][bookId].quantity = newQuantity;
            } else {
              // Otherwise add the item to user cart
              cartData[userData.id][bookId] = item;
            }
          }
          
          // Save updated cart to localStorage
          localStorage.setItem('cart', JSON.stringify(cartData));
          
          // Clear guest cart
          localStorage.removeItem('guestCart');
        }
        
        // Reload cart data
        loadCartData(userData.id);
        
        // Close login popup
        setShowLoginPopup(false);
        
        // Try placing the order again
        handlePlaceOrder({ preventDefault: () => {} });
      } catch (error) {
        console.error('Error updating user data after login:', error);
      }
    }
  };

  useEffect(() => {
    // Fetch user ID first
    const fetchUserData = async () => {
      const token = Cookies.get('token');
      if (!token) {
        console.log("No token found, loading guest cart");
        // Load guest cart if user is not logged in
        loadGuestCartData();
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
        
        // Store userId in cookie for consistency across components
        Cookies.set('userId', userData.id.toString(), {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Now load cart data
        loadCartData(userData.id);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Load guest cart if there's an error
        loadGuestCartData();
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

  const loadGuestCartData = async () => {
    try {
      const storedGuestCart = localStorage.getItem('guestCart');
      console.log("Loading guest cart from localStorage:", storedGuestCart);
      
      if (storedGuestCart) {
        const parsedGuestCart = JSON.parse(storedGuestCart);
        console.log("Parsed guest cart:", parsedGuestCart);
        
        // Fetch book details for each book in cart
        const bookIds = Object.keys(parsedGuestCart);
        const bookDetailsMap = {};
        
        if (bookIds.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        
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
          const cartItem = parsedGuestCart[bookId];
          const book = bookDetailsMap[bookId];
          
          return {
            id: bookId,
            title: cartItem.title || book?.book_title || 'Unknown Book',
            author: cartItem.author || book?.author?.author_name || 'Unknown Author',
            price: cartItem.price || book?.discounts?.[0]?.discount_price || book?.book_price || 0,
            quantity: cartItem.quantity,
            image: cartItem.image || book?.book_cover_photo || ''
          };
        });
        
        console.log("Cart items array for guest:", cartItemsArray);
        setCartItems(cartItemsArray);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error parsing guest cart data from localStorage:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (id, newQuantity, title) => {
    console.log(`Updating quantity for book ${id} to ${newQuantity}`);
    console.log(`User ID: ${userId ? userId : 'Guest'}`);
    
    if (newQuantity > 8) return;
    
    if (newQuantity <= 0) {
      // Instead of removing immediately, show confirmation
      setItemToDelete(id);
      setItemTitle(title);
      setShowConfirmation(true);
      return;
    }
      
    // Update state for UI
    setCartItems(cartItems.map(item => 
      item.id === id ? {...item, quantity: newQuantity} : item
    ));
    
    // Update localStorage
    if (userId) {
      // For logged-in users
      const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
      if (storedCart[userId] && storedCart[userId][id]) {
        storedCart[userId][id].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(storedCart));
        
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } else {
      // For guest users
      const storedGuestCart = JSON.parse(localStorage.getItem('guestCart') || '{}');
      if (storedGuestCart[id]) {
        storedGuestCart[id].quantity = newQuantity;
        localStorage.setItem('guestCart', JSON.stringify(storedGuestCart));
        console.log("Updated guest cart item quantity:", id, newQuantity);
        
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('cartUpdated'));
      }
    }
  };

  // Add confirmation handler
  const confirmDelete = () => {
    const id = itemToDelete;
    
    setCartItems(cartItems.filter(item => item.id != id));
    
    if (userId) {
      // For logged-in users
      const storedCart = JSON.parse(localStorage.getItem('cart') || '{}');
      if (storedCart[userId] && storedCart[userId][id]) {
        delete storedCart[userId][id];
        localStorage.setItem('cart', JSON.stringify(storedCart));
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } else {
      // For guest users
      const storedGuestCart = JSON.parse(localStorage.getItem('guestCart') || '{}');
      if (storedGuestCart[id]) {
        delete storedGuestCart[id];
        localStorage.setItem('guestCart', JSON.stringify(storedGuestCart));
        console.log("Removed item from guest cart:", id);
        
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('cartUpdated'));
      }
    }


    
    
    // Show notification
    showNotification(`"${itemTitle}" has been removed from your cart`, 'success');
    
    // Close confirmation dialog
    setShowConfirmation(false);
    setItemToDelete(null);
    setItemTitle('');
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setItemToDelete(null);
    setItemTitle('');
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
      {/* Login popup */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)} 
        onLogin={handleSuccessfulLogin}
      />
      
      {/* Notification component with longer duration for order success */}
      <Notification 
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
        duration={10000} // 10 seconds for order notifications
      />
      
      {/* Confirmation popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Remove Item</h3>
            <p className="mb-6">Are you sure you want to remove "{itemTitle}" from your cart?</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                <tr 
                  key={item.id} 
                  className="text-sm cursor-pointer hover:bg-gray-50"
                  
                >
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-24 h-28 bg-gray-200 flex-shrink-0 mr-6 flex items-center justify-center">
                        {imageErrors[item.id] ? (
                          <div  className="flex items-center justify-center w-full h-full">
                            <img 
                            
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1200px-No-Image-Placeholder.svg.png" 
                              alt="No image available" 
                              className="w-full h-full object-contain"
                            />
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
                        <p className="font-medium text-base" onClick={() => window.open(`/product/${item.id}`, '_blank')} >{item.title} </p>
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
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.title)}
                        className="bg-gray-200 p-2 rounded"
                      >
                        {/* Minus Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                      </button>
                      <span className="mx-4 w-8 text-center text-base">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.title)}
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
