const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";
/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ title, author, url, username, storyId, createdAt }) {
    this.author = author;
    this.title = title;
    this.url = url;
    this.username = username;
    this.storyId = storyId;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    return "hostname.com";
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    // token fron user, obj details from res data
    let storiesUrl = `${BASE_URL}/stories`;
    let response = await axios.post(storiesUrl, {
      token: user.loginToken,
      story: newStory,
    });
    // console.log(response);
    // let { title, author, url, username, storyId, createdAt } = response.data.story;
    let addedStory = new Story(response.data.story);
    //new story added to front of array
    this.stories.unshift(addedStory);
    // update user's own stories array
    user.ownStories.unshift(addedStory);
    // console.log(addedStory);
    return addedStory;
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    return new User(response.data.user, response.data.token);
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    return new User(response.data.user, response.data.token);
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });
      return new User(response.data.user, token);
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /* function adds a new favorite for the user by POSTing to the server 
   * required: a storyId (from the story), the user token, username
   */
  async addFavorite(storyId) {
    const favoritesUrl = `${BASE_URL}/users/${this.username}/favorites/${storyId}`;
    const response = await axios.post(
      favoritesUrl, 
      {token: this.loginToken }
    );

    let favoritedData = response.data.user.favorites;
    // was wondering if this is inefficient, similar to clearing DOM and re-adding 
    // all the story list items again
    this.favorites = favoritedData.map(s => new Story(s));
    
  }

  /* function removes a favorite for the user by POSTing to the server 
   * required: a storyId (from the story), the user token, username
   */
  async removeFavorite(storyId) {
    const favoritesUrl = `${BASE_URL}/users/${this.username}/favorites/${storyId}`;
    const response = await axios({
      url: favoritesUrl,
      method: "DELETE", 
      data: {token: this.loginToken }
    });

    let favoritedData = response.data.user.favorites;
    this.favorites = favoritedData.map(s => new Story(s));
  }


  /* function checks if a story is in the user's current favorites array */
  includesFavorite(story) {
    for (let favStory of this.favorites)  {
      if (favStory.storyId === story.storyId) {
        return true;
      }
    }
    return false;
  }
}

