import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import App from "./App.tsx";
import AuthErrorBoundary from "./components/AuthErrorBoundary.tsx";
import "./index.css";
import '@aws-amplify/ui-react/styles.css';
import "./styles/auth.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

// Global error handler for authentication errors
window.addEventListener('error', (event) => {
  if (event.error?.message?.includes('User pool client') || event.error?.message?.includes('does not exist')) {
    event.preventDefault();
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #f5f7fa;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      ">
        <div style="
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 61, 92, 0.1);
          border: 1px solid #e1e5e9;
          padding: 40px;
          max-width: 400px;
          text-align: center;
        ">
          <h2 style="color: #003d5c; margin-bottom: 16px;">Service Temporarily Unavailable</h2>
          <p style="color: #5a6c7d; margin-bottom: 24px;">Authentication services are currently unavailable. Please try again later.</p>
          <button onclick="window.location.reload()" style="
            background-color: #003d5c;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            cursor: pointer;
            font-size: 14px;
          ">Retry</button>
        </div>
      </div>
    `;
  }
});

// Configure Amplify with environment variables or fallback to outputs file
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || outputs.auth?.user_pool_id,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || outputs.auth?.user_pool_client_id,
      identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID || outputs.auth?.identity_pool_id,
      loginWith: {
        email: true
      }
    }
  }
};

Amplify.configure(amplifyConfig);

// Check if we should skip auth for testing
const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        {skipAuth ? (
            <App />
        ) : (
            <AuthErrorBoundary>
                <Authenticator>
                    <App />
                </Authenticator>
            </AuthErrorBoundary>
        )}
    </React.StrictMode>
);
