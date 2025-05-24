require 'sidekiq'
require 'sidekiq-scheduler'

Sidekiq.configure_server do |config|
  config.on(:startup) do
    Sidekiq.schedule = {
      'reset_commitments' => {
        'cron' => '0 * * * *', # Run at the start of every hour
        'class' => 'ResetCommitmentsJob'
      }
    }
    SidekiqScheduler::Scheduler.instance.reload_schedule!
  end
end 