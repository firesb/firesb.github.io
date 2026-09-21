// 1. Select the dropdown element
const dropdown = document.getElementById('accounttype');
const form = document.getElementById('signup-form');
let classOptionsDiv = document.getElementById('class-options');

// 2. Add the change event listener
dropdown.addEventListener('change', (event) => {
  // 3. Get the newly selected value
  const selectedValue = event.target.value;

  // 4. Check if it matches your specific value
  if (selectedValue === 'teacher') {
    classOptionsDiv.innerHTML = `
      <label for="school">School:</label>
      <input type="text" id="school" name="school" required placeholder="School Name"><br>
      <label for="grade">Grade:</label>
      <select id="grade" name="grade" required>
        <option value="" disabled>Select Grade</option>
        <option value="K">Kindergarten</option>
        <option value="1">1st Grade</option>
        <option value="2">2nd Grade</option>
        <option value="3">3rd Grade</option>
        <option value="4">4th Grade</option>
        <option value="5">5th Grade</option>
        <option value="6">6th Grade</option>
        <option value="7">7th Grade</option>
        <option value="8">8th Grade</option>
        <option value="9">9th Grade</option>
        <option value="10">10th Grade</option>
        <option value="11">11th Grade</option>
        <option value="12">12th Grade</option>
        <option value="other">Higher Education</option>
      </select><br>
      <label for="class">Class:</label>
      <input type="text" id="class" name="class" required placeholder="1A"><br>
    `;
  } else if (selectedValue === 'parent') {
    classOptionsDiv.innerHTML = '<h3>You can add your child\'s account later in your profile and create the account(s) if you don\'t have one already.</h3>';
  } else {
    classOptionsDiv.innerHTML = ''; // Clear the div if another option is selected
  };
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  // Insert data into Supabase when the form is submitted
  insertData();

});

async function insertData() {
  const supabaseUrl = 'https://rrxxnrhjdfkkzkggyuby.supabase.co'; 
  
  const tableName = 'firesb_accounts'; 
  
  const anonKey = 'sb_publishable_8otqa5vZveDxDRaVCV1wOg_i3A5sVPI'; 

  // Combine them into the official Supabase REST endpoint
  const endpoint = `${supabaseUrl}/rest/v1/${tableName}`;

  try {

    let formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        displayname: document.getElementById('displayname').value,
        accounttype: document.getElementById('accounttype').value,
        class: document.getElementById('class') ? document.getElementById('class').value : null,
        school: document.getElementById('school') ? document.getElementById('school').value : null,
        grade: document.getElementById('grade') ? document.getElementById('grade').value : null
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // Forces Supabase to return the created row
      },
      // 4. Provide the columns and data you want to insert

      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully inserted data:', data);
    
  } catch (error) {
    console.error('Failed to insert data:', error);
  }
}
