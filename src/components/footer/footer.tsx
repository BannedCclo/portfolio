import type { CSSProperties, ReactNode } from "react";
import styles from "./footer.module.css";
import Signature from "../signature/signature";

interface FooterProps {
  /** Logo exibido no topo do footer. Cada site define o seu (ex.: <img src={...} alt="..." />). */
  logo: ReactNode;
  /** Cor de fundo do footer. Se omitida, usa o tom padrão. */
  backgroundColor?: string;
  /** Conteúdo inteiro da metade esquerda. Livre para cada site — o footer não opina sobre ele. */
  children: ReactNode;
}

interface ContactLink {
  icon: string;
  label: string;
  href: string;
  text: string;
}

const contactLinks: ContactLink[] = [
  {
    icon: "fa-brands fa-instagram",
    label: "Instagram:",
    href: "https://www.instagram.com/not_cecelo/",
    text: "@not_cecelo",
  },
  {
    icon: "fa-solid fa-square-envelope",
    label: "Email:",
    href: "https://mail.google.com/mail/u/0/?fs=1&tf=cm&source=mailto&to=marcelosg909@gmail.com",
    text: "marcelosg909@gmail.com",
  },
  {
    icon: "fa-brands fa-linkedin",
    label: "LinkedIn:",
    href: "https://www.linkedin.com/in/marcelo-santos-34aa98264/",
    text: "Marcelo Guimarães",
  },
  {
    icon: "fa-brands fa-github",
    label: "GitHub:",
    href: "https://github.com/BannedCclo",
    text: "BannedCclo",
  },
];

const Footer = ({ logo, backgroundColor, children }: FooterProps) => {
  const footerStyle: CSSProperties | undefined = backgroundColor
    ? { backgroundColor }
    : undefined;

  return (
    <footer className={styles.footer} style={footerStyle}>
      <header className={styles.header}>{logo}</header>
      <main className={styles.main}>
        <section className={styles.leftSection}>{children}</section>
        <section className={styles.rightSection}>
          <div className={styles.signatureContainer}>
            <p>Designed and developed by Marcelo Guimarães</p>
            <Signature />
          </div>
          <ul className={styles.contactList}>
            {contactLinks.map(({ icon, label, href, text }) => (
              <li key={href} className={styles.contactItem}>
                <span className={styles.contactLabel}>
                  <i className={`${icon} ${styles.contactIcon}`} aria-hidden="true"></i>
                  <span className={styles.contactLabelText}>{label} </span>
                </span>
                <a className={styles.contactLink} href={href} target="_blank" rel="noreferrer">
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </footer>
  );
};

export default Footer;
