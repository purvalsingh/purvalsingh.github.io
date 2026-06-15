// =============================================
// PURVAL SINGH — CV Interactions
// Scroll-reveal animations & subtle effects
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Scroll Reveal ----------
  const sections = document.querySelectorAll('.cv-section, .cv-footer');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  sections.forEach((section, index) => {
    section.classList.add('reveal');
    section.style.transitionDelay = `${index * 80}ms`;
    observer.observe(section);
  });

  // ---------- Dividers also reveal ----------
  const dividers = document.querySelectorAll('.section-divider');
  dividers.forEach(divider => {
    divider.classList.add('reveal');
    observer.observe(divider);
  });

  // ---------- Magnetic hover on link chips ----------
  const chips = document.querySelectorAll('.link-chip');
  
  chips.forEach(chip => {
    chip.addEventListener('mousemove', (e) => {
      const rect = chip.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      chip.style.transform = `translate(${x * 0.1}px, ${y * 0.15 - 1}px)`;
    });

    chip.addEventListener('mouseleave', () => {
      chip.style.transform = 'translate(0, 0)';
    });
  });

  // ---------- Skill tags stagger animation ----------
  const skillTags = document.querySelectorAll('.skill-tag');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = entry.target.querySelectorAll('.skill-tag');
        tags.forEach((tag, i) => {
          tag.style.opacity = '0';
          tag.style.transform = 'translateY(8px)';
          setTimeout(() => {
            tag.style.transition = `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 50}ms`;
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
          }, 100);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skill-tags').forEach(group => {
    skillObserver.observe(group);
  });

  // ---------- Smooth page load ----------
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
