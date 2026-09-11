ALTER TABLE `polls` ADD `generated_by_ai` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `max_attempts` integer;--> statement-breakpoint
ALTER TABLE `quizzes` ADD `generated_by_ai` integer DEFAULT false NOT NULL;
