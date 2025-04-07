import ProtectedRoute from "@/components/ProtectedRoute";
import WatchlistContent from "./WatchlistContent";

export default function WatchlistPage() {
  return (
    <ProtectedRoute>
      <WatchlistContent />
    </ProtectedRoute>
  );
}
