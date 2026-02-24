import { motion } from "framer-motion";
import { Droplets, TrendingUp, MapPin, Users } from "lucide-react";

const stats = [
  { icon: Droplets, label: "Water Requests", value: "2,340+", desc: "Daily requests served" },
  { icon: TrendingUp, label: "Efficiency", value: "87%", desc: "Fulfillment rate" },
  { icon: MapPin, label: "Coverage", value: "12", desc: "Districts in Juba" },
  { icon: Users, label: "Households", value: "5,600+", desc: "Active users" },
];

const StatsSection = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="glass-card p-5 text-center group hover:glow-border transition-all duration-500"
        >
          <div className="w-10 h-10 rounded-xl gradient-bg mx-auto mb-3 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
            <stat.icon className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="text-2xl font-bold font-display gradient-text">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsSection;
