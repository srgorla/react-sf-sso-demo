import InfoCard from "../components/InfoCard";
import ProfileJson from "../components/ProfileJson";
import ProgressBar from "../components/ProgressBar";
import StatTile from "../components/StatTile";
import { authConfig, userManager } from "../auth/auth";

export default function Dashboard({ user, error }) {
  const userName = user?.profile?.name || "N/A";
  const email = user?.profile?.email || "N/A";
  const issuer = user?.profile?.iss || "N/A";

  const logout = async () => {
    await userManager.removeUser();
    const logoutUrl =
      `${authConfig.authority}/secur/logout.jsp` +
      `?retUrl=${encodeURIComponent(authConfig.postLogoutRedirectUri)}`;
    window.location.assign(logoutUrl);
  };

  return (
    <div style={{ padding: "32px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #1d4ed8, #0f766e)",
            color: "white",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            marginBottom: "28px"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <div style={{ fontSize: "14px", opacity: 0.85, marginBottom: "8px" }}>
                React + Salesforce SSO POC
              </div>
              <h1 style={{ fontSize: "38px", margin: 0, marginBottom: "10px" }}>
                Welcome, {userName}
              </h1>
              <p style={{ fontSize: "16px", margin: 0, opacity: 0.92 }}>
                Signed in through Salesforce with Google SSO
              </p>
            </div>

            <button
              onClick={logout}
              style={{
                background: "white",
                color: "#111827",
                border: "none",
                borderRadius: "12px",
                padding: "12px 18px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.12)"
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "24px"
          }}
        >
          <InfoCard label="Status" value="Logged in successfully" />
          <InfoCard label="Name" value={userName} />
          <InfoCard label="Email" value={email} />
          <InfoCard label="Issuer" value={issuer} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
            alignItems: "start"
          }}
        >
          <ProfileJson profile={user.profile} />

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "24px" }}>Quick Stats</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "14px",
                marginBottom: "22px"
              }}
            >
              <StatTile title="Identity Source" value="Salesforce" subtitle="OIDC issuer" />
              <StatTile title="Authentication Mode" value="Google SSO" subtitle="Brokered through Salesforce" />
              <StatTile
                title="Email Verified"
                value={user?.profile?.email_verified ? "Yes" : "No"}
                subtitle="From returned profile claims"
              />
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "24px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: "24px" }}>Visual Experience</h2>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            A lightweight dashboard section to make the authenticated experience feel more like
            an application.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr",
              gap: "24px",
              marginTop: "20px"
            }}
          >
            <div>
              <h3 style={{ marginTop: 0 }}>Profile Completeness</h3>
              <ProgressBar label="Basic identity loaded" percent={100} />
              <ProgressBar label="Email claim available" percent={user?.profile?.email ? 100 : 0} />
              <ProgressBar
                label="Verified email"
                percent={user?.profile?.email_verified ? 100 : 40}
              />
              <ProgressBar label="User session active" percent={100} />
            </div>

            <div>
              <h3 style={{ marginTop: 0 }}>Identity Summary</h3>
              <div
                style={{
                  height: "220px",
                  borderRadius: "18px",
                  background:
                    "radial-gradient(circle at top, #60a5fa, #2563eb 45%, #0f172a 100%)",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "24px",
                    left: "24px",
                    color: "white"
                  }}
                >
                  <div style={{ fontSize: "14px", opacity: 0.85 }}>Authenticated User</div>
                  <div style={{ fontSize: "24px", fontWeight: 700, marginTop: "8px" }}>
                    {userName}
                  </div>
                  <div style={{ fontSize: "14px", marginTop: "8px", opacity: 0.92 }}>
                    {email}
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    right: "24px",
                    bottom: "24px",
                    width: "96px",
                    height: "96px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.16)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "28px"
                  }}
                >
                  {userName
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <p style={{ color: "#dc2626", marginTop: "16px" }}>{error}</p>}
      </div>
    </div>
  );
}