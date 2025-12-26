/**
 * Game Service - Firestore Operations for Game Sessions & Student Scores
 *
 * Handles:
 * - Session validation and claiming
 * - Student score management
 * - Real-time ranking queries
 */

import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { isNewBestScore, GAME_CONFIG } from '../config/gameConfig';

const CONSOLE_PREFIX = '[GameService]';

// ============================================
// Session Management
// ============================================

/**
 * Fetch game session by ID
 * @param {string} sessionId - Session ID from QR code
 * @returns {Promise<Object|null>} Session data or null
 */
export const getGameSession = async (sessionId) => {
  try {
    const sessionRef = doc(db, 'gameSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      console.log(`${CONSOLE_PREFIX} Session not found:`, sessionId);
      return null;
    }

    const data = sessionSnap.data();
    console.log(`${CONSOLE_PREFIX} Session fetched:`, sessionId);
    return { id: sessionSnap.id, ...data };
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Fetch session failed:`, error);
    throw error;
  }
};

/**
 * Validate session (exists, not expired, not claimed)
 * @param {Object} session - Session data
 * @returns {Object} Validation result { valid: boolean, reason?: string }
 */
export const validateSession = (session) => {
  if (!session) {
    return { valid: false, reason: 'SESSION_NOT_FOUND' };
  }

  if (session.claimed) {
    return { valid: false, reason: 'ALREADY_CLAIMED' };
  }

  const now = Timestamp.now();
  if (session.expiresAt && session.expiresAt.seconds < now.seconds) {
    return { valid: false, reason: 'SESSION_EXPIRED' };
  }

  return { valid: true };
};

// ============================================
// Score Claiming
// ============================================

/**
 * Claim score for a student
 * @param {string} sessionId - Game session ID
 * @param {string} studentId - 4-digit student ID
 * @param {Object} session - Session data
 * @returns {Promise<Object>} Updated student data
 */
export const claimScore = async (sessionId, studentId, session) => {
  try {
    console.log(`${CONSOLE_PREFIX} Claiming score:`, { sessionId, studentId });

    const studentRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentRef);

    const now = serverTimestamp();
    const { gameType, score } = session;

    if (studentSnap.exists()) {
      // Update existing student
      const studentData = studentSnap.data();
      const currentBest = studentData.scores?.[gameType];

      // Check if new score is better (handles all game types)
      const isNewBest = isNewBestScore(gameType, score, currentBest);

      if (isNewBest) {
        const newScores = { ...studentData.scores, [gameType]: score };
        const totalScore = Object.values(newScores).reduce((a, b) => a + b, 0);

        await updateDoc(studentRef, {
          scores: newScores,
          totalScore,
          lastPlayed: now,
          updatedAt: now
        });

        console.log(`${CONSOLE_PREFIX} New best score!`, score);
      } else {
        await updateDoc(studentRef, {
          lastPlayed: now,
          updatedAt: now
        });

        console.log(`${CONSOLE_PREFIX} Score not better than current best`);
      }
    } else {
      // Create new student record
      const studentData = {
        studentId,
        name: null,
        class: null,
        scores: { [gameType]: score },
        totalScore: score,
        photoUrl: null,
        lastPlayed: now,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(studentRef, studentData);
      console.log(`${CONSOLE_PREFIX} New student created:`, studentId);
    }

    // Mark session as claimed
    const sessionRef = doc(db, 'gameSessions', sessionId);
    await updateDoc(sessionRef, {
      claimed: true,
      claimedBy: studentId,
      claimedAt: now
    });

    console.log(`${CONSOLE_PREFIX} Score claimed successfully`);

    // Return updated student data
    const updatedSnap = await getDoc(studentRef);
    return updatedSnap.data();
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Claim score failed:`, error);
    throw error;
  }
};

// ============================================
// Ranking Queries
// ============================================

