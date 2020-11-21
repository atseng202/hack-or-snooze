"use strict";

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
    //new story added to front of storyList
    this.stories.unshift(addedStory);
    // update user's own stories array
    user.addStory(addedStory);
    // console.log(addedStory);
    return addedStory;
  }

  /* function accepts a user instance and storyId String
   * It removes the story from the server, and delegates user to remove 
   * story from its ownStories array
   */

  async removeStory(user, storyId) {
    const myStoriesUrl = `${BASE_URL}/stories/${storyId}`;

    let response = await axios({
      url: myStoriesUrl,
      method: "DELETE",
      data: { token: user.loginToken },
    });

    let removedStory = this.stories.find(s => s.storyId === storyId);
    this.stories = this.stories.filter((s) => s.storyId !== storyId);
    user.removeStory(removedStory);
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
    { username, name, createdAt, favorites = [], stories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = stories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   * - Delegating failed response error handling to whoever calls this function
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
   * - Delegating failed response error handling to whoever calls this function
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
    let response = await this._addOrRemove(true, storyId);

    // response.data.user.favorites is an array of user favorites
    let storyData = response.data.user.favorites.find( s => s.storyId === storyId);
    let newFavStory = new Story(storyData);
    this.favorites.push(newFavStory);
  }

  /* function removes a favorite for the user by POSTing to the server
   * required: a storyId (from the storyId), the user token, username
   */
  async removeFavorite(storyId) {
    await this._addOrRemove(false, storyId);

    this.favorites = this.favorites.filter((s) => s.storyId !== storyId);
  }

  /* Helper function to determine to add or remove favorites */

  async _addOrRemove(toBeFavorited, storyId) {
    const favoritesUrl = `${BASE_URL}/users/${this.username}/favorites/${storyId}`;
    let method = toBeFavorited ? "POST" : "DELETE";

    return await axios({
      url: favoritesUrl,
      method,
      data: { token: this.loginToken },
    });
  }

  /* function accepts a user list of stories and a story instance
   * returns true if the story is found in this list, false otherwise
   */
  includes(inUserList, storyOfInterest) {
    for (let story of inUserList) {
      if (storyOfInterest.storyId === story.storyId) {
        return true;
      }
    }
    return false;
  }

  /* function accepts a story and removes it from users ownStories array 
   * params: story instance to delete
   */
  removeStory(story) {
    this.ownStories = this.ownStories.filter((s) => s.storyId !== story.storyId);    
  }

  /* function accepts a story instance
   * adds the story to the front of the user's ownStories list
   */
  addStory(story) {
    this.ownStories.unshift(story);
  }
}
