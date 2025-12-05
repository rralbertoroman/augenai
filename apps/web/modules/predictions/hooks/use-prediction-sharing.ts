import { useState, useCallback } from "react";
import type { UserProfileDTO } from "@/server/zod-schemas/user_profile";
import { getAllUserProfiles } from "@/server/services/user_profile";
import { sharePrediction } from "@/server/services/prediction_sharing";
import { useAuth } from "@/contexts/auth-context";

export function usePredictionSharing() {
  const [users, setUsers] = useState<UserProfileDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfileDTO | null>(null);
  const [shared, setShared] = useState(false);
  const { user } = useAuth();

  // Fetch all users except current
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers = await getAllUserProfiles();
      const filtered = allUsers.filter(
        (u: UserProfileDTO) => u.id !== user?.id,
      );
      setUsers(filtered);
    } catch {
      setError("Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Share request with selected user
  const shareWithUser = async (
    requestId: string,
    recipientId: string,
    accessToken: string,
  ) => {
    setIsSharing(true);
    setError(null);
    try {
      const result = await sharePrediction(accessToken, requestId, recipientId);
      if (!result.success) {
        setError(result.error || "Error al compartir la solicitud");
      } else {
        setShared(true);
      }
    } catch {
      setError("Error al compartir la solicitud");
    } finally {
      setIsSharing(false);
    }
  };

  return {
    users,
    loading,
    isSharing,
    error,
    search,
    setSearch,
    selectedUser,
    setSelectedUser,
    shared,
    setShared,
    fetchUsers,
    shareWithUser,
  };
}
