import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBusiness } from "@/features/settings/useBusiness";
import { useAuth } from "@/hooks/useAuth";
import { settingsService } from "@/services/settingsService";
import { accountService } from "@/services/accountService";
import { profileService } from "@/services/profileService";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Skeleton,
} from "@/components/ui";
import { Plus, Wallet, LogOut, Download } from "lucide-react";
import { ROUTES } from "@/constants/app";
import { supabase } from "@/lib/supabase";
import { downloadCSV } from "@/utils/exportUtils";

export default function SettingsPage() {
  const { user } = useAuth();
  const { business, isLoading } = useBusiness();
  const navigate = useNavigate();

  // Business Profile State
  const [name, setName] = useState(business?.name || "");
  const [threshold, setThreshold] = useState(
    business?.safe_cash_threshold || 0,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Account Management State
  const [accounts, setAccounts] = useState<any[]>([]);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState<
    "cash" | "mobile_money" | "bank"
  >("mobile_money");
  const [isAddingAcc, setIsAddingAcc] = useState(false);

  // User Profile & Security State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name || "");
      setThreshold(business.safe_cash_threshold || 0);
      accountService
        .getAccounts(business.id)
        .then(setAccounts)
        .catch(console.error);
    }

    if (user) {
      supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFullName(data.full_name || "");
            setPhone(data.phone || "");
          }
        });
    }
  }, [business, user]);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await settingsService.updateBusiness(business.id, {
        name,
        safe_cash_threshold: Number(threshold),
      });
      setMessage({
        text: "Business settings saved successfully.",
        type: "success",
      });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !newAccName) return;
    try {
      setIsAddingAcc(true);
      const newAcc = await settingsService.addAccount(
        business.id,
        newAccName,
        newAccType,
      );
      setAccounts([...accounts, newAcc]);
      setNewAccName("");
    } catch (err: any) {
      alert("Error adding account: " + err.message);
    } finally {
      setIsAddingAcc(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setIsUpdatingProfile(true);
      await profileService.updateProfile(user.id, { fullName, phone });
      setMessage({ text: "Profile updated successfully.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({
        text: "Password must be at least 8 characters.",
        type: "error",
      });
      return;
    }
    try {
      setIsUpdatingPassword(true);
      await profileService.updatePassword(newPassword);
      setMessage({ text: "Password updated successfully.", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleExportData = async () => {
    if (!business) return;
    try {
      setIsExporting(true);
      const { transactions } = await profileService.exportAllData(business.id);
      downloadCSV(
        transactions,
        `Full_Data_Export_${business.name.replace(/\s+/g, "_")}`,
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(ROUTES.login);
  };

  if (isLoading) return <Skeleton className="h-96 w-full max-w-3xl" />;
  if (!business) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Settings"
        description="Manage your business and account preferences."
      />

      {message && (
        <div
          className={`p-4 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-teal-50 border-teal-200 text-teal-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
          {message.text}
        </div>
      )}

      {/* Business Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBusiness} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Business Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Safe Cash Threshold (GH₵)
              </label>
              <p className="text-xs text-text-secondary mb-2">
                You will see an alert if your available cash drops below this
                amount.
              </p>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                min="0"
                required
              />
            </div>

            <Button type="submit" isLoading={isSaving}>
              Save Business Details
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Financial Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-text-secondary">
            Manage your wallets. You can transfer money between these accounts.
          </p>

          <div className="divide-y divide-border border border-border rounded-lg bg-surface-subtle">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-4 bg-white first:rounded-t-lg last:rounded-b-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-navy-900">
                      {acc.name}
                    </p>
                    <p className="text-xs text-text-secondary capitalize">
                      {acc.type.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleAddAccount}
            className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-4 border-t border-border">
            <div className="flex-1">
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Account Name
              </label>
              <Input
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                placeholder="e.g. MTN MoMo"
                required
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Type
              </label>
              <select
                value={newAccType}
                onChange={(e) => setNewAccType(e.target.value as any)}
                className="block w-full h-11 rounded-lg border bg-white px-3.5 text-sm border-border focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            <Button
              type="submit"
              isLoading={isAddingAcc}
              leftIcon={<Plus className="h-4 w-4" />}>
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Full Name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Phone Number (Optional)
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 024 123 4567"
              />
            </div>
            <Button type="submit" isLoading={isUpdatingProfile}>
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security (Password) */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1.5">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type password again"
              />
            </div>
            <Button
              type="submit"
              isLoading={isUpdatingPassword}
              variant="outline">
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data & Account */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-surface-subtle rounded-lg border border-border">
            <div>
              <h4 className="font-medium text-navy-900 text-sm">
                Export All Data
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                Download your transactions as a CSV file.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportData}
              isLoading={isExporting}
              leftIcon={<Download className="h-4 w-4" />}>
              Export CSV
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
            <div>
              <h4 className="font-medium text-red-900 text-sm">Sign Out</h4>
              <p className="text-xs text-red-700 mt-1">
                Log out of your account on this device.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleSignOut}
              leftIcon={<LogOut className="h-4 w-4" />}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
