import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import SmartBudgetingTips from "./pages/tips/SmartBudgetingTips";
import ExpenseAnalyticsTips from "./pages/tips/ExpenseAnalyticsTips";
import FinancialGoalsTips from "./pages/tips/FinancialGoalsTips";
import OCRScanningTips from "./pages/tips/OCRScanningTips";
import SubscriptionTrackingTips from "./pages/tips/SubscriptionTrackingTips";
import ScheduledPaymentsTips from "./pages/tips/ScheduledPaymentsTips";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Budgets from "./pages/dashboard/Budgets";
import Goals from "./pages/dashboard/Goals";
import Loans from "./pages/dashboard/Loans";
import Subscriptions from "./pages/dashboard/Subscriptions";
import Scheduled from "./pages/dashboard/Scheduled";
import CalendarView from "./pages/dashboard/CalendarView";
import ActivityLog from "./pages/dashboard/ActivityLog";
import AllSpending from "./pages/dashboard/AllSpending";
import Accounts from "./pages/dashboard/Accounts";
import BudgetDetails from "./pages/dashboard/BudgetDetails";
import Categories from "./pages/dashboard/Categories";
import Titles from "./pages/dashboard/Titles";
import GoalDetails from "./pages/dashboard/GoalDetails";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";
import About from "./pages/dashboard/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/tips/smart-budgeting" element={<SmartBudgetingTips />} />
          <Route path="/tips/expense-analytics" element={<ExpenseAnalyticsTips />} />
          <Route path="/tips/financial-goals" element={<FinancialGoalsTips />} />
          <Route path="/tips/ocr-scanning" element={<OCRScanningTips />} />
          <Route path="/tips/subscription-tracking" element={<SubscriptionTrackingTips />} />
          <Route path="/tips/scheduled-payments" element={<ScheduledPaymentsTips />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="goals" element={<Goals />} />
            <Route path="loans" element={<Loans />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="scheduled" element={<Scheduled />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="activity" element={<ActivityLog />} />
            <Route path="spending" element={<AllSpending />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="budget-details" element={<BudgetDetails />} />
            <Route path="categories" element={<Categories />} />
            <Route path="titles" element={<Titles />} />
            <Route path="goal-details" element={<GoalDetails />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;