//App.jsx
import './App.css';
import React, { Component } from 'react';
import {BrowserRouter,Routes,Route} from "react-router-dom";

import Navbar from './components/Navbar';
import CategoryNavbar from './components/CategoryNavbar';
import SearchResults from './components/SearchResults';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import Account from "./components/Account";
import AdminAddProduct from "./components/AdminAddProduct";
import Chatbot from "./components/Chatbot";

export class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/" element={<CategoryNavbar />}/>
                    <Route path="/search" element={<SearchResults />}/>
                    <Route path="/cart" element={<Cart />}/>
                    <Route path="/wishlist" element={<Wishlist />}/>
                    <Route path="/account" element={<Account />} />
                    <Route path="/admin/add-product" element={<AdminAddProduct />}/>
                </Routes>
                <Chatbot />
            </BrowserRouter>
        );
    }
}

export default App;