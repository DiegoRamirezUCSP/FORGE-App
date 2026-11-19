import type { AdminUser, DraftWorkout, SessionResult } from '../types';

export type HomeStackParams = {
  Home: undefined;
  Progress: undefined;
  RankDetails: undefined;
  TrainingMenu: undefined;
  WorkoutSetup: { draft?: DraftWorkout } | undefined;
  ActiveSession: { draft: DraftWorkout };
  SessionSummary: { result: SessionResult };
};

export type ProfileStackParams = {
  Profile: undefined;
  AdminUsers: undefined;
  AdminUserDetail: { user: AdminUser };
};

export type TabParams = {
  HomeTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};
