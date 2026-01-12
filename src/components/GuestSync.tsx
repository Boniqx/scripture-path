"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { PersistenceService } from "@/services/persistenceService";
import { Loader2 } from "lucide-react";

export function GuestSync() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const syncGuestData = () => {
      const studies = PersistenceService.getAllStudies();
      const guestStudies = studies.filter(
        (s) => s.metadata.ownerId === "guest_temporary"
      );

      if (guestStudies.length > 0) {
        setSyncing(true);
        // Simulate a brief "sync" visual for effect, though operation is instant locally
        setTimeout(() => {
          let count = 0;
          guestStudies.forEach((study) => {
            count++;
            // Update owner locally
            const updatedStudy = { ...study };
            updatedStudy.metadata.ownerId = user.id;
            PersistenceService.saveStudy(updatedStudy);

            // TODO: In a real production app, we would fire an UploadStudy action here
            // to persist this to Supabase immediately.
          });
          console.log(`Synced ${count} guest studies to user ${user.email}`);
          setSyncing(false);
        }, 1000);
      }
    };

    syncGuestData();
  }, [user]);

  if (!syncing) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-fade-in-up">
      <div className="bg-amber-900/90 text-amber-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-2xl border border-amber-500/30 flex items-center space-x-3 backdrop-blur-md">
        <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
        <span>Syncing Data...</span>
      </div>
    </div>
  );
}
