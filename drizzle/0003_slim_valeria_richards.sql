ALTER TABLE `user` ADD `polar_subscription_id` text;--> statement-breakpoint
ALTER TABLE `user` ADD `subscription_status` text;--> statement-breakpoint
ALTER TABLE `user` ADD `subscription_event_at` integer;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `payment_provider`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `stripe_subscription_id`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `paypal_subscription_id`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `stripe_customer_id`;