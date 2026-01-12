'use client';

import { BibleStudy, User } from '@/types';

const STORAGE_KEYS = {
  USERS: 'scripture_path_db_users',
  STUDIES: 'scripture_path_db_studies',
  SESSION: 'scripture_path_session'
};

// Helper for SSR safety
const isBrowser = typeof window !== 'undefined';

export const PersistenceService = {
  // --- User Management ---
  getUsers: (): User[] => {
    if (!isBrowser) return [];
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  getUserByEmail: (email: string): User | undefined => {
    return PersistenceService.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  saveUser: (user: User) => {
    if (!isBrowser) return;
    const users = PersistenceService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // --- Study Management ---
  getAllStudies: (): BibleStudy[] => {
    if (!isBrowser) return [];
    const data = localStorage.getItem(STORAGE_KEYS.STUDIES);
    return data ? JSON.parse(data) : [];
  },

  getStudyById: (id: string): BibleStudy | undefined => {
    return PersistenceService.getAllStudies().find(s => s.metadata.id === id);
  },

  saveStudy: (study: BibleStudy) => {
    if (!isBrowser) return;
    const studies = PersistenceService.getAllStudies();
    const index = studies.findIndex(s => s.metadata.id === study.metadata.id);
    if (index > -1) {
      studies[index] = study;
    } else {
      studies.push(study);
    }
    localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(studies));
  },

  deleteStudy: (id: string) => {
    if (!isBrowser) return;
    const studies = PersistenceService.getAllStudies();
    const updated = studies.filter(s => s.metadata.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(updated));
  },

  getUserStudies: (userId: string): BibleStudy[] => {
    return PersistenceService.getAllStudies()
      .filter(s => s.metadata.ownerId === userId)
      .sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
  },

  getPublicStudies: (): BibleStudy[] => {
    return PersistenceService.getAllStudies()
      .filter(s => s.metadata.isPublic)
      .sort((a, b) => {
        const scoreA = (a.metadata.stats?.views || 0) + (a.metadata.stats?.likes || 0) * 2 + (a.metadata.stats?.shares || 0) * 3;
        const scoreB = (b.metadata.stats?.views || 0) + (b.metadata.stats?.likes || 0) * 2 + (b.metadata.stats?.shares || 0) * 3;
        return scoreB - scoreA;
      });
  },

  toggleVisibility: (studyId: string) => {
    if (!isBrowser) return false;
    const studies = PersistenceService.getAllStudies();
    const index = studies.findIndex(s => s.metadata.id === studyId);
    if (index > -1) {
      studies[index].metadata.isPublic = !studies[index].metadata.isPublic;
      localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(studies));
      return studies[index].metadata.isPublic;
    }
    return false;
  },

  // --- Oversight ---
  getGlobalStats: () => {
    const studies = PersistenceService.getAllStudies();
    const users = PersistenceService.getUsers();
    return {
      totalStudies: studies.length,
      totalUsers: users.length,
      publicStudies: studies.filter(s => s.metadata.isPublic).length,
      totalViews: studies.reduce((acc, curr) => acc + (curr.metadata.stats?.views || 0), 0),
      totalLikes: studies.reduce((acc, curr) => acc + (curr.metadata.stats?.likes || 0), 0),
      totalShares: studies.reduce((acc, curr) => acc + (curr.metadata.stats?.shares || 0), 0)
    };
  },

  // --- Tracking ---
  recordView: (studyId: string, userId?: string) => {
    if (!isBrowser) return;
    const studies = PersistenceService.getAllStudies();
    const studyIndex = studies.findIndex(s => s.metadata.id === studyId);
    if (studyIndex > -1) {
      if (!studies[studyIndex].metadata.stats) {
        studies[studyIndex].metadata.stats = { views: 0, clones: 0, likes: 0, shares: 0 };
      }
      studies[studyIndex].metadata.stats.views++;
      localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(studies));
    }
  },

  recordLike: (studyId: string) => {
    if (!isBrowser) return 0;
    const studies = PersistenceService.getAllStudies();
    const studyIndex = studies.findIndex(s => s.metadata.id === studyId);
    if (studyIndex > -1) {
      if (!studies[studyIndex].metadata.stats) {
        studies[studyIndex].metadata.stats = { views: 0, clones: 0, likes: 0, shares: 0 };
      }
      studies[studyIndex].metadata.stats.likes++;
      localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(studies));
      return studies[studyIndex].metadata.stats.likes;
    }
    return 0;
  },

  recordShare: (studyId: string) => {
    if (!isBrowser) return 0;
    const studies = PersistenceService.getAllStudies();
    const studyIndex = studies.findIndex(s => s.metadata.id === studyId);
    if (studyIndex > -1) {
      if (!studies[studyIndex].metadata.stats) {
        studies[studyIndex].metadata.stats = { views: 0, clones: 0, likes: 0, shares: 0 };
      }
      studies[studyIndex].metadata.stats.shares++;
      localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(studies));
      return studies[studyIndex].metadata.stats.shares;
    }
    return 0;
  }
};
