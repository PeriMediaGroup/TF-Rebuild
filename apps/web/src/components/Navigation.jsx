import "./navigation.scss";

export default function Navigation() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "https://merch.triggerfeed.com", label: "Merch", external: true  },
    { href: "https://app.triggerfeed.com", label: "Launch App", external: true },
  ];

  return (
    <nav className="tf-nav">
      <ul className="tf-nav__list">
        {links.map((link) => (
          <li key={link.href} className="tf-nav__item">
            <a
              href={link.href}
              target={link.external ? "_blank" : "_self"}
              rel={link.external ? "noopener noreferrer" : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
