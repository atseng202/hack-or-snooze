"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** Show form for submitting a new story on click on "submit" */
function navSubmitStoryClick(evt) {
  console.debug("navSubmitStoryClick", evt);
  hidePageComponents();
  $allStoriesList.show();
  $newStoryForm.show();
}

$navSubmitStory.on("click", navSubmitStoryClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

$navFavorites.on("click", navFavoritesClick);

/*
 * Show section for favorited stories on click of "favorites" link 
 * Also hide storiesList, login/signup forms, submit form, etc.
 * 
 */

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt)
  hidePageComponents();
  putFavoritesOnPage();
}

$navMyStories.on("click", navMyStoriesClick);

/*
 * Show section for my stories on click of "my stories" link 
 * Also hide storiesList, login/signup forms, submit form, etc.
 */

function navMyStoriesClick(evt) {
  console.debug("navMyStoriesClick", evt)
  hidePageComponents();
  putMyStoriesOnPage();
}
