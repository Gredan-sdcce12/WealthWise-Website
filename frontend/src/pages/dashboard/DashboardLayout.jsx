// src/layout/DashboardLayout.jsx (or similar file that wraps your routes)

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
// Assuming the sidebar is in src/components
import { DashboardSidebar } from '@/components/DashboardSidebar'; 
// Use Outlet if this is a React Router layout component, otherwise use DashboardHome
import DashboardHome from '@/pages/dashboard/DashboardHome'; 

export default function DashboardLayout() {
  // State to manage the sidebar's collapse status
  const [collapsed, setCollapsed] = useState(false);

  // The sidebar widths are defined in DashboardSidebar: 260px (expanded) and 70px (collapsed).

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Sidebar Component: Fixed position */}
      <DashboardSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
      />

      {/* 2. Main Content Area: Applying the critical margin */}
      <main 
        className={cn(
          "transition-all duration-300 p-6 min-h-screen", // Base padding and transition
          // 👇 CRITICAL FIX: Add margin equal to sidebar width
          collapsed ? "ml-[70px]" : "ml-[260px]" 
        )}
      >
        {/* Placeholder for the dashboard content, which comes from your routing. */}
        {/* If you are testing this file directly, use: */}
        <DashboardHome /> 

        {/* If this is a router component, use the React Router Outlet: */}
        {/* <Outlet /> */} 
      </main>
    </div>
  );
}