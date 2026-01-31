import './style.css'

console.log('Elvira Technologies Loaded');

// Interaction logic will go here
// Header scroll effect
const header = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});
