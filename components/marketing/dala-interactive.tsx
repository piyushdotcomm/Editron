"use client";

import { useEffect } from "react";

export function DalaInteractive() {
  useEffect(() => {
    // Hide scrollbars on html and body
    document.documentElement.classList.add("hide-scrollbar");
    document.body.classList.add("hide-scrollbar");

    // Dynamic viewport height calculation matching Real Dala
    const setVh = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);

    // 1. Mobile Nav Toggle
    const navToggle = document.querySelector(".js-nav-toggle");
    const nav = document.querySelector(".js-nav");
    const handleNav = () => {
      nav?.classList.toggle("is-open");
      navToggle?.classList.toggle("is-active");
    };
    const handleLinkClick = () => {
      nav?.classList.remove("is-open");
      navToggle?.classList.remove("is-active");
    };

    if (navToggle && nav) {
      navToggle.addEventListener("click", handleNav);
      const navLinks = nav.querySelectorAll(".nav__link, .nav__cta a");
      navLinks.forEach((link) => {
        link.addEventListener("click", handleLinkClick);
      });
    }

    // 3. Anchor link smooth scrolling
    const anchorLinks = document.querySelectorAll("[anchor-link]");
    const handleAnchor = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const targetName = target.getAttribute("anchor-link");
      if (targetName) {
        const dest = document.querySelector(`[anchor-target="${targetName}"]`) ||
                     document.querySelector(`[section-name="${targetName}"]`) ||
                     document.getElementById(targetName);
        if (dest) {
          e.preventDefault();
          dest.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    anchorLinks.forEach((link) => {
      link.addEventListener("click", handleAnchor);
    });

    // 4. Team Slider Navigation
    const prevBtn = document.querySelector(".js-slider-prev");
    const nextBtn = document.querySelector(".js-slider-next");
    const slidesContainer = document.querySelector(".js-slides") as HTMLElement | null;
    const contentItems = document.querySelectorAll(".team-slider__content__item");

    let handlePrev: (() => void) | null = null;
    let handleNext: (() => void) | null = null;

    if (slidesContainer && contentItems.length > 0) {
      let activeIndex = 0; // Default starting card: Piyush Kumar (Creator & Lead Architect)
      const totalContributors = contentItems.length;
      const baseCenterSlide = 5; // Slide 6 in 18-slide sequence

      const getCardStride = () => {
        const cards = slidesContainer.querySelectorAll(".team-card");
        if (cards && cards.length >= 2) {
          const c1 = cards[0] as HTMLElement;
          const c2 = cards[1] as HTMLElement;
          const stride = c2.offsetLeft - c1.offsetLeft;
          if (stride > 0) return stride;
        }
        return 360;
      };

      const getIdealCenterOffset = () => {
        const allCards = slidesContainer.querySelectorAll(".team-card");
        if (allCards && allCards.length > baseCenterSlide) {
          const card = allCards[baseCenterSlide] as HTMLElement;
          const containerWidth = slidesContainer.parentElement?.clientWidth || window.innerWidth;
          return (containerWidth / 2) - (card.offsetLeft + (card.clientWidth / 2));
        }
        return -1282.52;
      };

      const updateSlider = (index: number) => {
        activeIndex = (index + totalContributors) % totalContributors;
        const cardStride = getCardStride();
        const baseOffset = getIdealCenterOffset();
        const activeSlideIndex = baseCenterSlide + activeIndex;
        const shift = activeIndex * cardStride;

        slidesContainer.style.transition = "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)";
        slidesContainer.style.transform = `translateX(${baseOffset - shift}px)`;

        // Highlight active slide card
        const allCards = slidesContainer.querySelectorAll(".team-card");
        allCards.forEach((card, idx) => {
          if (idx === activeSlideIndex) {
            card.classList.add("is-active");
          } else {
            card.classList.remove("is-active");
          }
        });

        // Update active content item
        contentItems.forEach((item, idx) => {
          const el = item as HTMLElement;
          el.style.transition = "opacity 0.35s ease, transform 0.35s ease";
          if (idx === activeIndex) {
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
            el.style.visibility = "visible";
            el.style.transform = "translate(0, 0)";
          } else {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
            el.style.visibility = "hidden";
            el.style.transform = "translate(0, 10px)";
          }
        });
      };

      updateSlider(0);

      handlePrev = () => updateSlider(activeIndex - 1);
      handleNext = () => updateSlider(activeIndex + 1);

      prevBtn?.addEventListener("click", handlePrev);
      nextBtn?.addEventListener("click", handleNext);
    }

    return () => {
      document.documentElement.classList.remove("hide-scrollbar");
      document.body.classList.remove("hide-scrollbar");
      if (handlePrev) prevBtn?.removeEventListener("click", handlePrev);
      if (handleNext) nextBtn?.removeEventListener("click", handleNext);
    };
  }, []);

  return null;
}
