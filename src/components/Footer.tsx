import { Droplets } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <Droplets className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold gradient-text">Moyo</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Moyo — Connecting Juba to clean water. Built for impact.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <Link to="/auth?role=supplier" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Suppliers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
