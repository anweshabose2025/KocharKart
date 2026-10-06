import React, { Component } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import Product from "./Product";

class SearchResults extends Component {

    state = {
        products: [],
        loading: true
    };

    componentDidMount() {
        this.searchProducts();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.query !== this.props.query) {
            this.searchProducts();
        }
    }

    searchProducts = () => {

        this.setState({ loading: true });

        api.get("/search/products", {
            params: {
                q: this.props.query
            }
        })
        .then((response) => {

            console.log("Search results:", response.data);

            this.setState({
                products: response.data,
                loading: false
            });

        })
        .catch((error) => {

            console.log("Search error:", error);

            this.setState({
                products: [],
                loading: false
            });

        });
    };

    render() {

        if (this.state.loading) {return <h4 className="container my-4">Searching...</h4>;}

        return (
            <div className="container my-4">
                <h4>Search results for: "{this.props.query}"</h4>
                <div className="row my-4">
                    {this.state.products.length > 0 ? (
                        this.state.products.map((i) => (
                            <div className="col-md-3" key={i.name}>
                                <Product productId={i._id} quantity={i.quantity} carttitle={i.name} name={i.name?i.name.slice(0,28)+"...":"No title available"} price={i.price} image={i.image? i.image:"/no-image.svg"} discount={i.discount} rating={i.rating} stock={i.stock}/>
                                </div>))) : (<h5>No products found.</h5>)}
                            </div>
                        </div>)}
}


function SearchResultsWrapper() {

    const [searchParams] = useSearchParams();

    const query = searchParams.get("q") || "";

    return <SearchResults query={query} />;
}

export default SearchResultsWrapper;