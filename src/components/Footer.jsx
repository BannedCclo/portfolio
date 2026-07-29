import Signature from "./Signature.jsx";

export default function Footer() {
  return (
    <footer className="layer">
      <span>© 2026 Marcelo Guimarães</span>
      <a href="mailto:marcelosg909@gmail.com">marcelosg909@gmail.com</a>
      <div className="footer__signature">
        <p>Designed and developed by Marcelo Guimarães</p>
        <Signature />
      </div>
      {/* Attribution required by the model's licence — do not remove */}
      <span className="footer__credit">
        Modelo 3D do cérebro: Nevit Dilmen,{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:3DPX-003765_3DModel_of_Brain_Nevit_Dilmen.stl"
          target="_blank"
          rel="noopener"
        >
          Wikimedia Commons
        </a>{" "}
        (CC BY-SA 3.0 / GFDL)
      </span>
    </footer>
  );
}
