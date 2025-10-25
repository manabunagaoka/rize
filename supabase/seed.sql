-- ============================================
-- RIZE BY MANABOODLE - SEED DATA
-- Top 10 Legendary Harvard Startups
-- ============================================

-- Clear existing data (if any)
truncate table top_startups cascade;

-- ============================================
-- INSERT TOP 10 HARVARD STARTUPS
-- ============================================

insert into top_startups (rank, name, founded_year, founder, valuation, description, category) values
(1, 'Meta (Facebook)', 2004, 'Mark Zuckerberg', '$1+ Trillion', 'Started in a Harvard dorm room to connect students. Became the world''s largest social network with 3+ billion users.', 'Consumer Social'),

(2, 'Microsoft', 1975, 'Bill Gates', '$3+ Trillion', 'Gates left Harvard to build personal computing software. Changed how the world uses computers and now leads in cloud computing.', 'Enterprise Software'),

(3, 'Stripe', 2010, 'John Collison', '$70 Billion', 'Made online payments simple for developers and businesses. Now powers millions of companies globally including Amazon and Google.', 'FinTech'),

(4, 'Airbnb', 2008, 'Nathan Blecharczyk', '$80+ Billion', 'Turned spare rooms into a global hospitality platform. Disrupted the entire hotel industry and operates in 220+ countries.', 'Consumer Marketplace'),

(5, 'Rippling', 2016, 'Parker Conrad', '$16.8 Billion', 'Unified HR, IT, and Finance software into one platform. Companies can run all operations from a single dashboard.', 'Enterprise SaaS'),

(6, 'Rent the Runway', 2009, 'Jennifer Hyman', '$750+ Million', 'Created clothing rental subscription service. Made designer fashion accessible and pioneered the sharing economy for apparel.', 'Consumer Subscription'),

(7, 'Care.com', 2006, 'Sheila Marcelo', '$500 Million', 'Connected families with caregivers for childcare, senior care, and more. Reached 17+ million members across 16 countries before acquisition.', 'Consumer Marketplace'),

(8, 'WHOOP', 2012, 'Will Ahmed', '$3.6 Billion', 'Wearable technology for optimizing human performance. Used by professional athletes, military, and fitness enthusiasts worldwide.', 'Consumer Hardware'),

(9, 'Devoted Health', 2017, 'Ed & Todd Park', '$12+ Billion', 'Technology-powered Medicare Advantage health plans. Making healthcare simpler and better for seniors across America.', 'HealthTech'),

(10, 'Modern Treasury', 2018, 'Dimitri Dadiomov', '$2+ Billion', 'Payment infrastructure that automates money movement from initiation through reconciliation. Powers payment operations for enterprises.', 'FinTech');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check that all 10 startups were inserted
select 'Total startups inserted: ' || count(*) as verification from top_startups;

-- View all startups ordered by rank
select rank, name, founder, valuation, category from top_startups order by rank;

-- ============================================
-- SEED DATA COMPLETE! 🎉
-- You should see all 10 Harvard startups in the database
-- ============================================
