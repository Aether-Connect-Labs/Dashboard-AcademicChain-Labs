import { useEffect, useState } from "react";
import { toast } from "../../utils/toast.js";

const palette = {
  success: "bg-emerald-500/90 border-emerald-300 text-emerald-50",
  error: "bg-rose-500/90 border-rose-200 text-rose-50",
  info: "bg-sky-500/90 border-sky-200 text-sky-50",
};

export default function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((payload) => {
      const id = crypto.randomUUID();
      setItems((current) => [...current, { id, ...payload }]);
      setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 3500);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-3 px-6 py-6">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto glass-panel border ${palette[item.type]} px-4 py-3 text-sm shadow-lg`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}

