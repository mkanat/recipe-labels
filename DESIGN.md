# Recipie Label Maker

This is a web app that will take brief information about recipies and print it out onto an 8.5" x 11" sheet of 3" x 2" labels.

## UI Requirements

- The app is designed primarily to be used on a mobile device.
- This app is intended to be used in a kitchen where the user may have messy hands, so the interface should be simple and easy to use with large buttons and text.

## Recipe Contents

A recipie has three fields:

- Temperature: A cooking temperature in degrees Fahrenheit.
- Time: How long to cook the food, in minutes.
- Instructions: A short description of how to prepare the food.

We have to limit the instructions field to have only as many characters as we can successfully print on a single label.

## Print Layout

When printing, the label should be formatted as follows:

```
**Temperature**: [Temperature]°F **Time**: [Time] min
[Instructions]
```

The text should be very easy to read.

## Authentication

- This app uses Google login only. Recipes are stored per-user.

## Secrets

- Secrets are stored in a local configuration file with a simple format.
- The secret configuration is kept secure--it is not accessible through the web interface.
- The secret configuration is always in .gitignore.

## Actions

- When first logging into the app, the user sees a list of their saved recipes.
- The user can add a new recipe.
- The user can edit an existing recipe.
- The user can delete an existing recipe.
- The user can print a recipe.
  - When printing a recipe, the user can choose to print a single copy or multiple copies.
- The user can print multiple recipes at once.
  - When printing multiple recipes at once, the user can choose to print a single copy or multiple copies of each recipe.

We preserve all past states of recipes so that we can undo to a previous state if needed (in the case of an accidental edit or deletion).

## Storage

- Recipes are stored in a local database.

## Serving

- This app is proxied behind Apache. It should provide the Apache config necessary to serve it.
- The production instance lives at recipe.kanat.us.
