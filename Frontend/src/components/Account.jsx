import React, { Component } from "react";
import "./Account.css";
import api from "../services/api";

export class Account extends Component {

    state = {
        showRegister: false,

        loginEmail: "",
        loginPassword: "",

        name: "",
        registerEmail: "",
        phone: "",
        registerPassword: ""
    };

    handleLoginChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleRegisterChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleLogin = (event) => {

    event.preventDefault();

    const loginData = {
        user_email: this.state.loginEmail,
        password: this.state.loginPassword
    };

    api.post("/auth/login", loginData)
        .then((response) => {

            console.log("Login response:", response.data);

            // Save logged-in user
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            alert("Login successful.");

            // Go to homepage
            window.location.href = "/";
        })
        .catch((error) => {

            console.log("Login error:", error);

            alert(
                error.response?.data?.detail ||
                "Login failed."
            );
        });
};

    handleRegister = (event) => {

    event.preventDefault();

    const registerData = {
        user_name: this.state.name,
        user_email: this.state.registerEmail,
        phone: this.state.phone,
        password: this.state.registerPassword
    };

    api.post("/users/register", registerData)
        .then((response) => {

            console.log("Registration response:", response.data);

            alert("Registration successful. Please login.");

            // Clear registration fields
            this.setState({
                name: "",
                registerEmail: "",
                phone: "",
                registerPassword: "",

                // Go back to login page
                showRegister: false
            });
        })
        .catch((error) => {

            console.log("Registration error:", error);

            alert(
                error.response?.data?.detail ||
                "Registration failed."
            );
        });
};

    render() {

        return (
            <div className="account-page">

                <div className="account-container">

                    {this.state.showRegister ? (

                        // ================= REGISTER =================

                        <div className="account-box">

                            <h2>Create Account</h2>

                            <form onSubmit={this.handleRegister}>

                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={this.state.name}
                                        onChange={this.handleRegisterChange}
                                        maxLength={10}
                                        required
                                        />
                                    <small>Maximum 10 characters</small>
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="registerEmail"
                                        placeholder="Enter your email"
                                        value={this.state.registerEmail}
                                        onChange={this.handleRegisterChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Enter your phone number"
                                        value={this.state.phone}
                                        onChange={this.handleRegisterChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="registerPassword"
                                        placeholder="Create a password"
                                        value={this.state.registerPassword}
                                        onChange={this.handleRegisterChange}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="account-btn"
                                >
                                    REGISTER
                                </button>

                            </form>

                            <div className="account-switch">

                                <span>Already have an account?</span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        this.setState({ showRegister: false })
                                    }
                                >
                                    LOGIN
                                </button>

                            </div>

                        </div>

                    ) : (

                        // ================= LOGIN =================

                        <div className="account-box">

                            <h2>Account</h2>

                            <form onSubmit={this.handleLogin}>

                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="loginEmail"
                                        placeholder="Enter your email"
                                        value={this.state.loginEmail}
                                        onChange={this.handleLoginChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="loginPassword"
                                        placeholder="Enter your password"
                                        value={this.state.loginPassword}
                                        onChange={this.handleLoginChange}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="account-btn"
                                >
                                    LOGIN
                                </button>

                            </form>

                            <div className="account-switch">

                                <span>Don't have an account?</span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        this.setState({ showRegister: true })
                                    }
                                >
                                    REGISTER
                                </button>

                            </div>

                        </div>

                    )}

                </div>

            </div>
        );
    }
}

export default Account;