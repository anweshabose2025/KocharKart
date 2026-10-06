import React, { Component } from "react";
import "./Chatbot.css";
import api from "../services/api";

export class Chatbot extends Component {

    state = {
        isChatOpen: false,
        isPopupVisible: true,
        message: "",
        messages: [
            {
                sender: "bot",
                text: "Hello! I'm your KocharKart AI Assistant. How can I help you find items today?"
            }
        ]
    };

    toggleChatbot = () => {
        this.setState((prevState) => ({
            isChatOpen: !prevState.isChatOpen
        }));
    };

    dismissPopup = (event) => {
        event.stopPropagation();

        this.setState({
            isPopupVisible: false
        });
    };

    handleChange = (event) => {
        this.setState({
            message: event.target.value
        });
    };

    handleKeyPress = (event) => {
        if (event.key === "Enter") {
            this.sendMessage();
        }
    };

    sendMessage = () => {

    const userMessage = this.state.message.trim();

    if (!userMessage) {
        return;
    }

    // Show user's message immediately
    this.setState((prevState) => ({
        messages: [
            ...prevState.messages,
            {
                sender: "user",
                text: userMessage
            }
        ],
        message: ""
    }));

    // Send to FastAPI
    api.post("/chatbot/", {
        query: userMessage
    })

    .then((response) => {

        console.log("Chatbot response:", response.data);

        const newMessages = [
            {
                sender: "bot",
                text: response.data.message
            }
        ];

        // Add products if backend returned products
        if (
            response.data.type === "products" &&
            response.data.data &&
            response.data.data.length > 0
        ) {

            response.data.data.forEach((product) => {

                newMessages.push({
                    sender: "product",
                    product: product
                });

            });
        }

        this.setState((prevState) => ({
            messages: [
                ...prevState.messages,
                ...newMessages
            ]
        }));

    })

    .catch((error) => {

        console.log("Chatbot error:", error);
        console.log("Backend error:", error.response?.data);

        this.setState((prevState) => ({
            messages: [
                ...prevState.messages,
                {
                    sender: "bot",
                    text: "Sorry, I couldn't process your request."
                }
            ]
        }));

    });
};

    render() {

        return (
            <>
                {/* Floating AI Assistant Launcher */}

                <div id="ai-assistant-container">

                    {/* Initial Greeting Callout Bubble */}

                    {this.state.isPopupVisible && !this.state.isChatOpen && (
                        <div
                            id="ai-popup-bubble"
                            onClick={this.toggleChatbot}
                        >
                            <span>How can I help you?</span>

                            <button
                                id="ai-popup-close"
                                onClick={this.dismissPopup}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Robot Trigger Button */}

                    <button
                        id="ai-robot-btn"
                        onClick={this.toggleChatbot}
                        aria-label="Open AI Assistant"
                    >

                        <div className="robot-icon">

                            <div className="robot-antenna"></div>

                            <div className="robot-head">

                                <div className="robot-eye left"></div>

                                <div className="robot-eye right"></div>

                            </div>

                        </div>

                    </button>

                </div>


                {/* Chatbot Drawer Window */}

                <div
                    id="chatbot-window"
                    className={
                        this.state.isChatOpen
                            ? "chat-open"
                            : "chat-hidden"
                    }
                >

                    <div className="chat-header">

                        <div className="chat-header-info">

                            <div className="status-indicator"></div>

                            <h3>KocharKart Assistant</h3>

                        </div>

                        <button
                            className="chat-close-btn"
                            onClick={this.toggleChatbot}
                        >
                            ✕
                        </button>

                    </div>


                    <div
                        className="chat-messages"
                        id="chat-messages"
                    >

                        {this.state.messages.map((message, index) => {

    if (message.sender === "product") {
        return (
            <div
                key={index}
                className="chat-product-card"
            >
                <img
                    src={message.product.image}
                    alt={message.product.name}
                    className="chat-product-image"
                />

                <div className="chat-product-info">

                    <div className="chat-product-name">
                        {message.product.name}
                    </div>

                    <div className="chat-product-price">
                        ₹{message.product.price}
                    </div>

                    <div className="chat-product-rating">
                        ⭐ {message.product.rating}
                    </div>

                    <div className="chat-product-discount">
                        {message.product.discount}% off
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div
            key={index}
            className={
                message.sender === "bot"
                    ? "chat-bubble bot-bubble"
                    : "chat-bubble user-bubble"
            }
        >
            {message.text}
        </div>
    );

})}

                    </div>


                    <div className="chat-input-area">

                        <input
                            type="text"
                            id="chat-user-input"
                            placeholder="Search products or ask a question..."
                            value={this.state.message}
                            onChange={this.handleChange}
                            onKeyDown={this.handleKeyPress}
                        />

                        <button
                            id="chat-send-btn"
                            onClick={this.sendMessage}
                        >
                            Send
                        </button>

                    </div>

                </div>
            </>
        );
    }
}

export default Chatbot;