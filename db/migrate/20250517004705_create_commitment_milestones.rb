class CreateCommitmentMilestones < ActiveRecord::Migration[7.1]
  def change
    create_table :commitment_milestones do |t|
      t.references :commitment, null: false, foreign_key: true
      t.references :milestone, null: false, foreign_key: true
      t.integer :contribution_percentage

      t.timestamps
    end
  end
end
