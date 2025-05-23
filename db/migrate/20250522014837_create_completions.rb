class CreateCompletions < ActiveRecord::Migration[7.1]
  def change
    create_table :completions do |t|
      t.references :commitment, null: false, foreign_key: true
      t.datetime :completed_at
      t.date :due_date, null: false
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :completions, [:commitment_id, :due_date], unique: true, name: 'index_completions_on_commitment_and_due_date'
    add_index :completions, :due_date
    add_index :completions, :status
  end
end
