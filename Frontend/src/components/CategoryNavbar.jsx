//CategoryNavbar.jsx
import React, { Component } from "react";
import api from "../services/api";
import "./CategoryNavbar.css";
import Product from "./Product.jsx";
export class CategoryNavbar extends Component {

    categories = [
        "All",
        "Electronics",
        "Mobile",
        "Furniture",
        "Lifestyle",
        "Grocery",
        "Large",
        "Home",
        "BGM"
    ];

    state = {products: [], loading: true, selectedCategory: "All"}

    componentDidMount() {
        api.get("/products")
            .then((response) => {
                this.setState({loading: true})
                console.log(response.data);
                this.setState({products: response.data, loading: false});
            })
            .catch((err) => {
                console.log(err); // products doesn't exist => 404 error // CORS problem => Request blocked // FastAPI isn't running => Network error
            });

    };


    handleCategoryClick = (category) => {
      let url;

    if (category === "All") {
        url = "/products";
    } else {
        url = `/products/category/${category}`;
    }

    this.setState({ loading: true, selectedCategory: category });
      api.get(url)
            .then((response) => {
                this.setState({loading: true})
                //console.log(category);
                //console.log(response.data);

                // Send products to Home
                this.setState({products: response.data, loading: false});

            })
            .catch((error) => {
                console.log(error);
                this.setState({
                products: [],
                loading: false
            });
            });
            

    };

    render() {
        return (
          <div>
            <div className="category-navbar">

                {this.categories.map((category) => (

                    <button
                        key={category}
                        className={this.state.selectedCategory === category? "category-button active": "category-button"}
                        onClick={() => this.handleCategoryClick(category)}
                    >
                        {category}
                    </button>

                ))}

            </div>
            <div className="container my-3">
                            {this.state.loading ? (<h4>Loading products...</h4>) : (
                                <div className="row my-4">
                                    {this.state.products.length > 0 ? (this.state.products.map((i) => (
                                            <div className="col-md-3" key = {i.name}>
                                            <Product productId={i._id} quantity={i.quantity} carttitle={i.name} name={i.name?i.name.slice(0,28)+"...":"No title available"} price={i.price} image={i.image? i.image:"/no-image.svg"} discount={i.discount} rating={i.rating} stock={i.stock}/>
                                            </div>))) : (<h4>No products found.</h4>)}
                                </div>
                            )}
                        </div>
                        </div>
        );
    }
}

export default CategoryNavbar;