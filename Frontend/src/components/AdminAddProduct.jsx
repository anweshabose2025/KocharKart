import React, { Component } from "react";
import api from "../services/api";
import "./AdminAddProduct.css";

class AdminAddProduct extends Component {

    state = {
        name: "",
        description: "",
        price: "",
        category: "",
        subcategory: "",
        brand: "",
        stock: "",
        size: "",
        colour: "",
        image: "",
        rating: "",
        discount: "",
        loading: false,
        editMode: false,
        editingProductId: ""
    };

    componentDidMount() {

    const params = new URLSearchParams(window.location.search);

    const editProductId = params.get("edit");

    if (editProductId) {

        this.setState({
            editMode: true,
            editingProductId: editProductId
        });

        this.loadProduct(editProductId);
    }
}

    loadProduct = (productId) => {

    this.setState({
        loading: true
    });

    api.get(`/products/${productId}`)
        .then((response) => {

            const product = response.data;

            this.setState({

                name: product.name || "",
                description: product.description || "",
                price: product.price ?? "",
                category: product.category || "",
                subcategory: product.subcategory || "",
                brand: product.brand || "",
                stock: product.stock ?? "",

                size: Array.isArray(product.size)
                    ? product.size.join(", ")
                    : "",

                colour: Array.isArray(product.colour)
                    ? product.colour.join(", ")
                    : "",

                image: product.image || "",
                rating: product.rating ?? "",
                discount: product.discount ?? "",

                loading: false
            });
        })
        .catch((error) => {

            console.log("Load product error:", error);

            alert(
                error.response?.data?.detail ||
                "Failed to load product."
            );

            this.setState({
                loading: false
            });
        });
};


    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleSubmit = (event) => {
        event.preventDefault();

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || user.user_email !== "anwesha.bose2021@gmail.com") {
            alert("Only admin can add products.");
            return;
        }

        const product = {
            name: this.state.name,
            description: this.state.description,
            price: Number(this.state.price),
            category: this.state.category,
            subcategory: this.state.subcategory,
            brand: this.state.brand,
            stock: Number(this.state.stock),
            size: this.state.size
                .split(",")
                .map(item => item.trim())
                .filter(Boolean),
            colour: this.state.colour
                .split(",")
                .map(item => item.trim())
                .filter(Boolean),
            image: this.state.image,
            rating: Number(this.state.rating),
            discount: Number(this.state.discount)
        };

        this.setState({ loading: true });

if (this.state.editMode) {

    api.put(
        `/products/${encodeURIComponent(
            this.state.editingProductId
        )}`,
        product,
        {
            params: {
                admin_email: user.user_email
            }
        }
    )
    .then((response) => {

        console.log(response.data);

        alert("Product updated successfully!");

        window.location.href = "/";

    })
    .catch((error) => {

        console.log("Update product error:", error);

        alert(
            error.response?.data?.detail ||
            "Failed to update product."
        );

        this.setState({
            loading: false
        });
    });

} else {

    api.post("/products/add", product)
        .then((response) => {

            console.log(response.data);

            alert("Product added successfully!");

            window.location.href = "/";

        })
        .catch((error) => {

            console.log("Add product error:", error);

            alert(
                error.response?.data?.detail ||
                "Failed to add product."
            );

            this.setState({
                loading: false
            });
        });
}}

    render() {
  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-header bg-white border-bottom py-3">
          <h2 className="h4 mb-0 text-dark fw-bold">Add / Manage Products</h2>
        </div>
        <div className="card-body p-4">
          <h3 className="h5 fw-semibold mb-4">{this.state.editMode? "Edit Product": "Add New Product"}</h3>
          <form onSubmit={this.handleSubmit}>
            {/* General Information */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-medium">Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="e.g. Slim Fit Cotton Shirt"
                  value={this.state.name}
                  onChange={this.handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Brand</label>
                <input
                  type="text"
                  className="form-control"
                  name="brand"
                  placeholder="e.g. Nike, Roadster"
                  value={this.state.brand}
                  onChange={this.handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-medium">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="description"
                  placeholder="Detailed product features and specifications..."
                  value={this.state.description}
                  onChange={this.handleChange}
                  required
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-medium">Price (₹)</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    placeholder="0.00"
                    value={this.state.price}
                    onChange={this.handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-medium">Discount (%)</label>
                <input
                  type="number"
                  className="form-control"
                  name="discount"
                  placeholder="e.g. 15"
                  value={this.state.discount}
                  onChange={this.handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-medium">Stock Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  name="stock"
                  placeholder="e.g. 50"
                  value={this.state.stock}
                  onChange={this.handleChange}
                  required
                />
              </div>
            </div>

            {/* Categorization */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-medium">Category</label>
                <select
                  className="form-select"
                  name="category"
                  value={this.state.category}
                  onChange={this.handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Large">Large</option>
                  <option value="Home">Home</option>
                  <option value="BGM">BGM</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Subcategory</label>
                <input
                  type="text"
                  className="form-control"
                  name="subcategory"
                  placeholder="e.g. Topwear, Footwear"
                  value={this.state.subcategory}
                  onChange={this.handleChange}
                />
              </div>
            </div>

            {/* Media & Attributes */}
            <div className="row g-3 mb-4">
              <div className="col-12">
                <label className="form-label fw-medium">Product Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  name="image"
                  placeholder="https://flipkart-images-anwesha.s3.eu-north-1.amazonaws.com/Lifestyle/example.png"
                  value={this.state.image}
                  onChange={this.handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Available Sizes</label>
                <input
                  type="text"
                  className="form-control"
                  name="size"
                  placeholder="Comma separated (e.g. S, M, L, XL)"
                  value={this.state.size}
                  onChange={this.handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Available Colors</label>
                <input
                  type="text"
                  className="form-control"
                  name="colour"
                  placeholder="Comma separated (e.g. Red, Blue, Black)"
                  value={this.state.colour}
                  onChange={this.handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-medium">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="form-control"
                  name="rating"
                  placeholder="0.0 - 5.0"
                  value={this.state.rating}
                  onChange={this.handleChange}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn btn-success btn-lg px-4 fs-6 fw-semibold"
                disabled={this.state.loading}
              >
                {this.state.loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {this.state.editMode
                ? "Updating..."
                : "Adding..."}
        </>
    ) : (
        this.state.editMode
            ? "Update Product"
            : "Add Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
}

export default AdminAddProduct;
