'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AuthDemoPage(): React.JSX.Element {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123456');
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState<unknown>(null);
  const [error, setError] = useState('');

  const handleLogin = async (): Promise<void> => {
    try {
      setError('');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as {
        error?: { message?: string };
        data?: { accessToken: string; user: unknown };
      };

      if (!response.ok) {
        throw new Error(data.error?.message ?? 'Login failed');
      }

      if (data.data) {
        setToken(data.data.accessToken);
        setUserData(data.data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleGetMe = async (): Promise<void> => {
    try {
      setError('');
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as {
        error?: { message?: string };
        data?: { user: unknown };
      };

      if (!response.ok) {
        throw new Error(data.error?.message ?? 'Failed to get user data');
      }

      if (data.data) {
        setUserData(data.data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTestProtectedRoute = async (): Promise<void> => {
    try {
      setError('');
      const response = await fetch('/api/moods', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as { error?: { message?: string } };

      if (!response.ok) {
        throw new Error(data.error?.message ?? 'Failed to access protected route');
      }

      // eslint-disable-next-line no-alert
      alert('Success! Protected route accessed. Check console for data.');
      // eslint-disable-next-line no-console
      console.log('Protected route data:', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Authentication Demo</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="demo123456"
            />
          </div>
          <Button onClick={() => void handleLogin()} className="w-full">
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
            <p className="break-all rounded bg-gray-100 p-2 font-mono text-xs">{token}</p>
            <div className="mt-4 space-x-2">
              <Button onClick={() => void handleGetMe()} variant="outline">
                Get Current User
              </Button>
              <Button onClick={() => void handleTestProtectedRoute()} variant="outline">
                Test Protected Route
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {userData !== null && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">
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
