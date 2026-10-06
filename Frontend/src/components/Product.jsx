//Product.jsx
import React, { Component } from "react";
import "./Product.css";
import api from "../services/api";

export class Product extends Component {

  state = {
    isFavourite: false,
    wishlistLoading: true,
    isAdmin: false,
    showAdminMenu: false
};

  componentDidMount() {
    this.checkAdmin();
    this.checkWishlist();}

    componentWillUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
}
  handleOutsideClick = (event) => {

    if (
        this.state.showAdminMenu &&
        this.adminMenuRef &&
        !this.adminMenuRef.contains(event.target)
    ) {
        this.setState({
            showAdminMenu: false
        });
    }
};

  checkAdmin = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (
        user &&
        user.user_email === "anwesha.bose2021@gmail.com"
    ) {
        this.setState({
            isAdmin: true
        });
    }
    document.addEventListener("click", this.handleOutsideClick);
};

 toggleAdminMenu = () => {
  event.stopPropagation();
    this.setState((prevState) => ({
        showAdminMenu: !prevState.showAdminMenu
    }));
};

handleEditProduct = () => {

    const productId = this.props.productId;

    window.location.href =
        `/admin/add-product?edit=${productId}`;
};

  checkWishlist = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        this.setState({
            isFavourite: false,
            wishlistLoading: false
        });
        return;
    }

    const userEmail = user.user_email;

    api.get(`/wishlist/${userEmail}`)
        .then((response) => {

            const wishlistItems = response.data;

            const exists = wishlistItems.some(
                (item) => item.product_name === this.props.carttitle
            );

            this.setState({
                isFavourite: exists,
                wishlistLoading: false
            });
        })
        .catch((error) => {
            console.log("Wishlist check error:", error);

            this.setState({
                isFavourite: false,
                wishlistLoading: false
            });
        });
};

  handleFavourite = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {alert("Please login first.");return;}
    const userEmail = user.user_email;
    const wishlistItem = {
        user_email: userEmail,
        product_name: this.props.carttitle,
    };
    if (!this.state.isFavourite) {
        api.post("/wishlist/add", wishlistItem)
            .then((response) => {
                console.log("Wishlist:", response.data);
                this.setState({
                    isFavourite: true
                });
            })
            .catch((error) => {
                console.log("Wishlist error:", error);
                alert(
                    error.response?.data?.detail ||
                    "Failed to add to wishlist."
                );
            });
    } else {
        api.delete(
            `/wishlist/${userEmail}/${encodeURIComponent(this.props.carttitle)}`)
        .then((response) => {
            console.log("Wishlist:", response.data);
            this.setState({
                isFavourite: false
            });
        })
        .catch((error) => {
            console.log("Wishlist error:", error);
            alert(
                error.response?.data?.detail ||
                "Failed to remove from wishlist."
            );
        });
    }
};

  handleAddToCart = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {alert("Please login first.");return;}
    const cartItem = {
        user_email: user.user_email,
        product_name: this.props.carttitle,
        brand:this.props.brand,
        image:this.props.image,
        quantity: 1
    };
    api.post("/cart/add", cartItem)
        .then((response) => {
            console.log(response.data);
            alert("Product added to cart!");
            // Refresh the entire page
            window.location.reload();
        })
        .catch((error) => {
            if (error.response && error.response.status === 400) {
                alert("Product is already present in cart.");//error.response.data.detail
            } else {
                alert("Something went wrong. Please try again.");
            }
        });
};
handleDeleteProduct = () => {

    const productId = this.props.productId;
    const productName = this.props.carttitle;

    const confirmDelete = window.confirm(
        `Are you sure you want to delete "${productName}"?`
    );

    if (!confirmDelete) {
        return;
    }

    api.delete(`/products/${productId}`)
        .then((response) => {

            console.log("Product deleted:", response.data);

            alert("Product deleted successfully.");

            window.location.reload();
        })
        .catch((error) => {

            console.log("Delete product error:", error);

            alert(
                error.response?.data?.detail ||
                "Failed to delete product."
            );
        });
};

  render() {
    return (
      <div className="product-container">

        {/* Image + badges */}
        <div className="image-container">

          {/* Stock + Favourite */}
              <div className="stock-info">

                  {this.props.stock === 0 ? (
                      <span className="out-of-stock">
                          Out of Stock
                      </span>
                  ) : this.props.stock < 10 ? (
                      <span className="low-stock">
                          Only {this.props.stock} left
                      </span>
                  ) : null}
              </div>
                <div className="product-actions">
                {/* Admin three-dot menu */}
                  {this.state.isAdmin && (
                      <div className="admin-product-menu" ref={(ref) => (this.adminMenuRef = ref)}>
                          <button className="admin-menu-btn" onClick={this.toggleAdminMenu} title="Product options">⋮</button>
                          {this.state.showAdminMenu && (
                              <div className="admin-menu-dropdown">
                                  <button onClick={this.handleEditProduct}>✏️ Edit Product</button>
                                  <button className="delete-option" onClick={this.handleDeleteProduct}> 🗑️ Delete Product</button>
                              </div>
                          )}
                      </div>
                  )}
                  <button
                      className="favourite-btn"
                      onClick={this.handleFavourite}
                      title="Add to Wishlist"
                  >
                      {this.state.isFavourite ? "♥" : "♡"}
                  </button>
                </div>

          {/* Product Image */}
          <img href={this.props.url} src={this.props.image} className="product-image" alt={this.props.name}/>

          {/* Rating + Discount */}
          <div className="image-info">

            <b>
              <span className="rating-badge">
                {this.props.rating} ⭐
              </span>
            </b>

            <b>
              <span className="discount-badge">
                {this.props.discount}% off
              </span>
            </b>

          </div>

        </div>


        {/* Product information below image */}
        <div className="product-details">

          <div>
            <b>
              <span className="product-name">
                {this.props.name}
              </span>
            </b>
          </div>


          {/* Price */}
          <div className="price-container">

            <span className="previous-price product-price">
              ₹{this.props.price}
            </span>

            <span className="product-price">
              ₹{Math.round(
                this.props.price -
                (this.props.price * this.props.discount / 100)
              )}
            </span>

            {this.props.discount >= 20 ? (
              <span className="sale-badge">
                Mega Sale is Live
              </span>
            ) : this.props.discount > 5 ? (
              <span className="sale-badge">
                Sale is Live
              </span>
            ) : null}
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-primary my-2 w-50" onClick={this.handleAddToCart}><b>Add to Cart</b></button>
            <button className="btn btn-sm btn-success my-2 w-50" onClick={this.handleBuyNow}><b>Buy Now</b></button>
          </div>
        </div>
        
      </div>
    );
  }
}

export default Product;