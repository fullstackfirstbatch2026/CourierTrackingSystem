import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const useCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

export const StatCard = ({ icon, label, value, change, color, bgColor, isUp }) => {
  const animatedValue = useCounter(value);

  return (
    <div className="stat-card" style={{ "--stat-color": color }}>
      <div className="stat-icon-wrap" style={{ background: bgColor }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-value">{animatedValue.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-change ${isUp ? "up" : "down"}`}>
        {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{change} vs last month</span>
      </div>
    </div>
  );
};
