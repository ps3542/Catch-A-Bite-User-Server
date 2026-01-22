import DashboardLayout from "../../components/DashboardLayout.jsx";
import useRoleGuard from "../../hooks/useRoleGuard.js";

const fallbackUser = {
  name: "Sample Rider",
};

const quickActions = [
  { label: "Start Delivery", hint: "Go online to receive jobs" },
  { label: "View Earnings", hint: "Check payout summary" },
  { label: "Nearby Requests", hint: "See active pickup zones" },
];

const summaryCards = [
  { title: "Deliveries Today", value: "12", meta: "Peak window 12:30-14:00" },
  { title: "Estimated Earnings", value: "78,000 KRW", meta: "Pending +18,000" },
];

const activities = [
  { title: "Order #5421 delivered", time: "Today 11:20", status: "Done" },
  { title: "Pickup at Cafe 302", time: "Today 10:40", status: "Assigned" },
  { title: "Navigation started", time: "Today 09:58", status: "In transit" },
  { title: "Customer call completed", time: "Yesterday 20:12", status: "Support" },
  { title: "Shift ended", time: "Yesterday 18:30", status: "Completed" },
];

const notices = [
  { title: "Safety reminder", detail: "Keep helmet and lights on for night rides." },
  { title: "Surge area guide", detail: "High demand zones update every 30 minutes." },
];

export default function RiderMainPage() {
  const { user, loading } = useRoleGuard("RIDER", fallbackUser);
  const dateText = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <DashboardLayout
      roleLabel="Rider"
      userName={user.name}
      dateText={dateText}
      quickActions={quickActions}
      summaryCards={summaryCards}
      activities={activities}
      notices={notices}
      isLoading={loading}
    />
  );
}
