//Navbar
import React, { Component } from 'react';
import './Navbar.css';
import api from "../services/api";

export class Navbar extends Component {
  state = {
        location: "Select location",
        cartCount: 0,
        searchQuery: "",
        userName: ""
    };

    componentDidMount() {
        this.getCartCount();
        this.getLocation();
    }

    getCartCount = () => {
        const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        return;
    }

    this.setState({
        userName: user.user_name
    });


    const userEmail = user.user_email;

    api.get(`/cart/count/${encodeURIComponent(userEmail)}`)
        .then((response) => {
            this.setState({
                cartCount: response.data.count
            });
        })
        .catch((error) => {
            console.log("Cart count error:", error);
        });
    };

    getLocation = () => {

        if (!navigator.geolocation) {
            this.setState({
                location: "Location unavailable"
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);

                // Reverse geocoding
                try {

                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
                    );

                    const data = await response.json();

                    const address = data.address;

                    const city = address.city || "";
                   const state = address.state || "";

                  const locationName = city && state? `${city}, ${state}`: city || state || "Unknown location";

                    this.setState({
                        location: locationName
                    });

                } catch (error) {

                    console.log(error);

                    this.setState({
                        location: "Unable to find location"
                    });
                }
            },

            (error) => {

                console.log(error);

                this.setState({
                    location: "Location permission denied"
                });
            }
        );
    };

    handleSearch = (event) => {
    event.preventDefault();

    const query = this.state.searchQuery.trim();

    if (!query) {
        return;
    }

    window.location.href = `/search?q=${encodeURIComponent(query)}`; //This function doesn't actually call your FastAPI API. It only changes the URL to: /search?q=laptop (if "laptop" is searched in seachbar)
};


  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm">
        <div className="container-fluid">
          {/* 1. LOGO (Left) */}
          <a href="/" className="navbar-brand d-flex align-items-center">
            <img
              src="/nav-logo.png" // Make sure this file exists in your public folder!
              alt="KocharKart Logo"
              className="nav-logo"
            />
          </a>
          {/* Location */}
              <div className="navbar-location" onClick={this.getLocation}>
                  <i className="bi bi-geo-alt-fill"></i>

                  <div>
                      <small>Deliver to</small>
                      <div>{this.state.location}</div>
                  </div>
              </div>
          {/* Toggler for Mobile View */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible Content */}
          <div className="collapse navbar-collapse" id="navbarContent">
            {/* 2. CENTERED SEARCH BAR */}
            <form className="d-flex mx-auto search-form my-2 my-lg-0" role="search" onSubmit={this.handleSearch}>
              <input
                className="form-control me-2 rounded-pill"
                type="search"
                placeholder="Search KocharKart..."
                aria-label="Search"
                value={this.state.searchQuery}
                onChange={(e) => this.setState({ searchQuery: e.target.value })}
              />
              <button className="btn btn-outline-light rounded-pill search-btn" type="submit">
                Search
              </button>
            </form>


            {/* 3. ACTION ICONS (Right) */}
            <div className="d-flex align-items-center gap-3 action-icons ms-auto">
              {/* User Account */}
<a href="/account" className="nav-link text-light p-0 account-link" title="Account">

  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>

  <span className="account-user-name">
    {this.state.userName || "Account"}
  </span>

</a>

              {/* Wishlist (Heart) */}
              <a href="/wishlist" className="nav-link text-light p-0" title="Wishlist">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-heart">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span className="mx-1"><b>Wishlist</b></span>
              </a>

              {/* Cart with Badge */}
              <a href="/cart" className="nav-link text-light p-0 position-relative cart-icon" title="Cart">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-cart">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="mx-1"><b>Cart</b></span>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-badge">
                  {this.state.cartCount}
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;