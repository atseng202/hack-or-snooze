// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  
  const hostName = story.getHostName();
  let isFavorite = false;
  if(currentUser){
    isFavorite = currentUser.includes(currentUser.favorites, story);
  }
  // debugger;
  return $(`
  <li id="${story.storyId}">
  <i class="fa${isFavorite ? "s" : "r"} fa-star"></i>
  <a href="${story.url}" target="a_blank" class="story-link">
  ${story.title}
  </a>
  <small class="story-hostname">(${hostName})</small>
  <small class="story-author">by ${story.author}</small>
  <small class="story-user">posted by ${story.username}</small>
  </li>
  `);
}

/** Gets list of stories from storyList instance, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  
  $allStoriesList.empty();
  
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  
  $allStoriesList.show();
}

$newStoryForm.on("submit", addNewStory);

/*
 * function to get new story from submitted form inputs 
 */

async function addNewStory(evt){
  console.debug("addNewStory");

  evt.preventDefault();
  const author = $('#create-author').val();
  const title = $('#create-title').val();
  const url = $('#create-url').val();

  // get HTML markup and add to front of all stories page
  const storyData = { author, title, url };
  const story = await storyList.addStory(currentUser, storyData);
  const $story = generateStoryMarkup(story);
  $newStoryForm.hide();
  $allStoriesList.prepend($story);
}

/* Get list of favorite stories from the user and puts them on page
 */
function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");
  $allFavoritesList.empty();

  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allFavoritesList.append($story);
  }
  
  // If favorites array is empty append message to DOM
  if(currentUser.favorites.length === 0){
    $noFavoritesMsg.show();
  } else {
    $noFavoritesMsg.hide();
  }

  $allFavoritesList.show();
}

/* function "favorites" the clicked link by POSTing to server
 * then updates the icon as favorited
 * also places favorites on page
 */

 async function toggleFavoriteStory(evt) {
   console.debug("toggleFavoriteStory", evt);
   // grab the target storyId to "favorite" it
   let $storyItem = $(evt.target).closest('li');
   let $favoritedStoryIcon = $(evt.target);
   let storyId = $storyItem.attr("id");
   let story = storyList.stories.find(s => s.storyId === storyId);

   let isFavorite = $favoritedStoryIcon.hasClass('fas');
   // either favorite or un-favorite story, depending on if 
   // it was previously favorited
   if (!isFavorite) {
     await currentUser.addFavorite(story);
   } else {
     await currentUser.removeFavorite(story);
   }
   isFavorite = !isFavorite;
   // update the DOM by updating the current story on DOM with 
   // correct Font Awesome icon

   $favoritedStoryIcon.toggleClass("fas far");
  //  // also update data-attribute of story item
  //  $storyItem.attr("data-favorite", `${isFavorite ? "yes" : "no"}`)
 }

 $allStoriesList.on("click", ".fa-star", toggleFavoriteStory);
 $allFavoritesList.on("click", ".fa-star", toggleFavoriteStory);
 $allMyStoriesList.on("click", ".fa-star", toggleFavoriteStory);

 // TODO: Get a trash icon from Font Awesome and add this click handler for my stories
 $allMyStoriesList.on("click", ".fa-trash-alt", deleteStory);


 /* Function gets list of current user's own stories and puts them on page
  *
  */

  function putMyStoriesOnPage() {
    console.debug("putMyStoriesOnPage");
    $allMyStoriesList.empty();

    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story);
      $story.prepend(`<i class="fas fa-trash-alt"></i>`);
      $allMyStoriesList.append($story);
    }

    // if no stories written append message to DOM
    (currentUser.ownStories.length === 0) ? $noMyStoriesMsg.show() :$noMyStoriesMsg.hide();
    
    $allMyStoriesList.show();
  }

  /** Function deletes the story from server
   *  and should remove from DOM too
   */  

   async function deleteStory(evt) {
     console.debug("deleteStory", evt);
   }