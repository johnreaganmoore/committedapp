class AddStreakColumnsToCommitments < ActiveRecord::Migration[7.1]
  def change
    add_column :commitments, :current_streak, :integer
    add_column :commitments, :best_streak, :integer
  end
end
