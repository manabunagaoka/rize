-- ============================================
-- RIZE BY MANABOODLE - DATABASE SCHEMA
-- Harvard Edition Startup Ranking Platform
-- ============================================

-- Enable UUID extension for generating unique IDs
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLE 1: TOP_STARTUPS
-- Historical Top 10 Harvard startup legends (static reference data)
-- ============================================

create table top_startups (
  id serial primary key,
  rank integer not null unique check (rank > 0 and rank <= 10),
  name text not null,
  founded_year integer check (founded_year >= 1900 and founded_year <= 2100),
  founder text not null,
  valuation text not null,
  description text not null,
  category text,
  logo_url text,
  created_at timestamp with time zone default now()
);

-- Add comment to table
comment on table top_startups is 'Top 10 legendary Harvard startups used as reference for voting';

-- ============================================
-- TABLE 2: STARTUP_VOTES
-- Student votes on the Top 10 historical startups
-- Each user can vote once per startup on 5 criteria
-- ============================================

create table startup_votes (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  startup_id integer not null references top_startups(id) on delete cascade,
  
  -- 5 voting criteria (1-5 stars each)
  market_opportunity integer not null check (market_opportunity between 1 and 5),
  innovation integer not null check (innovation between 1 and 5),
  execution_difficulty integer not null check (execution_difficulty between 1 and 5),
  scalability integer not null check (scalability between 1 and 5),
  social_impact integer not null check (social_impact between 1 and 5),
  
  created_at timestamp with time zone default now(),
  
  -- Ensure one vote per user per startup
  unique(user_id, startup_id)
);

comment on table startup_votes is 'Student votes on the Top 10 startups - one vote per user per startup';
comment on column startup_votes.user_id is 'User ID from Manaboodle SSO (x-user-id header)';
comment on column startup_votes.market_opportunity is 'Size of addressable market (1-5)';
comment on column startup_votes.innovation is 'How novel is the solution (1-5)';
comment on column startup_votes.execution_difficulty is 'How hard to build (1-5)';
comment on column startup_votes.scalability is 'Can it grow exponentially (1-5)';
comment on column startup_votes.social_impact is 'Does it make the world better (1-5)';

-- ============================================
-- TABLE 3: STUDENT_PROJECTS
-- Student startup submissions
-- Status workflow: pending -> approved/rejected
-- ============================================

