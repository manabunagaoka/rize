// lib/db-helpers.ts
// Database helper functions for common queries
// Use these to keep your API routes and components clean

import { supabase } from './supabase';
import type { TopStartup, StudentProject } from './supabase';

// ============================================
// VOTING PROGRESS & ELIGIBILITY
// ============================================

/**
 * Get the number of startups a user has voted on
 * Users must vote on 5+ startups to unlock project submission
 * 
 * @param userId - User ID from SSO (x-user-id header)
 * @returns Number of startups voted on
 */
export async function getUserVoteCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('startup_votes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching vote count:', error);
    return 0;
  }
  
  return count || 0;
}

/**
 * Check if user has voted on enough startups to submit a project
 * Requirement: 5+ startup votes
 * 
 * @param userId - User ID from SSO
 * @returns True if user can submit, false otherwise
 */
export async function canUserSubmitProject(userId: string): Promise<boolean> {
  const voteCount = await getUserVoteCount(userId);
  return voteCount >= 5;
}

/**
 * Get detailed voting progress for a user
 * Includes which startups they've voted on and which are remaining
 * 
 * @param userId - User ID from SSO
 * @returns Vote progress details
 */
export async function getUserVotingProgress(userId: string) {
  // Get all startups
  const { data: allStartups, error: startupsError } = await supabase
    .from('top_startups')
    .select('*')
    .order('rank');
  
  if (startupsError || !allStartups) {
    return {
      votedCount: 0,
      totalStartups: 10,
      canSubmit: false,
      votedStartupIds: [],
      remainingStartups: [],
    };
  }
  
  // Get user's votes
  const { data: userVotes, error: votesError } = await supabase
    .from('startup_votes')
    .select('startup_id')
    .eq('user_id', userId);
  
  if (votesError) {
    console.error('Error fetching user votes:', votesError);
  }
  
  const votedStartupIds = userVotes?.map(v => v.startup_id) || [];
  const remainingStartups = allStartups.filter(s => !votedStartupIds.includes(s.id));
  
  return {
    votedCount: votedStartupIds.length,
    totalStartups: allStartups.length,
    canSubmit: votedStartupIds.length >= 5,
    votedStartupIds,
    remainingStartups,
  };
}

/**
 * Check if user has already voted on a specific startup
 * 
 * @param userId - User ID from SSO
 * @param startupId - Startup ID to check
 * @returns True if user has voted, false otherwise
 */
export async function hasUserVotedOnStartup(
  userId: string,
  startupId: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from('startup_votes')
    .select('id')
    .eq('user_id', userId)
    .eq('startup_id', startupId)
    .single();
  
  return !error && !!data;
}

// ============================================
// PROJECT SCORING & RANKINGS
// ============================================

/**
 * Calculate average score for a project across all 5 criteria
 * 
 * @param projectId - Project UUID
 * @returns Average score (0-5) and vote count
 */
export async function getProjectScore(projectId: string) {
  const { data: votes, error } = await supabase
    .from('project_votes')
    .select('market_opportunity, innovation, execution_difficulty, scalability, social_impact')
    .eq('project_id', projectId);
  
  if (error || !votes || votes.length === 0) {
    return {
      overallScore: 0,
      voteCount: 0,
      breakdown: {
        marketOpportunity: 0,
        innovation: 0,
        executionDifficulty: 0,
        scalability: 0,
        socialImpact: 0,
      },
    };
  }
  
  const totals = votes.reduce(
    (acc, vote) => ({
      marketOpportunity: acc.marketOpportunity + vote.market_opportunity,
      innovation: acc.innovation + vote.innovation,
      executionDifficulty: acc.executionDifficulty + vote.execution_difficulty,
      scalability: acc.scalability + vote.scalability,
      socialImpact: acc.socialImpact + vote.social_impact,
    }),
    { marketOpportunity: 0, innovation: 0, executionDifficulty: 0, scalability: 0, socialImpact: 0 }
  );
  
  const voteCount = votes.length;
  const breakdown = {
    marketOpportunity: totals.marketOpportunity / voteCount,
    innovation: totals.innovation / voteCount,
    executionDifficulty: totals.executionDifficulty / voteCount,
    scalability: totals.scalability / voteCount,
    socialImpact: totals.socialImpact / voteCount,
  };
  
  const overallScore =
    (breakdown.marketOpportunity +
      breakdown.innovation +
      breakdown.executionDifficulty +
      breakdown.scalability +
      breakdown.socialImpact) / 5;
  
  return {
    overallScore: Number(overallScore.toFixed(2)),
    voteCount,
    breakdown: {
      marketOpportunity: Number(breakdown.marketOpportunity.toFixed(2)),
      innovation: Number(breakdown.innovation.toFixed(2)),
      executionDifficulty: Number(breakdown.executionDifficulty.toFixed(2)),
      scalability: Number(breakdown.scalability.toFixed(2)),
      socialImpact: Number(breakdown.socialImpact.toFixed(2)),
    },
  };
}

