class AddResetFieldsToCommitments < ActiveRecord::Migration[7.1]
  def change
    add_column :commitments, :daily_reset_time, :time, default: '00:00'
    add_column :commitments, :weekly_reset_day, :integer, default: 1 # 1 for Monday
    add_column :commitments, :monthly_reset_day, :integer, default: 1 # 1st of the month
    add_column :commitments, :last_reset_at, :datetime
    add_column :commitments, :streak_count, :integer, default: 0
    add_column :commitments, :longest_streak, :integer, default: 0
  end
end 