create table student_projects (
  id uuid default gen_random_uuid() primary key,
  
  -- User info from SSO
  user_id text not null,
  user_email text not null,
  user_name text,
  user_class text,
  
  -- Project details
  startup_name text not null,
  one_liner text not null check (length(one_liner) <= 50),
  elevator_pitch text not null check (length(elevator_pitch) <= 200),
  category text not null check (category in ('EdTech', 'HealthTech', 'FinTech', 'Social Impact', 'Consumer', 'Enterprise/B2B', 'Climate/Sustainability', 'Other')),
  founders text not null,
  stage text not null check (stage in ('Idea', 'Prototype', 'Beta/Testing', 'Launched', 'Revenue')),
  
  -- Optional "brag" traction
  traction_type text check (traction_type in ('users', 'revenue', 'funding', 'featured', 'award')),
  traction_value text,
  
  -- Optional links and media
  website_url text,
  logo_url text,
  problem_statement text check (length(problem_statement) <= 100),
  
  -- Status and timestamps
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table student_projects is 'Class of 2026 student startup submissions - awaiting approval and voting';
comment on column student_projects.status is 'pending: awaiting admin review | approved: visible and votable | rejected: hidden';
comment on column student_projects.one_liner is 'Short description for card view (max 50 chars)';
comment on column student_projects.elevator_pitch is 'Longer pitch explanation (max 200 chars)';
comment on column student_projects.category is 'Startup sector/industry';
comment on column student_projects.traction_type is 'Type of achievement to brag about';
comment on column student_projects.traction_value is 'Specific traction metric (e.g., "200 users", "$5K", "TechCrunch")';

-- ============================================
-- TABLE 4: PROJECT_VOTES
-- Votes on student projects (same 5 criteria as startup votes)
-- ============================================

create table project_votes (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  project_id uuid not null references student_projects(id) on delete cascade,
  
  -- 5 voting criteria (1-5 stars each)
  market_opportunity integer not null check (market_opportunity between 1 and 5),
  innovation integer not null check (innovation between 1 and 5),
  execution_difficulty integer not null check (execution_difficulty between 1 and 5),
  scalability integer not null check (scalability between 1 and 5),
  social_impact integer not null check (social_impact between 1 and 5),
  
  created_at timestamp with time zone default now(),
  
  -- Ensure one vote per user per project
  unique(user_id, project_id)
);

comment on table project_votes is 'Student votes on submitted projects - drives leaderboard rankings';
comment on column project_votes.user_id is 'User ID from Manaboodle SSO (x-user-id header)';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Startup votes indexes
create index idx_startup_votes_user on startup_votes(user_id);
create index idx_startup_votes_startup on startup_votes(startup_id);
create index idx_startup_votes_created on startup_votes(created_at desc);

-- Student projects indexes
create index idx_student_projects_user on student_projects(user_id);
create index idx_student_projects_status on student_projects(status);
create index idx_student_projects_created on student_projects(created_at desc);
create index idx_student_projects_email on student_projects(user_email);

-- Project votes indexes
create index idx_project_votes_user on project_votes(user_id);
create index idx_project_votes_project on project_votes(project_id);
create index idx_project_votes_created on project_votes(created_at desc);

-- ============================================
-- FUNCTIONS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at on student_projects
create trigger update_student_projects_updated_at
  before update on student_projects
  for each row
  execute function update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Optional: Enable if you want database-level security
-- For now, we handle authorization in the application layer
-- ============================================

-- Enable RLS on tables (currently permissive, can tighten later)
-- alter table top_startups enable row level security;
-- alter table startup_votes enable row level security;
-- alter table student_projects enable row level security;
-- alter table project_votes enable row level security;

-- Public read access to top startups and approved projects
-- create policy "Public read access to top startups" on top_startups for select using (true);
-- create policy "Public read access to approved projects" on student_projects for select using (status = 'approved' or status = 'featured');

-- ============================================
-- HELPFUL VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Project rankings with vote statistics
create or replace view project_rankings as
select 
  p.id,
  p.startup_name,
  p.one_liner,
  p.elevator_pitch,
  p.user_name,
  p.user_class,
  p.category,
  p.founders,
  p.stage,
  p.traction_type,
  p.traction_value,
  p.website_url,
  p.logo_url,
  p.status,
  p.created_at,
  count(v.id) as vote_count,
  coalesce(avg(v.market_opportunity), 0) as avg_market_opportunity,
  coalesce(avg(v.innovation), 0) as avg_innovation,
  coalesce(avg(v.execution_difficulty), 0) as avg_execution_difficulty,
  coalesce(avg(v.scalability), 0) as avg_scalability,
  coalesce(avg(v.social_impact), 0) as avg_social_impact,
  coalesce(avg((v.market_opportunity + v.innovation + v.execution_difficulty + v.scalability + v.social_impact) / 5.0), 0) as overall_score
from student_projects p
left join project_votes v on p.id = v.project_id
where p.status = 'approved'
group by p.id
order by overall_score desc, vote_count desc;

comment on view project_rankings is 'Leaderboard view with calculated scores and rankings for approved student startups';

-- View: User voting progress (how many startups they voted on)
create or replace view user_voting_progress as
select 
  user_id,
  count(*) as startups_voted,
  (count(*) >= 5) as can_submit_project,
  max(created_at) as last_vote_at
from startup_votes
group by user_id;

comment on view user_voting_progress is 'Track how many startups each user has voted on (need 5 to unlock submission)';

-- ============================================
-- SCHEMA COMPLETE! 🎉
-- Next step: Run seed.sql to populate top_startups table
-- ============================================
