import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AUTO_LOGOUT_TIME = 10 * 60 * 1000; // 10 minutes

export default function AutoLogout({ onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (typeof onLogout === "function") {
          onLogout();
        }
        navigate("/login");
      }, AUTO_LOGOUT_TIME);
    };

    // Reset timer on user activity
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [onLogout, navigate]);

  return null;
}