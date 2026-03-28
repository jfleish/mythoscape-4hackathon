import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Sparkles, LayoutDashboard, Grid3X3, LogOut } from "lucide-react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Create" },
    { to: "/gallery", icon: Grid3X3, label: "Gallery" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-card rounded-none border-x-0 border-t-0 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-lg gradient-text">Mind to Manifest</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}>
              <Button
                variant={location.pathname === to ? "glow" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AppLayout;
