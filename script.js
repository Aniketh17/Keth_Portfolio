
    document.getElementById('menuToggle').addEventListener('click', function() {
        this.classList.toggle('active');
        document.querySelector('.nav-links').classList.toggle('active');
    });


    document.addEventListener('DOMContentLoaded', function() {
      const skillsSection = document.querySelector('.skills');

      function checkScroll() {
          const rect = skillsSection.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          if (rect.top < windowHeight && rect.bottom >= 0) {
              skillsSection.classList.add('in-view');
          } else {
              skillsSection.classList.remove('in-view');
          }
      }

      window.addEventListener('scroll', checkScroll);
      checkScroll(); // Check on load in case already in view
  });

  document.addEventListener('DOMContentLoaded', function() {
    const projectItems = document.querySelectorAll('.project-item');

    function checkScroll() {
        projectItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight && rect.bottom >= 0) {
                if (!item.classList.contains('animated')) {
                    item.classList.add('animated');
                }
            } else {
                // Remove the class if you want to reset the animation when scrolling back up
                 item.classList.remove('animated');
            }
        });
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Check on load in case already in view
});



AOS.init({
  duration: 1000, // Duration of animation in milliseconds
});
