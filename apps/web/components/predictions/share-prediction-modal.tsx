import { useEffect } from "react";
import { usePredictionSharing } from "@/hooks/use-prediction-sharing";
import { useAuth } from "@/contexts/auth-context";
import { ClipboardDialog } from "@/components/common/clipboard-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SharePredictionModalProps {
  open: boolean;
  onClose: () => void;
  predictionId: string;
}

export function SharePredictionModal({
  open,
  onClose,
  predictionId,
}: SharePredictionModalProps) {
  const {
    users,
    loading,
    error,
    search,
    setSearch,
    selectedUser,
    setSelectedUser,
    shared,
    setShared,
    fetchUsers,
    shareWithUser,
  } = usePredictionSharing();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, fetchUsers]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleShare = async () => {
    if (selectedUser && accessToken) {
      await shareWithUser(predictionId, selectedUser.id, accessToken);
      setShared(true);
    }
  };

  return (
    <ClipboardDialog
      open={open}
      onOpenChange={onClose}
      title="Compartir predicción"
    >
      <Input
        placeholder="Buscar usuario por nombre o email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={loading}
      />
      <div style={{ maxHeight: 200, overflowY: "auto", marginTop: 8 }}>
        {loading ? (
          <div>Cargando usuarios...</div>
        ) : filteredUsers.length === 0 ? (
          <div>No se encontraron usuarios.</div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                background:
                  selectedUser?.id === user.id ? "#e0e7ff" : "transparent",
                borderRadius: 4,
                marginBottom: 4,
              }}
              onClick={() => setSelectedUser(user)}
            >
              <strong>{user.name}</strong>{" "}
              <span style={{ color: "#888" }}>{user.email}</span>
            </div>
          ))
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {shared && (
        <Alert className="mt-2">
          <AlertDescription>¡Predicción compartida!</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2 justify-end pt-4">
        <Button onClick={onClose} variant="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleShare}
          disabled={!selectedUser || loading || shared}
        >
          Compartir
        </Button>
      </div>
    </ClipboardDialog>
  );
}
