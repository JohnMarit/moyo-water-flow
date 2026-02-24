import { motion } from "framer-motion";
import { MapPin, Truck, BarChart3, ArrowRight } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Pin Your Location",
    description: "Tap to mark your GPS location and request water delivery to your doorstep.",
  },
  {
    icon: Truck,
    title: "Smart Routing",
    description: "Tanker operators see real-time demand clusters and get optimized routes.",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Track fulfillment rates, demand trends, and coverage across Juba districts.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            How <span className="gradient-text">Moyo</span> Works
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connecting households to water tankers through intelligent demand mapping.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass-card p-7 group hover:glow-border cursor-default"
            >
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Learn more <ArrowRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
