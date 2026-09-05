import "@/public/assets/dala/styles.css";
import { DALA_CONTENT_HTML } from "@/components/marketing/dala-content-html";
import { DalaBrain } from "@/components/canvas/dala-brain";
import { DalaInteractive } from "@/components/marketing/dala-interactive";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-x-hidden hide-scrollbar">

      {/* Global & Scrollbar styles: hides all scrollbars while scrolling works */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --vh: 1vh !important;
            }
            html, body {
              background-color: #000000 !important;
              color: #ffffff !important;
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
              overflow-x: hidden !important;
            }
            html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
            }
            .asscrollbar {
              display: none !important;
            }
            .site-loader {
              display: none !important;
            }
            .cookie-notice,
            .js-cookie-notice {
              display: none !important;
            }
            [data-nextjs-dev-tools],
            [data-nextjs-toast],
            nextjs-portal {
              display: none !important;
            }
            /* Ensure fixed canvas is behind content */
            #canvas {
              position: fixed !important;
              top: 0;
              left: 0;
              width: 100vw !important;
              height: 100vh !important;
              z-index: 0 !important;
            }
            /* Ensure content wrapper sits above canvas */
            .dala-content-root {
              position: relative !important;
              z-index: 10 !important;
              pointer-events: auto !important;
            }
            /* Editron Header Logo */
            .header__logo {
              display: flex !important;
              align-items: center !important;
              gap: 0.75rem !important;
              width: auto !important;
              height: 3rem !important;
              background: transparent !important;
              border: none !important;
              padding: 0 !important;
              text-decoration: none !important;
              cursor: pointer !important;
              outline: none !important;
              font-size: 1.85rem !important;
              font-weight: 700 !important;
              color: #ffffff !important;
              transition: opacity 0.2s ease, transform 0.2s ease !important;
              z-index: 2 !important;
            }
            .header__logo:hover {
              opacity: 0.85 !important;
              transform: scale(1.02) !important;
            }
            .header__logo-img {
              width: 2.5rem !important;
              height: 2.5rem !important;
              object-fit: contain !important;
              display: block !important;
              flex-shrink: 0 !important;
            }
            .header__logo-text {
              font-family: inherit !important;
              font-size: 1.85rem !important;
              font-weight: 700 !important;
              letter-spacing: -0.03em !important;
              line-height: 1 !important;
              color: #ffffff !important;
              display: inline-block !important;
              user-select: none !important;
            }
            @media (max-width: 639px) {
              .header__logo {
                gap: 0.5rem !important;
              }
              .header__logo-img {
                width: 2rem !important;
                height: 2rem !important;
              }
              .header__logo-text {
                font-size: 1.4rem !important;
              }
            }
            /* Mobile Navigation Drawer & Toggle */
            @media (max-width: 767px) {
              .nav:not(.is-open) {
                display: none !important;
              }
              .nav.is-open {
                display: flex !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(0, 0, 0, 0.92) !important;
                backdrop-filter: blur(24px) !important;
                -webkit-backdrop-filter: blur(24px) !important;
                z-index: 1000 !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                pointer-events: auto !important;
              }
              .nav.is-open .nav__list {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 1.75rem !important;
                padding: 0 !important;
                pointer-events: auto !important;
              }
              .nav.is-open .nav__item {
                visibility: visible !important;
                opacity: 1 !important;
                margin: 0 !important;
              }
              .nav.is-open .nav__link {
                font-size: 1.5rem !important;
                font-weight: 600 !important;
                color: #ffffff !important;
                letter-spacing: 0.05em !important;
              }
              .nav.is-open .nav__cta {
                visibility: visible !important;
                opacity: 1 !important;
                margin-top: 1rem !important;
              }
              .nav-toggle.is-active .nav-toggle__burger {
                display: none !important;
              }
              .nav-toggle.is-active .nav-toggle__cross {
                display: block !important;
              }
            }
            /* Contributor Portrait Cards & Styling */
            .team-card__inner {
              border-radius: 2rem !important;
              overflow: hidden !important;
              aspect-ratio: 0.72 !important;
              background: #111111 !important;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
            }
            .team-card__image {
              border-radius: 2rem !important;
              width: 100% !important;
              height: 100% !important;
              aspect-ratio: 0.72 !important;
              object-fit: cover !important;
              object-position: center !important;
              transition: filter 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important;
            }
            .team-card.is-active .team-card__image {
              filter: grayscale(0) brightness(1) !important;
              transform: scale(1.15) !important;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 35px rgba(146, 106, 255, 0.35) !important;
            }
            .team-card:not(.is-active) .team-card__image {
              filter: grayscale(0.55) brightness(0.3) !important;
              transform: scale(0.95) !important;
            }
            /* GitHub Profile Button */
            .team-card__github-btn {
              display: inline-flex !important;
              align-items: center !important;
              gap: 0.5rem !important;
              padding: 0.5rem 1.1rem !important;
              border-radius: 9999px !important;
              background: rgba(255, 255, 255, 0.08) !important;
              border: 1px solid rgba(255, 255, 255, 0.18) !important;
              color: #ffffff !important;
              text-decoration: none !important;
              font-size: 0.95rem !important;
              font-weight: 600 !important;
              letter-spacing: -0.01em !important;
              transform: scale(1) !important;
              opacity: 1 !important;
              transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
              backdrop-filter: blur(12px) !important;
              -webkit-backdrop-filter: blur(12px) !important;
              box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35) !important;
            }
            .team-card__github-btn:hover {
              background: rgba(255, 255, 255, 0.2) !important;
              border-color: rgba(255, 255, 255, 0.45) !important;
              transform: translateY(-2px) scale(1.03) !important;
              box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15) !important;
              color: #ffffff !important;
            }
            .team-card__github-btn .team-card__social__icon {
              width: 1.25rem !important;
              height: 1.25rem !important;
              fill: #ffffff !important;
              flex-shrink: 0 !important;
            }
          `,
        }}
      />

      {/* 3D Brain & Floating Cones Canvas */}
      <DalaBrain />

      {/* Dala Landing Content */}
      <div
        className="dala-content-root"
        dangerouslySetInnerHTML={{ __html: DALA_CONTENT_HTML }}
      />

      {/* Client interactions: nav scrolling, team carousel, hover effects */}
      <DalaInteractive />
    </div>
  );
}