/**
 * Get leaderboard of approved student projects
 * Sorted by overall score (descending), then by vote count
 * 
 * @param limit - Maximum number of projects to return
 * @returns Ranked list of projects with scores
 */
export async function getProjectLeaderboard(limit: number = 50) {
  // Use the pre-built view for efficiency
  const { data, error } = await supabase
    .from('project_rankings')
    .select('*')
    .limit(limit);
  
  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
  
  // Add rank numbers
  return data?.map((project, index) => ({
    ...project,
    rank: index + 1,
  })) || [];
}

/**
 * Get a user's submitted projects with their current rankings
 * 
 * @param userId - User ID from SSO
 * @returns User's projects with scores and ranks
 */
export async function getUserProjects(userId: string) {
  const { data: projects, error } = await supabase
    .from('student_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error || !projects) {
    console.error('Error fetching user projects:', error);
    return [];
  }
  
  // Get scores for each project
  const projectsWithScores = await Promise.all(
    projects.map(async (project) => {
      const score = await getProjectScore(project.id);
      return {
        ...project,
        ...score,
      };
    })
  );
  
  return projectsWithScores;
}

/**
 * Check if user has already voted on a project
 * 
 * @param userId - User ID from SSO
 * @param projectId - Project UUID
 * @returns True if voted, false otherwise
 */
export async function hasUserVotedOnProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('project_votes')
    .select('id')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single();
  
  return !error && !!data;
}

// ============================================
// TOP STARTUPS QUERIES
// ============================================

/**
 * Get all Top 10 startups ordered by rank
 * 
 * @returns Array of top startups
 */
export async function getTopStartups(): Promise<TopStartup[]> {
  const { data, error } = await supabase
    .from('top_startups')
    .select('*')
    .order('rank');
  
  if (error) {
    console.error('Error fetching top startups:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a single startup by ID with vote statistics
 * 
 * @param startupId - Startup ID
 * @returns Startup with average scores
 */
export async function getStartupWithStats(startupId: number) {
  const { data: startup, error: startupError } = await supabase
    .from('top_startups')
    .select('*')
    .eq('id', startupId)
    .single();
  
  if (startupError || !startup) {
    return null;
  }
  
  // Get vote statistics
  const { data: votes, error: votesError } = await supabase
    .from('startup_votes')
    .select('market_opportunity, innovation, execution_difficulty, scalability, social_impact')
    .eq('startup_id', startupId);
  
  if (votesError || !votes || votes.length === 0) {
    return {
      ...startup,
      voteCount: 0,
      averageScore: 0,
    };
  }
  
  const totalScore = votes.reduce(
    (sum, vote) =>
      sum +
      (vote.market_opportunity +
        vote.innovation +
        vote.execution_difficulty +
        vote.scalability +
        vote.social_impact) / 5,
    0
  );
  
  return {
    ...startup,
    voteCount: votes.length,
    averageScore: Number((totalScore / votes.length).toFixed(2)),
  };
}

// ============================================
// ADMIN QUERIES
// ============================================

/**
 * Get all projects with a specific status
 * Useful for admin dashboard
 * 
 * @param status - Project status to filter by
 * @returns Array of projects
 */
export async function getProjectsByStatus(
  status: 'submitted' | 'approved' | 'featured' | 'rejected'
): Promise<StudentProject[]> {
  const { data, error } = await supabase
    .from('student_projects')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching projects by status:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get overall platform statistics
 * Useful for admin dashboard
 * 
 * @returns Platform stats object
 */
export async function getPlatformStats() {
  const [
    { count: totalProjects },
    { count: totalVotes },
    { count: approvedProjects },
    { count: uniqueVoters },
  ] = await Promise.all([
    supabase.from('student_projects').select('*', { count: 'exact', head: true }),
    supabase.from('project_votes').select('*', { count: 'exact', head: true }),
    supabase.from('student_projects').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('startup_votes').select('user_id', { count: 'exact', head: true }),
  ]);
  
  return {
    totalProjects: totalProjects || 0,
    totalVotes: totalVotes || 0,
    approvedProjects: approvedProjects || 0,
    uniqueVoters: uniqueVoters || 0,
  };
}
