/**
 * Personalized messages for Mia
 */

import { randomPick } from "@/utils";

/** Home screen messages — casual, personal, just for Mia */
const HOME_MESSAGES: string[] = [
  "What you gonna listen to today smelly",
  "Play some teon",
  "I miss you Tehe",
  "Hola Mia",
  "Go put on Teon already",
  "I miss my Quesadillas",
  "What song you going to play",
  "Miss You Pretty Tehe",
  "Im hungry asf",
  "You better be High rn",
  "Made this for you :) 💕",
  "I still haven't watched anime yet so wack",
  "Watch out for King Kong",
];

/** Random floating surprise messages */
export const ENCOURAGING_MESSAGES: string[] = [
  "I miss you TEHE",
  "Thinking about you stinky",
];

/** Secret messages after extended listening */
export const SECRET_MESSAGES: string[] = [
  "You've been listening for a while loser... I miss you TEHE",
  "Im still waiting on my Quesadilla",
  "Still thinking about you",
];

/** Get a random home screen message */
export function getHomeMessage(): string {
  return randomPick(HOME_MESSAGES);
}

/** Get a random encouraging message */
export function getEncouragingMessage(): string {
  return randomPick(ENCOURAGING_MESSAGES);
}

/** Get a secret message for extended listening sessions */
export function getSecretMessage(): string {
  return randomPick(SECRET_MESSAGES);
}
