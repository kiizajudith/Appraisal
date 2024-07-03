import { useState, useEffect } from "react";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { doCreateUserWithEmailAndPassword } from "@/firebase/auth";

export default function Register({ email: propEmail }) {
  const [email, setEmail] = useState(propEmail || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propEmail) {
      setEmail(propEmail);
      generatePassword();
    }
  }, [propEmail]);

  useEffect(() => {
    if (email && password) {
      handleCreateAccount();
    }
  }, [email, password]);

  const generatePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let generatedPassword = "";
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }
    setPassword(generatedPassword);
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      await doCreateUserWithEmailAndPassword(email, password);
      setMessage("Account created successfully!");
      console.log(`Email: ${email}, Password: ${password}`);
    } catch (error) {
      setError("Failed to create account: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5">
      <Card className="mx-auto max-w-lg border-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>
            Account with the credentials below has been created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="mb-4 text-green-500 bg-green-100 p-2 rounded">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 text-red-500 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full focus:ring-2 focus:ring-green-500"
                  disabled
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="password"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full focus:ring-2 focus:ring-green-500"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
