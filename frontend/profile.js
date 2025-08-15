
 requireLogin(); // kicks to login.html if not logged in
  getProfile().then(profile => {
    document.getElementById("profile-name").textContent = profile.name;
  });

    // Chart.js Bar Chart Demo for Today's Progress
    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Calories', 'Workouts', 'Steps', 'Water L'],
        datasets: [{
          label: 'Today',
          data: [620, 2, 8400, 2.4],
          backgroundColor: [
            '#10b981', '#2563eb', '#f59e42', '#ef4444'
          ],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Goal Set Functionality
    const goalForm = document.getElementById('goal-form');
    const goalInput = document.getElementById('goal-input');
    const goalDisplay = document.getElementById('current-goal-display');

    goalForm.addEventListener('submit', function(e){
      e.preventDefault();
      const value = goalInput.value.trim();
      if (value) {
        localStorage.setItem('userGoal', value);
        goalDisplay.innerHTML = `<strong>Current Goal:</strong> ${value}`;
        goalInput.value = '';
      }
    });

    // Display current goal on load
    window.addEventListener('DOMContentLoaded', () => {
      const goal = localStorage.getItem('userGoal');
      if (goal) {
        goalDisplay.innerHTML = `<strong>Current Goal:</strong> ${goal}`;
      }
    });
  