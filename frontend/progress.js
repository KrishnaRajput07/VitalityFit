
    if (!localStorage.getItem("vhToken")) {
  window.location.href = "login.html";
}

    // Demo data for week and month
    const DATA = {
      week: {
        calorie:   [450, 620, 700, 820, 540, 760, 610],
        calorieLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        workouts:  [1, 1, 1, 1, 0, 2, 1],
        workoutsLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        steps: 8500,
        weight: -0.9,
        time: 42,
        water: 18.5,
        days: '6/7'
      },
      month: {
        calorie:   [500, 750, 700, 800, 640, 760, 720, 680, 700, 800, 540, 860, 610, 780, 845, 650, 880, 700, 750, 600, 810, 720, 710, 705, 790, 760, 830, 820, 760, 770],
        calorieLabels: Array.from({length: 30}, (_, i) => (i+1).toString()),
        workouts:  [1, 1, 1, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1, 1, 2, 2, 2, 2, 1, 2, 2],
        workoutsLabels: Array.from({length: 30}, (_, i) => (i+1).toString()),
        steps: 9100,
        weight: -3.2,
        time: 40,
        water: 75.9,
        days: '25/30'
      }
    };

    // Start in week mode
    let selectedRange = 'week';

    // Set up charts
    let calorieChart, workoutChart;
    function setupCharts() {
      const ctxC = document.getElementById('calorieChart').getContext('2d');
      const ctxW = document.getElementById('workoutChart').getContext('2d');
      calorieChart = new Chart(ctxC, {
        type: 'line',
        data: {
          labels: DATA[selectedRange].calorieLabels,
          datasets: [{
            label: 'Calories Burned',
            data: DATA[selectedRange].calorie,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: "#10b981"
          }]
        },
        options: { responsive: true, plugins: {legend: {display: false} }, scales: {y: {beginAtZero: true} } }
      });
      workoutChart = new Chart(ctxW, {
        type: 'bar',
        data: {
          labels: DATA[selectedRange].workoutsLabels,
          datasets: [{
            label: 'Workouts Completed',
            data: DATA[selectedRange].workouts,
            backgroundColor: '#2563eb'
          }]
        },
        options: { responsive: true, plugins: {legend: {display: false} }, scales: {y: {beginAtZero: true, stepSize: 1, ticks: {precision:0}} } }
      });
    }
    function updateCharts(range) {
      calorieChart.data.labels = DATA[range].calorieLabels;
      calorieChart.data.datasets[0].data = DATA[range].calorie;
      calorieChart.update();
      workoutChart.data.labels = DATA[range].workoutsLabels;
      workoutChart.data.datasets[0].data = DATA[range].workouts;
      workoutChart.update();
      // Update stats
      document.getElementById('stat-steps').innerText = DATA[range].steps.toLocaleString();
      document.getElementById('stat-weight').innerText = DATA[range].weight > 0 ? '+'+DATA[range].weight+' kg' : DATA[range].weight+' kg';
      document.getElementById('stat-time').innerText = DATA[range].time + ' min';
      document.getElementById('stat-water').innerText = DATA[range].water + ' L';
      document.getElementById('stat-days').innerText = DATA[range].days + ' days';
    }

    window.addEventListener('DOMContentLoaded', () => {
      setupCharts();
      // Range selector
      document.querySelectorAll('.range-btn').forEach(btn => {
        btn.addEventListener('click',function(){
          document.querySelectorAll('.range-btn').forEach(b=>b.classList.remove('bg-emerald-500'));
          this.classList.add('bg-emerald-500');
          selectedRange = this.dataset.range;
          updateCharts(selectedRange);
        });
      });
      // load goal
      const goal = localStorage.getItem('userGoal');
      if(goal) document.getElementById('current-goal-display').innerHTML = "<strong>Current goal:</strong> "+goal;
    });

    // Save goal
    document.getElementById('goal-form').addEventListener('submit',e=>{
      e.preventDefault();
      const v = document.getElementById('goal-input').value.trim();
      if(v){
        localStorage.setItem('userGoal', v);
        document.getElementById('current-goal-display').innerHTML = "<strong>Current goal:</strong> "+v;
        document.getElementById('goal-input').value = '';
      }
    });
  