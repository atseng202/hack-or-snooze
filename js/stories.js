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
  let isFavorite = currentUser.includesFavorite(story);
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

$newStoryForm.on("submit", addNewStoryAndUpdatePage);

/*
 * function to get new story from submitted form inputs 
 * TODO: Change function name, avoid using and
 */

async function addNewStoryAndUpdatePage(evt){
  console.debug("addNewStoryAndUpdatePage");

  evt.preventDefault();
  // TODO: Change ids to newAuthor, newTitle etc.
  const author = $('#author').val();
  const title = $('#title').val();
  const url = $('#url').val();
  // we didn't use the story instance here because we updated the stories array in addStory
  const storyData = { author, title, url };
  await storyList.addStory(currentUser, storyData);
  // TODO: don't recreate markup from scratch, just prepend story to beginning of story list
  $newStoryForm.hide();
  putStoriesOnPage(); 
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
   console.debug("toggleFavoriteStory");
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
