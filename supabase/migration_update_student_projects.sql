-- ============================================
-- MIGRATION: Update student_projects table
-- Rename and restructure fields for Class of 2026
-- ============================================

-- Drop the existing table and recreate (safe for new project)
-- If you have existing data, you'll need to backup first
drop table if exists project_votes cascade;
drop table if exists student_projects cascade;

-- Recreate student_projects with new structure
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

-- Recreate project_votes table
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

-- Recreate indexes
create index idx_student_projects_user on student_projects(user_id);
create index idx_student_projects_status on student_projects(status);
create index idx_student_projects_created on student_projects(created_at desc);
create index idx_student_projects_email on student_projects(user_email);

create index idx_project_votes_user on project_votes(user_id);
create index idx_project_votes_project on project_votes(project_id);
create index idx_project_votes_created on project_votes(created_at desc);

-- Recreate trigger
create trigger update_student_projects_updated_at
  before update on student_projects
  for each row
  execute function update_updated_at_column();

-- Recreate view
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

-- Add comments
comment on table student_projects is 'Class of 2026 student startup submissions - awaiting approval and voting';
comment on table project_votes is 'Student votes on submitted projects - drives leaderboard rankings';
comment on view project_rankings is 'Leaderboard view with calculated scores and rankings for approved student startups';
