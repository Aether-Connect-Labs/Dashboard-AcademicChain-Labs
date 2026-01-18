let listeners = [];

function emit(payload) {
  listeners.forEach((l) => l(payload));
}

export const toast = {
  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  success(message) {
    emit({ type: "success", message });
  },
  error(message) {
    emit({ type: "error", message });
  },
  info(message) {
    emit({ type: "info", message });
  },
};

export function showToast(message, type = "info") {
  if (type === "success") toast.success(message);
  else if (type === "error") toast.error(message);
  else toast.info(message);
}
