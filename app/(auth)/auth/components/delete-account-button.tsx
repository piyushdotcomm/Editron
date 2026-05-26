"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

const DeleteAccountButton = () => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch("/api/delete-account", {method: "DELETE",});
      
      if (!response.ok) {
          toast.error("Failed to delete account");
          return;
      }
      toast.success("Account deleted successfully");

      await signOut({
        callbackUrl: "/",});
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while deleting account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      className="h-7 px-2 text-[10px] rounded-full border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-300 disabled:border-red-200"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-2.5 w-2.5 mr-0.5" />
      {loading ? "Deleting..." : "Delete Account"}
    </Button>
  );
};

export default DeleteAccountButton;