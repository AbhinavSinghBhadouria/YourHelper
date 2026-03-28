Authentication while using OAuth2


User clicks Google Sign-In
        ↓
Google returns a Credential Token (JWT) to your callback
        ↓
You send that token to YOUR backend
        ↓
Backend verifies it with Google, extracts user info
        ↓
Backend finds/creates user in MongoDB
        ↓
Backend returns YOUR OWN JWT (same as normal login)
        ↓
Frontend stores it and proceeds normally