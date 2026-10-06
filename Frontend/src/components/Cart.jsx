import React, { Component } from "react";
import api from "../services/api";
import "./Cart.css"; // Ensure you import your CSS file

export class Cart extends Component {
  state = {
    cartItems: [],
    loading: false,
    isAdmin: false
  };

  componentDidMount() {
    this.getCart();
    this.checkAdmin();
  }

  checkAdmin = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.user_email === "anwesha.bose2021@gmail.com") {
        this.setState({
            isAdmin: true
        });
    }
};

  handleAddItems = () => {
    window.location.href = "/admin/add-product";
};

  getCart = () => {
    this.setState({ loading: true });
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Please login first.");
        return;
    }

    const userEmail = user.user_email;

    api.get(`/cart/${userEmail}`)
      .then((response) => {
        // Ensure cartItems is an array even if empty or unexpected format
        const items = Array.isArray(response.data) ? response.data : [];
        this.setState({
          cartItems: items,
          loading: false,
        });
      })
      .catch((error) => {
        console.log("Cart error:", error);
        this.setState({
          cartItems: [],
          loading: false,
        });
      });
  };

  // Helper calculation for total price
  calculateTotalPrice = () => {
    return this.state.cartItems.reduce(
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

    api.delete(`/cart/${userEmail}/${encodeURIComponent(productName)}`)
        .then((response) => {
            console.log(response.data);

            // Remove the product from the screen immediately
            this.setState({
                cartItems: this.state.cartItems.filter(
                    (item) => item.product_name !== productName
                )
            });
        })
        .catch((error) => {
            console.log("Remove error:", error);

            alert(
                error.response?.data?.detail ||
                "Failed to remove product from cart."
            );
        });
};

  // Handlers for quantity (add backend calls here as needed)
  // Handlers for quantity (Immutably updating state)
  handleQuantityChange = (index, delta) => {

    const item = this.state.cartItems[index];

    const currentQty = Number(item.quantity) || 1;
    const newQty = currentQty + delta;

    if (newQty < 1) {
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Please login first.");
        return;
    }

    const userEmail = user.user_email;

    api.put(
        `/cart/${userEmail}/${encodeURIComponent(item.product_name)}`,
        null,
        {
            params: {
                quantity: newQty
            }
        }
    )
    .then((response) => {

        console.log("Quantity updated:", response.data);

        // Update React state after MongoDB update succeeds
        this.setState((prevState) => ({
            cartItems: prevState.cartItems.map((cartItem, i) => {
                if (i === index) {
                    return {
                        ...cartItem,
                        quantity: newQty
                    };
                }

                return cartItem;
            })
        }));
    })
    .catch((error) => {

        console.log("Quantity update error:", error);

        alert(
            error.response?.data?.detail ||
            "Failed to update quantity."
        );
    });
};

  render() {
    const { cartItems, loading } = this.state;
    const totalPrice = this.calculateTotalPrice();
    const deliveryCharge = totalPrice > 500 || totalPrice === 0 ? 0 : 40;

    if (loading) {
      return (
        <div className="cart-page-bg">
          <div className="cart-container loading-state">
            <h4>Loading your cart...</h4>
          </div>
        </div>
      );
    }

    if (cartItems.length === 0) {
      return (
        <div className="cart-page-bg">
          <div className="cart-container empty-cart flex-center">
            <h3>Your cart is empty!</h3>
            <p>Explore our wide range of products and add items to your cart.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="cart-page-bg">
        <div className="cart-container">
          {/* Left Column: Cart Items List */}
          <div className="cart-left">
            <div className="cart-header">
              <h3>My Cart ({cartItems.length})</h3>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item, index) => (
                <div key={item.id || index} className="cart-item">
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
                      <div className="quantity-controller">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() => this.handleQuantityChange(index, -1)}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => this.handleQuantityChange(index, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button className="remove-btn" onClick={() => this.handleRemove(item.product_name)} >REMOVE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <button className="place-order-btn">PLACE ORDER</button>
            </div>
          </div>

          {/* Right Column: Price Details */}
          <div className="cart-right">
             {this.state.isAdmin && (
        <div className="cart-right-header">
            <button
                className="btn btn-sm btn-primary add-items-btn"
                onClick={this.handleAddItems}
            >
                <b>Add Items</b>
            </button>
        </div>
    )}
            <div className="price-details-card">
              <h4 className="price-header">PRICE DETAILS</h4>
              <div className="price-row">
                <span>Price ({cartItems.length} items)</span>
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

export default Cart;