
    const API_BASE_URL = "https://vitalhu-backend.onrender.com/api";

    const nutritionPresets = {
      all: ['banana', 'apple', 'chicken', 'salad'],
      'weight loss': ['spinach', 'lettuce', 'tomato'],
      'muscle gain': ['chicken', 'egg', 'tofu'],
      vegetarian: ['quinoa', 'tofu', 'beans']
    };

    async function fetchNutritionalFacts(queries) {
      if (!queries || queries.length === 0) {
        document.getElementById('nutrition-search-results').innerHTML = '';
        return;
      }
      document.getElementById('nutrition-search-results').innerHTML = '<div class="text-gray-500">Loading...</div>';

      try {
        // Fetch nutrition info for each query in parallel
        const resultsArray = await Promise.all(queries.map(async q => {
          const res = await fetch(`${API_BASE_URL}/nutrition?search=${encodeURIComponent(q)}`);
          if (!res.ok) {
            throw new Error(`Error fetching nutrition data for "${q}"`);
          }
          const data = await res.json();
          return data;
        }));

        let html = '';
        resultsArray.forEach(items => {
          if (Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
              html += `
                <div class="mb-4 p-3 rounded bg-white shadow">
                  <div class="font-bold text-xl capitalize">${item.name || 'Unknown'}</div>
                  <div class="text-gray-600">Calories: ${item.calories ?? 'N/A'}, Protein: ${item.protein_g ?? 'N/A'}g, Carbs: ${item.carbohydrates_total_g ?? 'N/A'}g, Fat: ${item.fat_total_g ?? 'N/A'}g</div>
                </div>
              `;
            });
          }
        });

        if (!html) {
          html = '<div class="text-gray-500">No nutrition info found.</div>';
        }
        document.getElementById('nutrition-search-results').innerHTML = html;

      } catch (err) {
        document.getElementById('nutrition-search-results').innerHTML = `<div class="text-red-500">Error: ${err.message}</div>`;
      }
    }

    // Tab handler for presets
    document.querySelectorAll('.nutrition-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.nutrition-tab').forEach(t => t.classList.remove('bg-black', 'font-bold'));
        this.classList.add('bg-black', 'font-bold');
        const cat = this.getAttribute('data-cat');
        fetchNutritionalFacts(nutritionPresets[cat]);
      });
    });

    // Search button handler
    document.getElementById('nutrition-search-btn').addEventListener('click', () => {
      const q = document.getElementById('nutrition-search-input').value.trim();
      if (!q) return;
      fetchNutritionalFacts([q]);
    });

    // Press Enter key triggers search
    document.getElementById('nutrition-search-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('nutrition-search-btn').click();
      }
    });

    // Fetch default category on load
    window.addEventListener('DOMContentLoaded', () => {
      fetchNutritionalFacts(nutritionPresets['all']);
    });
 