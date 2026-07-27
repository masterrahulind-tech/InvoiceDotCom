import Script from "next/script";
import { getSession } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <>
      {session && (
        <style>{`
          a[href="/signup"] {
            display: none !important;
          }
        `}</style>
      )}
      {/* AppCo CSS Libraries */}
      <link rel="stylesheet" href="/assets/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/themify-icons.css" />
      <link rel="stylesheet" href="/assets/animate.min.css" />
      <link rel="stylesheet" href="/assets/magnific-popup.css" />
      <link rel="stylesheet" href="/assets/owl.carousel.min.css" />
      <link rel="stylesheet" href="/assets/owl.theme.default.min.css" />
      <link rel="stylesheet" href="/assets/style.css" />
      <link rel="stylesheet" href="/assets/responsive.css" />

      {children}

      {/* AppCo JS Libraries */}
      <Script src="/assets/jquery-3.6.1.min.js" strategy="beforeInteractive" />
      <Script src="/assets/popper.min.js" strategy="afterInteractive" />
      <Script src="/assets/bootstrap.min.js" strategy="afterInteractive" />
      <Script src="/assets/jquery.easing.min.js" strategy="afterInteractive" />
      <Script src="/assets/jquery.magnific-popup.min.js" strategy="afterInteractive" />
      <Script src="/assets/owl.carousel.min.js" strategy="afterInteractive" />
      <Script src="/assets/jquery.countdown.min.js" strategy="afterInteractive" />
      <Script src="/assets/validator.min.js" strategy="afterInteractive" />
      <Script src="/assets/wow.min.js" strategy="afterInteractive" />
      <Script src="/assets/scripts.js" strategy="afterInteractive" />
    </>
  );
}
