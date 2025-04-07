import ProtectedRoute from "@/components/ProtectedRoute";
import PortfolioContent from "./PortfolioContent";

export default function PortfolioPage() {
  return (
    <ProtectedRoute>
      <PortfolioContent />
    </ProtectedRoute>
  );
}
