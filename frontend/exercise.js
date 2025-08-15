
    lucide.createIcons();

    // Category → Placeholder data mapping
    const placeholderResults = {
      all: [
        {name:'Push Ups', type:'strength', muscle:'chest', difficulty:'beginner', instructions:'Keep your body straight and lower yourself until your chest nearly touches the floor.'},
        {name:'Running', type:'cardio', muscle:'legs', difficulty:'all levels', instructions:'Maintain a steady pace and keep breathing evenly.'}
      ],
      cardio: [
        {name:'Cycling', type:'cardio', muscle:'legs', difficulty:'all levels', instructions:'Use a stationary or road bike at moderate intensity.'}
      ],
      strength: [
        {name:'Squats', type:'strength', muscle:'legs', difficulty:'beginner', instructions:'Keep your back straight and lower your hips until thighs are parallel to the floor.'}
      ],
      yoga: [
        {name:'Sun Salutation', type:'yoga', muscle:'full body', difficulty:'beginner', instructions:'Perform the sequence slowly with deep breaths.'}
      ]
    };

    function renderExercises(list) {
      if (!list || list.length === 0) {
        document.getElementById('exercise-search-results').innerHTML = '<div class="text-gray-500">No exercises found.</div>';
        return;
      }
      const html = list.map(e =>
        `<div class="mb-4 p-3 rounded bg-white shadow">
          <div class="font-bold text-xl">${e.name}</div>
          <div class="text-gray-600 capitalize">${e.type || ''}${e.muscle ? ' – ' + e.muscle : ''} – <span class="capitalize">${e.difficulty || ''}</span></div>
          <div class="mt-2 text-gray-700">${e.instructions || ''}</div>
        </div>`
      ).join('');
      document.getElementById('exercise-search-results').innerHTML = html;
    }

    // Tab click listener
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('bg-black', 'font-bold'));
        this.classList.add('bg-black', 'font-bold');
        const cat = this.getAttribute('data-cat');
        renderExercises(placeholderResults[cat]);
      });
    });

    // Search input handler
    document.getElementById('exercise-search-btn').addEventListener('click', function() {
      const q = document.getElementById('exercise-search-input').value.trim().toLowerCase();
      if (!q) { 
        renderExercises([]); 
        return; 
      }
      // Search placeholder data
      const merged = Object.values(placeholderResults).flat();
      const filtered = merged.filter(e => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q));
      renderExercises(filtered);
    });

    // On load: show 'all'
    window.addEventListener('DOMContentLoaded', () => {
      renderExercises(placeholderResults['all']);
    });


    // Base URL of your backend API
const API_BASE_URL = "https://vitalhu-backend.onrender.com/api";

// Function to search exercises by query string using your backend API
async function fetchExercises(query) {
  if (!query) {
    document.getElementById('exercise-search-results').innerHTML = '';
    return;
  }
  
  // Show loading message
  document.getElementById('exercise-search-results').innerHTML = '<div class="text-gray-500">Loading...</div>';

  try {
    const response = await fetch(`${API_BASE_URL}/exercise?search=${encodeURIComponent(query)}`);
    
    // Check if response is JSON
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error("Unexpected response: " + text.substring(0, 100));
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error fetching exercises");
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      document.getElementById('exercise-search-results').innerHTML = '<div class="text-gray-500">No exercises found.</div>';
      return;
    }

    // Build HTML for results
    const html = data.map(e =>
      `<div class="mb-4 p-3 rounded bg-white shadow">
        <div class="font-bold text-xl">${e.name}</div>
        <div class="text-gray-600 capitalize">${e.type || ''}${e.muscle ? ' – ' + e.muscle : ''} – <span class="capitalize">${e.difficulty || ''}</span></div>
        <div class="mt-2 text-gray-700">${e.instructions || ''}</div>
      </div>`).join('');

    document.getElementById('exercise-search-results').innerHTML = html;

  } catch (err) {
    document.getElementById('exercise-search-results').innerHTML = `<div class="text-red-500">Error: ${err.message}</div>`;
  }
}

// Search button handler
document.getElementById('exercise-search-btn').addEventListener('click', () => {
  const query = document.getElementById('exercise-search-input').value.trim();
  fetchExercises(query);
});

// Optional: Press Enter key in search input triggers search
document.getElementById('exercise-search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('exercise-search-btn').click();
  }
});

 