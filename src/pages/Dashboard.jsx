import { useState } from "react";
import "./Dashboard.css";
import InfoCard from "../components/InfoCard";
import ProfileJson from "../components/ProfileJson";
import ProgressBar from "../components/ProgressBar";
import StatTile from "../components/StatTile";
import { internalAuthConfig, internalUserManager } from "../auth/internalAuth";
import { portalAuthConfig } from "../auth/portalAuth";

export default function Dashboard({ user, error, mode }) {
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const userName = user?.profile?.name || "N/A";
  const email = user?.profile?.email || "N/A";
  const issuer = user?.profile?.iss || "N/A";

  const logoutReactOnly = async () => {
    try {
      await internalUserManager.removeUser();
      localStorage.removeItem("portal_user");
      sessionStorage.removeItem("portal_user");
      sessionStorage.removeItem("login_mode");
      sessionStorage.removeItem("accounts_cache");
      window.location.assign(mode === "portal" ? "/?mode=portal" : "/?mode=internal");
    } catch (e) {
      console.error(e);
    }
  };

  const logoutReactAndSalesforce = async () => {
    try {
      await internalUserManager.removeUser();
      localStorage.removeItem("portal_user");
      sessionStorage.removeItem("portal_user");
      sessionStorage.removeItem("login_mode");
      sessionStorage.removeItem("accounts_cache");

      const retUrl =
        mode === "portal"
          ? portalAuthConfig.postLogoutRedirectUri
          : internalAuthConfig.postLogoutRedirectUri;

      const logoutUrl =
        `${internalAuthConfig.authority}/secur/logout.jsp` +
        `?retUrl=${encodeURIComponent(retUrl)}`;

      window.location.assign(logoutUrl);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);

      const restBase = user.profile?.urls?.rest?.replace("{version}", "61.0");

      if (!restBase) {
        throw new Error("REST base URL not found in user profile");
      }

      const response = await fetch(
        `${restBase}query?q=${encodeURIComponent(
          "SELECT Id, Name FROM Account ORDER BY Name LIMIT 10"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: "application/json"
          }
        }
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Salesforce API error ${response.status}: ${text}`);
      }

      const data = JSON.parse(text);
      setAccounts(data.records || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to fetch Salesforce data");
    } finally {
      setLoadingAccounts(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-hero">
          <div className="dashboard-hero-content">
            <div>
              <div className="dashboard-hero-eyebrow">React + Salesforce SSO POC</div>
              <h1 className="dashboard-hero-title">Welcome, {userName}</h1>
              <p className="dashboard-hero-subtitle">
                Signed in through Salesforce with Google SSO
              </p>
            </div>

            <div className="dashboard-hero-actions">
              <button className="dashboard-btn dashboard-btn-secondary" onClick={logoutReactOnly}>
                Logout React Only
              </button>

              <button
                className="dashboard-btn dashboard-btn-primary-light"
                onClick={logoutReactAndSalesforce}
              >
                Logout React + Salesforce
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-card-grid">
          <InfoCard label="Status" value="Logged in successfully" />
          <InfoCard label="Name" value={userName} />
          <InfoCard label="Email" value={email} />
          <InfoCard label="Issuer" value={issuer} />
        </div>

        <div className="dashboard-main-grid">
          <div>
            <ProfileJson profile={user.profile} />

            <div className="dashboard-panel dashboard-panel-spacing">
              <div className="dashboard-panel-header">
                <div>
                  <h2 className="dashboard-panel-title">Salesforce Data Demo</h2>
                  <p className="dashboard-panel-subtitle">
                    Fetch Salesforce data using the logged-in user&apos;s access token.
                  </p>
                </div>

                <button
                  className="dashboard-btn dashboard-btn-primary"
                  onClick={fetchAccounts}
                  disabled={loadingAccounts}
                >
                  {loadingAccounts ? "Loading..." : "Fetch Accounts"}
                </button>
              </div>

              <div className="dashboard-token-box">
                <div className="dashboard-token-label">Access Token (demo only)</div>
                <textarea
                  readOnly
                  value={user.access_token || ""}
                  className="dashboard-token-textarea"
                />
              </div>

              <div className="dashboard-token-box">
                <div className="dashboard-token-label">ID Token (demo only)</div>
                <textarea
                  readOnly
                  value={user.id_token || ""}
                  className="dashboard-token-textarea"
                />
              </div>

              {accounts.length > 0 ? (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Account ID</th>
                        <th>Account Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((acc) => (
                        <tr key={acc.Id}>
                          <td className="dashboard-table-id">{acc.Id}</td>
                          <td>{acc.Name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="dashboard-empty-state">
                  No account data loaded yet. Click <strong>Fetch Accounts</strong>.
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-panel">
            <h2 className="dashboard-panel-title">Quick Stats</h2>

            <div className="dashboard-stats-grid">
              <StatTile title="Identity Source" value="Salesforce" subtitle="OIDC issuer" />
              <StatTile
                title="Authentication Mode"
                value="Google SSO"
                subtitle="Brokered through Salesforce"
              />
              <StatTile
                title="Email Verified"
                value={user?.profile?.email_verified ? "Yes" : "No"}
                subtitle="From returned profile claims"
              />
            </div>
          </div>
        </div>

        <div className="dashboard-panel dashboard-panel-spacing">
          <h2 className="dashboard-panel-title">Visual Experience</h2>
          <p className="dashboard-panel-subtitle">
            A lightweight dashboard section to make the authenticated experience feel more like an
            application.
          </p>

          <div className="dashboard-visual-grid">
            <div>
              <h3 className="dashboard-section-title">Profile Completeness</h3>
              <ProgressBar label="Basic identity loaded" percent={100} />
              <ProgressBar label="Email claim available" percent={user?.profile?.email ? 100 : 0} />
              <ProgressBar
                label="Verified email"
                percent={user?.profile?.email_verified ? 100 : 40}
              />
              <ProgressBar label="User session active" percent={100} />
            </div>

            <div>
              <h3 className="dashboard-section-title">Identity Summary</h3>
              <div className="dashboard-identity-card">
                <div className="dashboard-identity-text">
                  <div className="dashboard-identity-label">Authenticated User</div>
                  <div className="dashboard-identity-name">{userName}</div>
                  <div className="dashboard-identity-email">{email}</div>
                </div>

                <div className="dashboard-identity-avatar">
                  {userName
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div className="dashboard-identity-circle dashboard-identity-circle-large" />
                <div className="dashboard-identity-circle dashboard-identity-circle-small" />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="dashboard-error">{error}</p>}
      </div>
    </div>
  );
}
