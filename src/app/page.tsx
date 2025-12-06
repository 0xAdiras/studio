"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateWords, validateWords } from "@/lib/words";
import { Loader2, KeyRound } from "lucide-react";

const PASSKEY_KEY = "moneygraph-passkey";
const AUTH_STATUS_KEY = "moneygraph-auth-status";

export default function AuthPage() {
  const [mode, setMode] = useState<"loading" | "login" | "setup">("loading");
  const [passkey, setPasskey] = useState("");
  const [generatedPasskey, setGeneratedPasskey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedPasskey = localStorage.getItem(PASSKEY_KEY);
    if (storedPasskey) {
      setMode("login");
    } else {
      setGeneratedPasskey(generateWords());
      setMode("setup");
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const storedPasskey = localStorage.getItem(PASSKEY_KEY);
    if (passkey === storedPasskey) {
      localStorage.setItem(AUTH_STATUS_KEY, "true");
      toast({
        title: "Success",
        description: "Welcome back to MoneyGraph.",
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "The 3-word passkey is incorrect. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleSetup = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!validateWords(passkey)) {
       toast({
        variant: "destructive",
        title: "Invalid Passkey",
        description: "Please use the generated 3-word passkey format (e.g., word-word-word).",
      });
      setIsLoading(false);
      return;
    }
    localStorage.setItem(PASSKEY_KEY, passkey);
    localStorage.setItem(AUTH_STATUS_KEY, "true");
    toast({
      title: "Passkey Created",
      description: "Welcome to MoneyGraph! Your dashboard is ready.",
    });
    router.push("/dashboard");
  };

  if (mode === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="z-10 flex flex-col items-center text-center mb-8">
        <div className="bg-primary/20 text-primary p-3 rounded-full mb-4 border border-primary/50">
          <KeyRound className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">MoneyGraph</h1>
        <p className="mt-2 text-lg text-muted-foreground">Your secure financial knowledge graph.</p>
      </div>
      {mode === "login" ? (
        <Card className="w-full max-w-sm z-10">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle>Enter Passkey</CardTitle>
              <CardDescription>Enter your 3-word passkey to unlock your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="e.g., apple-orbit-echo"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value.toLowerCase())}
                required
                disabled={isLoading}
                autoComplete="off"
                autoCapitalize="none"
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Unlock"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card className="w-full max-w-sm z-10">
          <form onSubmit={handleSetup}>
            <CardHeader>
              <CardTitle>Create Your Passkey</CardTitle>
              <CardDescription>
                This is your unique, private key. <b className="text-destructive">Save it somewhere safe.</b> It cannot be recovered.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  readOnly
                  value={generatedPasskey}
                  className="pr-10 font-mono text-center text-lg h-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPasskey);
                    toast({ title: "Copied to clipboard!" });
                  }}
                >
                  Copy
                </Button>
              </div>
              <Input
                type="text"
                placeholder="Confirm your passkey"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value.toLowerCase())}
                required
                disabled={isLoading}
                autoComplete="off"
                autoCapitalize="none"
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Create & Enter"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </main>
  );
}
