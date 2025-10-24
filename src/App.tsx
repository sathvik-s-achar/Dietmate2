import { useState } from "react";
import { Button } from "./components/ui/button";
import { Avatar } from "./components/ui/avatar";
import { 
  LayoutDashboard, 
  Apple, 
  TrendingUp, 
  Calendar, 
  Settings, 
  User,
  Menu,
  Bell,
  Search
} from "lucide-react";
import { DashboardStats } from "./components/DashboardStats";
import { NutritionChart } from "./components/NutritionChart";
import { MacroDistribution } from "./components/MacroDistribution";
import { MealLog } from "./components/MealLog";
import { QuickActions } from "./components/QuickActions";
import { WaterTracker } from "./components/WaterTracker";
import { RecentMeals } from "./components/RecentMeals";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "meals", label: "Meals", icon: Apple },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "planner", label: "Meal Planner", icon: Calendar },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && <span className="text-xl">NutriTrack</span>}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === item.id
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : ""
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </Button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Avatar className="w-10 h-10 bg-green-500" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">Sarah Johnson</div>
                <div className="text-xs text-gray-500">Pro Member</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1>Good afternoon, Sarah!</h1>
                <p className="text-sm text-gray-500">
                  You're doing great! Keep up the healthy habits.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meals..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <DashboardStats />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <NutritionChart />
                </div>
                <div>
                  <MacroDistribution />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MealLog />
                </div>
                <div className="space-y-6">
                  <WaterTracker />
                  <RecentMeals />
                </div>
              </div>

              <QuickActions />
            </div>
          )}

          {activeTab === "meals" && (
            <div className="space-y-6">
              <h2>Meal Tracking</h2>
              <MealLog />
            </div>
          )}

          {activeTab === "progress" && (
            <div className="space-y-6">
              <h2>Your Progress</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NutritionChart />
                <MacroDistribution />
              </div>
            </div>
          )}

          {activeTab === "planner" && (
            <div className="space-y-6">
              <h2>Meal Planner</h2>
              <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2">Plan Your Meals</h3>
                <p className="text-gray-500 mb-6">
                  Create a weekly meal plan to stay on track with your nutrition goals
                </p>
                <Button className="bg-green-500 hover:bg-green-600">
                  Create Meal Plan
                </Button>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2>Profile Settings</h2>
              <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2">Your Profile</h3>
                <p className="text-gray-500 mb-6">
                  Manage your personal information and nutrition goals
                </p>
                <Button className="bg-green-500 hover:bg-green-600">
                  Edit Profile
                </Button>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h2>Settings</h2>
              <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2">App Settings</h3>
                <p className="text-gray-500 mb-6">
                  Customize your experience and preferences
                </p>
                <Button className="bg-green-500 hover:bg-green-600">
                  Configure Settings
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
