'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AuthDemoPage() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123456');
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      setToken(data.data.accessToken);
      setUserData(data.data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleGetMe = async () => {
    try {
      setError('');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get user data');
      }

      setUserData(data.data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTestProtectedRoute = async () => {
    try {
      setError('');
      const response = await fetch('/api/moods', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to access protected route');
      }

      alert('Success! Protected route accessed. Check console for data.');
      console.log('Protected route data:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Authentication Demo</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="demo123456"
            />
          </div>
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </CardContent>
      </Card>

      {token && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Authentication Token</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-mono break-all bg-gray-100 p-2 rounded">
              {token}
            </p>
            <div className="mt-4 space-x-2">
              <Button onClick={handleGetMe} variant="outline">
                Get Current User
              </Button>
              <Button onClick={handleTestProtectedRoute} variant="outline">
                Test Protected Route
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {userData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}