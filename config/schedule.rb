# Use this file to easily define all of your cron jobs.

# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Example:
#
# set :output, "/path/to/my/cron_log.log"
#
# every 2.hours do
#   command "/usr/bin/some_great_command"
#   runner "MyModel.some_method"
#   rake "some:great:rake:task"
# end
#
# every 4.days do
#   runner "AnotherModel.prune_old_records"
# end

# Learn more: http://github.com/javan/whenever

# Run the daily completions job at 12:05 AM every day
every 1.day, at: '12:05 am' do
  rake 'generate_completions:generate_due'
end

# For development, run every minute
if Rails.env.development?
  every 1.minute do
    rake 'generate_completions:generate_due'
  end
end
