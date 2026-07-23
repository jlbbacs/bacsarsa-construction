import { motion } from "framer-motion";
import type { AboutStat } from "../types";

export function StatsStrip({ stats }: { stats: AboutStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="flex flex-col gap-1 border-l-4 border-safety-500 pl-4"
        >
          <span className="font-mono text-3xl font-semibold text-charcoal-900 sm:text-4xl">{stat.value}</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-steel-600">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
