import { useEffect, useRef, useState } from "react";
import { userManager } from "./auth";

export default function Callback() {
  const [message, setMessage] = useState("Completing sign-in...");
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    userManager
      .signinRedirectCallback()
      .then(() => {
        window.location.replace("/");
      })
      .catch((e) => {
        console.error("Callback error:", e);
        setMessage(`Sign-in failed: ${e?.message || "Unknown error"}`);
      });
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      {message}
    </div>
  );
}