/**
 * Subscribe to real-time ranking updates (Reaction Game)
 * @param {Function} callback - Called with ranking data on updates
 * @param {number} topN - Number of top students to fetch (default 100)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToRanking = (callback, topN = 100) => {
  const q = query(
    collection(db, 'students'),
    where('scores.reaction', '!=', null),
    orderBy('scores.reaction', 'asc'), // Lower is better
    limit(topN)
  );

  return onSnapshot(q, (snapshot) => {
    const ranking = snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      studentId: doc.id,
      ...doc.data()
    }));

    console.log(`${CONSOLE_PREFIX} Reaction ranking updated:`, ranking.length, 'students');
    callback(ranking);
  }, (error) => {
    console.error(`${CONSOLE_PREFIX} Ranking subscription error:`, error);
  });
};

/**
 * Subscribe to real-time ranking updates (Color Game)
 * @param {Function} callback - Called with ranking data on updates
 * @param {number} topN - Number of top students to fetch (default 100)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToColorRanking = (callback, topN = 100) => {
  const q = query(
    collection(db, 'students'),
    where('scores.color', '!=', null),
    orderBy('scores.color', 'desc'), // Higher is better
    limit(topN)
  );

  return onSnapshot(q, (snapshot) => {
    const ranking = snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      studentId: doc.id,
      ...doc.data()
    }));

    console.log(`${CONSOLE_PREFIX} Color ranking updated:`, ranking.length, 'students');
    callback(ranking);
  }, (error) => {
    console.error(`${CONSOLE_PREFIX} Color ranking subscription error:`, error);
  });
};

/**
 * Subscribe to real-time ranking updates (Memory Game)
 * @param {Function} callback - Called with ranking data on updates
 * @param {number} topN - Number of top students to fetch (default 100)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToMemoryRanking = (callback, topN = 100) => {
  const q = query(
    collection(db, 'students'),
    where('scores.memory', '!=', null),
    orderBy('scores.memory', 'desc'), // Higher is better
    limit(topN)
  );

  return onSnapshot(q, (snapshot) => {
    const ranking = snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      studentId: doc.id,
      ...doc.data()
    }));

    console.log(`${CONSOLE_PREFIX} Memory ranking updated:`, ranking.length, 'students');
    callback(ranking);
  }, (error) => {
    console.error(`${CONSOLE_PREFIX} Memory ranking subscription error:`, error);
  });
};

/**
 * Subscribe to real-time ranking updates (Balloon Game)
 * @param {Function} callback - Called with ranking data on updates
 * @param {number} topN - Number of top students to fetch (default 100)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToBalloonRanking = (callback, topN = 100) => {
  const q = query(
    collection(db, 'students'),
    where('scores.balloon', '!=', null),
    orderBy('scores.balloon', 'desc'), // Higher is better
    limit(topN)
  );

  return onSnapshot(q, (snapshot) => {
    const ranking = snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      studentId: doc.id,
      ...doc.data()
    }));

    console.log(`${CONSOLE_PREFIX} Balloon ranking updated:`, ranking.length, 'students');
    callback(ranking);
  }, (error) => {
    console.error(`${CONSOLE_PREFIX} Balloon ranking subscription error:`, error);
  });
};

/**
 * Subscribe to ranking for any game type (unified function)
 * @param {string} gameType - 'reaction', 'color', 'memory', 'balloon'
 * @param {Function} callback - Called with ranking data on updates
 * @param {number} topN - Number of top students to fetch (default 100)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToGameRanking = (gameType, callback, topN = 100) => {
  const orderDirection = gameType === 'reaction' ? 'asc' : 'desc';

  const q = query(
    collection(db, 'students'),
    where(`scores.${gameType}`, '!=', null),
    orderBy(`scores.${gameType}`, orderDirection),
    limit(topN)
  );

  return onSnapshot(q, (snapshot) => {
    const ranking = snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      studentId: doc.id,
      ...doc.data()
    }));

    console.log(`${CONSOLE_PREFIX} ${gameType} ranking updated:`, ranking.length, 'students');
    callback(ranking);
  }, (error) => {
    console.error(`${CONSOLE_PREFIX} ${gameType} ranking subscription error:`, error);
  });
};

/**
 * Get student rank and score (Reaction Game)
 * @param {string} studentId - 4-digit student ID
 * @returns {Promise<Object|null>} { rank, score, total } or null
 */
