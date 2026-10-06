import React, { Component } from "react";
import api from "../services/api";
import "./Wishlist.css"; // Ensure you import your CSS file

export class Wishlists extends Component {
  state = {
    wishlistItems: [],
    loading: false,
  };

  componentDidMount() {
    this.getWishlist();
  }

  getWishlist = () => {
    this.setState({ loading: true });
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Please login first.");
        return;
    }

    const userEmail = user.user_email;

    api.get(`/wishlist/${userEmail}`)
      .then((response) => {
        // Ensure wishlistItems is an array even if empty or unexpected format
        const items = Array.isArray(response.data) ? response.data : [];
        this.setState({
          wishlistItems: items,
          loading: false,
        });
      })
      .catch((error) => {
        console.log("Wishlist error:", error);
        this.setState({
          wishlistItems: [],
          loading: false,
        });
      });
  };

  // Helper calculation for total price
  calculateTotalPrice = () => {
    return this.state.wishlistItems.reduce(
      (total, item) => total + (Math.round(item.price - (item.price * item.discount / 100))|| 0) * (item.quantity || 1),
      0
    );
  };

  handleRemove = (productName) => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Please login first.");
        return;
    }

    const userEmail = user.user_email;

    api.delete(`/wishlist/${userEmail}/${encodeURIComponent(productName)}`)
        .then((response) => {
            console.log(response.data);

            // Remove the product from the screen immediately
            this.setState({
                wishlistItems: this.state.wishlistItems.filter(
                    (item) => item.product_name !== productName
                )
            });
        })
        .catch((error) => {
            console.log("Remove error:", error);

            alert(
                error.response?.data?.detail ||
                "Failed to remove product from wishlist."
            );
        });
};

  render() {
    const { wishlistItems, loading } = this.state;
    const totalPrice = this.calculateTotalPrice();
    const deliveryCharge = totalPrice > 500 || totalPrice === 0 ? 0 : 40;

    if (loading) {
      return (
        <div className="wishlist-page-bg">
          <div className="wishlist-container loading-state">
            <h4>Loading your wishlist...</h4>
          </div>
        </div>
      );
    }

    if (wishlistItems.length === 0) {
      return (
        <div className="wishlist-page-bg">
          <div className="wishlist-container empty-wishlist flex-center">
            <h3>Your wishlist is empty!</h3>
            <p>Explore our wide range of products and add items to your wishlist.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="wishlist-page-bg">
        <div className="wishlist-container">
          {/* Left Column: wishlist Items List */}
          <div className="wishlist-left">
            <div className="wishlist-header">
              <h3>My wishlist ({wishlistItems.length})</h3>
            </div>

            <div className="wishlist-items-list">
              {wishlistItems.map((item, index) => (
                <div key={item.id || index} className="wishlist-item">
                  <div className="item-image-container">
                    <img src={item.image} alt={item.product_name} />
                  </div>

                  <div className="item-details">
                    <h5 className="item-title">{item.product_name}</h5>
                    <div className="item-price-row">
                      <span className="item-price previous-price">₹{item.price}</span>
                      <span className="product-price">
              ₹{Math.round(item.price - (item.price * item.discount / 100))}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="item-actions">
                      <button className="remove-btn" onClick={() => this.handleRemove(item.product_name)} >REMOVE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Price Details */}
          <div className="wishlist-right">
            <div className="price-details-card">
              <h4 className="price-header">PRICE DETAILS</h4>
              <div className="price-row">
                <span>Price ({wishlistItems.length} items)</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="price-row">
                <span>Delivery Charges</span>
                <span className={deliveryCharge === 0 ? "free-text" : ""}>
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </span>
              </div>
              <hr />
              <div className="price-row total-row">
                <span>Total Amount</span>
                <span>₹{totalPrice + deliveryCharge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Wishlists;