import { useEffect } from "react";
import { usePredictionSharing } from "@/modules/predictions/hooks/use-prediction-sharing";
import { useAuth } from "@/contexts/auth-context";
import { ClipboardDialog } from "@/modules/commons/clipboard/clipboard-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle } from "lucide-react";

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
    isSharing,
    error,
    search,
    setSearch,
    selectedUser,
    setSelectedUser,
    shared,
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
    }
  };

  // Show success state
  if (shared) {
    return (
      <ClipboardDialog
        open={open}
        onOpenChange={onClose}
        title="Compartir predicción"
      >
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <CheckCircle className="h-12 w-12 text-emerald-500" />
          <p className="text-lg font-medium text-center">
            ¡Predicción compartida exitosamente!
          </p>
          <p className="text-sm text-muted-foreground text-center">
            {selectedUser?.name} ahora puede ver esta predicción.
          </p>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </ClipboardDialog>
    );
  }

  // Show sharing spinner
  if (isSharing) {
    return (
      <ClipboardDialog
        open={open}
        onOpenChange={onClose}
        title="Compartir predicción"
      >
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Compartiendo predicción...</p>
        </div>
      </ClipboardDialog>
    );
  }

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
          <div className="flex items-center justify-center py-4">
            <Spinner className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">
            No se encontraron usuarios.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`px-3 py-2 cursor-pointer rounded mb-1 transition-colors ${
                selectedUser?.id === user.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted"
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <strong>{user.name}</strong>{" "}
              <span className="text-muted-foreground">{user.email}</span>
            </div>
          ))
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2 justify-end pt-4">
        <Button onClick={onClose} variant="secondary">
          Cancelar
        </Button>
        <Button onClick={handleShare} disabled={!selectedUser || loading}>
          Compartir
        </Button>
      </div>
    </ClipboardDialog>
  );
}