export const getStudentRank = async (studentId) => {
  try {
    const studentRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return null;
    }

    const studentData = studentSnap.data();
    const studentScore = studentData.scores?.reaction;

    if (!studentScore) {
      return null;
    }

    // Count students with better scores
    const betterScoresQuery = query(
      collection(db, 'students'),
      where('scores.reaction', '<', studentScore)
    );

    const betterScoresSnap = await getDocs(betterScoresQuery);
    const rank = betterScoresSnap.size + 1;

    // Get total students
    const allStudentsQuery = query(
      collection(db, 'students'),
      where('scores.reaction', '!=', null)
    );

    const allStudentsSnap = await getDocs(allStudentsQuery);
    const total = allStudentsSnap.size;

    return {
      rank,
      score: studentScore,
      total
    };
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Get student rank failed:`, error);
    throw error;
  }
};

/**
 * Get student rank and score (Color Game)
 * @param {string} studentId - 4-digit student ID
 * @returns {Promise<Object|null>} { rank, score, total } or null
 */
export const getStudentColorRank = async (studentId) => {
  try {
    const studentRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return null;
    }

    const studentData = studentSnap.data();
    const studentScore = studentData.scores?.color;

    if (!studentScore) {
      return null;
    }

    // Count students with better scores (higher is better for color game)
    const betterScoresQuery = query(
      collection(db, 'students'),
      where('scores.color', '>', studentScore)
    );

    const betterScoresSnap = await getDocs(betterScoresQuery);
    const rank = betterScoresSnap.size + 1;

    // Get total students
    const allStudentsQuery = query(
      collection(db, 'students'),
      where('scores.color', '!=', null)
    );

    const allStudentsSnap = await getDocs(allStudentsQuery);
    const total = allStudentsSnap.size;

    return {
      rank,
      score: studentScore,
      total
    };
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Get student color rank failed:`, error);
    throw error;
  }
};

/**
 * Get student data
 * @param {string} studentId - 4-digit student ID
 * @returns {Promise<Object|null>} Student data or null
 */
export const getStudentData = async (studentId) => {
  try {
    const studentRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return null;
    }

    return studentSnap.data();
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Get student data failed:`, error);
    throw error;
  }
};

/**
 * Get all score history for a student
 * @param {string} studentId - 4-digit student ID
 * @returns {Promise<Array>} Array of score records sorted by date (newest first)
 */
export const getAllStudentScores = async (studentId) => {
  try {
    console.log(`${CONSOLE_PREFIX} Fetching all scores for:`, studentId);

    // Query all claimed sessions for this student
    const sessionsQuery = query(
      collection(db, 'gameSessions'),
      where('claimedBy', '==', studentId),
      orderBy('claimedAt', 'desc') // Newest first
    );

    const sessionsSnap = await getDocs(sessionsQuery);

    const scores = sessionsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        gameType: data.gameType,
        score: data.score,
        claimedAt: data.claimedAt,
        createdAt: data.createdAt
      };
    });

    console.log(`${CONSOLE_PREFIX} Found ${scores.length} score records`);
    return scores;
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Get all student scores failed:`, error);
    throw error;
  }
};

/**
 * Get student ranks and scores for all games
 *
 * Returns ranking data for all 4 game types for a specific student
 * @param {string} studentId - 4-digit student ID
 * @returns {Promise<Object>} { reaction: {...}, color: {...}, memory: {...}, balloon: {...} }
 */
export const getStudentAllRanks = async (studentId) => {
  try {
    const studentRef = doc(db, 'students', studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      return null;
    }

    const studentData = studentSnap.data();
    const scores = studentData.scores || {};
    const result = {};

    // 각 게임 타입별로 순위 계산
    for (const gameType of Object.keys(GAME_CONFIG)) {
      const studentScore = scores[gameType];

      if (!studentScore) {
        result[gameType] = null;
        continue;
      }

      const config = GAME_CONFIG[gameType];
      const operator = config.betterWhen === 'lower' ? '<' : '>';

      // Count students with better scores
      const betterScoresQuery = query(
        collection(db, 'students'),
        where(`scores.${gameType}`, operator, studentScore)
      );

      const betterScoresSnap = await getDocs(betterScoresQuery);
      const rank = betterScoresSnap.size + 1;

      // Get total students
      const allStudentsQuery = query(
        collection(db, 'students'),
        where(`scores.${gameType}`, '!=', null)
      );

      const allStudentsSnap = await getDocs(allStudentsQuery);
      const total = allStudentsSnap.size;

      result[gameType] = {
        rank,
        score: studentScore,
        total,
        gameType
      };
    }

    console.log(`${CONSOLE_PREFIX} Fetched ranks for all games:`, studentId);
    return result;
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Get student all ranks failed:`, error);
    throw error;
  }
};
