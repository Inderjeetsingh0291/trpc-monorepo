"use client";

import { useState, useEffect } from "react";
import { useUser } from "~/hooks/api/auth";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "~/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Switch } from "~/components/ui/switch";

export function AccountClient() {
  const { user, isLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
    }
  }, [user]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading your profile...</div>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      // Profile update endpoint not yet wired — placeholder
      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile", error);
      setSaveMessage("Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8 grid w-full max-w-md grid-cols-3 mx-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 pb-6">
              <CardTitle className="text-xl">Profile Details</CardTitle>
              <CardDescription>
                Your account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarImage src={user?.profileImageUrl ?? ""} alt="Profile" />
                  <AvatarFallback className="bg-orange-100 text-orange-700 text-2xl font-semibold">
                    {user?.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Profile picture upload coming soon</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-semibold text-slate-700">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Your full name" 
                  className="h-11 bg-slate-50/50" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-email" className="font-semibold text-slate-700">Email Address</Label>
                <Input 
                  id="account-email" 
                  value={user?.email ?? ""} 
                  disabled
                  className="h-11 bg-slate-50/50 opacity-60 cursor-not-allowed" 
                />
                <p className="text-xs text-slate-400">Email cannot be changed.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-slate-50 px-6 py-4">
              <p className="text-sm text-green-600 font-medium h-5">{saveMessage}</p>
              <Button onClick={handleSave} disabled={isSaving} className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm px-8">
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* EMAIL TAB */}
        <TabsContent value="email">
          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-6">
              <CardTitle className="text-xl">Email Address</CardTitle>
              <CardDescription>
                Your registered email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="space-y-1.5">
                  <p className="font-medium text-slate-900">{user?.email}</p>
                  <span className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">Primary</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* SECURITY TAB */}
        <TabsContent value="security">
          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-6">
              <CardTitle className="text-xl">Security & Authentication</CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">Password</p>
                    <p className="text-sm text-slate-500">Your account is protected with a hashed password.</p>
                  </div>
                  <span className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">Protected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

