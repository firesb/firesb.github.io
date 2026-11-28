(function () {
  const supabaseUrl = 'https://rrxxnrhjdfkkzkggyuby.supabase.co';
  const anonKey = 'sb_publishable_8otqa5vZveDxDRaVCV1wOg_i3A5sVPI';
  const columns = 'username,accounttype,created_at,displayname,grade,spoints,ex_level,id';

  const title = document.getElementById('profile-title');
  const status = document.getElementById('profile-status');
  const details = document.getElementById('profile-details');

  function getProfileLookup() {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('id')) {
      return { column: 'id', value: searchParams.get('id') || '' };
    }

    const queryUsername = searchParams.get('username');
    if (queryUsername && queryUsername.trim()) {
      return { column: 'username', value: queryUsername };
    }

    const hash = window.location.hash.slice(1);
    if (!hash) {
      return null;
    }
    try {
      return { column: 'username', value: decodeURIComponent(hash) };
    } catch {
      return { column: 'username', value: hash };
    }
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

  function editDistance(left, right) {
    let previousRow = Array.from({ length: right.length + 1 }, (_, index) => index);

    for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
      const currentRow = [leftIndex + 1];
      for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
        const substitutionCost = left[leftIndex] === right[rightIndex] ? 0 : 1;
        currentRow.push(Math.min(
          currentRow[rightIndex] + 1,
          previousRow[rightIndex + 1] + 1,
          previousRow[rightIndex] + substitutionCost
        ));
      }
      previousRow = currentRow;
    }

    return previousRow[right.length];
  }

  async function findClosestUsername(username) {
    const pageSize = 1000;
    let offset = 0;
    let closestUsername = '';
    let closestDistance = Number.POSITIVE_INFINITY;
    const normalizedUsername = username.toLocaleLowerCase();

    while (true) {
      const params = new URLSearchParams({
        select: 'username',
        order: 'username.asc',
        limit: String(pageSize)
      });
      const response = await fetch(
        `${supabaseUrl}/rest/v1/firesb_accounts?${params}&offset=${offset}`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Username search failed with status ${response.status}.`);
      }

      const users = await response.json();
      if (!Array.isArray(users)) {
        throw new Error('The username search returned an unexpected response.');
      }
      if (users.length === 0) {
        return closestUsername;
      }

      for (const user of users) {
        if (typeof user.username !== 'string') {
          continue;
        }
        const distance = editDistance(normalizedUsername, user.username.toLocaleLowerCase());
        if (distance < closestDistance) {
          closestUsername = user.username;
          closestDistance = distance;
        }
      }

      const range = response.headers.get('content-range');
      const total = range && range.includes('/') ? Number(range.split('/')[1]) : Number.NaN;
      const hasMore = Number.isFinite(total)
        ? offset + users.length < total
        : users.length === pageSize;
      if (!hasMore) {
        return closestUsername;
      }
      offset += users.length;
    }
  }

  async function loadProfile() {
    let lookup;
    try {
      lookup = getProfileLookup();
    } catch (error) {
      status.textContent = 'This profile link contains an invalid lookup value.';
      status.setAttribute('role', 'alert');
      console.error('Could not read profile lookup value:', error);
      return;
    }

    if (!lookup || !lookup.value.trim()) {
      title.textContent = 'Profile not found';
      status.textContent = 'Open a profile link that includes a username or ID to view this page.';
      return;
    }

    const encodedValue = encodeURIComponent(lookup.value);
    const encodedFilterValue = lookup.column === 'username'
      ? encodedValue.replace(/\./g, '%2E')
      : encodedValue;
    const params = new URLSearchParams({
      select: columns
    }).toString().replace(/\+/g, '%20');

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/firesb_accounts?${lookup.column}=eq.${encodedFilterValue}&${params}`,
        {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Profile request failed with status ${response.status}.`);
      }

      const users = await response.json();
      if (!Array.isArray(users)) {
        throw new Error('The profile service returned an unexpected response.');
      }
      if (users.length === 0) {
        title.textContent = 'Profile not found';
        status.textContent = 'We couldn’t find a profile for that username or ID.';
        console.warn('Profile lookup returned no matching account.', lookup);
        if (lookup.column === 'username') {
          try {
            const closestUsername = await findClosestUsername(lookup.value);
            if (closestUsername) {
              console.info('Closest username match in the database:', closestUsername);
            } else {
              console.info('No usernames are available for comparison.');
            }
          } catch (error) {
            console.error('Could not search for a similar username:', error);
          }
        }
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
