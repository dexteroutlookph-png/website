// Vercel Speed Insights initialization
// This script initializes Speed Insights for the application

(function() {
  // Initialize the queue for Speed Insights
  window.si = window.si || function () { 
    (window.siq = window.siq || []).push(arguments); 
  };

  // Create and append the Speed Insights script
  var script = document.createElement('script');
  script.src = '/_vercel/speed-insights/script.js';
  script.defer = true;
  
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load script. Please check if Speed Insights is enabled in your Vercel dashboard.');
  };
  
  document.head.appendChild(script);
})();
