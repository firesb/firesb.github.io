form = document.getElementById('login-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginWithUsername();
});

async function loginWithUsername() {
  const supabaseUrl = 'https://rrxxnrhjdfkkzkggyuby.supabase.co'; 
  const anonKey = 'sb_publishable_8otqa5vZveDxDRaVCV1wOg_i3A5sVPI'; 
  
  // 1. Point to your custom users table instead of /auth/v1/
  // Replace 'your_table_name' with your actual database table name
  const tableName = 'firesb_accounts'; 
  
  const inputUsername = document.getElementById('username').value;
  const inputPassword = document.getElementById('password').value;

  // We read the table and filter by matching username and password
  const endpoint = `${supabaseUrl}/rest/v1/${tableName}?username=eq.${encodeURIComponent(inputUsername)}&password=eq.${encodeURIComponent(inputPassword)}&select=*`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET', // We are retrieving the matching user row
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    });

    const usersFound = await response.json();

    if (!response.ok) {
      console.error("Database Error:", usersFound);
      alert("Login failed due to a database issue.");
      return;
    }

    // 2. If the array is empty, no user matched that username/password combo
    if (usersFound.length === 0) {
      alert("Invalid username or password!");
      return;
    }

    // 3. Success! You have the full user object matching your database columns
    const loggedInUser = usersFound[0];
    localStorage.setItem('loggedInAccount', JSON.stringify(loggedInUser));
    
    // Save their username or custom ID to localStorage for future use
    localStorage.setItem('username', loggedInUser.username);
    localStorage.setItem('accounttype', loggedInUser.accounttype);

    window.location.href = "/"
    return loggedInUser;

  } catch (error) {
    console.error('Login process failed:', error.message);
  }
}
