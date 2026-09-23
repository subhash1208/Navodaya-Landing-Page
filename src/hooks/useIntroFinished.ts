'use client';

import { createContext, useContext } from 'react';

/**
 * Whether the first-visit intro overlay is finished and the page underneath is actually
 * on screen.
 *
 * Components that play an entrance animation read this so they do not perform it behind
 * an opaque full-screen overlay, where nobody can see it.
 *
 * Defaults to `true`, deliberately: anything rendered outside `<LoadingScreen>` — every
 * route except the homepage — is on screen the moment it mounts and must not wait for a
 * signal that will never arrive. The default also bounds the blast radius of a bug in
 * `LoadingScreen` to "an animation started early" rather than "content never appeared".
 */
export const IntroFinishedContext = createContext(true);

/** Read the intro gate. See {@link IntroFinishedContext}. */
export const useIntroFinished = () => useContext(IntroFinishedContext);
