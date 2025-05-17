class CreateCommitments < ActiveRecord::Migration[7.1]
  def change
    create_table :commitments do |t|
      t.string :title
      t.text :description
      t.string :frequency
      t.date :start_date
      t.date :end_date
      t.boolean :completed
      t.references :user, null: false, foreign_key: true
      t.integer :position

      t.timestamps
    end
  end
end
