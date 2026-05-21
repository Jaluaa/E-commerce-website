import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">NexusShop</Link>
        
        <div className="nav-links">
          <Link to="/products">Products</Link>
          
          {user ? (
            <>
              <Link to="/cart">Cart {cartCount > 0 && <span style={{backgroundColor: 'var(--accent-color)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', marginLeft: '5px'}}>{cartCount}</span>}</Link>
              <button className="btn btn-danger" onClick={logout} style={{padding: '0.5rem 1rem'}}>Logout</button>
            </>
          ) : (
             <>
               <Link to="/login">Login</Link>
               <Link to="/signup" className="btn btn-primary" style={{padding: '0.5rem 1rem'}}>Sign up</Link>
             </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
