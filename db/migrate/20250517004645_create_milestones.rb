class CreateMilestones < ActiveRecord::Migration[7.1]
  def change
    create_table :milestones do |t|
      t.string :title
      t.text :description
      t.date :target_date
      t.string :status
      t.references :user, null: false, foreign_key: true
      t.integer :position

      t.timestamps
    end
  end
end
