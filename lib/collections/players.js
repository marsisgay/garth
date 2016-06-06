//This is the database of people who have logged in.
//Each logged in person has to fill in their particulars i.e.
//1. Age: 
//2. Field:
//  - Business and Finance
//  - Arts and Culture
//  - Science and Technology
//  - Health and Law
//3. Gender

//In the background, we will also assign the following:
//4. Participant number, chronologically increasing.
//5. Treatment or Control Group assignment, so that the groups are equal.
//6. User ID for reference throughout the game
//
//Each user has their own ID. This ID is filled in to the players database which is used in the game. 
//see players.js
//This database is not available throughout the game and is locked on the server side once the data comes through from the client.

//UserAccounts = new Mongo.Collection('users');
//UserAccounts.insert({age:24,Field:1,Gender:"female",});

myPlayers = new Mongo.Collection('players');
