import '../styles/header.css';

interface HeaderProps {
  onSignOut: () => void;
}

export default function Header({ onSignOut }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-banner">
        <div className="header-banner-content">
        </div>
      </div>
      <div className="header-main">
        <div className="header-brand">
          <div className="header-logo">IDP</div>
          <div>
            <h1 className="header-title">Intelligent Document Processing</h1>
            <p className="header-subtitle">For demonstration purposes only</p>
          </div>
        </div>
        <button onClick={onSignOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    </header>
  );
}