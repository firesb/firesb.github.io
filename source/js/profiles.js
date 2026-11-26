(function () {
  const supabaseUrl = 'https://rrxxnrhjdfkkzkggyuby.supabase.co';
  const anonKey = 'sb_publishable_8otqa5vZveDxDRaVCV1wOg_i3A5sVPI';
  const columns = 'username,accounttype,created_at,displayname,grade,spoints,ex_level';

  const title = document.getElementById('profile-title');
  const status = document.getElementById('profile-status');
  const details = document.getElementById('profile-details');

  function getUsername() {
    const queryUsername = new URLSearchParams(window.location.search).get('username');
    if (queryUsername && queryUsername.trim()) {
      return queryUsername;
    }

    const hash = window.location.hash.slice(1);
    if (!hash) {
      return '';
    }
    return decodeURIComponent(hash);
  }

  function setText(id, value, fallback = 'Not available') {
    document.getElementById(id).textContent =
      value === null || value === undefined || value === '' ? fallback : String(value);
  }

  function formatDate(value) {
    if (!value) {
      return 'Not available';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? 'Not available'
      : new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date);
  }

  function formatPoints(value) {
    if (value === null || value === undefined || value === '') {
      return 'Not available';
    }
    const points = Number(value);
    return Number.isFinite(points) ? new Intl.NumberFormat().format(points) : String(value);
  }

  function formatAccountType(user) {
    if (String(user.accounttype).toLowerCase() !== 'teacher') {
      return user.accounttype;
    }

    if (user.grade === 'other') {
      return 'Teacher of College/University';
    }
    if (user.grade === 'K') {
      return 'Teacher of Kindergarten';
    }

    const grade = Number(user.grade);
    return Number.isInteger(grade) && grade >= 1 && grade <= 12
      ? `Teacher of Grade ${grade}`
      : 'Teacher';
  }

  async function loadProfile() {
    let username;
    try {
      username = getUsername();
    } catch (error) {
      status.textContent = 'This profile link contains an invalid username.';
      status.setAttribute('role', 'alert');
      console.error('Could not read profile username:', error);
      return;
    }

    if (!username) {
      title.textContent = 'Profile not found';
      status.textContent = 'Open a profile link that includes a username to view this page.';
      return;
    }

    const params = new URLSearchParams({
      username: `eq.${username}`,
      select: columns
    }).toString().replace(/\+/g, '%20');

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/firesb_accounts?${params}`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Profile request failed with status ${response.status}.`);
      }

      const users = await response.json();
      if (!Array.isArray(users)) {
        throw new Error('The profile service returned an unexpected response.');
      }
      if (users.length === 0) {
        title.textContent = 'Profile not found';
        status.textContent = 'We couldn’t find a profile for that username.';
        return;
      }

      const user = users[0];
      const displayName = user.displayname || user.username;
      title.textContent = `${displayName}’s Profile`;
      setText('profile-username', user.username);
      setText('profile-account-type', formatAccountType(user));
      setText('profile-points', formatPoints(user.spoints));
      setText('profile-level', user.ex_level);
      setText('profile-created', formatDate(user.created_at));
      status.textContent = 'Profile loaded.';
      details.hidden = false;
    } catch (error) {
      title.textContent = 'Profile unavailable';
      status.textContent = 'We couldn’t load this profile right now. Please try again later.';
      status.setAttribute('role', 'alert');
      console.error('Failed to load profile:', error);
    }
  }

  loadProfile();
})();
