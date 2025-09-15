# API Integration Documentation

## Structure Overview

```
src/
├── lib/
│   ├── types/          # TypeScript interfaces & types
│   │   ├── auth.ts     # Authentication related types
│   │   └── index.ts    # Export all types
│   ├── api/            # API service functions
│   │   ├── auth.ts     # Authentication API calls
│   │   └── index.ts    # Export all APIs
│   └── utils/          # Utility functions
│       ├── api-client.ts # HTTP client with auth handling
│       └── index.ts    # Export all utilities
└── hooks/              # React hooks
    ├── useAuth.ts      # Authentication hook
    ├── AuthContext.tsx # Global auth context
    └── index.ts        # Export all hooks
```

## Usage Examples

### 1. Using the useAuth hook

```tsx
import { useAuth } from '@/hooks';

function LoginComponent() {
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async () => {
    const result = await login({ username: 'admin', password: 'admin123' });
    if (result.success) {
      console.log('Login successful:', result.data);
    } else {
      console.error('Login failed:', result.error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Using the AuthContext (Global State)

```tsx
// In your layout.tsx or _app.tsx
import { AuthProvider } from '@/hooks';

export default function Layout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

// In any component
import { useAuthContext } from '@/hooks';

function SomeComponent() {
  const { user, isAuthenticated, logout } = useAuthContext();
  
  return (
    <div>
      {isAuthenticated && (
        <p>Hello, {user?.username}!</p>
      )}
    </div>
  );
}
```

### 3. Direct API Usage

```tsx
import { authApi } from '@/lib/api';

// Login
const loginResult = await authApi.login({
  username: 'admin',
  password: 'admin123'
});

// Get profile
const profileResult = await authApi.getProfile();

// Logout
const logoutResult = await authApi.logout();
```

### 4. Using API Client directly

```tsx
import { apiClient } from '@/lib/utils';

// Custom API call
const result = await apiClient.get('/custom-endpoint');
const postResult = await apiClient.post('/custom-endpoint', { data: 'example' });
```

## API Endpoints Configured

- **POST** `/login` - User login
- **GET** `/me` - Get user profile
- **POST** `/logout` - User logout

## Features

- ✅ Automatic token management (localStorage)
- ✅ Request/Response interceptors
- ✅ TypeScript support
- ✅ Error handling
- ✅ Loading states
- ✅ Global authentication state
- ✅ Auto token validation on app start

## Error Handling

All API calls return a consistent `ApiResponse<T>` structure:

```tsx
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    error: string;
    message: string;
  };
}
```

## Testing

Visit `/login-example` to test the authentication flow with the provided test credentials:
- Username: `admin`
- Password: `admin123`
