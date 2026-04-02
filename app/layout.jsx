import "./globals.css";
import { AppNavbar } from "../src/components/app-navbar";

export const metadata = {
  title: "Laegemiddelinformation paa somalisk",
  description: "Medicininformation paa somalisk, dansk, engelsk og arabisk.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="so">
      <body>
        <AppNavbar />
        {children}
      </body>
    </html>
  );
}
