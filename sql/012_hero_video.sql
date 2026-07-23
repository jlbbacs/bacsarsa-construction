-- Lets the Home page hero background be a video instead of (or in addition
-- to) a static image. HeroSection.tsx prefers hero_video_url over
-- hero_image_url when both are set.
alter table home_config
  add column if not exists hero_video_url text;
