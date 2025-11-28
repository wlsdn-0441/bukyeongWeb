/**
 * Statistics Service - Usage Analytics
 *
 * Queries Firestore for usage statistics:
 * - Total active users
 * - Registrations by grade
 * - Registrations by class
 */

import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../config/firebase';

const CONSOLE_PREFIX = '[StatisticsService]';

/**
 * Get total active registrations count
 * @returns {Promise<number>} Total count
 */
export const getTotalActiveUsers = async () => {
  try {
    const q = query(
      collection(db, 'studentRegistrations'),
      where('isActive', '==', true)
    );

    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;
    console.log(`${CONSOLE_PREFIX} Total active users:`, count);
    return count;
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Failed to get total users:`, error);
    throw error;
  }
};

/**
 * Get registrations count by grade
 * @returns {Promise<Object>} { "1": 45, "2": 52, "3": 38 }
 */
export const getRegistrationsByGrade = async () => {
  try {
    const q = query(
      collection(db, 'studentRegistrations'),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const byGrade = { "1": 0, "2": 0, "3": 0 };

    snapshot.docs.forEach(doc => {
      const grade = doc.data().grade;
      byGrade[grade] = (byGrade[grade] || 0) + 1;
    });

    console.log(`${CONSOLE_PREFIX} By grade:`, byGrade);
    return byGrade;
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Failed to get by grade:`, error);
    throw error;
  }
};

/**
 * Get registrations count by class
 * @returns {Promise<Object>} { "1-1": 5, "1-2": 7, "2-6": 12, ... }
 */
export const getRegistrationsByClass = async () => {
  try {
    const q = query(
      collection(db, 'studentRegistrations'),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const byClass = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const classKey = `${data.grade}-${data.classNum}`;
      byClass[classKey] = (byClass[classKey] || 0) + 1;
    });

    console.log(`${CONSOLE_PREFIX} By class:`, byClass);
    return byClass;
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Failed to get by class:`, error);
    throw error;
  }
};

/**
 * Get comprehensive statistics (for admin dashboard)
 * @returns {Promise<Object>} Comprehensive stats object
 */
export const getComprehensiveStats = async () => {
  try {
    console.log(`${CONSOLE_PREFIX} Fetching comprehensive statistics...`);

    const [total, byGrade, byClass] = await Promise.all([
      getTotalActiveUsers(),
      getRegistrationsByGrade(),
      getRegistrationsByClass()
    ]);

    const stats = {
      total,
      byGrade,
      byClass,
      updatedAt: new Date().toISOString()
    };

    console.log(`${CONSOLE_PREFIX} Comprehensive stats:`, stats);
    return stats;
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Failed to get comprehensive stats:`, error);
    throw error;
  }
};
